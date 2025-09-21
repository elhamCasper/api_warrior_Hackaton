from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, BigInteger, LargeBinary
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

    transcripts = relationship("Transcript", back_populates="owner")

class Transcript(Base):
    __tablename__ = "transcripts"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, index=True, nullable=False)
    session_id = Column(String, unique=True, index=True, nullable=False)
    original_text = Column(String, nullable=False)
    medical_entities = Column(String, nullable=True)  # JSON string
    diagnoses = Column(String, nullable=True)         # JSON string
    medications = Column(String, nullable=True)       # JSON string
    procedures = Column(String, nullable=True)        # JSON string
    clinical_summary = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="transcripts")

