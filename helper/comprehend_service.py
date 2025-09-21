import boto3
import json
from typing import Dict, Any, List
from config import settings
from model.clinical_model import MedicalEntity, Diagnosis, Medication, Procedure

class ComprehendService:
    def __init__(self):
        # Use Bedrock with Amazon Nova Pro instead of Comprehend Medical
        self.bedrock_client = boto3.client(
            'bedrock-runtime',
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_default_region
        )
        # Using Amazon Nova Pro for medical analysis
        self.model_id = "amazon.nova-pro-v1:0"
    
    async def analyze_medical_text(self, text: str) -> Dict[str, Any]:
        """Analyze medical text using Amazon Nova Pro"""
        try:
            system_prompt = """You are a medical AI assistant specialized in analyzing clinical transcriptions. 
            Extract structured medical information and return it as valid JSON only."""
            
            user_prompt = f"""
            Analyze this medical transcription and extract structured information:
            
            "{text}"
            
            Return ONLY valid JSON with this exact structure:
            {{
                "entities": [
                    {{"text": "entity_text", "category": "MEDICAL_CONDITION|MEDICATION|PROCEDURE|SYMPTOM", "type": "specific_type", "confidence": 0.95, "begin_offset": 0, "end_offset": 10}}
                ],
                "diagnoses": [
                    {{"name": "diagnosis_name", "confidence": 0.90}}
                ],
                "medications": [
                    {{"name": "medication_name", "dosage": "dosage_info", "frequency": "frequency", "confidence": 0.85}}
                ],
                "procedures": [
                    {{"name": "procedure_name", "confidence": 0.88}}
                ],
                "summary": "Clinical summary text",
                "confidence": 0.87
            }}
            
            Extract:
            - Medical conditions/diagnoses mentioned
            - Medications with dosage and frequency if available
            - Medical procedures performed or planned
            - Symptoms described by patient
            - Generate a concise clinical summary
            - Provide confidence scores (0.0-1.0) for each item
            """

            # Nova Pro request format
            body = {
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "text": user_prompt
                            }
                        ]
                    }
                ],
                "system": [
                    {
                        "text": system_prompt
                    }
                ],
                "inferenceConfig": {
                    "max_new_tokens": 2000,
                    "temperature": 0.1,
                    "top_p": 0.9
                }
            }

            response = self.bedrock_client.invoke_model(
                modelId=self.model_id,
                body=json.dumps(body)
            )

            response_body = json.loads(response['body'].read())
            content = response_body['output']['message']['content'][0]['text']
            
            try:
                # Parse Nova Pro's JSON response
                analysis_data = json.loads(content)
                
                # Convert to our model format
                medical_entities = []
                diagnoses = []
                medications = []
                procedures = []
                
                # Process entities
                for entity_data in analysis_data.get("entities", []):
                    entity = MedicalEntity(
                        text=entity_data.get("text", ""),
                        category=entity_data.get("category", "UNKNOWN"),
                        type=entity_data.get("type", "UNKNOWN"),
                        confidence=entity_data.get("confidence", 0.0),
                        begin_offset=entity_data.get("begin_offset", 0),
                        end_offset=entity_data.get("end_offset", 0)
                    )
                    medical_entities.append(entity)
                
                # Process diagnoses
                for diag_data in analysis_data.get("diagnoses", []):
                    diagnosis = Diagnosis(
                        name=diag_data.get("name", ""),
                        confidence=diag_data.get("confidence", 0.0)
                    )
                    diagnoses.append(diagnosis)
                
                # Process medications
                for med_data in analysis_data.get("medications", []):
                    medication = Medication(
                        name=med_data.get("name", ""),
                        dosage=med_data.get("dosage"),
                        frequency=med_data.get("frequency"),
                        confidence=med_data.get("confidence", 0.0)
                    )
                    medications.append(medication)
                
                # Process procedures
                for proc_data in analysis_data.get("procedures", []):
                    procedure = Procedure(
                        name=proc_data.get("name", ""),
                        confidence=proc_data.get("confidence", 0.0)
                    )
                    procedures.append(procedure)
                
                return {
                    "entities": [entity.dict() for entity in medical_entities],
                    "diagnoses": [diagnosis.dict() for diagnosis in diagnoses],
                    "medications": [medication.dict() for medication in medications],
                    "procedures": [procedure.dict() for procedure in procedures],
                    "summary": analysis_data.get("summary", "No summary available"),
                    "confidence": analysis_data.get("confidence", 0.0),
                    "phi_detected": False  # Bedrock doesn't detect PHI directly
                }
                
            except json.JSONDecodeError:
                # Fallback if Nova Pro doesn't return valid JSON
                return {
                    "entities": [],
                    "diagnoses": [],
                    "medications": [],
                    "procedures": [],
                    "summary": content,  # Use raw response as summary
                    "confidence": 0.5,
                    "phi_detected": False
                }
        
        except Exception as e:
            error_msg = str(e)
            # Handle specific Nova Pro errors
            if "ValidationException" in error_msg:
                error_msg = "Nova Pro model validation error - check model availability in your region"
            elif "AccessDeniedException" in error_msg:
                error_msg = "Nova Pro access denied - check IAM permissions for bedrock:InvokeModel"
            elif "ThrottlingException" in error_msg:
                error_msg = "Nova Pro rate limit exceeded - please retry"
            
            return {
                "entities": [],
                "diagnoses": [],
                "medications": [],
                "procedures": [],
                "summary": f"Nova Pro analysis unavailable: {error_msg}",
                "confidence": 0.0,
                "phi_detected": False
            }
    
    def get_model_info(self) -> Dict[str, str]:
        """Get information about the current model"""
        return {
            "model_id": self.model_id,
            "model_name": "Amazon Nova Pro",
            "provider": "Amazon",
            "capabilities": "Medical text analysis, entity extraction, clinical summarization"
        }