from sqlalchemy.orm import Session
from app.models.notification import MedicationAlarm
from app.schemas.notification import MedicationAlarmCreate
from datetime import datetime, timedelta, time, timezone 
from zoneinfo import ZoneInfo


def create_medication_alarm(db: Session, alarm: MedicationAlarmCreate, user_id: int):
    db_alarm = MedicationAlarm(
        user_id=user_id,
        medication_name=alarm.medication_name,
        dosage=alarm.dosage,
        frequency_hours=alarm.frequency_hours,
        start_time=alarm.start_time,
        next_alarm_time=calculate_next_alarm_time(alarm.start_time, alarm.frequency_hours)
    )
    db.add(db_alarm)
    db.commit()
    db.refresh(db_alarm)
    return db_alarm

def get_medication_alarms_by_user(db: Session, user_id: int):
    alarms = db.query(MedicationAlarm).filter(MedicationAlarm.user_id == user_id).all()
    return alarms

def delete_medication_alarm(db: Session, alarm_id: int, user_id: int):
    alarm = db.query(MedicationAlarm).filter(
        MedicationAlarm.id == alarm_id,
        MedicationAlarm.user_id == user_id
    ).first()
    if alarm:
        db.delete(alarm)
        db.commit()
        return True
    return False

def calculate_next_alarm_time(start_time: time, frequency_hours: int) -> datetime:
    # Zona horaria Bogotá
    bogota_tz = ZoneInfo("America/Bogota")

    # Obtener la hora actual en Bogotá
    now = datetime.now(bogota_tz)

    # Crear un datetime con la fecha de hoy y la hora de inicio
    start_datetime = datetime.combine(now.date(), start_time)
    start_datetime = start_datetime.replace(tzinfo=bogota_tz)

    # Si la hora de inicio ya pasó hoy, sumar intervalos hasta que esté en el futuro
    while start_datetime <= now:
        start_datetime += timedelta(hours=frequency_hours)

    return start_datetime.time()
