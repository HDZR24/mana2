"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Save, AlertCircle, CheckCircle, Loader2, User, Heart, AlertTriangle, Activity } from "lucide-react"

interface UserProfile {
  id: number
  email: string
  full_name: string
  age: number
  gender: string
  diabetes: boolean
  hypertension: boolean
  obesity: boolean
  allergies: string
  is_active: boolean
}

interface EditProfileModalProps {
  profile: UserProfile
  // support both prop names for backwards compatibility
  onProfileUpdate?: (updatedProfile: UserProfile) => void
  onProfileUpdateAction?: (updatedProfile: UserProfile) => void
}

export function EditProfileModal({ profile, onProfileUpdate, onProfileUpdateAction }: EditProfileModalProps) {
  // prefer onProfileUpdate (parent uses this), fall back to onProfileUpdateAction
  const profileUpdateCallback = onProfileUpdate ?? onProfileUpdateAction ?? (() => {})
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [partialSuccess, setPartialSuccess] = useState<string | null>(null)

  const [basicData, setBasicData] = useState({
    full_name: profile.full_name,
    age: profile.age.toString(),
    gender: profile.gender,
  })

  const [healthData, setHealthData] = useState({
    diabetes: profile.diabetes,
    hypertension: profile.hypertension,
    obesity: profile.obesity,
    allergies: profile.allergies,
  })

  useEffect(() => {
    if (isOpen) {
      setBasicData({
        full_name: profile.full_name,
        age: profile.age.toString(),
        gender: profile.gender,
      })
      setHealthData({
        diabetes: profile.diabetes,
        hypertension: profile.hypertension,
        obesity: profile.obesity,
        allergies: profile.allergies,
      })
      setError(null)
      setSuccess(false)
      setPartialSuccess(null)
    }
  }, [isOpen, profile])

  const handleBasicDataChange = (field: string, value: string) => {
    setBasicData((prev) => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(false)
    setPartialSuccess(null)
  }

  const handleHealthDataChange = (field: string, value: string | boolean) => {
    setHealthData((prev) => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(false)
    setPartialSuccess(null)
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    setError(null)
    setPartialSuccess(null)

    const token = localStorage.getItem("access_token")
    if (!token) {
      setError("No estás autenticado")
      setIsSaving(false)
      return
    }

    let basicUpdateSuccess = false
    let healthUpdateSuccess = false

    try {
      // Update basic profile data
      console.log("🔄 Updating basic profile data...")
      const basicResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_USER_PROFILE}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: basicData.full_name,
            age: Number.parseInt(basicData.age),
            gender: basicData.gender,
          }),
        },
      )

      if (basicResponse.ok) {
        console.log("✅ Basic profile updated successfully")
        basicUpdateSuccess = true
      } else {
        console.error("❌ Basic profile update failed:", basicResponse.status)
        throw new Error("Error al actualizar información básica")
      }

      // Update health data
      console.log("🔄 Updating health data...")
      const healthResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_USER_HEALTH}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(healthData),
        },
      )

      if (healthResponse.ok) {
        console.log("✅ Health data updated successfully")
        healthUpdateSuccess = true

      } else {
        console.error("❌ Health data update failed:", healthResponse.status)
        const errorText = await healthResponse.text()
        console.error("Health update error details:", errorText)

        // Check for the specific backend error we know about
        if (
          healthResponse.status === 500 &&
          (errorText.includes("unexpected keyword argument 'user_id'") ||
            errorText.includes("update_health_info() got an unexpected keyword argument"))
        ) {
          throw new Error("BACKEND_HEALTH_ERROR")
        } else if (healthResponse.status === 422) {
          const errorData = await healthResponse.json()
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
          throw new Error(`Error de validación en información de salud: ${errorMessages}`)
        } else {
          throw new Error(`Error al actualizar información de salud (${healthResponse.status})`)
        }
      }

      // If both updates succeeded, get updated profile
      if (basicUpdateSuccess && healthUpdateSuccess) {
        console.log("🔄 Fetching updated profile...")
        const profileResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_USER_PROFILE}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (profileResponse.ok) {
          const updatedProfile = await profileResponse.json()
          try {
            profileUpdateCallback(updatedProfile)
          } catch (cbErr) {
            console.error("Error calling profile update callback:", cbErr)
          }
          setSuccess(true)

          // Close modal after success
          setTimeout(() => {
            setIsOpen(false)
            setSuccess(false)
          }, 1500)
        }
      }
    } catch (err) {
      console.error("❌ Profile update error:", err)

      if (err instanceof Error) {
        if (err.message === "BACKEND_HEALTH_ERROR") {
          if (basicUpdateSuccess) {
            setPartialSuccess(
              "✅ Información básica actualizada correctamente.\n\n⚠️ ERROR DEL BACKEND: El endpoint de información de salud tiene un error en el código del servidor.\n\n🔧 Error técnico: La función update_health_info() no acepta el parámetro 'user_id' pero está siendo llamada con ese parámetro.\n\n💡 Solución temporal: Puedes actualizar tu información de salud directamente desde la página de Información de Salud en el menú de navegación.",
            )
          } else {
            setError(
              "🚨 ERROR DEL BACKEND DETECTADO\n\nEl endpoint de información de salud tiene un problema técnico:\n• La función update_health_info() no acepta el parámetro 'user_id'\n• Esto debe ser corregido en el código del backend\n\n💡 Contacta al administrador del sistema para reportar este error técnico.",
            )
          }
        } else {
          if (basicUpdateSuccess && !healthUpdateSuccess) {
            setPartialSuccess(
              "✅ Información básica actualizada correctamente.\n❌ Error al actualizar información de salud.\n\n💡 Intenta actualizar la información de salud por separado.",
            )
          } else {
            setError(err.message)
          }
        }
      } else {
        setError("Error desconocido al actualizar el perfil")
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 text-lg font-semibold">
          <Edit className="w-5 h-5 mr-2" />
          Editar Perfil Completo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-600">Editar Perfil Completo</DialogTitle>
          <DialogDescription>Actualiza toda tu información personal y de salud en un solo lugar</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 whitespace-pre-line">{error}</AlertDescription>
          </Alert>
        )}

        {partialSuccess && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 whitespace-pre-line">{partialSuccess}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">¡Perfil actualizado correctamente!</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic" className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Información Básica
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              Información de Salud
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 mt-6">
            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="mt-2 border-2 border-gray-200 bg-gray-50 rounded-xl"
              />
              <p className="text-xs text-gray-500 mt-1">El correo electrónico no se puede modificar</p>
            </div>

            <div>
              <Label htmlFor="full_name" className="text-sm font-semibold text-gray-700">
                Nombre completo
              </Label>
              <Input
                id="full_name"
                value={basicData.full_name}
                onChange={(e) => handleBasicDataChange("full_name", e.target.value)}
                className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                disabled={isSaving}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="age" className="text-sm font-semibold text-gray-700">
                  Edad
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  value={basicData.age}
                  onChange={(e) => handleBasicDataChange("age", e.target.value)}
                  className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                  disabled={isSaving}
                  required
                />
              </div>
              <div>
                <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">
                  Género
                </Label>
                <Select
                  value={basicData.gender}
                  onValueChange={(value) => handleBasicDataChange("gender", value)}
                  disabled={isSaving}
                >
                  <SelectTrigger className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Femenino</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefiero no decir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-6 mt-6">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Información de Salud:</strong> Esta información nos ayuda a personalizar las recomendaciones de
                platos y restaurantes según tus necesidades médicas.
              </AlertDescription>
            </Alert>

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
                      healthData[condition.id as keyof typeof healthData]
                        ? `border-${condition.color}-500 bg-${condition.color}-50`
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={condition.id}
                        checked={healthData[condition.id as keyof typeof healthData] as boolean}
                        onCheckedChange={(checked) => handleHealthDataChange(condition.id, checked as boolean)}
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
                onChange={(e) => handleHealthDataChange("allergies", e.target.value)}
                className="border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                rows={4}
                disabled={isSaving}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Guardando todos los cambios...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Guardar todos los cambios
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}