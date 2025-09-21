from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, BigInteger, LargeBinary, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.ext.declarative import declarative_base


Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ClinicalSummary(Base):
    __tablename__ = "clinical_summaries"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, index=True, nullable=False)
    session_id = Column(String, unique=True, index=True, nullable=False)
    original_text = Column(String, nullable=False)
    medical_entities = Column(String, nullable=True)  # JSON string of entities
    diagnoses = Column(String, nullable=True)         # JSON string of diagnoses
    medications = Column(String, nullable=True)       # JSON string of medications
    procedures = Column(String, nullable=True)        # JSON string of procedures
    clinical_summary = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class TranscriptionFile(Base):
    __tablename__ = "transcription_files"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, unique=True, index=True, nullable=False)
    content_type = Column(String, nullable=False)
    size = Column(BigInteger, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    transcription_text = Column(String, nullable=True)
    patient_id = Column(String, index=True, nullable=True)
    processed = Column(Boolean, default=False)