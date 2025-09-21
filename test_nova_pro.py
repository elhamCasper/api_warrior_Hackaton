#!/usr/bin/env python3
"""
Test script for Amazon Nova Pro medical analysis
"""
import asyncio
import sys
from helper.comprehend_service import ComprehendService

async def test_nova_pro():
    """Test Nova Pro with sample medical text"""
    
    # Sample medical transcription
    sample_text = """
    Patient presents with chest pain and shortness of breath. 
    Started on aspirin 81mg daily and lisinopril 10mg once daily.
    Ordered echocardiogram and stress test.
    Patient reports feeling dizzy and nauseous.
    Blood pressure 140/90, heart rate 85 bpm.
    """
    
    print("🔬 Testing Amazon Nova Pro Medical Analysis")
    print("=" * 50)
    print(f"Sample text: {sample_text.strip()}")
    print("\n" + "=" * 50)
    
    try:
        # Initialize service
        service = ComprehendService()
        
        # Get model info
        model_info = service.get_model_info()
        print(f"Model: {model_info['model_name']} ({model_info['model_id']})")
        print(f"Provider: {model_info['provider']}")
        print(f"Capabilities: {model_info['capabilities']}")
        print("\n" + "-" * 50)
        
        # Analyze text
        print("🤖 Analyzing with Nova Pro...")
        result = await service.analyze_medical_text(sample_text)
        
        # Display results
        print("\n📊 ANALYSIS RESULTS:")
        print(f"Overall Confidence: {result['confidence']}")
        print(f"Summary: {result['summary']}")
        
        print(f"\n💊 Medications ({len(result['medications'])}):")
        for med in result['medications']:
            print(f"  - {med['name']} (confidence: {med['confidence']:.2f})")
            if med.get('dosage'):
                print(f"    Dosage: {med['dosage']}")
            if med.get('frequency'):
                print(f"    Frequency: {med['frequency']}")
        
        print(f"\n🏥 Diagnoses ({len(result['diagnoses'])}):")
        for diag in result['diagnoses']:
            print(f"  - {diag['name']} (confidence: {diag['confidence']:.2f})")
        
        print(f"\n🔬 Procedures ({len(result['procedures'])}):")
        for proc in result['procedures']:
            print(f"  - {proc['name']} (confidence: {proc['confidence']:.2f})")
        
        print(f"\n📋 All Entities ({len(result['entities'])}):")
        for entity in result['entities']:
            print(f"  - {entity['text']} [{entity['category']}] (confidence: {entity['confidence']:.2f})")
        
        print("\n✅ Nova Pro test completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error testing Nova Pro: {str(e)}")
        print("\nPossible issues:")
        print("1. Nova Pro not available in your AWS region")
        print("2. Missing IAM permissions for bedrock:InvokeModel")
        print("3. Nova Pro not enabled in your account")
        print("4. Network connectivity issues")
        return False
    
    return True

if __name__ == "__main__":
    success = asyncio.run(test_nova_pro())
    sys.exit(0 if success else 1)