from fastapi import FastAPI,APIRouter, Request, Depends, HTTPException, Response, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import helper.constant as constants
import os
from helper.trancribe_Service import TranscribeService


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

@app.get("/")
async def index():
    return {"Status": "Ready"}

@app.post("/uploadfile")
async def create_upload_file(file: UploadFile = File(...)):

    if file.content_type not in constants.ALLOWED_AUDIO_TYPES:
        raise HTTPException(status_code=400, detail="Only audio files are allowed")

    # Process transcription
    result = await transcribe_service.transcribe_audio(file)
    return {"transcription": result, "status": "success"}
