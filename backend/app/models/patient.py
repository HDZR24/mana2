from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from app.db.session import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    document_number = Column(String(50), unique=True, nullable=False)
    document_type = Column(String(10))
    city = Column(String(100))
    country = Column(String(100))
    height_cm = Column(Integer)
    weight_kg = Column(Integer)
    has_prediabetes = Column(Boolean, default=False)
    has_diabetes = Column(Boolean, default=False)
    diagnosis_date = Column(Date)
    doctor_name = Column(String(255))
    doctor_phone = Column(String(20))
    diabetes_type_id = Column(Integer, ForeignKey('diabetes_types.id'))
    insurance_id = Column(Integer, ForeignKey('insurances.id'))