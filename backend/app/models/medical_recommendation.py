from sqlalchemy import Column, Integer, Boolean, String, ForeignKey
from sqlalchemy.dialects.postgresql import TIME
from app.db.session import Base

class MedicalRecommendation(Base):
    __tablename__ = "medical_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey('patients.id'))
    measurement_interval_hours = Column(Integer)
    first_measurement_time = Column(TIME)  # Tipo TIME específico de PostgreSQL
    abdo_insulin_applied = Column(Boolean)
    water_interval_hours = Column(Integer)
    water_amount_per_intake = Column(String(50))
