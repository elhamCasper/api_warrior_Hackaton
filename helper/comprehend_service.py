import boto3
import json
from typing import Dict, Any, List
from config import settings
from model.clinical_model import MedicalEntity, Diagnosis, Medication, Procedure

class ComprehendService:
    def __init__(self):
        self.comprehend_medical = boto3.client('comprehendmedical',
                                                aws_access_key_id=settings.aws_access_key_id,
                                                aws_secret_access_key=settings.aws_secret_access_key,
                                                region_name=settings.aws_default_region)
    
    async def analyze_medical_text(self, text: str) -> Dict[str, Any]:
        """Analyze medical text using Amazon Comprehend Medical"""
        try:
            # Detect medical entities
            entities_response = self.comprehend_medical.detect_entities_v2(Text=text)
            
            # Detect PHI (Personal Health Information)
            phi_response = self.comprehend_medical.detect_phi(Text=text)
            
            # Process entities
            medical_entities = []
            diagnoses = []
            medications = []
            procedures = []
            
            for entity in entities_response['Entities']:
                medical_entity = MedicalEntity(
                    text=entity['Text'],
                    category=entity['Category'],
                    type=entity['Type'],
                    confidence=entity['Score'],
                    begin_offset=entity['BeginOffset'],
                    end_offset=entity['EndOffset']
                )
                medical_entities.append(medical_entity)
                
                # Categorize entities
                if entity['Category'] == 'MEDICAL_CONDITION':
                    diagnosis = Diagnosis(
                        name=entity['Text'],
                        confidence=entity['Score']
                    )
                    diagnoses.append(diagnosis)
                
                elif entity['Category'] == 'MEDICATION':
                    medication = Medication(
                        name=entity['Text'],
                        confidence=entity['Score']
                    )
                    medications.append(medication)
                
                elif entity['Category'] == 'PROCEDURE':
                    procedure = Procedure(
                        name=entity['Text'],
                        confidence=entity['Score']
                    )
                    procedures.append(procedure)
            
            # Generate clinical summary
            summary = self._generate_clinical_summary(text, medical_entities, diagnoses, medications, procedures)
            
            # Calculate overall confidence
            confidence = self._calculate_confidence(medical_entities)
            
            return {
                "entities": [entity.dict() for entity in medical_entities],
                "diagnoses": [diagnosis.dict() for diagnosis in diagnoses],
                "medications": [medication.dict() for medication in medications],
                "procedures": [procedure.dict() for procedure in procedures],
                "summary": summary,
                "confidence": confidence,
                "phi_detected": len(phi_response['Entities']) > 0
            }
        
        except Exception as e:
            raise Exception(f"Medical analysis error: {str(e)}")
    
    def _generate_clinical_summary(self, text: str, entities: List[MedicalEntity], 
                                 diagnoses: List[Diagnosis], medications: List[Medication], 
                                 procedures: List[Procedure]) -> str:
        """Generate a structured clinical summary"""
        summary_parts = []
        
        if diagnoses:
            summary_parts.append(f"DIAGNOSES: {', '.join([d.name for d in diagnoses[:3]])}")
        
        if medications:
            summary_parts.append(f"MEDICATIONS: {', '.join([m.name for m in medications[:3]])}")
        
        if procedures:
            summary_parts.append(f"PROCEDURES: {', '.join([p.name for p in procedures[:3]])}")
        
        # Extract key symptoms and findings
        symptoms = [e.text for e in entities if e.category == 'SYMPTOM'][:3]
        if symptoms:
            summary_parts.append(f"SYMPTOMS: {', '.join(symptoms)}")
        
        return " | ".join(summary_parts) if summary_parts else "No significant medical findings identified."
    
    def _calculate_confidence(self, entities: List[MedicalEntity]) -> float:
        """Calculate overall confidence score"""
        if not entities:
            return 0.0
        
        total_confidence = sum(entity.confidence for entity in entities)
        return round(total_confidence / len(entities), 2)