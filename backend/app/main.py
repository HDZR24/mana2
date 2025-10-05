from app.models.chat_message import ChatMessage
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.notification import MedicationAlarm 
from app.db.session import SessionLocal, engine, Base
from app.api.endpoints.dishes import router as dishes_router
from app.api.endpoints.auth import router as auth_router
from app.api.endpoints.users import router as users_router
from app.api.endpoints.profile import router as profile_router
from app.api.endpoints.restaurants import router as restaurants_router
from app.api.endpoints.medical import router as medical_router
from app.api.endpoints.notifications import router as notifications_router
from app.api.endpoints.tour_stops import router as tour_stops_router
from app.api.endpoints.califications import router as califications_router
from app.db.init_db import init_db

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.on_event("startup")
def on_startup():
    init_db()
    print("✅ Initialization complete - Admin user created if needed")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router, prefix="/api/v1/auth", tags=["Autenticación"])
app.include_router(users_router, prefix="/api/v1/users", tags=["Usuarios"])
app.include_router(profile_router, prefix="/api/v1", tags=["Perfil"])
app.include_router(dishes_router, prefix="/api/v1", tags=["Platos"])
app.include_router(restaurants_router, prefix="/api/v1", tags=["Restaurantes"])
app.include_router(medical_router, prefix="/api/v1/medical", tags=["Perfil Médico"])
app.include_router(notifications_router,prefix="/api/v1/notifications",tags=["Notificaciones"])
app.include_router(tour_stops_router, prefix="/api/v1", tags=["Tour Stops"])
app.include_router(califications_router, prefix="/api/v1", tags=["Calificaciones"])
