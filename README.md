# Audio Transcription API

FastAPI-based audio transcription service using AWS Transcribe for converting audio files to text.

## Features

- Audio file upload and transcription
- AWS Transcribe integration with speaker labeling
- Support for multiple audio formats (MP3, WAV, FLAC, OGG, AAC)
- Automatic S3 storage and cleanup
- CORS enabled for frontend integration

## Prerequisites

- Python 3.10+
- AWS Account with Transcribe and S3 access
- S3 bucket named "warriorbox"

## Installation

1. Clone the repository
2. Create virtual environment:
   ```bash
   python -m venv env
   env\Scripts\activate  # Windows
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your AWS credentials:
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_DEFAULT_REGION=your_region
   ```

## Usage

### Local Development
```bash
uvicorn main:app --reload
```

### Docker
```bash
docker build -t audio-transcription .
docker run -p 8000:8000 audio-transcription
```

### Docker Compose
```bash
docker-compose up --build
```

## API Endpoints

### GET /
Health check endpoint
```json
{"Status": "Ready"}
```

### POST /uploadfile
Upload audio file for transcription

**Request:**
- File: Audio file (MP3, WAV, FLAC, OGG, AAC)

**Response:**
```json
{
  "transcription": "transcribed text here",
  "status": "success"
}
```

## Supported Audio Formats

- MP3 (audio/mpeg)
- WAV (audio/wav, audio/x-wav)
- FLAC (audio/flac)
- OGG (audio/ogg)
- AAC (audio/x-aac)

## AWS Services Used

- **Amazon Transcribe**: Audio-to-text conversion
- **Amazon S3**: Temporary audio file storage

## Configuration

The service uses AWS Transcribe with:
- Speaker labeling (max 2 speakers)
- Alternative transcriptions (max 2)
- English (US) language detection
- Automatic cleanup of temporary files