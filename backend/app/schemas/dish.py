from pydantic import BaseModel
from typing import Optional


class DishBase(BaseModel):
    name: str
    restaurant: Optional[str] = None
    rating: Optional[float] = None
    description: str
    health_benefits: Optional[str] = None
    category: Optional[str] = None
    price_usd: Optional[float] = None
    price_cop: Optional[float] = None
    price_delivery: Optional[float] = None
    main_protein: Optional[str] = None
    ingredients: Optional[str] = None


class DishCreate(DishBase):
    pass


class Dish(DishBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True
