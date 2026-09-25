# NeuroSense Firmware

ESP8266 firmware for the NeuroSense wearable. Samples three I²C sensors,
derives eight features on device, shows vitals on an OLED, and publishes to the
ThingSpeak channel the backend polls.

```
firmware/
└── NeuroSense/
    ├── NeuroSense.ino
    ├── secrets.example.h
    └── secrets.h          (you create this; gitignored)
```

The sketch folder name must match the `.ino` filename — an Arduino IDE
requirement, not a style choice.

## Hardware

| Component | Part | I²C address | Purpose |
|---|---|---|---|
| MCU | ESP8266 (NodeMCU 1.0 / ESP-12E) | — | Logic + WiFi |
| Pulse oximeter | MAX30100 | `0x57` | Heart rate, SpO2 |
| IMU | MPU6050 | `0x68` | Accelerometer, gyroscope |
| Display | SSD1306 128×64 OLED | `0x3C` | Live readout |

One shared I²C bus on the ESP8266 defaults:

| Signal | Pin | GPIO |
|---|---|---|
| SDA | D2 | GPIO4 |
| SCL | D1 | GPIO5 |

Power the MAX30100 and MPU6050 from 3.3 V. The MAX30100 breakout needs pull-ups
on SDA/SCL if the board does not already carry them. The bus runs at 400 kHz so
the pulse oximeter can keep up.

## Libraries

Install via the Arduino Library Manager:

- `Adafruit GFX Library`
- `Adafruit SSD1306`
- `MAX30100lib` (OXullo/Arduino-MAX30100)
- `ThingSpeak`
- `arduinoFFT` (Enrique Condes) — **v2.x**, which uses the `ArduinoFFT<double>`
  template API. v1.x will not compile against this sketch.

`ESP8266WiFi` ships with the board package. Add the board URL under
*Preferences → Additional Boards Manager URLs*:

```
http://arduino.esp8266.com/stable/package_esp8266com_index.json
```

## Configuration

Credentials live in `secrets.h`, which is gitignored:

```bash
cp secrets.example.h secrets.h
```

Then fill in `WIFI_SSID`, `WIFI_PASSWORD`, `TS_CHANNEL_ID` (unquoted number)
and `TS_WRITE_API_KEY`.

## Published fields

Written every 15 seconds — the floor on a free ThingSpeak account. **The order
is a contract** shared with `backend/config.py` and
`backend/data/parkinsons.csv`.

| Field | Name | Unit | Derivation |
|---|---|---|---|
| 1 | `hr` | bpm | MAX30100 |
| 2 | `spo2` | % | MAX30100 |
| 3 | `tremorFreq` | Hz | FFT peak of AC accel within 2–12 Hz |
| 4 | `totalAccel` | g | RMS of accel magnitude about its mean |
| 5 | `totalGyro` | °/s | Mean gyro magnitude |
| 6 | `sleepStage` | 0/1/2 | Awake / light / deep |
| 7 | `gaitScore` | 0–100 | `100 − totalAccel × 200`, floored at 60 |
| 8 | `fallAlert` | 0/1 | Latched when instantaneous \|a\| > 2.5 g |

## How it works

The IMU is sampled at a fixed **50 Hz** into a **128-sample window** (2.56 s).
When a window fills, it collapses into the eight features above.

**Tremor frequency** comes from a 128-point FFT of the acceleration magnitude
with its mean removed — removing the mean strips gravity, so what remains is
motion. The peak is searched only between 2 and 12 Hz: below that is posture
drift, above is sensor noise, and Parkinsonian rest tremor sits at 3–7 Hz. Bin
resolution is 50/128 ≈ 0.39 Hz.

**Fall detection** runs per sample rather than per window, so a brief impact is
never averaged away. The flag latches and clears only after a successful
upload, so an event cannot be lost between windows.

**Sleep staging** needs continuity across windows: light sleep after 5 minutes
of sustained stillness, deep after 30. This is why the host-side
`extract_features_from_window()` takes `sleep_stage` as a parameter instead of
deriving it — a single window cannot see minutes of history.

`pox.update()` is called on every pass of `loop()` and nothing in the loop
blocks, which is what the MAX30100 driver needs to track a pulse.

## Flashing

1. *Tools → Board →* **NodeMCU 1.0 (ESP-12E Module)**
2. *Upload Speed* → 115200
3. Select the port and upload
4. Serial Monitor at **115200 baud**

On boot the OLED shows `NeuroSense booting`, then either `WiFi connected` or
`WiFi failed - offline`. WiFi failure is not fatal: the device keeps sampling
and displaying, retries the connection, and skips uploads until it recovers.
A missing MPU6050 or MAX30100 does halt the sketch, with the reason on screen
and over serial.

## Known limitations

- **Thresholds are untuned.** 2.5 g for falls, 0.02 g RMS for stillness, and
  the gait score mapping are reasoned starting points, not values fitted to
  labelled recordings. Expect false positives from knocks to the device.
- **Single-threshold fall detection is coarse.** No free-fall precursor or
  post-impact orientation check, so the flag is a hint for the backend rather
  than a verdict.
- **Short test runs always report sleep stage 0**, by design — the timers need
  5 and 30 minutes of stillness.
- **Serial and OLED output is plain ASCII.** The Adafruit GFX font is a 5×7
  ASCII table; emoji render as garbage glyphs.
- **`hr` and `spo2` are sampled once per window**, not averaged across it.
