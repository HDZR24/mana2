from pydantic import BaseModel
from datetime import date
from typing import Optional

class GlucoseMeasurementBase(BaseModel):
    patient_id: int
    level_maj_130_min_110: Optional[bool] = None
    level_measured: Optional[int] = None
    uncontrolled: Optional[bool] = None
    control_level: Optional[str] = None
    measurement_date: date
    peak_level: Optional[str] = None
    peak_level_value: Optional[float] = None

class GlucoseMeasurementCreate(GlucoseMeasurementBase):
    pass

class GlucoseMeasurement(GlucoseMeasurementBase):
    id: int

    class Config:
        from_attributes = True