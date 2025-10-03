from pydantic import BaseModel
from datetime import time
from typing import Optional

class MedicalRecommendationBase(BaseModel):
    patient_id: int
    measurement_interval_hours: Optional[int] = None
    first_measurement_time: Optional[time] = None
    abdo_insulin_applied: Optional[bool] = None
    water_interval_hours: Optional[int] = None
    water_amount_per_intake: Optional[str] = None

class MedicalRecommendationCreate(MedicalRecommendationBase):
    pass

class MedicalRecommendation(MedicalRecommendationBase):
    id: int

    class Config:
        from_attributes = True