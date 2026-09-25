"""Central configuration, read from the environment.

Nothing secret is hardcoded here. Copy `.env.example` to `.env` and fill it in,
or export the variables in your shell before starting the API.
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"

MODEL_PATH = MODELS_DIR / "random_forest_model.pkl"
SCALER_PATH = MODELS_DIR / "scaler.pkl"
TRAINING_CSV = DATA_DIR / "parkinsons.csv"

# The eight features published by the firmware, in ThingSpeak field order.
# firmware/NeuroSense/NeuroSense.ino writes them in exactly this order and
# data/parkinsons.csv carries the same column names. All three must agree.
FEATURES = [
    "hr",
    "spo2",
    "tremorFreq",
    "totalAccel",
    "totalGyro",
    "sleepStage",
    "gaitScore",
    "fallAlert",
]

# field1..field8 -> feature name
FIELD_MAP = {f"field{i + 1}": name for i, name in enumerate(FEATURES)}

# Features that must be non-zero for a reading to be considered real. A device
# that is powered but not worn reports zeros for these.
CRITICAL_FEATURES = ["hr", "spo2", "totalAccel", "totalGyro", "gaitScore"]

THINGSPEAK_URL = "https://api.thingspeak.com/channels/{channel_id}/feeds.json"
THINGSPEAK_CHANNEL_ID = os.getenv("THINGSPEAK_CHANNEL_ID", "3123361")
THINGSPEAK_READ_API_KEY = os.getenv("THINGSPEAK_READ_API_KEY", "")
POLL_INTERVAL_SECONDS = int(os.getenv("POLL_INTERVAL_SECONDS", "15"))

# Comma-separated list of allowed browser origins for the API.
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

API_HOST = os.getenv("API_HOST", "127.0.0.1")
API_PORT = int(os.getenv("API_PORT", "8000"))
