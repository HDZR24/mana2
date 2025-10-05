from pydantic import BaseModel
from datetime import time, datetime
from typing import List, Optional
from pydantic import Field, validator

class MedicationAlarmCreate(BaseModel):
    medication_name: str
    dosage: str
    frequency_hours: int = Field(..., gt=0, le=24)  # 1-24 horas
    start_time: time

    @validator('frequency_hours')
    def validate_frequency(cls, v):
        if v <= 0 or v > 24:
            raise ValueError("Frequency must be between 1 and 24 hours")
        return v

class MedicationAlarm(MedicationAlarmCreate):
    id: int
    user_id: int
    next_alarm_time: datetime  # Cambiado de Optional[time] a datetime
    
    class Config:
        from_attributes = True

class MedicationAlarmList(BaseModel):
    alarms: List[MedicationAlarm]
