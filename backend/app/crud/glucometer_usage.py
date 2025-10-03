from sqlalchemy.orm import Session
from app.models.glucometer_usage import GlucometerUsage
from app.schemas.glucometer_usage import GlucometerUsageCreate

def create_glucometer_usage(db: Session, glucometer_usage: GlucometerUsageCreate):
    db_glucometer_usage = GlucometerUsage(**glucometer_usage.model_dump())
    db.add(db_glucometer_usage)
    db.commit()
    db.refresh(db_glucometer_usage)
    return db_glucometer_usage

def get_glucometer_usage_by_patient(db: Session, patient_id: int):
    return db.query(GlucometerUsage).filter(GlucometerUsage.patient_id == patient_id).first()