from sqlalchemy import Column, Integer, String, Time, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base

class MedicationAlarm(Base):
    __tablename__ = "medication_alarms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    medication_name = Column(String(100), nullable=False)
    dosage = Column(String(50), nullable=False)
    frequency_hours = Column(Integer, nullable=False)  # Cada cuántas horas
    start_time = Column(Time, nullable=False)          # Primera hora (solo hora)
    next_alarm_time = Column(DateTime, nullable=False) # Próxima alarma (fecha y hora completa)
    
    # Relación opcional para acceso más fácil
    user = relationship("User", back_populates="medication_alarms")
