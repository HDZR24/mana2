from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.tour_stop import TourStop, TourStopCreate, TourRoute, TourStopList
from app.crud.tour_stop import create_tour_stop, get_tour_stops, get_tour_stop, get_tour_route

router = APIRouter(tags=["Tour Stops"])

@router.post("/tour-stops", response_model=TourStop)
def create_tour_stop_endpoint(
    tour_stop: TourStopCreate,
    db: Session = Depends(get_db)
):
    return create_tour_stop(db, tour_stop)

@router.get("/tour-stops", response_model=List[TourStop])
def read_tour_stops(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_tour_stops(db, skip=skip, limit=limit)

# Obtener una parada específica
@router.get("/routes/{route_id}/stops/{stop_number}", response_model=TourStop)
def read_tour_stop(
    route_id: int, 
    stop_number: int,
    db: Session = Depends(get_db)
):
    db_tour_stop = get_tour_stop(db, route_id, stop_number)
    if not db_tour_stop:
        raise HTTPException(status_code=404, detail="Tour stop not found")
    return db_tour_stop

# Obtener una ruta completa por ID
@router.get("/routes/{route_id}", response_model=TourRoute)
def get_route(route_id: int, db: Session = Depends(get_db)):
    stops = get_tour_route(db, route_id)
    if not stops:
        raise HTTPException(status_code=404, detail="Route not found")
    
    # Construir objeto de ruta
    return TourRoute(
        id=route_id,
        route_name=stops[0].route_name if stops else "",
        stops=stops
    )

# Obtener todas las rutas disponibles
@router.get("/routes", response_model=TourStopList)
def get_all_routes(db: Session = Depends(get_db)):
    # Obtener todos los IDs de rutas únicos
    route_ids = [stop.id for stop in db.query(TourStop.id).distinct().all()]
    
    routes = []
    for route_id in route_ids:
        stops = get_tour_route(db, route_id)
        if stops:
            routes.append(TourRoute(
                id=route_id,
                route_name=stops[0].route_name,
                stops=stops
            ))
    
    return {"routes": routes}