from sqlalchemy.orm import Session
from app.models.dish import Dish
from app.schemas.dish import DishCreate


def get_dish(db: Session, dish_id: int):
    return db.query(Dish).filter(Dish.id == dish_id).first()


def get_dishes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Dish).filter(Dish.is_active == True).offset(skip).limit(limit).all()


def create_dish(db: Session, dish: DishCreate):
    db_dish = Dish(**dish.model_dump())
    db.add(db_dish)
    db.commit()
    db.refresh(db_dish)
    return db_dish
