"""NeuroSense API.

Serves the patient roster and, per patient, a report built from live
ThingSpeak readings scored by the trained Random Forest.

Scope note: authentication here is a demo stub. Credentials are in-memory and
the token is not signed or verified - it exists so the frontend has a login
flow to exercise. Do not deploy this as-is.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

import uvicorn
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import API_HOST, API_PORT, CORS_ORIGINS, THINGSPEAK_CHANNEL_ID
from ml_module import ModelNotTrained, generate_report
from thingspeak_client import fetch_thingspeak_data

app = FastAPI(title="NeuroSense API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# --------------------------------------------------------------------- models
class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    user: dict


class Patient(BaseModel):
    id: str
    name: str
    age: int
    diagnosis_date: str
    risk_level: str
    last_updated: str
    thingspeak_channel_id: str


# ----------------------------------------------------------------- demo data
DEMO_USERS = {
    "doctor@neurosense.com": {
        "password": "doctor123",
        "role": "doctor",
        "name": "Dr. Sarah Johnson",
    },
    "caretaker@neurosense.com": {
        "password": "care123",
        "role": "caretaker",
        "name": "John Smith",
    },
}

# P001 is wired to the real hardware channel. The others are placeholders: the
# report endpoint returns status "no_data" for them rather than failing.
DEMO_PATIENTS: List[Dict[str, Any]] = [
    {
        "id": "P001",
        "name": "Robert Wilson",
        "age": 68,
        "diagnosis_date": "2022-03-15",
        "risk_level": "moderate",
        "last_updated": "2025-12-16T10:30:00",
        "thingspeak_channel_id": THINGSPEAK_CHANNEL_ID,
    },
    {
        "id": "P002",
        "name": "Mary Thompson",
        "age": 72,
        "diagnosis_date": "2021-08-22",
        "risk_level": "high",
        "last_updated": "2025-12-16T09:45:00",
        "thingspeak_channel_id": "2739568",
    },
    {
        "id": "P003",
        "name": "James Miller",
        "age": 65,
        "diagnosis_date": "2023-01-10",
        "risk_level": "low",
        "last_updated": "2025-12-16T11:15:00",
        "thingspeak_channel_id": "2739569",
    },
    {
        "id": "P004",
        "name": "Patricia Davis",
        "age": 70,
        "diagnosis_date": "2022-11-05",
        "risk_level": "moderate",
        "last_updated": "2025-12-16T08:20:00",
        "thingspeak_channel_id": "2739570",
    },
]


def require_auth(authorization: Optional[str] = Header(default=None)) -> str:
    """Demo guard: checks a bearer token is present, not that it is valid."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    return authorization.split(" ", 1)[1]


# ----------------------------------------------------------------- endpoints
@app.get("/")
def root() -> Dict[str, str]:
    return {
        "service": "NeuroSense API",
        "description": "Parkinsonian monitoring - sensor ingest, ML scoring, patient reports",
        "docs": "/docs",
    }


@app.get("/api/health")
def health() -> Dict[str, Any]:
    return {"status": "ok", "time": datetime.now().isoformat(timespec="seconds")}


@app.post("/api/auth/login", response_model=LoginResponse)
def login(request: LoginRequest) -> Dict[str, Any]:
    user = DEMO_USERS.get(request.email)
    if not user or user["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "token": f"demo_{request.email}_{datetime.now().timestamp()}",
        "user": {"email": request.email, "name": user["name"], "role": user["role"]},
    }


@app.get("/api/patients", response_model=List[Patient])
def get_patients(_: str = Depends(require_auth)) -> List[Dict[str, Any]]:
    return DEMO_PATIENTS


@app.get("/api/patients/{patient_id}/report")
def get_patient_report(
    patient_id: str, results: int = 20, _: str = Depends(require_auth)
) -> Dict[str, Any]:
    """Fetch the latest readings for a patient and score them."""
    patient = next((p for p in DEMO_PATIENTS if p["id"] == patient_id), None)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    try:
        raw_data = fetch_thingspeak_data(
            patient["thingspeak_channel_id"], results=max(1, min(results, 100))
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"ThingSpeak unreachable: {exc}") from exc

    try:
        return generate_report(patient["id"], patient["name"], raw_data)
    except ModelNotTrained as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


if __name__ == "__main__":
    uvicorn.run(app, host=API_HOST, port=API_PORT)
