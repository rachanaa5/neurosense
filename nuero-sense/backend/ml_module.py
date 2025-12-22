import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import joblib
from utils_feature_engineering import extract_features_from_window

# === CONFIG ===
DATA_CSV = r'parkinsons.csv'
MODELS_DIR = 'models'
os.makedirs(MODELS_DIR, exist_ok=True)

def parse_list_cell(cell):
    if pd.isna(cell): 
        return []
    s = str(cell).strip().strip('[]')
    if s == '':
        return []
    return np.array([float(x) for x in s.split(',')])

def prepare_feature_dataframe(df):
    if {'hr','spo2','ax','ay','az'}.issubset(df.columns):
        rows = []
        for _, r in df.iterrows():
            hr = parse_list_cell(r['hr']) if isinstance(r['hr'], str) else np.array([r['hr']])
            spo2 = parse_list_cell(r['spo2']) if isinstance(r['spo2'], str) else np.array([r['spo2']])
            ax = parse_list_cell(r['ax'])
            ay = parse_list_cell(r['ay'])
            az = parse_list_cell(r['az'])
            feats = extract_features_from_window(hr, spo2, ax, ay, az, fs=50)
            feats['label'] = r.get('label', 0)
            rows.append(feats)
        return pd.DataFrame(rows)
    else:
        return df.copy()

# === LOAD CSV ===
if not os.path.exists(DATA_CSV):
    raise FileNotFoundError(f"CSV file '{DATA_CSV}' not found.")

df = pd.read_csv(DATA_CSV)
print(f" Loaded dataset with {len(df)} rows.")
feature_df = prepare_feature_dataframe(df)

# === FEATURES ===
required = ['hr','spo2','tremorFreq','totalAccel','totalGyro','sleepStage','gaitScore','fallAlert']
for c in required:
    if c not in feature_df.columns:
        raise ValueError(f"Missing column: {c}")

# === CLEANING ===
before = len(feature_df)
critical = ['hr','spo2','totalAccel','totalGyro','gaitScore']
mask = np.ones(len(feature_df), dtype=bool)
for c in critical:
    mask &= feature_df[c].notna() & (feature_df[c] > 0)
feature_df = feature_df[mask].copy()
after = len(feature_df)
print(f" Removed {before - after} invalid rows (zero/NaN in core features).")

# === FALLBACK if empty ===
if after == 0:
    print(" No valid rows — generating dummy dataset for testing...")
    rng = np.random.default_rng(42)
    N = 50
    feature_df = pd.DataFrame({
        'hr': rng.integers(70, 90, N),
        'spo2': rng.integers(95, 99, N),
        'tremorFreq': rng.uniform(0, 8, N),
        'totalAccel': rng.uniform(0.1, 0.6, N),
        'totalGyro': rng.uniform(5, 20, N),
        'sleepStage': rng.integers(0, 3, N),
        'gaitScore': rng.integers(60, 100, N),
        'fallAlert': rng.integers(0, 2, N),
        'label': rng.integers(0, 2, N)
    })

# === TRAINING SETUP ===
X = feature_df[required].astype(float)
y = feature_df['label'].astype(int)
n_samples = len(X)
class_counts = y.value_counts().to_dict()
print(f" Samples after cleaning: {n_samples}, class counts: {class_counts}")

# === SMALL DATA FIX ===
if n_samples < 10:
    print(" Small dataset detected — skipping train/test split (training on all data).")
    X_train, X_test, y_train, y_test = X, X, y, y
else:
    # use stratify only if both classes have enough samples
    use_stratify = len(class_counts) > 1 and min(class_counts.values()) >= 2
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42,
        stratify=y if use_stratify else None
    )

# === SCALE ===
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# === TRAIN MODEL ===
model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    class_weight='balanced'
)
model.fit(X_train_scaled, y_train)

# === EVALUATE ===
y_pred = model.predict(X_test_scaled)
acc = accuracy_score(y_test, y_pred) * 100
print(f"\n Model Accuracy: {acc:.2f}%")
print("\nClassification Report:\n", classification_report(y_test, y_pred, digits=3))

# === FEATURE IMPORTANCE ===
print("\n Feature Importances:")
for name, imp in zip(required, model.feature_importances_):
    print(f"{name:<12}: {imp:.3f}")

# === SAVE ===
joblib.dump(model, os.path.join(MODELS_DIR, 'random_forest_model.pkl'))
joblib.dump(scaler, os.path.join(MODELS_DIR, 'scaler.pkl'))
print("\n Model retrained and saved successfully!")
