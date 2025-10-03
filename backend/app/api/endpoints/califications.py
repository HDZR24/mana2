from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.calification import Calification, CalificationCreate, CalificationList
from app.crud.calification import create_calification, get_califications, get_calification, get_califications_by_user
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(tags=["Calificaciones"])

@router.post("/califications", response_model=Calification)
def create_calification_endpoint(
    calification: CalificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verificar que el usuario solo pueda calificarse a sí mismo
    if current_user.id != calification.user_id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes calificar tu propia experiencia"
        )
    
    return create_calification(db, calification)

@router.get("/califications", response_model=List[Calification])
def read_califications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_califications(db, skip=skip, limit=limit)

@router.get("/califications/{calification_id}", response_model=Calification)
def read_calification(calification_id: int, db: Session = Depends(get_db)):
    db_calification = get_calification(db, calification_id)
    if not db_calification:
        raise HTTPException(status_code=404, detail="Calificación no encontrada")
    return db_calification

@router.get("/users/{user_id}/califications", response_model=CalificationList)
def read_califications_by_user(user_id: int, db: Session = Depends(get_db)):
    califications = get_califications_by_user(db, user_id)
    return {"califications": califications}