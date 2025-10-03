from sqlalchemy import Column, Integer, String, Boolean
from app.db.session import Base

class DiabetesType(Base):
    __tablename__ = "diabetes_types"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(20))  # Ej: 'Tipo I', 'Tipo II'
    insulin_production = Column(Boolean)  # TRUE si hay baja producción
    insulin_absorption = Column(Boolean)  # TRUE si hay baja absorción
    physical_inactivity = Column(Boolean)
    obesity = Column(Boolean)
    family_history = Column(Boolean)