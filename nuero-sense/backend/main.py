from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime
import os

app = FastAPI(title="NeuroSense API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

class ReportData(BaseModel):
    timestamp: str
    heart_rate: float
    spo2: float
    tremor_score: float
    motion_stability: float
    risk_level: str

class PatientReport(BaseModel):
    patient_id: str
    patient_name: str
    data: List[ReportData]
    summary: dict

MOCK_USERS = {
    "doctor@neurosense.com": {"password": "doctor123", "role": "doctor", "name": "Dr. Sarah Johnson"},
    "caretaker@neurosense.com": {"password": "care123", "role": "caretaker", "name": "John Smith"}
}

MOCK_PATIENTS = [
    {
        "id": "P001",
        "name": "Robert Wilson",
        "age": 68,
        "diagnosis_date": "2022-03-15",
        "risk_level": "moderate",
        "last_updated": "2025-12-16T10:30:00",
        "thingspeak_channel_id": "2739567"
    },
    {
        "id": "P002",
        "name": "Mary Thompson",
        "age": 72,
        "diagnosis_date": "2021-08-22",
        "risk_level": "high",
        "last_updated": "2025-12-16T09:45:00",
        "thingspeak_channel_id": "2739568"
    },
    {
        "id": "P003",
        "name": "James Miller",
        "age": 65,
        "diagnosis_date": "2023-01-10",
        "risk_level": "low",
        "last_updated": "2025-12-16T11:15:00",
        "thingspeak_channel_id": "2739569"
    },
    {
        "id": "P004",
        "name": "Patricia Davis",
        "age": 70,
        "diagnosis_date": "2022-11-05",
        "risk_level": "moderate",
        "last_updated": "2025-12-16T08:20:00",
        "thingspeak_channel_id": "2739570"
    }
]

@app.get("/")
def root():
    return {"message": "NeuroSense API - Parkinson's Disease Monitoring System"}

@app.post("/api/auth/login", response_model=LoginResponse)
def login(request: LoginRequest):
    user = MOCK_USERS.get(request.email)
    if not user or user["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "token": f"token_{request.email}_{datetime.now().timestamp()}",
        "user": {
            "email": request.email,
            "name": user["name"],
            "role": user["role"]
        }
    }

@app.get("/api/patients", response_model=List[Patient])
def get_patients(authorization: Optional[str] = None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return MOCK_PATIENTS

@app.get("/api/patients/{patient_id}/report")
def get_patient_report(patient_id: str, authorization: Optional[str] = None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    patient = next((p for p in MOCK_PATIENTS if p["id"] == patient_id), None)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    from ml_module import generate_report
    from thingspeak_client import fetch_thingspeak_data
    
    try:
        raw_data = fetch_thingspeak_data(patient["thingspeak_channel_id"])
        report = generate_report(patient_id, patient["name"], raw_data)
        return report
    except Exception as e:
        print(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
