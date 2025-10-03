from pydantic import BaseModel
from typing import Optional

class GlucometerUsageBase(BaseModel):
    patient_id: int
    uses_glucometer: bool
    brand: Optional[str] = None

class GlucometerUsageCreate(GlucometerUsageBase):
    pass

class GlucometerUsage(GlucometerUsageBase):
    id: int

    class Config:
        from_attributes = True