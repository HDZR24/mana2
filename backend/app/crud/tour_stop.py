from sqlalchemy.orm import Session
from app.models.tour_stop import TourStop
from app.schemas.tour_stop import TourStopCreate

def create_tour_stop(db: Session, tour_stop: TourStopCreate):
    db_tour_stop = TourStop(**tour_stop.model_dump())
    db.add(db_tour_stop)
    db.commit()
    db.refresh(db_tour_stop)
    return db_tour_stop

def get_tour_stops(db: Session, skip: int = 0, limit: int = 100):
    return db.query(TourStop).offset(skip).limit(limit).all()

# Buscar por clave primaria compuesta
def get_tour_stop(db: Session, route_id: int, stop_number: int):
    return db.query(TourStop).filter(
        TourStop.id == route_id,
        TourStop.stop_number == stop_number
    ).first()

# Obtener todas las paradas de una ruta por su ID
def get_tour_stops_by_route(db: Session, route_id: int):
    return db.query(TourStop).filter(
        TourStop.id == route_id
    ).order_by(TourStop.stop_number).all()

# Obtener una ruta completa por su ID
def get_tour_route(db: Session, route_id: int):
    return db.query(TourStop).filter(
        TourStop.id == route_id
    ).order_by(TourStop.stop_number).all()