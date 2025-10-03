from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from typing import List
from app.schemas.medical import MedicalProfileCreate

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    age: Optional[int] = Field(None, gt=18)
    gender: Optional[str] = None

class UserCreate(UserBase):
    password: str
    diabetes: bool = False
    hypertension: bool = False
    obesity: bool = False
    allergies: Optional[str] = None
    terms_accepted: bool
    data_usage_consent: bool
    medical_profile: Optional[MedicalProfileCreate] = None

    @validator('medical_profile')
    def validate_medical_profile(cls, v, values):
        if values.get('diabetes') and v is None:
            raise ValueError("Se requiere perfil médico para usuarios diabéticos")
        if not values.get('diabetes') and v is not None:
            raise ValueError("Perfil médico solo permitido para usuarios diabéticos")
        return v

class UserInDB(UserBase):
    id: int
    diabetes: bool
    hypertension: bool
    obesity: bool
    allergies: Optional[str]
    terms_accepted: bool
    data_usage_consent: bool
    is_active: bool
    is_superuser: bool

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserList(BaseModel):
    users: List[UserInDB]
    page: int
    per_page: int
    total: int
    total_pages: int

    class Config:
        from_attributes = True
        
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = Field(None, gt=18)
    gender: Optional[str] = None

class HealthUpdate(BaseModel):
    diabetes: Optional[bool] = None
    hypertension: Optional[bool] = None
    obesity: Optional[bool] = None
    allergies: Optional[str] = None

class HealthInfo(BaseModel):
    diabetes: bool
    hypertension: bool
    obesity: bool
    allergies: str
    
    class Config:
        from_attributes = True
        
class DishBase(BaseModel):
    name: str
    restaurant: Optional[str] = None
    location: Optional[str] = None
    rating: Optional[float] = None
    image: Optional[str] = None
    description: str
    health_benefits: Optional[str] = None
    category: Optional[str] = None
    price: Optional[str] = None

class DishCreate(DishBase):
    pass

class Dish(DishBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True
        
