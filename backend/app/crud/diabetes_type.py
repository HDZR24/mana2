from sqlalchemy.orm import Session
from app.models.diabetes_type import DiabetesType
from app.schemas.diabetes_type import DiabetesTypeCreate

def create_diabetes_type(db: Session, diabetes_type: DiabetesTypeCreate):
    db_diabetes_type = DiabetesType(**diabetes_type.model_dump())
    db.add(db_diabetes_type)
    db.commit()
    db.refresh(db_diabetes_type)
    return db_diabetes_type

def get_diabetes_type(db: Session, diabetes_type_id: int):
    return db.query(DiabetesType).filter(DiabetesType.id == diabetes_type_id).first()