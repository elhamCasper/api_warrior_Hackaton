from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class TranscriptionRequest(BaseModel):
    text: str
    patient_id: Optional[str] = None
    session_date: Optional[datetime] = datetime.now().today()

class MedicalEntity(BaseModel):
    text: str
    category: str
    type: str
    confidence: float
    begin_offset: int
    end_offset: int

class Diagnosis(BaseModel):
    name: str
    icd10_code: Optional[str] = None
    confidence: float

class Medication(BaseModel):
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    confidence: float

class Procedure(BaseModel):
    name: str
    cpt_code: Optional[str] = None
    confidence: float

class ClinicalSummary(BaseModel):
    patient_id: str
    session_id: str
    session_date: datetime = datetime.now()
    original_text: str
    medical_entities: List[MedicalEntity]
    diagnoses: List[Diagnosis]
    medications: List[Medication]
    procedures: List[Procedure]
    clinical_summary: str
    confidence_score: float
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }