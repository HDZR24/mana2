from pydantic import BaseModel
from typing import Optional, List

class TourStopBase(BaseModel):
    id: int  # ID de la ruta
    route_name: str
    stop_number: int
    stop_name: Optional[str] = None
    arrival_time: Optional[str] = None
    departure_time: Optional[str] = None
    location_url: str

class TourStopCreate(TourStopBase):
    pass

class TourStop(TourStopBase):
    class Config:
        from_attributes = True

class TourRoute(BaseModel):
    id: int
    route_name: str
    stops: List[TourStop]  # Lista de todas las paradas
    
    class Config:
        from_attributes = True

class TourStopList(BaseModel):
    routes: List[TourRoute]  # Lista de rutas completas