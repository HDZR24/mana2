"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { User, Mail, Calendar, Users, AlertCircle, CheckCircle, Heart } from "lucide-react"
import { EditProfileModal } from "@/components/edit-profile-modal"

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

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    gender: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        setError("No estás autenticado")
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_USER_PROFILE}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (response.ok) {
          const profileData = await response.json()
          setProfile(profileData)
          setFormData({
            full_name: profileData.full_name,
            age: profileData.age.toString(),
            gender: profileData.gender,
          })
        } else if (response.status === 401) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("token_type")
          setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        } else {
          setError("Error al cargar el perfil")
        }
      } catch (err) {
        setError("Error de conexión al cargar el perfil")
        console.error("Error fetching profile:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_USER_PROFILE}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: formData.full_name,
            age: Number.parseInt(formData.age),
            gender: formData.gender,
          }),
        },
      )

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
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
              full_name: "nombre completo",
              age: "edad",
              gender: "género",
            }
            const fieldName = err.loc[err.loc.length - 1]
            const translatedField = fieldTranslations[fieldName] || fieldName
            return `${translatedField}: ${err.msg}`
          })
          .join(", ")
        setError(`Error de validación: ${errorMessages}`)
      } else {
        const errorText = await response.text()
        setError(`Error al actualizar el perfil: ${errorText}`)
      }
    } catch (err) {
      setError("Error de conexión al actualizar el perfil")
      console.error("Error updating profile:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile)
    setFormData({
      full_name: updatedProfile.full_name,
      age: updatedProfile.age.toString(),
      gender: updatedProfile.gender,
    })
  }

  const getHealthBadges = () => {
    if (!profile) return []
    const badges = []
    if (profile.diabetes) badges.push({ label: "Diabetes", color: "bg-blue-100 text-blue-800 border-blue-200" })
    if (profile.hypertension) badges.push({ label: "Hipertensión", color: "bg-red-100 text-red-800 border-red-200" })
    if (profile.obesity) badges.push({ label: "Obesidad", color: "bg-green-100 text-green-800 border-green-200" })
    return badges
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Navigation />
        <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900">Error al cargar el perfil</h1>
            <p className="text-gray-600 mt-2">Por favor, intenta nuevamente más tarde.</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
            <p className="text-gray-600">Gestiona tu información personal y preferencias</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Summary */}
            <div className="lg:col-span-1">
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                  <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-green-600">
                      {profile.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{profile.full_name}</CardTitle>
                  <CardDescription className="text-green-100">{profile.email}</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">{profile.age} años</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Users className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {profile.gender === "male" ? "Masculino" : profile.gender === "female" ? "Femenino" : "Otro"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Cuenta activa</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Heart className="w-5 h-5 text-red-500" />
                      <h4 className="font-semibold text-gray-900">Condiciones de Salud</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getHealthBadges().length > 0 ? (
                        getHealthBadges().map((badge, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className={`text-xs px-3 py-1 border ${badge.color} font-medium`}
                          >
                            {badge.label}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500 italic">Ninguna registrada</span>
                      )}
                    </div>
                  </div>

                  {profile.allergies && (
                    <div className="mt-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        <h4 className="font-semibold text-gray-900">Alergias</h4>
                      </div>
                      <p className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
                        {profile.allergies}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Edit Profile Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 rounded-t-lg">
                  <CardTitle className="flex items-center text-xl">
                    <User className="w-6 h-6 mr-2 text-green-600" />
                    Información Personal
                  </CardTitle>
                  <CardDescription>Actualiza tu información personal básica</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {error && (
                    <Alert className="mb-6 border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="mb-6 border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">Perfil actualizado correctamente</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
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
                        value={formData.full_name}
                        onChange={(e) => handleInputChange("full_name", e.target.value)}
                        className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                        disabled={isSaving}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="age" className="text-sm font-semibold text-gray-700">
                          Edad
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          min="18"
                          value={formData.age}
                          onChange={(e) => handleInputChange("age", e.target.value)}
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
                          value={formData.gender}
                          onValueChange={(value) => handleInputChange("gender", value)}
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

                    <div className="flex justify-center pt-4">
                      <EditProfileModal profile={profile} onProfileUpdate={handleProfileUpdate} />
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}