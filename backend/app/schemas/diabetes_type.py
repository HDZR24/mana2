from pydantic import BaseModel

class DiabetesTypeBase(BaseModel):
    type: str
    insulin_production: bool
    insulin_absorption: bool
    physical_inactivity: bool
    obesity: bool
    family_history: bool

class DiabetesTypeCreate(DiabetesTypeBase):
    pass

class DiabetesType(DiabetesTypeBase):
    id: int

    class Config:
        from_attributes = True