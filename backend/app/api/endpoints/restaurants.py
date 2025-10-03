from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.restaurant import Restaurant, RestaurantCreate
from app.crud.restaurant import get_restaurants, create_restaurant, get_restaurant

router = APIRouter(tags=["Restaurantes"])

@router.get("/restaurants", response_model=List[Restaurant])
def read_restaurants(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    restaurants = get_restaurants(db, skip=skip, limit=limit)
    return restaurants

@router.get("/restaurants/{restaurant_id}", response_model=Restaurant)
def read_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    db_restaurant = get_restaurant(db, restaurant_id=restaurant_id)
    if db_restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurante no encontrado")
    return db_restaurant

@router.post("/restaurants", response_model=Restaurant)
def create_new_restaurant(restaurant: RestaurantCreate, db: Session = Depends(get_db)):
    return create_restaurant(db=db, restaurant=restaurant)