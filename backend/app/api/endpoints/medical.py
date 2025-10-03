from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.medical import MedicalProfileCreate, MedicalProfileResponse
from app.crud.medical import create_medical_profile
from app.core.security import get_current_user
from app.models.user import User
from app.models.patient import Patient
from app.models.diabetes_type import DiabetesType
from app.models.insurance import Insurance
from app.models.glucometer_usage import GlucometerUsage
from app.models.glucose_measurement import GlucoseMeasurement
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/profile", status_code=status.HTTP_201_CREATED)
def create_medical_profile_endpoint(
    profile: MedicalProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        create_medical_profile(db, user_id=current_user.id, profile=profile)
        return {"message": "Perfil médico creado exitosamente"}
    except Exception as e:
        # Registrar el error completo
        logger.exception("Error creating medical profile")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno al crear el perfil médico"
        )


@router.get("/profile", response_model=MedicalProfileResponse)
def get_medical_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Obtener paciente asociado al usuario
    patient = db.query(Patient).filter(Patient.id == current_user.id).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil médico no encontrado"
        )
    
    # Obtener datos relacionados
    diabetes_type = db.query(DiabetesType).filter(DiabetesType.id == patient.diabetes_type_id).first()
    insurance = db.query(Insurance).filter(Insurance.id == patient.insurance_id).first()
    glucometer_usage = db.query(GlucometerUsage).filter(GlucometerUsage.patient_id == patient.id).first()
    glucose_measurements = db.query(GlucoseMeasurement).filter(GlucoseMeasurement.patient_id == patient.id).all()
    
    # Construir respuesta estructurada
    return {
        "document_number": patient.document_number,
        "document_type": patient.document_type,
        "city": patient.city,
        "country": patient.country,
        "height_cm": patient.height_cm,
        "weight_kg": patient.weight_kg,
        "has_prediabetes": patient.has_prediabetes,
        "has_diabetes": patient.has_diabetes,
        "diagnosis_date": patient.diagnosis_date,
        "doctor_name": patient.doctor_name,
        "doctor_phone": patient.doctor_phone,
        "diabetes_type": diabetes_type,
        "insurance": insurance,
        "glucometer_usage": glucometer_usage,
        "glucose_measurements": glucose_measurements
    }