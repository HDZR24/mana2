from sqlalchemy import Column, Integer, Boolean, String, ForeignKey
from app.db.session import Base

class GlucometerUsage(Base):
    __tablename__ = "glucometer_usage"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey('patients.id'))
    uses_glucometer = Column(Boolean)
    brand = Column(String(100))  # Si usa glucómetro que ponga la marca