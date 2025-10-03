from sqlalchemy import Column, Integer, Boolean, String, Date, ForeignKey, DECIMAL
from app.db.session import Base

class GlucoseMeasurement(Base):
    __tablename__ = "glucose_measurements"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey('patients.id'))
    level_maj_130_min_110 = Column(Boolean)  # Rango de glicemia
    level_measured = Column(Integer)  # Valor medido de glicemia
    uncontrolled = Column(Boolean)  # ¿Descontrol?
    control_level = Column(String(50))  # "Alto", "Bajo"
    measurement_date = Column(Date)  # fecha de medición
    peak_level = Column(String(50))  # "Más de 130", "Menos de 110"
    peak_level_value = Column(DECIMAL(5, 2))  # Valor numérico