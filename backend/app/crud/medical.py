from sqlalchemy.orm import Session
from app.models.patient import Patient
from app.models.insurance import Insurance
from app.models.glucometer_usage import GlucometerUsage
from app.models.glucose_measurement import GlucoseMeasurement
from app.models.diabetes_type import DiabetesType
from app.schemas.medical import MedicalProfileCreate
import logging

logger = logging.getLogger(__name__)

def create_medical_profile(db: Session, user_id: int, profile: MedicalProfileCreate):
    try:
        # 1. Crear diabetes type (si aplica)
        db_diabetes = None
        if profile.has_diabetes and profile.diabetes_type:
            db_diabetes = DiabetesType(**profile.diabetes_type.dict())
            db.add(db_diabetes)
            db.commit()
            db.refresh(db_diabetes)

        # 2. Crear insurance
        db_insurance = None
        if profile.insurance:
            db_insurance = Insurance(**profile.insurance.dict())
            db.add(db_insurance)
            db.commit()
            db.refresh(db_insurance)

        # 3. Crear paciente
        patient_data = {
            "id": user_id,
            "document_number": profile.document_number,
            "document_type": profile.document_type,
            "city": profile.city,
            "country": profile.country,
            "height_cm": profile.height_cm,
            "weight_kg": profile.weight_kg,
            "has_prediabetes": profile.has_prediabetes,
            "has_diabetes": profile.has_diabetes,
            "diagnosis_date": profile.diagnosis_date if profile.has_diabetes else None,
            "doctor_name": profile.doctor_name if profile.has_diabetes else None,
            "doctor_phone": profile.doctor_phone if profile.has_diabetes else None,
            "diabetes_type_id": db_diabetes.id if db_diabetes else None,
            "insurance_id": db_insurance.id if db_insurance else None
        }
        db_patient = Patient(**patient_data)
        db.add(db_patient)
        db.commit()
        db.refresh(db_patient)

        # 4. Agregar glucometer y mediciones
        if profile.glucometer_usage:
            glucometer_data = profile.glucometer_usage.dict()
            glucometer_data["patient_id"] = db_patient.id
            db_glucometer = GlucometerUsage(**glucometer_data)
            db.add(db_glucometer)

        if profile.glucose_measurements:
            for measurement in profile.glucose_measurements:
                measurement_data = measurement.dict()
                measurement_data["patient_id"] = db_patient.id
                db_measurement = GlucoseMeasurement(**measurement_data)
                db.add(db_measurement)

        db.commit()
        return True
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating medical profile: {str(e)}")
        raise e
