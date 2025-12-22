import numpy as np
from scipy.signal import welch

def accel_magnitude(ax, ay, az):
    """
    Compute acceleration magnitude array from axis arrays.
    ax, ay, az : 1D numpy arrays of equal length
    Returns magnitude array.
    """
    ax = np.asarray(ax)
    ay = np.asarray(ay)
    az = np.asarray(az)
    return np.sqrt(ax*ax + ay*ay + az*az)

def extract_features_from_window(hr_vals, spo2_vals, ax, ay, az, fs=50):
    """
    Extract feature vector from short time window of sensor data.

    Inputs:
        hr_vals, spo2_vals : arrays (or scalars) of heart rate and spo2 during the window
        ax, ay, az : arrays of accelerometer values during the window
        fs : sampling frequency in Hz (default 50Hz)

    Outputs:
        dict of features including:
          - hr_mean, spo2_mean
          - accel_mean, accel_std, accel_max, accel_min
          - dominant_freq (tremor/frequency peak in accel) in Hz
          - accel_power (bandpower 0.5-20Hz)
    """
    hr_vals = np.asarray(hr_vals)
    spo2_vals = np.asarray(spo2_vals)
    ax = np.asarray(ax)
    ay = np.asarray(ay)
    az = np.asarray(az)

    feats = {}
    # HR and SpO2 features (if scalars passed, np.mean is fine)
    feats['hr_mean'] = float(np.mean(hr_vals))
    feats['spo2_mean'] = float(np.mean(spo2_vals))

    # Accel magnitude
    mag = accel_magnitude(ax, ay, az)
    feats['accel_mean'] = float(np.mean(mag))
    feats['accel_std'] = float(np.std(mag))
    feats['accel_max'] = float(np.max(mag))
    feats['accel_min'] = float(np.min(mag))

    # Power spectral density via Welch
    if len(mag) >= 4:
        f, Pxx = welch(mag, fs=fs, nperseg=min(256, len(mag)))
        # dominant frequency (peak in PSD)
        idx = np.argmax(Pxx)
        feats['dominant_freq'] = float(f[idx])
        # band power 0.5 - 20 Hz (typical tremor/gait range)
        band_mask = (f >= 0.5) & (f <= 20)
        feats['accel_bandpower'] = float(np.trapz(Pxx[band_mask], f[band_mask]) if band_mask.any() else 0.0)
    else:
        feats['dominant_freq'] = 0.0
        feats['accel_bandpower'] = 0.0

    return feats
