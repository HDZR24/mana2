from sqlalchemy import Boolean, Column, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    age = Column(Integer)
    gender = Column(String)
    diabetes = Column(Boolean, default=False)
    hypertension = Column(Boolean, default=False)
    obesity = Column(Boolean, default=False)
    allergies = Column(Text)
    terms_accepted = Column(Boolean, default=False)
    data_usage_consent = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    # Nuevo campo para identificar superusuarios
    is_superuser = Column(Boolean, default=False)
    medication_alarms = relationship("MedicationAlarm", back_populates="user")
    califications = relationship("Calification", back_populates="user")