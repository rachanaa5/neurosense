/*
 * NeuroSense - wearable Parkinsonian monitoring node
 *
 * ESP8266 + MPU6050 (motion) + MAX30100 (HR/SpO2) + SSD1306 OLED.
 *
 * Samples the IMU at a fixed 50 Hz into a 128-sample window (2.56 s), derives
 * eight features from each window, and publishes them to ThingSpeak every
 * 15 s. The field order below is a contract shared with
 * backend/thingspeak_client.py and backend/data/parkinsons.csv - changing it
 * here silently corrupts the model input.
 *
 *   field1 hr          bpm       MAX30100
 *   field2 spo2        %         MAX30100
 *   field3 tremorFreq  Hz        dominant frequency of AC accel, 2-12 Hz band
 *   field4 totalAccel  g         RMS of gravity-removed accel magnitude
 *   field5 totalGyro   deg/s     mean gyro magnitude
 *   field6 sleepStage  0|1|2     awake / light / deep
 *   field7 gaitScore   0-100     movement-stability score, higher is steadier
 *   field8 fallAlert   0|1       latched impact flag
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <MAX30100_PulseOximeter.h>
#include <ESP8266WiFi.h>
#include <ThingSpeak.h>
#include <arduinoFFT.h>

#include "secrets.h"

// ---------------------------------------------------------------- hardware
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define OLED_ADDR 0x3C
#define MPU_ADDR 0x68

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
PulseOximeter pox;
WiFiClient client;

// MPU6050 at default full-scale ranges: +/-2 g and +/-250 deg/s.
static const float ACCEL_LSB_PER_G = 16384.0f;
static const float GYRO_LSB_PER_DPS = 131.0f;

// ---------------------------------------------------------------- sampling
static const uint16_t SAMPLE_RATE_HZ = 50;
static const uint16_t SAMPLE_PERIOD_MS = 1000 / SAMPLE_RATE_HZ;  // 20 ms
static const uint16_t WINDOW_SIZE = 128;                         // 2.56 s

// arduinoFFT needs power-of-two buffers of double.
double vReal[WINDOW_SIZE];
double vImag[WINDOW_SIZE];
ArduinoFFT<double> FFT(vReal, vImag, WINDOW_SIZE, (double)SAMPLE_RATE_HZ);

// Tremor is searched in this band. Below 2 Hz is posture drift, above 12 Hz is
// sensor noise; Parkinsonian rest tremor sits at 3-7 Hz.
static const float TREMOR_MIN_HZ = 2.0f;
static const float TREMOR_MAX_HZ = 12.0f;

static float accelMag[WINDOW_SIZE];  // |a| in g, gravity included
static float gyroMag[WINDOW_SIZE];   // |w| in deg/s
static uint16_t sampleIndex = 0;
static uint32_t lastSampleMs = 0;

// ---------------------------------------------------------------- features
static float hr = 0.0f;
static float spo2 = 0.0f;
static float tremorFreq = 0.0f;
static float totalAccel = 0.0f;
static float totalGyro = 0.0f;
static uint8_t sleepStage = 0;
static float gaitScore = 100.0f;
static uint8_t fallAlert = 0;

// Impact above this (gravity included) counts as a fall.
static const float FALL_THRESHOLD_G = 2.5f;
// AC accel RMS below this counts as "still" for sleep staging.
static const float STILL_RMS_G = 0.02f;
static const uint32_t LIGHT_SLEEP_MS = 300000UL;   // 5 min still
static const uint32_t DEEP_SLEEP_MS = 1800000UL;   // 30 min still

static uint32_t stillSinceMs = 0;
static bool isStill = false;

static const uint32_t UPLOAD_INTERVAL_MS = 15000UL;  // ThingSpeak free-tier floor
static uint32_t lastUploadMs = 0;

// ---------------------------------------------------------------- helpers

void onBeatDetected() {
  Serial.println(F("beat"));
}

void showStatus(const __FlashStringHelper *line) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 24);
  display.println(line);
  display.display();
}

void haltWith(const __FlashStringHelper *msg) {
  Serial.println(msg);
  showStatus(msg);
  while (true) {
    delay(1000);
    ESP.wdtFeed();
  }
}

void initMPU6050() {
  // Wake the device: PWR_MGMT_1 = 0.
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B);
  Wire.write(0x00);
  if (Wire.endTransmission(true) != 0) {
    haltWith(F("MPU6050 not found"));
  }
}

// Reads one accel+gyro sample and appends it to the window buffers.
void sampleIMU() {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  if (Wire.endTransmission(false) != 0) {
    return;  // skip this sample, keep the loop alive
  }
  if (Wire.requestFrom(MPU_ADDR, 14, true) != 14) {
    return;
  }

  int16_t rawAx = (Wire.read() << 8) | Wire.read();
  int16_t rawAy = (Wire.read() << 8) | Wire.read();
  int16_t rawAz = (Wire.read() << 8) | Wire.read();
  (void)((Wire.read() << 8) | Wire.read());  // temperature, unused
  int16_t rawGx = (Wire.read() << 8) | Wire.read();
  int16_t rawGy = (Wire.read() << 8) | Wire.read();
  int16_t rawGz = (Wire.read() << 8) | Wire.read();

  float ax = rawAx / ACCEL_LSB_PER_G;
  float ay = rawAy / ACCEL_LSB_PER_G;
  float az = rawAz / ACCEL_LSB_PER_G;
  float gx = rawGx / GYRO_LSB_PER_DPS;
  float gy = rawGy / GYRO_LSB_PER_DPS;
  float gz = rawGz / GYRO_LSB_PER_DPS;

  float aMag = sqrtf(ax * ax + ay * ay + az * az);
  float gMag = sqrtf(gx * gx + gy * gy + gz * gz);

  // Fall detection reacts per sample, not per window, so a short impact is
  // never averaged away. The flag latches until the next successful upload.
  if (aMag > FALL_THRESHOLD_G) {
    fallAlert = 1;
    Serial.print(F("fall impact "));
    Serial.println(aMag, 2);
  }

  accelMag[sampleIndex] = aMag;
  gyroMag[sampleIndex] = gMag;
  sampleIndex++;
}

// Dominant frequency of the AC part of |a|, restricted to the tremor band.
float dominantTremorHz(const float *mag, float meanMag) {
  for (uint16_t i = 0; i < WINDOW_SIZE; i++) {
    vReal[i] = (double)(mag[i] - meanMag);  // remove gravity/DC
    vImag[i] = 0.0;
  }

  FFT.windowing(FFTWindow::Hamming, FFTDirection::Forward);
  FFT.compute(FFTDirection::Forward);
  FFT.complexToMagnitude();

  const float binHz = (float)SAMPLE_RATE_HZ / (float)WINDOW_SIZE;  // 0.39 Hz
  uint16_t minBin = (uint16_t)(TREMOR_MIN_HZ / binHz);
  uint16_t maxBin = (uint16_t)(TREMOR_MAX_HZ / binHz);
  if (maxBin > WINDOW_SIZE / 2) {
    maxBin = WINDOW_SIZE / 2;
  }

  uint16_t peakBin = minBin;
  double peak = 0.0;
  for (uint16_t i = minBin; i <= maxBin; i++) {
    if (vReal[i] > peak) {
      peak = vReal[i];
      peakBin = i;
    }
  }
  return peakBin * binHz;
}

// Collapses one full window into the eight published features.
void computeWindowFeatures() {
  float sumA = 0.0f;
  float sumG = 0.0f;
  for (uint16_t i = 0; i < WINDOW_SIZE; i++) {
    sumA += accelMag[i];
    sumG += gyroMag[i];
  }
  float meanA = sumA / WINDOW_SIZE;
  totalGyro = sumG / WINDOW_SIZE;

  // RMS about the mean: removes the constant 1 g so this is motion only.
  float sumSq = 0.0f;
  for (uint16_t i = 0; i < WINDOW_SIZE; i++) {
    float d = accelMag[i] - meanA;
    sumSq += d * d;
  }
  totalAccel = sqrtf(sumSq / WINDOW_SIZE);

  tremorFreq = dominantTremorHz(accelMag, meanA);

  // Steadier movement means less accel spread. 0.20 g of RMS maps to the
  // floor of 60, matching the range in backend/data/parkinsons.csv.
  gaitScore = 100.0f - (totalAccel * 200.0f);
  if (gaitScore < 60.0f) gaitScore = 60.0f;
  if (gaitScore > 100.0f) gaitScore = 100.0f;

  // Sleep staging off sustained stillness.
  uint32_t now = millis();
  if (totalAccel < STILL_RMS_G) {
    if (!isStill) {
      isStill = true;
      stillSinceMs = now;
    }
    uint32_t stillFor = now - stillSinceMs;
    if (stillFor >= DEEP_SLEEP_MS) {
      sleepStage = 2;
    } else if (stillFor >= LIGHT_SLEEP_MS) {
      sleepStage = 1;
    } else {
      sleepStage = 0;
    }
  } else {
    isStill = false;
    sleepStage = 0;
  }
}

void drawScreen() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println(F("NeuroSense Monitor"));

  display.setCursor(0, 14);
  display.print(F("HR  : "));
  display.print(hr, 0);
  display.println(F(" bpm"));

  display.setCursor(0, 26);
  display.print(F("SpO2: "));
  display.print(spo2, 0);
  display.println(F(" %"));

  display.setCursor(0, 38);
  display.print(F("Tremor: "));
  display.print(tremorFreq, 1);
  display.println(F(" Hz"));

  display.setCursor(0, 50);
  display.print(F("Fall:"));
  display.print(fallAlert);
  display.print(F("  Sleep:"));
  display.print(sleepStage);

  display.display();
}

void uploadToThingSpeak() {
  ThingSpeak.setField(1, hr);
  ThingSpeak.setField(2, spo2);
  ThingSpeak.setField(3, tremorFreq);
  ThingSpeak.setField(4, totalAccel);
  ThingSpeak.setField(5, totalGyro);
  ThingSpeak.setField(6, (int)sleepStage);
  ThingSpeak.setField(7, gaitScore);
  ThingSpeak.setField(8, (int)fallAlert);

  int status = ThingSpeak.writeFields(TS_CHANNEL_ID, TS_WRITE_API_KEY);

  Serial.print(F("hr="));       Serial.print(hr, 1);
  Serial.print(F(" spo2="));    Serial.print(spo2, 1);
  Serial.print(F(" tremor="));  Serial.print(tremorFreq, 2);
  Serial.print(F(" accel="));   Serial.print(totalAccel, 4);
  Serial.print(F(" gyro="));    Serial.print(totalGyro, 2);
  Serial.print(F(" sleep="));   Serial.print(sleepStage);
  Serial.print(F(" gait="));    Serial.print(gaitScore, 1);
  Serial.print(F(" fall="));    Serial.print(fallAlert);
  Serial.print(F(" -> HTTP ")); Serial.println(status);

  if (status == 200) {
    fallAlert = 0;  // clear only once the event has actually been reported
  }
}

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print(F("connecting to wifi"));

  // Bounded wait: a missing network must not brick the device, the sensors
  // and display stay useful offline.
  uint32_t deadline = millis() + 20000UL;
  while (WiFi.status() != WL_CONNECTED && millis() < deadline) {
    delay(250);
    Serial.print('.');
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print(F("wifi ok, ip "));
    Serial.println(WiFi.localIP());
    showStatus(F("WiFi connected"));
  } else {
    Serial.println(F("wifi failed, running offline"));
    showStatus(F("WiFi failed - offline"));
  }
  delay(1000);
}

// ---------------------------------------------------------------- lifecycle

void setup() {
  Serial.begin(115200);
  Wire.begin();           // ESP8266 default: SDA=D2/GPIO4, SCL=D1/GPIO5
  Wire.setClock(400000);  // the MAX30100 needs the bus to keep up

  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println(F("SSD1306 init failed"));
    while (true) { delay(1000); ESP.wdtFeed(); }
  }
  showStatus(F("NeuroSense booting"));

  initMPU6050();

  if (!pox.begin()) {
    haltWith(F("MAX30100 init failed"));
  }
  pox.setOnBeatDetectedCallback(onBeatDetected);

  connectWiFi();
  ThingSpeak.begin(client);

  lastSampleMs = millis();
  lastUploadMs = millis();
}

void loop() {
  // The MAX30100 driver needs to be serviced as often as possible; nothing in
  // this loop is allowed to block.
  pox.update();

  uint32_t now = millis();

  if (now - lastSampleMs >= SAMPLE_PERIOD_MS) {
    lastSampleMs += SAMPLE_PERIOD_MS;
    sampleIMU();

    if (sampleIndex >= WINDOW_SIZE) {
      sampleIndex = 0;
      computeWindowFeatures();
      hr = pox.getHeartRate();
      spo2 = pox.getSpO2();
      drawScreen();
    }
  }

  if (now - lastUploadMs >= UPLOAD_INTERVAL_MS) {
    lastUploadMs = now;
    if (WiFi.status() == WL_CONNECTED) {
      uploadToThingSpeak();
    } else {
      Serial.println(F("offline, skipping upload"));
      WiFi.reconnect();
    }
  }
}
