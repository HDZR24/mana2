"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { CreateAlarmModal } from "./create-alarm-modal"
import { BellRing, PlusCircle, Trash2, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import type { Alarm } from "@/types/alarm"
import { calculateNextAlarmTimeAndStatus } from "@/lib/alarm-utils"

interface AlarmPanelProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function AlarmPanel({ isOpen, onOpenChange }: AlarmPanelProps) {
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null)

  const fetchAlarms = async () => {
    setIsLoading(true)
    setError(null)
    setDeleteSuccess(null)

    const token = localStorage.getItem("access_token")
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión para ver tus alarmas.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_NOTIFICATIONS_ALARMS_LIST}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Sort alarms by next_alarm_time
        const sortedAlarms = data.alarms.sort(
          (a: Alarm, b: Alarm) => new Date(a.next_alarm_time).getTime() - new Date(b.next_alarm_time).getTime(),
        )
        setAlarms(sortedAlarms)
      } else if (response.status === 401) {
        localStorage.removeItem("access_token")
        localStorage.removeItem("token_type")
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
      } else {
        const errorText = await response.text()
        setError(`Error al cargar alarmas: ${errorText || "Intenta nuevamente."}`)
      }
    } catch (err) {
      console.error("Error fetching alarms:", err)
      setError("Error de conexión al cargar las alarmas.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchAlarms()
    }
  }, [isOpen])

  const handleDeleteAlarm = async (alarmId: number) => {
    setIsLoading(true)
    setError(null)
    setDeleteSuccess(null)

    const token = localStorage.getItem("access_token")
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_NOTIFICATIONS_ALARMS_DELETE_BASE}/${alarmId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 204) {
        // 204 No Content for successful deletion
        setDeleteSuccess("Alarma eliminada exitosamente.")
        fetchAlarms() // Refresh the list
        setTimeout(() => setDeleteSuccess(null), 2000)
      } else if (response.status === 401) {
        localStorage.removeItem("access_token")
        localStorage.removeItem("token_type")
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
      } else {
        const errorText = await response.text()
        setError(`Error al eliminar alarma: ${errorText || "Intenta nuevamente."}`)
      }
    } catch (err) {
      console.error("Error deleting alarm:", err)
      setError("Error de conexión al eliminar la alarma.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-white/95 backdrop-blur-lg shadow-2xl border-0">
        <SheetHeader className="p-4 border-b border-gray-100">
          <SheetTitle className="text-2xl font-bold text-green-600 flex items-center">
            <BellRing className="w-7 h-7 mr-2" />
            Mis Alarmas de Medicación
          </SheetTitle>
        </SheetHeader>

        <div className="p-4 flex-shrink-0">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Crear Nueva Alarma
          </Button>
        </div>

        {error && (
          <div className="p-4 flex-shrink-0">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {deleteSuccess && (
          <div className="p-4 flex-shrink-0">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{deleteSuccess}</AlertDescription>
            </Alert>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1 p-4">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-4" />
            <p className="text-gray-600">Cargando alarmas...</p>
          </div>
        ) : alarms.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 p-4 text-center text-gray-500">
            <BellRing className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-lg font-semibold">No tienes alarmas configuradas.</p>
            <p className="text-sm mt-2">Haz clic en "Crear Nueva Alarma" para empezar.</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {alarms.map((alarm) => {
                const { formattedTime, status } = calculateNextAlarmTimeAndStatus(alarm)
                const isPendingToday = status.includes("Pendiente hoy")
                const isPast = status.includes("Pasada")

                return (
                  <Card
                    key={alarm.id}
                    className={`shadow-md border-2 ${isPendingToday ? "border-green-400 bg-green-50" : isPast ? "border-gray-200 bg-gray-100 opacity-70" : "border-gray-200 bg-white"}`}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex-1 space-y-1">
                        <h3 className={`font-bold text-lg ${isPast ? "text-gray-600" : "text-gray-900"}`}>
                          {alarm.medication_name}
                        </h3>
                        <p className={`text-sm ${isPast ? "text-gray-500" : "text-gray-700"}`}>Dosis: {alarm.dosage}</p>
                        <p className={`text-sm ${isPast ? "text-gray-500" : "text-gray-700"}`}>
                          Frecuencia: cada {alarm.frequency_hours} horas
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <BellRing
                            className={`w-4 h-4 ${isPendingToday ? "text-green-600" : isPast ? "text-gray-400" : "text-blue-500"}`}
                          />
                          <span
                            className={`text-sm font-semibold ${isPendingToday ? "text-green-600" : isPast ? "text-gray-500" : "text-blue-500"}`}
                          >
                            {formattedTime}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${isPendingToday ? "bg-green-200 text-green-800" : isPast ? "bg-gray-200 text-gray-600" : "bg-blue-100 text-blue-800"}`}
                          >
                            {status}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAlarm(alarm.id)}
                        disabled={isLoading}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Eliminar alarma para ${alarm.medication_name}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        )}

        <CreateAlarmModal isOpen={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} onAlarmCreated={fetchAlarms} />
      </SheetContent>
    </Sheet>
  )
}
