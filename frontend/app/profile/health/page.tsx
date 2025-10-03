"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Heart, Save, AlertCircle, CheckCircle, Loader2, Activity } from "lucide-react"

interface HealthProfile {
  diabetes: boolean
  hypertension: boolean
  obesity: boolean
  allergies: string
}

export default function HealthProfilePage() {
  const [healthData, setHealthData] = useState<HealthProfile>({
    diabetes: false,
    hypertension: false,
    obesity: false,
    allergies: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchHealthData = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        setError("No estás autenticado")
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_USER_HEALTH}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (response.ok) {
          const data = await response.json()
          setHealthData({
            diabetes: data.diabetes,
            hypertension: data.hypertension,
            obesity: data.obesity,
            allergies: data.allergies || "",
          })
        } else if (response.status === 401) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("token_type")
          setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        } else {
          setError("Error al cargar la información de salud")
        }
      } catch (err) {
        setError("Error de conexión al cargar la información de salud")
        console.error("Error fetching health data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHealthData()
  }, [])

  const handleConditionChange = (condition: keyof HealthProfile, checked: boolean) => {
    if (condition !== "allergies") {
      setHealthData((prev) => ({ ...prev, [condition]: checked }))
    }
    setError(null)
    setSuccess(false)
  }

  const handleAllergiesChange = (value: string) => {
    setHealthData((prev) => ({ ...prev, allergies: value }))
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    const token = localStorage.getItem("access_token")
    if (!token) {
      setError("No estás autenticado")
      setIsSaving(false)
      return
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_USER_HEALTH}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(healthData),
        },
      )

      if (response.ok) {
        setSuccess(true)

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      } else if (response.status === 401) {
        localStorage.removeItem("access_token")
        localStorage.removeItem("token_type")
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
      } else if (response.status === 422) {
        const errorData = await response.json()
        const errorMessages = errorData.detail
          .map((err: any) => {
            const fieldTranslations: { [key: string]: string } = {
              diabetes: "diabetes",
              hypertension: "hipertensión",
              obesity: "obesidad",
              allergies: "alergias",
            }
            const fieldName = err.loc[err.loc.length - 1]
            const translatedField = fieldTranslations[fieldName] || fieldName
            return `${translatedField}: ${err.msg}`
          })
          .join(", ")
        setError(`Error de validación: ${errorMessages}`)
      } else {
        const errorText = await response.text()
        setError(`Error al actualizar la información de salud: ${errorText}`)
      }
    } catch (err) {
      setError("Error de conexión al actualizar la información de salud")
      console.error("Error updating health data:", err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Navigation />
        <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navigation />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Información de Salud</h1>
            <p className="text-gray-600">
              Gestiona tus condiciones médicas y alergias para recibir recomendaciones personalizadas
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <CardTitle className="flex items-center text-2xl">
                <Heart className="w-7 h-7 mr-3" />
                Mi Información de Salud
              </CardTitle>
              <CardDescription className="text-green-100">
                Esta información nos ayuda a personalizar las recomendaciones de platos y restaurantes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-6 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Información de salud actualizada correctamente
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Health Conditions */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-2xl">
                  <Label className="text-lg font-bold text-gray-900 flex items-center mb-6">
                    <Activity className="w-6 h-6 mr-2 text-green-600" />
                    Condiciones Médicas
                  </Label>
                  <p className="text-gray-600 mb-6">
                    Selecciona las condiciones que apliquen para recibir recomendaciones alimentarias adecuadas
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        id: "diabetes",
                        label: "Diabetes",
                        description: "Necesito platos con bajo índice glucémico",
                        color: "blue",
                      },
                      {
                        id: "hypertension",
                        label: "Hipertensión",
                        description: "Necesito comidas bajas en sodio",
                        color: "red",
                      },
                      {
                        id: "obesity",
                        label: "Obesidad",
                        description: "Necesito opciones bajas en calorías",
                        color: "green",
                      },
                    ].map((condition) => (
                      <div
                        key={condition.id}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          healthData[condition.id as keyof HealthProfile]
                            ? `border-${condition.color}-500 bg-${condition.color}-50`
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={condition.id}
                            checked={healthData[condition.id as keyof HealthProfile] as boolean}
                            onCheckedChange={(checked) =>
                              handleConditionChange(condition.id as keyof HealthProfile, checked as boolean)
                            }
                            className="mt-1 data-[state=checked]:bg-green-600"
                            disabled={isSaving}
                          />
                          <div>
                            <Label htmlFor={condition.id} className="font-semibold cursor-pointer text-base">
                              {condition.label}
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">{condition.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Allergies */}
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl">
                  <Label htmlFor="allergies" className="text-lg font-bold text-gray-900 flex items-center mb-4">
                    <AlertCircle className="w-6 h-6 mr-2 text-orange-600" />
                    Alergias Alimentarias
                  </Label>
                  <p className="text-gray-600 mb-4">
                    Describe detalladamente cualquier alergia alimentaria que tengas para evitar ingredientes peligrosos
                  </p>
                  <Textarea
                    id="allergies"
                    placeholder="Ejemplo: Alérgico a nueces, mariscos, lactosa..."
                    value={healthData.allergies}
                    onChange={(e) => handleAllergiesChange(e.target.value)}
                    className="border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                    rows={4}
                    disabled={isSaving}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                      Guardando cambios...
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6 mr-2" />
                      Guardar información de salud
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
