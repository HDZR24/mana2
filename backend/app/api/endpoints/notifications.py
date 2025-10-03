from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.notification import MedicationAlarmCreate, MedicationAlarm, MedicationAlarmList
from app.crud.notification import (
    create_medication_alarm,
    get_medication_alarms_by_user,
    delete_medication_alarm,
    calculate_next_alarm_time
)
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(tags=["Notificaciones"])

@router.post("/alarms", response_model=MedicationAlarm, status_code=status.HTTP_201_CREATED)
def create_alarm(
    alarm: MedicationAlarmCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
): 
    return create_medication_alarm(db, alarm, current_user.id)

@router.get("/alarms", response_model=MedicationAlarmList)
def get_alarms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alarms = get_medication_alarms_by_user(db, current_user.id)
    
    # Actualizar tiempos de próxima alarma
    updated_alarms = []
    for alarm in alarms:
        alarm.next_alarm_time = calculate_next_alarm_time(
            alarm.start_time, alarm.frequency_hours
        )
        updated_alarms.append(alarm)
    
    return {"alarms": updated_alarms}

@router.delete("/alarms/{alarm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alarm(
    alarm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not delete_medication_alarm(db, alarm_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alarma no encontrada"
        )
    return
