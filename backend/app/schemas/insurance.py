from pydantic import BaseModel

class InsuranceBase(BaseModel):
    policy_name: str
    policy_number: str
    eps: str
    medical_center: str
    available_in_cartagena: bool

class InsuranceCreate(InsuranceBase):
    pass

class Insurance(InsuranceBase):
    id: int

    class Config:
        from_attributes = True