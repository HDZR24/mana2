from sqlalchemy import Column, Integer, Boolean, String, Time, ForeignKey
from app.db.session import Base

class MedicalRecommendation(Base):
    __tablename__ = "medical_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey('patients.id'))
    measurement_interval_hours = Column(Integer)  # Intervalo de medición en horas
    first_measurement_time = Column(Time)  # Hora de la primera medición
    abdo_insulin_applied = Column(Boolean)  # ¿Se aplica insulina abdominal?
    water_interval_hours = Column(Integer)  # Intervalo de ingesta de agua
    water_amount_per_intake = Column(String(50))  # Ej: "Un litro"