"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, BellRing, CheckCircle, AlertCircle } from "lucide-react"
import type { NewAlarm } from "@/types/alarm"

interface CreateAlarmModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onAlarmCreated: () => void
}

export function CreateAlarmModal({ isOpen, onOpenChange, onAlarmCreated }: CreateAlarmModalProps) {
  const [medicationName, setMedicationName] = useState("")
  const [dosage, setDosage] = useState("")
  const [frequencyHours, setFrequencyHours] = useState<number | string>("")
  const [startTime, setStartTime] = useState("") // HH:MM format from input type="time"
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const resetForm = () => {
    setMedicationName("")
    setDosage("")
    setFrequencyHours("")
    setStartTime("")
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const token = localStorage.getItem("access_token")
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.")
      setIsLoading(false)
      return
    }

    if (!medicationName || !dosage || !frequencyHours || !startTime) {
      setError("Por favor, completa todos los campos.")
      setIsLoading(false)
      return
    }

    // Convert HH:MM to HH:MM:00.000Z for the API
    const formattedStartTime = `${startTime}:00.000Z`

    const newAlarm: NewAlarm = {
      medication_name: medicationName,
      dosage: dosage,
      frequency_hours: Number(frequencyHours),
      start_time: formattedStartTime,
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_NOTIFICATIONS_ALARMS_CREATE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAlarm),
      })

      if (response.ok) {
        setSuccess(true)
        onAlarmCreated() // Notify parent to refresh alarms
        setTimeout(() => {
          onOpenChange(false) // Close modal
          resetForm()
        }, 1500)
      } else if (response.status === 422) {
        const errorData = await response.json()
        const errorMessages = errorData.detail
          .map((err: any) => `${err.loc[err.loc.length - 1]}: ${err.msg}`)
          .join(", ")
        setError(`Error de validación: ${errorMessages}`)
      } else {
        const errorText = await response.text()
        setError(`Error al crear alarma: ${errorText || "Intenta nuevamente."}`)
      }
    } catch (err) {
      console.error("Error creating alarm:", err)
      setError("Error de conexión. Por favor, verifica tu internet.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-600 flex items-center">
            <BellRing className="w-6 h-6 mr-2" />
            Crear Nueva Alarma
          </DialogTitle>
          <DialogDescription>Configura una nueva alarma para tus medicamentos.</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">Alarma creada exitosamente!</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="medicationName">Nombre del Medicamento</Label>
            <Input
              id="medicationName"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              className="border-2 border-gray-200 focus:border-green-500 rounded-xl"
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dosage">Dosis (ej. 500 mg)</Label>
            <Input
              id="dosage"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="border-2 border-gray-200 focus:border-green-500 rounded-xl"
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="frequencyHours">Frecuencia (horas)</Label>
            <Input
              id="frequencyHours"
              type="number"
              min="1"
              value={frequencyHours}
              onChange={(e) => setFrequencyHours(e.target.value)}
              className="border-2 border-gray-200 focus:border-green-500 rounded-xl"
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="startTime">Primera Dosis (Hora)</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border-2 border-gray-200 focus:border-green-500 rounded-xl"
              disabled={isLoading}
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
