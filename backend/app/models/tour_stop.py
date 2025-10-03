from sqlalchemy import Column, Integer, String, Text
from app.db.session import Base

class TourStop(Base):
    __tablename__ = "tour_stops"

    # id: identificador de la ruta (no autoincremental)
    id = Column(Integer, primary_key=True, index=True)
    
    route_name = Column(String(100), nullable=False)
    stop_number = Column(Integer, primary_key=True, index=True)  # Parte de la clave primaria compuesta
    stop_name = Column(String(100), nullable=True)
    arrival_time = Column(String(50), nullable=True)
    departure_time = Column(String(50), nullable=True)
    location_url = Column(Text, nullable=False)