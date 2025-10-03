"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ChevronRight, User, Heart, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface RegisterRequest {
  email: string
  full_name: string
  age: number
  gender: string
  password: string
  diabetes: boolean
  hypertension: boolean
  obesity: boolean
  allergies: string
  terms_accepted: boolean
  data_usage_consent: boolean
}

interface RegisterResponse {
  email: string
  full_name: string
  age: number
  gender: string
  id: number
  diabetes: boolean
  hypertension: boolean
  obesity: boolean
  allergies: string
  terms_accepted: boolean
  data_usage_consent: boolean
  is_active: boolean
}

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

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.get("message") === "registration-success") {
      setSuccess(true)
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    }
  }, [searchParams])

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    diabetes: false,
    hypertension: false,
    obesity: false,
    allergies: "",
    acceptTerms: false,
    authorizeData: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null) // Clear error when user starts typing
  }

  const handleNext = async () => {
    if (currentStep === 1) {
      setCurrentStep(2)
    } else if (currentStep === 2) {
      // This is now the point where initial user registration happens
      setIsLoading(true)
      setError(null)

      try {
        const registerData: RegisterRequest = {
          email: formData.email,
          full_name: formData.fullName,
          age: Number.parseInt(formData.age),
          gender: formData.gender,
          password: formData.password,
          diabetes: formData.diabetes,
          hypertension: formData.hypertension,
          obesity: formData.obesity,
          allergies: formData.allergies,
          terms_accepted: formData.acceptTerms,
          data_usage_consent: formData.authorizeData,
        }

        const registerResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_AUTH_REGISTER}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(registerData),
          },
        )

        if (registerResponse.ok) {
          const registerDataResult: RegisterResponse = await registerResponse.json()
          console.log("Initial registration successful:", registerDataResult)

          // --- NEW: Automatically log in the user after successful registration ---
          const loginData: LoginRequest = {
            email: formData.email,
            password: formData.password,
          }

          const loginResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_AUTH_LOGIN}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(loginData),
            },
          )

          if (loginResponse.ok) {
            const loginDataResult: LoginResponse = await loginResponse.json()
            console.log("Automatic login successful:", loginDataResult)

            // Store the access token and user ID
            localStorage.setItem("access_token", loginDataResult.access_token)
            localStorage.setItem("token_type", loginDataResult.token_type)
            localStorage.setItem("user_id", registerDataResult.id.toString()) // Store user ID from registration response

            setSuccess(true)

            // Dispatch custom event to notify other components (like UserMenu)
            window.dispatchEvent(new Event("userLoggedIn"))

            // Conditional redirection based on diabetes status
            if (registerDataResult.diabetes) {
              // Redirect to the new medical profile page if user has diabetes
              setTimeout(() => {
                router.push("/register/medical-profile")
              }, 1000) // Short delay before redirecting
            } else {
              // Redirect to home page if user does not have diabetes
              setTimeout(() => {
                router.push("/")
              }, 1000)
            }
          } else {
            // Handle login failure after successful registration
            const loginErrorText = await loginResponse.text()
            setError(
              `Registro exitoso, pero no se pudo iniciar sesión automáticamente: ${loginErrorText || "Error desconocido."}`,
            )
            // Redirect to login page if automatic login fails
            setTimeout(() => {
              router.push("/login?message=registration-success")
            }, 1500)
          }
          // --- END NEW ---
        } else if (registerResponse.status === 422) {
          const errorData: ValidationError = await registerResponse.json()
          const errorMessages = errorData.detail
            .map((err) => {
              const fieldTranslations: { [key: string]: string } = {
                email: "correo electrónico",
                full_name: "nombre completo",
                age: "edad",
                gender: "género",
                password: "contraseña",
                terms_accepted: "términos y condiciones",
              }
              const fieldName = err.loc[err.loc.length - 1]
              const translatedField = fieldTranslations[fieldName as string] || fieldName
              return `${translatedField}: ${err.msg}`
            })
            .join(", ")

          setError(`Error de validación: ${errorMessages}`)
        } else {
          const errorText = await registerResponse.text()
          setError(`Error en el registro: ${errorText || "Por favor, intenta nuevamente."}`)
        }
      } catch (err) {
        setError("Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.")
        console.error("Registration error:", err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleNext()
  }

  const isStep1Valid = formData.fullName && formData.email && formData.password && formData.age && formData.gender
  const isStep2Valid = formData.acceptTerms

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navigation />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? "text-green-600" : "text-gray-400"}`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 1 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-400"
                  }`}
                >
                  <User className="w-5 h-5" />
                </div>
                <span className="font-medium">Datos Personales</span>
              </div>
              <div className={`w-8 h-0.5 ${currentStep >= 2 ? "bg-green-600" : "bg-gray-200"}`}></div>
              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? "text-green-600" : "text-gray-400"}`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 2 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-400"
                  }`}
                >
                  <Heart className="w-5 h-5" />
                </div>
                <span className="font-medium">Datos de Salud</span>
              </div>
            </div>
          </div>

          <Card className="overflow-hidden shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8">
              <div className="mb-4">
                <Image
                  src="/images/NutriAI-logo.jpeg"
                  alt="NutriAI"
                  width={60}
                  height={60}
                  className="mx-auto rounded-full shadow-lg"
                />
              </div>
              <CardTitle className="text-3xl font-bold">Crea tu cuenta en NutriAI</CardTitle>
              <CardDescription className="text-green-100 text-lg">
                {currentStep === 1
                  ? "Completa tus datos personales básicos"
                  : "Información de salud para recomendaciones personalizadas"}
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
                    ¡Registro exitoso! Redirigiendo al siguiente paso...
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
                          Nombre completo
                        </Label>
                        <Input
                          id="fullName"
                          placeholder="Juan Pérez"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                          Correo electrónico
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="juan@ejemplo.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                        Contraseña
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="age" className="text-sm font-semibold text-gray-700">
                          Edad (mayor de 18 años)
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          min="18"
                          placeholder="25"
                          value={formData.age}
                          onChange={(e) => handleInputChange("age", e.target.value)}
                          className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">
                          Género
                        </Label>
                        <Select onValueChange={(value) => handleInputChange("gender", value)} disabled={isLoading}>
                          <SelectTrigger className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl">
                            <SelectValue placeholder="Selecciona tu género" />
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

                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={!isStep1Valid || isLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      Siguiente
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-8">
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-2xl">
                      <Label className="text-lg font-bold text-gray-900 flex items-center mb-4">
                        <Heart className="w-6 h-6 mr-2 text-red-500" />
                        Información de Salud
                      </Label>
                      <p className="text-gray-600 mb-6">
                        Selecciona las condiciones que apliquen para recibir recomendaciones personalizadas
                      </p>

                      <div className="grid md:grid-cols-3 gap-4">
                        {[
                          { id: "diabetes", label: "Diabetes", color: "blue" },
                          { id: "hypertension", label: "Hipertensión", color: "red" },
                          { id: "obesity", label: "Obesidad", color: "green" },
                        ].map((condition) => (
                          <div
                            key={condition.id}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              formData[condition.id as keyof typeof formData]
                                ? `border-${condition.color}-500 bg-${condition.color}-50`
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={condition.id}
                                checked={formData[condition.id as keyof typeof formData] as boolean}
                                onCheckedChange={(checked) => handleInputChange(condition.id, checked as boolean)}
                                className="data-[state=checked]:bg-green-600"
                                disabled={isLoading}
                              />
                              <Label htmlFor={condition.id} className="font-medium cursor-pointer">
                                {condition.label}
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="allergies" className="text-sm font-semibold text-gray-700">
                        Alergias alimentarias
                      </Label>
                      <Textarea
                        id="allergies"
                        placeholder="Describe cualquier alergia alimentaria que tengas..."
                        value={formData.allergies}
                        onChange={(e) => handleInputChange("allergies", e.target.value)}
                        className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                        rows={4}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl">
                      <Label className="text-lg font-bold text-gray-900 flex items-center mb-4">
                        <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
                        Consentimientos
                      </Label>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="acceptTerms"
                            checked={formData.acceptTerms}
                            onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
                            className="mt-1 data-[state=checked]:bg-green-600"
                            disabled={isLoading}
                            required
                          />
                          <Label htmlFor="acceptTerms" className="text-sm leading-relaxed cursor-pointer">
                            Acepto los{" "}
                            <Link href="#" className="text-green-600 hover:underline">
                              términos y condiciones
                            </Link>
                          </Label>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="authorizeData"
                            checked={formData.authorizeData}
                            onCheckedChange={(checked) => handleInputChange("authorizeData", checked as boolean)}
                            className="mt-1 data-[state=checked]:bg-green-600"
                            disabled={isLoading}
                          />
                          <Label htmlFor="authorizeData" className="text-sm leading-relaxed cursor-pointer">
                            Autorizo el uso de mis datos para recomendaciones personalizadas
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                      <Button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        variant="outline"
                        className="flex-1 border-2 border-gray-300 hover:border-gray-400 py-3 rounded-xl"
                        disabled={isLoading}
                      >
                        Atrás
                      </Button>
                      <Button
                        type="submit"
                        disabled={!isStep2Valid || isLoading}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Verificando...
                          </>
                        ) : (
                          "Verificar y Continuar"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
