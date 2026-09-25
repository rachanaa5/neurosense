"""Inference: load the trained Random Forest and turn sensor readings into
predictions and patient reports.

Training lives in `train_model.py`. Importing this module never trains and
never touches the network; the model is loaded lazily on first use so the API
can start even when the pickles have not been generated yet.
"""

import statistics
from datetime import datetime
from typing import Any, Dict, List, Optional

import joblib
import numpy as np

from config import CRITICAL_FEATURES, FEATURES, MODEL_PATH, SCALER_PATH

_model = None
_scaler = None

# Risk bands applied to the model's probability of the Parkinsonian class.
RISK_BANDS = [(0.66, "High"), (0.33, "Medium")]


class ModelNotTrained(RuntimeError):
    """Raised when the pickles are missing. Run `python train_model.py`."""


def load_model():
    """Load model and scaler once, on first use."""
    global _model, _scaler
    if _model is None or _scaler is None:
        if not MODEL_PATH.exists() or not SCALER_PATH.exists():
            raise ModelNotTrained(
                f"Model or scaler missing in {MODEL_PATH.parent}. "
                "Run `python train_model.py` first."
            )
        _model = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
    return _model, _scaler


def is_valid_reading(features: Dict[str, float]) -> bool:
    """A device that is powered but not worn sends zeros for the vitals."""
    return any(
        features.get(name) not in (None, 0) and not np.isnan(features.get(name, 0.0))
        for name in CRITICAL_FEATURES
    )


def risk_level(probability: float) -> str:
    for threshold, label in RISK_BANDS:
        if probability >= threshold:
            return label
    return "Low"


def predict(features: Dict[str, float]) -> Dict[str, Any]:
    """Classify a single reading.

    Returns `valid: False` rather than raising when the reading is all zeros,
    so a disconnected sensor does not look like a healthy patient.
    """
    if not is_valid_reading(features):
        return {
            "valid": False,
            "reason": "All critical sensor readings are zero or invalid.",
            "features": features,
        }

    model, scaler = load_model()
    vector = [[float(features.get(name, 0.0)) for name in FEATURES]]
    scaled = scaler.transform(vector)

    prediction = int(model.predict(scaled)[0])
    if hasattr(model, "predict_proba"):
        proba = [round(float(p), 3) for p in model.predict_proba(scaled)[0]]
        parkinsonian_probability = float(proba[1]) if len(proba) > 1 else 0.0
    else:
        proba = []
        parkinsonian_probability = float(prediction)

    return {
        "valid": True,
        "prediction": prediction,
        "label": "Parkinsonian indicators" if prediction == 1 else "Healthy",
        "probability": proba,
        "risk_level": risk_level(parkinsonian_probability),
        "features": features,
    }


def _mean(values: List[float]) -> float:
    return round(statistics.fmean(values), 2) if values else 0.0


def generate_report(
    patient_id: str, patient_name: str, raw_data: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Build a patient report from a window of ThingSpeak entries.

    `raw_data` is what `thingspeak_client.fetch_thingspeak_data` returns.
    The newest entry drives the risk verdict; the rest form the trend series
    the frontend charts.
    """
    if not raw_data:
        return {
            "patient_id": patient_id,
            "patient_name": patient_name,
            "generated_at": datetime.now().isoformat(timespec="seconds"),
            "status": "no_data",
            "message": "No readings available on the ThingSpeak channel.",
            "readings": [],
            "summary": {},
        }

    readings = []
    for entry in raw_data:
        features = {name: entry.get(name, 0.0) for name in FEATURES}
        result = predict(features)
        readings.append(
            {
                "timestamp": entry.get("created_at"),
                "entry_id": entry.get("entry_id"),
                "heart_rate": features["hr"],
                "spo2": features["spo2"],
                "tremor_freq": features["tremorFreq"],
                "total_accel": features["totalAccel"],
                "total_gyro": features["totalGyro"],
                "sleep_stage": features["sleepStage"],
                "gait_score": features["gaitScore"],
                "fall_alert": features["fallAlert"],
                "valid": result["valid"],
                "prediction": result.get("prediction"),
                "risk_level": result.get("risk_level"),
            }
        )

    valid = [r for r in readings if r["valid"]]
    latest = valid[-1] if valid else readings[-1]

    summary = {
        "avg_heart_rate": _mean([r["heart_rate"] for r in valid]),
        "avg_spo2": _mean([r["spo2"] for r in valid]),
        "avg_tremor_freq": _mean([r["tremor_freq"] for r in valid]),
        "avg_gait_score": _mean([r["gait_score"] for r in valid]),
        "fall_events": sum(1 for r in valid if r["fall_alert"]),
        "readings_analysed": len(valid),
    }

    return {
        "patient_id": patient_id,
        "patient_name": patient_name,
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "status": "ok" if valid else "invalid_data",
        "risk_level": latest.get("risk_level", "Unknown"),
        "prediction": latest.get("prediction"),
        "readings": readings,
        "summary": summary,
    }
