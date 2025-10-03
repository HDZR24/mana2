from pydantic import BaseModel
from datetime import date
from typing import List, Optional

class DiabetesTypeBase(BaseModel):
    type: str
    insulin_production: bool
    insulin_absorption: bool
    physical_inactivity: bool
    obesity: bool
    family_history: bool

class InsuranceBase(BaseModel):
    policy_name: str
    policy_number: str
    eps: str
    medical_center: str
    available_in_cartagena: bool

class GlucometerUsageBase(BaseModel):
    uses_glucometer: bool
    brand: Optional[str] = None

class GlucoseMeasurementBase(BaseModel):
    level_maj_130_min_110: Optional[bool] = None
    level_measured: Optional[int] = None
    uncontrolled: Optional[bool] = None
    control_level: Optional[str] = None
    measurement_date: Optional[date] = None
    peak_level: Optional[str] = None
    peak_level_value: Optional[float] = None

# Esquema para creación (usado en el registro)
class MedicalProfileCreate(BaseModel):
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
    diabetes_type: Optional[DiabetesTypeBase] = None
    insurance: InsuranceBase
    glucometer_usage: GlucometerUsageBase
    glucose_measurements: List[GlucoseMeasurementBase]

# Esquema para respuesta (usado en GET)
class MedicalProfileResponse(BaseModel):
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
    diabetes_type: Optional[DiabetesTypeBase] = None
    insurance: Optional[InsuranceBase] = None
    glucometer_usage: Optional[GlucometerUsageBase] = None
    glucose_measurements: List[GlucoseMeasurementBase] = []