"""
Realtime Parkinson's Detection — ThingSpeak Integration (Smart Update Version)

This script:
 - Fetches latest sensor data from ThingSpeak
 - Predicts 'Healthy' or 'Parkinson's' using trained model
 - Stops processing if ThingSpeak data hasn't updated
"""

import os
import time
import requests
import numpy as np
import joblib
from datetime import datetime

# === CONFIG ===
CHANNEL_ID = '3123361'
READ_API_KEY = 'WFERTVJMKJ6YWR0F'
POLL_INTERVAL = 15  # seconds
THINGSPEAK_URL = f"https://api.thingspeak.com/channels/{CHANNEL_ID}/feeds.json"

# === MODEL LOADING ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
MODEL_PATH = os.path.join(MODELS_DIR, 'random_forest_model.pkl')
SCALER_PATH = os.path.join(MODELS_DIR, 'scaler.pkl')

if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
    raise FileNotFoundError(" Model or scaler not found in models/. Run training first.")

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
print(" Model and scaler loaded successfully!\n")

# === FUNCTIONS ===
def fetch_latest_feed():
    """Fetch the latest feed data from ThingSpeak."""
    params = {'results': 1}
    if READ_API_KEY:
        params['api_key'] = READ_API_KEY
    r = requests.get(THINGSPEAK_URL, params=params, timeout=10)
    r.raise_for_status()
    return r.json()

def parse_float(value):
    """Convert a value to float safely."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0

def predict_from_feed(feed):
    """Extract features and make a prediction."""
    fields = feed.get('feeds', [{}])[0]

    hr = parse_float(fields.get('field1'))
    spo2 = parse_float(fields.get('field2'))
    tremorFreq = parse_float(fields.get('field3'))
    totalAccel = parse_float(fields.get('field4'))
    totalGyro = parse_float(fields.get('field5'))
    sleepStage = parse_float(fields.get('field6'))
    gaitScore = parse_float(fields.get('field7'))
    fallAlert = parse_float(fields.get('field8'))

    critical_values = [hr, spo2, totalAccel, totalGyro, gaitScore]
    if all(v == 0 or np.isnan(v) for v in critical_values):
        return {
            'valid': False,
            'reason': 'All critical sensor readings are zero or invalid.',
            'features': {'hr': hr, 'spo2': spo2, 'tremorFreq': tremorFreq,
                         'totalAccel': totalAccel, 'totalGyro': totalGyro,
                         'sleepStage': sleepStage, 'gaitScore': gaitScore, 'fallAlert': fallAlert}
        }

    X = [hr, spo2, tremorFreq, totalAccel, totalGyro, sleepStage, gaitScore, fallAlert]
    X_scaled = scaler.transform([X])
    pred = model.predict(X_scaled)[0]
    proba = model.predict_proba(X_scaled)[0] if hasattr(model, 'predict_proba') else [0, 0]

    return {
        'valid': True,
        'prediction': int(pred),
        'probability': [round(float(p), 3) for p in proba],
        'features': {'hr': hr, 'spo2': spo2, 'tremorFreq': tremorFreq,
                     'totalAccel': totalAccel, 'totalGyro': totalGyro,
                     'sleepStage': sleepStage, 'gaitScore': gaitScore, 'fallAlert': fallAlert},
        'entry_id': fields.get('entry_id'),
        'created_at': fields.get('created_at')
    }

def main_loop():
    print(f" Starting ThingSpeak realtime prediction loop (Channel: {CHANNEL_ID})\n")
    last_entry_id = None  # To track if data changes

    while True:
        try:
            data = fetch_latest_feed()
            result = predict_from_feed(data)

            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            # === Check if new data has arrived ===
            entry_id = result.get('entry_id')
            if entry_id == last_entry_id:
                print(f"[{now}] ⏸ No new data on ThingSpeak — waiting...")
                time.sleep(POLL_INTERVAL)
                continue
            last_entry_id = entry_id

            # === Handle invalid data ===
            if not result['valid']:
                print(f"[{now}]  Invalid data — {result['reason']}")
                time.sleep(POLL_INTERVAL)
                continue

            # === Predict ===
            label = " Parkinson's Detected" if result['prediction'] == 1 else " Healthy"
            print(f"[{now}] {label}")
            print(f" → Probabilities: {result['probability']}")
            print(f" → Features: {result['features']}\n")

        except Exception as e:
            print(" Error during fetch/predict:", e)

        time.sleep(POLL_INTERVAL)

# === ENTRY POINT ===
if __name__ == "__main__":
    main_loop()
