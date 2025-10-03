from sqlalchemy.orm import Session
from app.models.insurance import Insurance
from app.schemas.insurance import InsuranceCreate

def create_insurance(db: Session, insurance: InsuranceCreate):
    db_insurance = Insurance(**insurance.model_dump())
    db.add(db_insurance)
    db.commit()
    db.refresh(db_insurance)
    return db_insurance

def get_insurance(db: Session, insurance_id: int):
    return db.query(Insurance).filter(Insurance.id == insurance_id).first()