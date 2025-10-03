from sqlalchemy.orm import Session
from app.models.calification import Calification
from app.schemas.calification import CalificationCreate

def create_calification(db: Session, calification: CalificationCreate):
    db_calification = Calification(**calification.model_dump())
    db.add(db_calification)
    db.commit()
    db.refresh(db_calification)
    return db_calification

def get_califications(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Calification).offset(skip).limit(limit).all()

def get_calification(db: Session, calification_id: int):
    return db.query(Calification).filter(Calification.id == calification_id).first()

def get_califications_by_user(db: Session, user_id: int):
    return db.query(Calification).filter(Calification.user_id == user_id).all()