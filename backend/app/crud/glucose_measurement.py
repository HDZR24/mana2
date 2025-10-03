from sqlalchemy.orm import Session
from app.models.glucose_measurement import GlucoseMeasurement
from app.schemas.glucose_measurement import GlucoseMeasurementCreate

def create_glucose_measurement(db: Session, glucose_measurement: GlucoseMeasurementCreate):
    db_glucose_measurement = GlucoseMeasurement(**glucose_measurement.model_dump())
    db.add(db_glucose_measurement)
    db.commit()
    db.refresh(db_glucose_measurement)
    return db_glucose_measurement

def get_glucose_measurements_by_patient(db: Session, patient_id: int, skip: int = 0, limit: int = 100):
    return db.query(GlucoseMeasurement).filter(GlucoseMeasurement.patient_id == patient_id).offset(skip).limit(limit).all()