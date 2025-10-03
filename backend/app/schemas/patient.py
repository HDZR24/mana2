from pydantic import BaseModel
from datetime import date
from typing import Optional

class PatientBase(BaseModel):
    document_number: str
    document_type: str
    city: str
    country: str
    height_cm: int
    weight_kg: int
    has_prediabetes: bool
    has_diabetes: bool
    diagnosis_date: Optional[date] = None
    doctor_name: Optional[str] = None
    doctor_phone: Optional[str] = None
    diabetes_type_id: Optional[int] = None
    insurance_id: Optional[int] = None

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: int

    class Config:
        from_attributes = True