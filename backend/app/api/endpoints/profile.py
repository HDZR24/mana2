from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserInDB, UserUpdate, HealthUpdate, HealthInfo
from app.core.security import get_current_user
from app.crud.user import get_user, update_user, update_health_info

router = APIRouter()

@router.get("/me", response_model=UserInDB)
def read_user_me(
    current_user: UserInDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener el perfil del usuario actual
    """
    db_user = get_user(db, user_id=current_user.id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_user

@router.put("/me", response_model=UserInDB)
def update_user_me(
    user_update: UserUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualizar información básica del perfil
    """
    db_user = update_user(db, user_id=current_user.id, user_update=user_update)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_user

@router.get("/me/health", response_model=HealthInfo)
def read_health_info(
    current_user: UserInDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener información de salud del usuario
    """
    db_user = get_user(db, user_id=current_user.id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_user

@router.patch("/me/health", response_model=HealthInfo)
async def update_user_health(
    health_update: HealthUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza la información de salud del usuario (método PATCH para actualizaciones parciales)
    """
    try:
        # Actualización optimizada
        db_user = await update_health_info(db, user=current_user, update_data=health_update)
        if not db_user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return db_user
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error actualizando información de salud: {str(e)}"
        )