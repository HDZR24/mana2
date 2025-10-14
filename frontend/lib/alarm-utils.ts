import type { Alarm } from "@/types/alarm"

/**
 * Formats a UTC time string to local time in 12-hour format
 * @param utcTimeString Time string in UTC format (HH:MM:SS)
 * @returns Formatted local time string (HH:MM AM/PM)
 */
export function formatTimeForDisplay(utcTimeString: string): string {
  try {
    // Crear fecha UTC (usamos una fecha base 1970-01-01)
    const utcDate = new Date(`1970-01-01T${utcTimeString}Z`);
    
    // Convertir a hora local
    const localHours = utcDate.getHours();
    const localMinutes = utcDate.getMinutes();
    
    // Formatear a 12 horas
    const ampm = localHours >= 12 ? 'PM' : 'AM';
    const hours12 = localHours % 12 || 12;  // Convertir 0 a 12
    const formattedMinutes = localMinutes < 10 ? `0${localMinutes}` : localMinutes;
    
    return `${hours12}:${formattedMinutes} ${ampm}`;
  } catch (error) {
    console.error("Error formatting UTC time:", utcTimeString, error);
    return "N/A";
  }
}

/**
 * Calculates next alarm time and status with UTC conversion
 * @param alarm Alarm object
 * @returns Formatted time and status
 */
export function calculateNextAlarmTimeAndStatus(alarm: Alarm): { formattedTime: string; status: string } {
  try {
    const now = new Date();
    
    // Parse next_alarm_time robustly: support
    // - time-only strings like "05:52:00"
    // - full ISO datetimes like "2025-10-13T05:52:00" (with or without timezone)
    const s = alarm.next_alarm_time

    if (!s || typeof s !== "string") {
      console.error("next_alarm_time missing or invalid type:", s)
      return { formattedTime: "Fecha inválida", status: "Error" }
    }

    let utcDate: Date | null = null
    const timeOnlyRegex = /^\d{2}:\d{2}(:\d{2})?$/
    const isoNoTZRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/

    if (timeOnlyRegex.test(s)) {
      // treat as UTC time on a base date
      utcDate = new Date(`1970-01-01T${s}Z`)
    } else if (isoNoTZRegex.test(s)) {
      // ISO datetime without timezone — assume it's UTC and append 'Z'
      utcDate = new Date(s + "Z")
    } else {
      // Try to parse directly (covers ISO with timezone or other formats)
      const parsed = new Date(s)
      if (!isNaN(parsed.getTime())) {
        utcDate = parsed
      }
    }

    if (!utcDate || isNaN(utcDate.getTime())) {
      console.error("Invalid next_alarm_time:", alarm.next_alarm_time)
      return { formattedTime: "Fecha inválida", status: "Error" }
    }

    // Crear fecha local dependiendo de si se recibió solo la hora o una fecha completa
    let localAlarmDate: Date
    if (timeOnlyRegex.test(s)) {
      // For time-only values, use today's date but interpret the time as UTC
      localAlarmDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        utcDate.getUTCHours(),
        utcDate.getUTCMinutes(),
        utcDate.getUTCSeconds(),
      )
    } else {
      // For full datetimes use the parsed date (it already represents an absolute instant).
      localAlarmDate = utcDate
    }

    // Verificar si es válido
    if (isNaN(localAlarmDate.getTime())) {
      console.error("Invalid next_alarm_time:", alarm.next_alarm_time);
      return { formattedTime: "Fecha inválida", status: "Error" };
    }

    const isToday = localAlarmDate.getDate() === now.getDate();
    const isPast = localAlarmDate.getTime() < now.getTime();

    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    let formattedTime = localAlarmDate.toLocaleTimeString("es-ES", options);
    let status = "Próxima";

    if (isToday) {
      if (isPast) {
        status = "Pendiente hoy (pasada)";
      } else {
        status = "Pendiente hoy";
      }
    } else if (localAlarmDate.getTime() < now.getTime()) {
      status = "Pasada";
      formattedTime = localAlarmDate.toLocaleDateString("es-ES", { 
        day: "2-digit", 
        month: "2-digit" 
      }) + " " + formattedTime;
    } else {
      formattedTime = localAlarmDate.toLocaleDateString("es-ES", { 
        day: "2-digit", 
        month: "2-digit" 
      }) + " " + formattedTime;
    }

    return { formattedTime, status };
  } catch (error) {
    console.error("Error processing alarm:", alarm, error);
    return { formattedTime: "N/A", status: "Error" };
  }
}
