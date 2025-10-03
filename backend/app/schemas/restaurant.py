from pydantic import BaseModel
from typing import List, Optional

class RestaurantBase(BaseModel):
    name: str
    location: Optional[str] = None
    rating: Optional[float] = None
    image: Optional[str] = None
    description: Optional[str] = None
    specialties: Optional[str] = None

class RestaurantCreate(RestaurantBase):
    pass

class Restaurant(RestaurantBase):
    id: int

    class Config:
        from_attributes = True