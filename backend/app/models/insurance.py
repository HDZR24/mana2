from sqlalchemy import Column, Integer, String, Boolean
from app.db.session import Base

class Insurance(Base):
    __tablename__ = "insurances"

    id = Column(Integer, primary_key=True, index=True)
    policy_name = Column(String(255))
    policy_number = Column(String(100))
    eps = Column(String(100))
    medical_center = Column(String(255))
    available_in_cartagena = Column(Boolean)  # ¿Cubre en Cartagena?