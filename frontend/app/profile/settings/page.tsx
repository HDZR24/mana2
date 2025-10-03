"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Lock, Bell, Palette, Shield, Settings, MapPin, Loader2 } from "lucide-react"

export default function SettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)
  const [privacySettings, setPrivacySettings] = useState({
    dataSharing: true,
    locationTracking: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      // In a real application, you would send these settings to your backend
      console.log("Saving settings:", {
        notificationsEnabled,
        darkModeEnabled,
        privacySettings,
      })
      setSuccess("Configuración guardada exitosamente.")
    } catch (err) {
      setError("Error al guardar la configuración. Inténtalo de nuevo.")
    } finally {
      setIsSaving(false)
      setTimeout(() => setSuccess(null), 3000) // Clear success message after 3 seconds
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navigation />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
            <p className="text-gray-600">Personaliza tu experiencia y gestiona tu privacidad</p>
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-8">
            {/* General Settings Card */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <Settings className="w-6 h-6 mr-2 text-green-600" />
                  Configuración General
                </CardTitle>
                <CardDescription>Ajustes básicos de la aplicación</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <Label htmlFor="notifications" className="text-base font-medium text-gray-700">
                      Notificaciones
                    </Label>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                    disabled={isSaving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Palette className="w-5 h-5 text-gray-600" />
                    <Label htmlFor="dark-mode" className="text-base font-medium text-gray-700">
                      Modo Oscuro
                    </Label>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={darkModeEnabled}
                    onCheckedChange={setDarkModeEnabled}
                    disabled={isSaving}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings Card */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <Shield className="w-6 h-6 mr-2 text-red-600" />
                  Privacidad y Seguridad
                </CardTitle>
                <CardDescription>Controla cómo se utilizan tus datos</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Lock className="w-5 h-5 text-gray-600" />
                    <Label htmlFor="data-sharing" className="text-base font-medium text-gray-700">
                      Compartir datos con terceros
                    </Label>
                  </div>
                  <Switch
                    id="data-sharing"
                    checked={privacySettings.dataSharing}
                    onCheckedChange={(checked) => setPrivacySettings((prev) => ({ ...prev, dataSharing: checked }))}
                    disabled={isSaving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <Label htmlFor="location-tracking" className="text-base font-medium text-gray-700">
                      Seguimiento de ubicación
                    </Label>
                  </div>
                  <Switch
                    id="location-tracking"
                    checked={privacySettings.locationTracking}
                    onCheckedChange={(checked) =>
                      setPrivacySettings((prev) => ({ ...prev, locationTracking: checked }))
                    }
                    disabled={isSaving}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
