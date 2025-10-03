from sqlalchemy.orm import Session
from app.models.medical_recommendation import MedicalRecommendation
from app.schemas.medical_recommendation import MedicalRecommendationCreate

def create_medical_recommendation(db: Session, medical_recommendation: MedicalRecommendationCreate):
    db_medical_recommendation = MedicalRecommendation(**medical_recommendation.model_dump())
    db.add(db_medical_recommendation)
    db.commit()
    db.refresh(db_medical_recommendation)
    return db_medical_recommendation

def get_medical_recommendation_by_patient(db: Session, patient_id: int):
    return db.query(MedicalRecommendation).filter(MedicalRecommendation.patient_id == patient_id).first()