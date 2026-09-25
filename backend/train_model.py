"""Train the Random Forest classifier and save the model + scaler.

    python train_model.py

Reads data/parkinsons.csv, writes models/random_forest_model.pkl and
models/scaler.pkl. Run this once before starting the API.

This used to live inside ml_module.py, which meant every `import ml_module`
retrained the model. Training belongs in a script you run deliberately.
"""

import sys

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from config import CRITICAL_FEATURES, FEATURES, MODEL_PATH, MODELS_DIR, SCALER_PATH, TRAINING_CSV

RANDOM_STATE = 42


def load_dataset() -> pd.DataFrame:
    if not TRAINING_CSV.exists():
        sys.exit(f"Training data not found: {TRAINING_CSV}")

    df = pd.read_csv(TRAINING_CSV)
    print(f"Loaded {len(df)} rows from {TRAINING_CSV.name}")

    missing = [c for c in FEATURES + ["label"] if c not in df.columns]
    if missing:
        sys.exit(f"Dataset is missing required columns: {', '.join(missing)}")
    return df


def clean(df: pd.DataFrame) -> pd.DataFrame:
    """Drop rows where a vital sign is zero or NaN - those are dropouts, not
    measurements, and training on them teaches the model that a disconnected
    sensor looks healthy."""
    mask = np.ones(len(df), dtype=bool)
    for column in CRITICAL_FEATURES:
        mask &= df[column].notna() & (df[column] > 0)

    removed = len(df) - int(mask.sum())
    if removed:
        print(f"Removed {removed} invalid rows (zero/NaN in {', '.join(CRITICAL_FEATURES)})")
    return df[mask].copy()


def main() -> None:
    df = clean(load_dataset())
    if df.empty:
        sys.exit("No valid rows left after cleaning - check the dataset.")

    # Fit on a plain array, not a DataFrame. Fitting on a DataFrame records
    # feature names, and inference passes a bare list - which makes sklearn
    # emit "X does not have valid feature names" on every single prediction.
    X = df[FEATURES].astype(float).to_numpy()
    y = df["label"].astype(int)

    class_counts = y.value_counts().to_dict()
    print(f"Training on {len(X)} samples, class counts: {class_counts}")
    if len(class_counts) < 2:
        sys.exit("Dataset contains only one class - the model cannot learn a boundary.")

    stratify = y if min(class_counts.values()) >= 2 else None
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=stratify
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = RandomForestClassifier(
        n_estimators=300, random_state=RANDOM_STATE, class_weight="balanced"
    )
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    print(f"\nHold-out accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%")
    print("\n" + classification_report(y_test, y_pred, digits=3, zero_division=0))

    print("Feature importances:")
    for name, importance in sorted(
        zip(FEATURES, model.feature_importances_), key=lambda p: p[1], reverse=True
    ):
        print(f"  {name:<12} {importance:.3f}")

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    print(f"\nSaved model  -> {MODEL_PATH}")
    print(f"Saved scaler -> {SCALER_PATH}")


if __name__ == "__main__":
    main()
