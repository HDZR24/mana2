from pydantic import BaseModel, Field, conint

class CalificationBase(BaseModel):
    user_id: int
    rating: int = Field(..., ge=1, le=5, description="Rating must be between 1 and 5")

class CalificationCreate(CalificationBase):
    pass

class Calification(CalificationBase):
    id: int

    class Config:
        from_attributes = True

class CalificationList(BaseModel):
    califications: list[Calification]