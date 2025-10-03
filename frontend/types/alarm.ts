export interface Alarm {
  id: number
  user_id: number
  medication_name: string
  dosage: string
  frequency_hours: number
  start_time: string // "HH:MM:SS.sssZ"
  next_alarm_time: string // "YYYY-MM-DDTHH:MM:SS.sssZ"
}

export interface NewAlarm {
  medication_name: string
  dosage: string
  frequency_hours: number
  start_time: string // "HH:MM:SS.sssZ"
}
