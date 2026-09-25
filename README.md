# NeuroSense

A wearable monitoring system for early indicators of Parkinsonian symptoms.

An ESP8266-based band reads heart rate, blood oxygen and motion, derives eight
features on device, and publishes them to ThingSpeak. A FastAPI service pulls
those readings, scores them with a trained Random Forest classifier, and serves
patient reports to a React dashboard.

Bachelor of Engineering project, Dept. of Electronics & Communication
Engineering, SMVITM Bantakal (VTU Belagavi), 2025-26.

---

## Architecture

```
  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
  │   Wearable   │       │  ThingSpeak  │       │   Backend    │       │   Frontend   │
  │              │       │              │       │              │       │              │
  │  MAX30100 ───┤       │              │       │  FastAPI     │       │  React +     │
  │  MPU6050  ───┼──────▶│  8 fields    │──────▶│  Random      │──────▶│  Vite +      │
  │  SSD1306 ◀───┤ HTTP  │  time series │ REST  │  Forest      │  REST │  Tailwind    │
  │  ESP8266     │  15s  │              │       │              │       │              │
  └──────────────┘       └──────────────┘       └──────────────┘       └──────────────┘
      sampling               storage               scoring              visualisation
      50 Hz / 2.56 s         + history             + reports            + polling 15 s
```

## Repository layout

```
neurosense/
├── firmware/          ESP8266 sketch (Arduino IDE)
│   └── NeuroSense/
├── backend/           FastAPI service + ML training and inference
│   ├── data/          training dataset
│   └── models/        trained model + scaler (generated)
└── frontend/          React dashboard (Vite)
```

## The feature contract

Eight features flow from the device to the model. **The order is fixed** and
appears in four places that must stay in agreement: the firmware's
`uploadToThingSpeak()`, the ThingSpeak channel layout, `backend/config.py`
(`FEATURES`), and the column order of `backend/data/parkinsons.csv`.

| Field | Name | Unit | Meaning |
|---|---|---|---|
| 1 | `hr` | bpm | Heart rate (MAX30100) |
| 2 | `spo2` | % | Blood oxygen saturation (MAX30100) |
| 3 | `tremorFreq` | Hz | Dominant frequency of AC acceleration, 2–12 Hz band |
| 4 | `totalAccel` | g | RMS of gravity-removed acceleration magnitude |
| 5 | `totalGyro` | °/s | Mean angular rate magnitude |
| 6 | `sleepStage` | 0/1/2 | Awake / light / deep |
| 7 | `gaitScore` | 0–100 | Movement stability, higher is steadier |
| 8 | `fallAlert` | 0/1 | Latched impact flag |

Changing this order in one place and not the others silently feeds the model
mislabelled inputs — it will still return a prediction, just a meaningless one.

## Hardware

| Component | Part | I²C address |
|---|---|---|
| MCU | ESP8266 (NodeMCU 1.0 / ESP-12E) | — |
| Pulse oximeter | MAX30100 | `0x57` |
| IMU | MPU6050 | `0x68` |
| Display | SSD1306 128×64 OLED | `0x3C` |

All three sensors share one I²C bus on the ESP8266 defaults: **SDA = D2
(GPIO4)**, **SCL = D1 (GPIO5)**. Power the sensors from 3.3 V.

## Getting started

### 1. Firmware

```bash
cd firmware/NeuroSense
cp secrets.example.h secrets.h   # then fill in WiFi + ThingSpeak credentials
```

Install the ESP8266 board package and these libraries through the Arduino
Library Manager: `Adafruit GFX Library`, `Adafruit SSD1306`, `MAX30100lib`,
`ThingSpeak`, `arduinoFFT`.

Select *NodeMCU 1.0 (ESP-12E Module)*, upload, and open the Serial Monitor at
**115200 baud**. Full details in [`firmware/README.md`](firmware/README.md).

### 2. Backend

```bash
cd backend
python -m venv .venv && source .venv/Scripts/activate   # Windows Git Bash
pip install -r requirements.txt

cp .env.example .env        # set your ThingSpeak channel
python train_model.py       # writes models/*.pkl
python main.py              # serves on http://127.0.0.1:8000
```

Interactive API docs at `http://127.0.0.1:8000/docs`.

To watch predictions stream in a terminal instead:

```bash
python realtime_thingspeak.py
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # only if the backend is not on the default port
npm run dev                  # http://localhost:5173
```

Demo sign-in: `doctor@neurosense.com` / `doctor123` for the clinician view, or
`caretaker@neurosense.com` / `care123` for the patient dashboard.

## API

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Liveness check |
| `POST` | `/api/auth/login` | Exchange credentials for a token |
| `GET` | `/api/patients` | Patient roster |
| `GET` | `/api/patients/{id}/report` | Scored readings + summary for one patient |

All endpoints except login and health require an `Authorization: Bearer <token>`
header.

## Machine learning

A Random Forest (300 trees, balanced class weights) over the eight features,
trained on `backend/data/parkinsons.csv` and scored against a held-out 20%
split. Model selection compared five classifiers:

| Model | Accuracy |
|---|---|
| **Random Forest** | **91.3%** |
| Support Vector Machine | 89.4% |
| Logistic Regression | 87.2% |
| K-Nearest Neighbors | 86.7% |
| Decision Tree | 85.6% |

These figures are the model-selection results recorded in the project report.
Note that `train_model.py` on the current 92-row dataset reports **100%** on its
held-out split — with a sample that small and classes this separable, the split
is not a meaningful generalisation estimate. Treat the table above as the
comparison that motivated the choice of Random Forest, not as a performance
guarantee.

Rows where any vital sign is zero are dropped before training: a device that is
powered but not being worn reports zeros, and training on those teaches the
model that a disconnected sensor looks healthy.

`backend/utils_feature_engineering.py` mirrors the firmware's feature
definitions, so a model trained from raw recordings sees the same quantities
the device will send at inference time.

## Known limitations

- **Authentication is a demo stub.** Credentials live in memory in
  `backend/main.py` and the bearer token is neither signed nor verified. It
  exists so the frontend has a login flow to exercise. Not deployable as-is.
- **Only P001 is wired to real hardware.** The other patients in the roster
  carry placeholder channel IDs and return `status: "no_data"`.
- **Sleep staging needs a long observation window.** Light sleep requires 5
  minutes of sustained stillness and deep sleep 30 minutes, so short test runs
  will always report stage 0.
- **Thresholds are untuned.** The fall threshold (2.5 g), stillness threshold
  (0.02 g RMS) and the gait score mapping are reasoned starting points, not
  values fitted against labelled recordings.

