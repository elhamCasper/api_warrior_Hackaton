import time
import boto3
from config import settings
import aiofiles
import asyncio, os
from fastapi import UploadFile
import uuid

class TranscribeService:
    def __init__(self):
        self.transcribe_client = boto3.client('transcribe',
                                              aws_access_key_id=settings.aws_access_key_id,
                                              aws_secret_access_key=settings.aws_secret_access_key,
                                              region_name=settings.aws_default_region)
        self.s3_client = boto3.client('s3'
                                        ,aws_access_key_id=settings.aws_access_key_id,
                                        aws_secret_access_key=settings.aws_secret_access_key,
                                        region_name=settings.aws_default_region)
        self.bucket_name = settings.s3_bucket_name
    
    async def transcribe_audio(self, audio_file: UploadFile) -> str:
        """Transcribe audio file using Amazon Transcribe"""
        try:
            # Generate unique job name
            job_name = f"clinical-transcribe-{uuid.uuid4().hex[:8]}"
            
            # Upload audio to S3
            s3_key = f"audio/{job_name}.{audio_file.filename.split('.')[-1]}"
            
            # Save file temporarily
            temp_file = f"./source/{audio_file.filename}"
            async with aiofiles.open(temp_file, 'wb') as f:
                content = await audio_file.read()
                await f.write(content)
            
            # Upload to S3
            self.s3_client.upload_file(temp_file, self.bucket_name, s3_key)
            
            # Clean up temp file
            os.remove(temp_file)
            
            # Start transcription job
            media_uri = f"s3://{self.bucket_name}/{s3_key}"
            
            response = self.transcribe_client.start_transcription_job(
                TranscriptionJobName=job_name,
                Media={'MediaFileUri': media_uri},
                MediaFormat=audio_file.filename.split('.')[-1].lower(),
                LanguageCode='en-US',
                Settings={
                    'ShowSpeakerLabels': True,
                    'MaxSpeakerLabels': 2,
                    'ShowAlternatives': True,
                    'MaxAlternatives': 2
                }
            )
            
            # Wait for completion
            while True:
                status = self.transcribe_client.get_transcription_job(
                    TranscriptionJobName=job_name
                )
                
                if status['TranscriptionJob']['TranscriptionJobStatus'] == 'COMPLETED':
                    # Get transcript
                    transcript_uri = status['TranscriptionJob']['Transcript']['TranscriptFileUri']
                    
                    # Download and parse transcript
                    import requests
                    transcript_response = requests.get(transcript_uri)
                    transcript_data = transcript_response.json()
                    
                    # Extract text
                    transcript_text = transcript_data['results']['transcripts'][0]['transcript']
                    
                    # Clean up S3 object
                    self.s3_client.delete_object(Bucket=self.bucket_name, Key=s3_key)
                    
                    return transcript_text
                
                elif status['TranscriptionJob']['TranscriptionJobStatus'] == 'FAILED':
                    raise Exception("Transcription job failed")
                
                # Wait before checking again
                await asyncio.sleep(2)
        
        except Exception as e:
            raise Exception(f"Transcription error: {str(e)}")
    
    def cleanup_job(self, job_name: str):
        """Clean up transcription job"""
        try:
            self.transcribe_client.delete_transcription_job(
                TranscriptionJobName=job_name
            )
        except:
            pass  # Job might already be deleted