from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.dish import Dish, DishCreate
from app.crud.dish import get_dishes, create_dish, get_dish

router = APIRouter(tags=["Platos"])

@router.get("/dishes", response_model=List[Dish])
def read_dishes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    dishes = get_dishes(db, skip=skip, limit=limit)
    return dishes

@router.get("/dishes/{dish_id}", response_model=Dish)
def read_dish(dish_id: int, db: Session = Depends(get_db)):
    db_dish = get_dish(db, dish_id=dish_id)
    if db_dish is None:
        raise HTTPException(status_code=404, detail="Plato no encontrado")
    return db_dish

@router.post("/dishes", response_model=Dish)
def create_new_dish(dish: DishCreate, db: Session = Depends(get_db)):
    return create_dish(db=db, dish=dish)