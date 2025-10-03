from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.user import UserInDB, UserList
from app.crud.user import get_users, get_users_count
from fastapi import Query

router = APIRouter()

@router.get("/", response_model=UserList)
def read_users(
    page: int = Query(1, gt=0, description="Número de página"),
    per_page: int = Query(10, gt=0, le=100, description="Elementos por página"),
    db: Session = Depends(get_db)
):
    # Calcular el offset (saltar)
    skip = (page - 1) * per_page
    
    # Obtener usuarios paginados
    users = get_users(db, skip=skip, limit=per_page)
    
    # Obtener el total de usuarios
    total = get_users_count(db)
    
    # Calcular el total de páginas
    total_pages = (total + per_page - 1) // per_page
    
    return {
        "users": users,
        "page": page,
        "per_page": per_page,
        "total": total,
        "total_pages": total_pages
    }