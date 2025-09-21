from fastapi import FastAPI,APIRouter, Request, Depends, HTTPException, Response, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import helper.constant as constants
import os
from helper.trancribe_Service import TranscribeService
from helper.comprehend_service import ComprehendService
from model.clinical_model import ClinicalSummary, TranscriptionRequest
import uuid
from database import initial_db, get_db

app = FastAPI()

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure with your S3 bucket URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

transcribe_service = TranscribeService()
comprehend_service = ComprehendService()

# initialize db on startup
# @app.on_event(event_type="startup")
# def startup():
#     initial_db()

@app.get("/")
async def index():
    return {"Status": "Ready"}

@app.get("/health")
async def health_check():
    model_info = comprehend_service.get_model_info()
    return {
        "status": "healthy", 
        "service": "medical-transcription",
        "ai_model": model_info
    }

@app.get("/model-info")
async def get_model_info():
    """Get information about the AI model being used"""
    return comprehend_service.get_model_info()

@app.post("/uploadfile")
async def create_upload_file(file: UploadFile = File(...)):
    try:
        if file.content_type not in constants.ALLOWED_AUDIO_TYPES:
            raise HTTPException(status_code=400, detail="Only audio files are allowed")

        # Process transcription
        result = await transcribe_service.transcribe_audio(file)
        return {"transcription": result, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.post("/analyze")
async def diagnose(request: TranscriptionRequest):
    try:
        # Extract medical entities and insights
        analysis = await comprehend_service.analyze_medical_text(request.text)
        
        # Generate clinical summary
        summary = ClinicalSummary(
            patient_id=request.patient_id,
            session_id=str(uuid.uuid4()),
            original_text=request.text,
            medical_entities=analysis.get("entities", []),
            diagnoses=analysis.get("diagnoses", []),
            medications=analysis.get("medications", []),
            procedures=analysis.get("procedures", []),
            clinical_summary=analysis.get("summary", ""),
            confidence_score=analysis.get("confidence", 0.0)
        )
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    
@app.post("/transcribe_and_analyze")
async def transcribe_and_analyze(file: UploadFile = File(...), patient_id: str = None):
    try:
        if file.content_type not in constants.ALLOWED_AUDIO_TYPES:
            raise HTTPException(status_code=400, detail="Only audio files are allowed")
        
        # get audio
        transcription = await transcribe_service.transcribe_audio(file)

        # analyze text
        conversation = TranscriptionRequest(
            text=transcription,
            patient_id=patient_id or f"patient_{uuid.uuid4().hex[:8]}"
        )
        
        analysis = await comprehend_service.analyze_medical_text(conversation.text)
        
        # Step 3: Generate complete clinical summary
        summary = ClinicalSummary(
            patient_id=conversation.patient_id,
            session_id=str(uuid.uuid4()),
            original_text=transcription,
            medical_entities=analysis.get("entities", []),
            diagnoses=analysis.get("diagnoses", []),
            medications=analysis.get("medications", []),
            procedures=analysis.get("procedures", []),
            clinical_summary=analysis.get("summary", ""),
            confidence_score=analysis.get("confidence", 0.0)
        )
        
        return {
            "transcription": transcription,
            "medical_entities": summary.medical_entities,
            "summary": summary.clinical_summary,
            "clinical_analysis": summary,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@app.post("/transcribe")
async def transcribe_endpoint(request: TranscriptionRequest):
    """
    Endpoint for frontend compatibility - processes patient data without audio
    """
    try:
        analysis = await comprehend_service.analyze_medical_text(request.text)
        
        return {
            "transcription": request.text,
            "medical_entities": analysis.get("entities", []),
            "summary": analysis.get("summary", ""),
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

