"""Host-side feature extraction from raw sensor windows.

This mirrors what firmware/NeuroSense/NeuroSense.ino computes on the device, so
a model trained from raw recordings here sees the same feature definitions the
ESP8266 will send at inference time. Keep the two in step.
"""

from typing import Dict, Sequence

import numpy as np
from scipy.signal import welch

# Same band the firmware searches: below 2 Hz is posture drift, above 12 Hz is
# sensor noise, Parkinsonian rest tremor sits at 3-7 Hz.
TREMOR_MIN_HZ = 2.0
TREMOR_MAX_HZ = 12.0

STILL_RMS_G = 0.02
GAIT_SCORE_SLOPE = 200.0
GAIT_SCORE_FLOOR = 60.0
FALL_THRESHOLD_G = 2.5


def magnitude(x: Sequence[float], y: Sequence[float], z: Sequence[float]) -> np.ndarray:
    x, y, z = np.asarray(x, float), np.asarray(y, float), np.asarray(z, float)
    return np.sqrt(x * x + y * y + z * z)


def dominant_tremor_hz(accel_mag: np.ndarray, fs: float) -> float:
    """Peak frequency of the AC part of |a|, restricted to the tremor band."""
    ac = accel_mag - np.mean(accel_mag)
    if ac.size < 4:
        return 0.0

    freqs, psd = welch(ac, fs=fs, nperseg=min(256, ac.size))
    band = (freqs >= TREMOR_MIN_HZ) & (freqs <= TREMOR_MAX_HZ)
    if not band.any():
        return 0.0
    return float(freqs[band][np.argmax(psd[band])])


def gait_score(total_accel: float) -> float:
    """Steadier movement means less accel spread. 0.20 g of RMS maps to 60."""
    return float(np.clip(100.0 - total_accel * GAIT_SCORE_SLOPE, GAIT_SCORE_FLOOR, 100.0))


def extract_features_from_window(
    hr_vals: Sequence[float],
    spo2_vals: Sequence[float],
    ax: Sequence[float],
    ay: Sequence[float],
    az: Sequence[float],
    gx: Sequence[float] = (),
    gy: Sequence[float] = (),
    gz: Sequence[float] = (),
    fs: float = 50.0,
    sleep_stage: int = 0,
) -> Dict[str, float]:
    """Collapse one window of raw samples into the eight published features.

    Returns the canonical names from `config.FEATURES` so the output can be fed
    straight into the scaler and model.

    `sleep_stage` is passed in rather than derived: staging needs continuity
    across windows (minutes of sustained stillness), which a single window
    cannot see. The firmware tracks it statefully.
    """
    accel_mag = magnitude(ax, ay, az)
    total_accel = float(np.std(accel_mag)) if accel_mag.size else 0.0

    if len(gx) and len(gy) and len(gz):
        total_gyro = float(np.mean(magnitude(gx, gy, gz)))
    else:
        total_gyro = 0.0

    return {
        "hr": float(np.mean(hr_vals)) if len(hr_vals) else 0.0,
        "spo2": float(np.mean(spo2_vals)) if len(spo2_vals) else 0.0,
        "tremorFreq": dominant_tremor_hz(accel_mag, fs),
        "totalAccel": total_accel,
        "totalGyro": total_gyro,
        "sleepStage": float(sleep_stage),
        "gaitScore": gait_score(total_accel),
        "fallAlert": float(accel_mag.max() > FALL_THRESHOLD_G) if accel_mag.size else 0.0,
    }
