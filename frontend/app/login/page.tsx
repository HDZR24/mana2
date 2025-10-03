"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Mail, Lock, LogIn, AlertCircle, Loader2 } from "lucide-react"

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  access_token: string
  token_type: string
}

interface ValidationError {
  detail: Array<{
    loc: (string | number)[]
    msg: string
    type: string
  }>
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const loginData: LoginRequest = {
        email,
        password,
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_AUTH_LOGIN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      })

      if (response.ok) {
        const data: LoginResponse = await response.json()
        console.log("✅ Login successful:", data)

        // Store the access token
        localStorage.setItem("access_token", data.access_token)
        localStorage.setItem("token_type", data.token_type)

        setSuccess(true)

        // Dispatch custom event to notify other components
        console.log("📢 Dispatching userLoggedIn event")
        window.dispatchEvent(new Event("userLoggedIn"))

        // Also dispatch storage event manually for cross-tab compatibility
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "access_token",
            newValue: data.access_token,
            storageArea: localStorage,
          }),
        )

        // Redirect to homepage after successful login
        setTimeout(() => {
          console.log("🔄 Redirecting to homepage")
          router.push("/")
        }, 800)
      } else if (response.status === 401) {
        setError("Credenciales incorrectas. Por favor, verifica tu email y contraseña.")
      } else if (response.status === 422) {
        const errorData: ValidationError = await response.json()
        const errorMessages = errorData.detail
          .map((err) => {
            // Translate common field names to Spanish
            const fieldTranslations: { [key: string]: string } = {
              email: "correo electrónico",
              password: "contraseña",
            }

            const fieldName = err.loc[err.loc.length - 1]
            const translatedField = fieldTranslations[fieldName as string] || fieldName
            return `${translatedField}: ${err.msg}`
          })
          .join(", ")

        setError(`Error de validación: ${errorMessages}`)
      } else {
        const errorText = await response.text()
        setError(`Error en el inicio de sesión: ${errorText || "Por favor, intenta nuevamente."}`)
      }
    } catch (err) {
      setError("Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navigation />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 rounded-t-lg">
              <div className="mb-4">
                <Image
                  src="/images/NutriAI-logo.jpeg"
                  alt="NutriAI"
                  width={60}
                  height={60}
                  className="mx-auto rounded-full shadow-lg"
                />
              </div>
              <CardTitle className="text-2xl font-bold">Iniciar sesión</CardTitle>
              <CardDescription className="text-green-100">
                Ingresa tus credenciales para acceder a tu cuenta
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
                  <AlertDescription className="text-green-800">
                    ¡Inicio de sesión exitoso! Redirigiendo...
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError(null) // Clear error when user starts typing
                    }}
                    className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                    disabled={isLoading}
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center">
                      <Lock className="w-4 h-4 mr-2" />
                      Contraseña
                    </Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError(null) // Clear error when user starts typing
                    }}
                    className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                    disabled={isLoading}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Iniciar sesión
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  ¿No tienes una cuenta?{" "}
                  <Link href="/register" className="text-green-600 hover:text-green-700 font-semibold">
                    Regístrate
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
