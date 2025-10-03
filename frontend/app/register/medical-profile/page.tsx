"use client"

import React from "react"

import type { ReactElement } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import {
  Stethoscope,
  FileText,
  Syringe,
  Droplet,
  Calendar,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

// Define the types for the medical profile data
interface DiabetesType {
  type: string
  insulin_production: boolean
  insulin_absorption: boolean
  physical_inactivity: boolean
  obesity: boolean
  family_history: boolean
}

interface Insurance {
  policy_name: string
  policy_number: string
  eps: string
  medical_center: string
  available_in_cartagena: boolean
}

interface GlucometerUsage {
  uses_glucometer: boolean
  brand: string
}

interface GlucoseMeasurement {
  level_maj_130_min_110: boolean
  level_measured: number
  uncontrolled: boolean
  control_level: string
  measurement_date: string
  peak_level: string
  // peak_level_value removed
}

interface MedicalProfileData {
  document_number: string
  document_type: string
  city: string
  country: string
  height_cm: number
  weight_kg: number
  has_prediabetes: boolean
  has_diabetes: boolean
  diagnosis_date: string
  doctor_name: string
  doctor_phone: string
  diabetes_type: DiabetesType
  insurance: Insurance
  glucometer_usage: GlucometerUsage
  glucose_measurements: GlucoseMeasurement[]
}

export default function MedicalProfileRegistrationPage(): ReactElement {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [currentFlashcard, setCurrentFlashcard] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasDoctorAssigned, setHasDoctorAssigned] = useState(false) // New state for doctor assignment

  const [formData, setFormData] = useState<MedicalProfileData>({
    document_number: "",
    document_type: "",
    city: "",
    country: "",
    height_cm: 0,
    weight_kg: 0,
    has_prediabetes: true, // Set to true by default
    has_diabetes: true, // Set to true by default
    diagnosis_date: "",
    doctor_name: "",
    doctor_phone: "",
    diabetes_type: {
      type: "",
      insulin_production: false,
      insulin_absorption: false,
      physical_inactivity: false,
      obesity: false,
      family_history: false,
    },
    insurance: {
      policy_name: "",
      policy_number: "",
      eps: "",
      medical_center: "",
      available_in_cartagena: false,
    },
    glucometer_usage: {
      uses_glucometer: false,
      brand: "",
    },
    glucose_measurements: [
      {
        level_maj_130_min_110: false,
        level_measured: 0,
        uncontrolled: false,
        control_level: "",
        measurement_date: "",
        peak_level: "",
        // peak_level_value removed
      },
    ],
  })

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id")
    const accessToken = localStorage.getItem("access_token")

    if (!storedUserId || !accessToken) {
      // If no user ID or token, redirect to registration or login
      router.push("/register?message=incomplete-registration")
      return
    }
    setUserId(storedUserId)

    // Removed fetchInitialHealthData as has_diabetes/prediabetes are now assumed true
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    setError(null)
  }

  const handleNestedInputChange = (
    parentField: keyof MedicalProfileData,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as any),
        [name]: type === "checkbox" ? checked : value,
      },
    }))
    setError(null)
  }

  const handleGlucoseMeasurementChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    const newMeasurements = [...formData.glucose_measurements]
    newMeasurements[index] = {
      ...newMeasurements[index],
      [name]: type === "checkbox" ? checked : value,
    }
    setFormData((prev) => ({
      ...prev,
      glucose_measurements: newMeasurements,
    }))
    setError(null)
  }

  const validateFlashcard = (step: number): boolean => {
    setError(null)
    let isValid = true

    switch (step) {
      case 0: // Basic Medical Info
        if (
          !formData.document_number ||
          !formData.document_type ||
          !formData.city ||
          !formData.country ||
          formData.height_cm <= 0 ||
          formData.weight_kg <= 0
        ) {
          setError("Por favor, completa todos los campos obligatorios de información básica.")
          isValid = false
        }
        break
      case 1: // Diabetes & Doctor Info
        if (!formData.diagnosis_date) {
          // diagnosis_date is always required now
          setError("Por favor, ingresa la fecha de diagnóstico de diabetes.")
          isValid = false
        }
        if (hasDoctorAssigned && (!formData.doctor_name || !formData.doctor_phone)) {
          setError("Por favor, completa la información del médico asignado.")
          isValid = false
        }
        break
      case 2: // Diabetes Type Details
        if (!formData.diabetes_type.type) {
          // Always required as has_diabetes is true
          setError("Por favor, selecciona el tipo de diabetes.")
          isValid = false
        }
        break
      case 3: // Insurance Details
        if (
          !formData.insurance.policy_name ||
          !formData.insurance.policy_number ||
          !formData.insurance.eps ||
          !formData.insurance.medical_center
        ) {
          setError("Por favor, completa todos los campos de información del seguro.")
          isValid = false
        }
        break
      case 4: // Glucometer Usage & Glucose Measurements
        if (formData.glucometer_usage.uses_glucometer && !formData.glucometer_usage.brand) {
          setError("Por favor, ingresa la marca del glucómetro.")
          isValid = false
        }
        // Validate at least one glucose measurement if glucometer is used
        if (formData.glucometer_usage.uses_glucometer && formData.glucose_measurements.length === 0) {
          setError("Por favor, añade al menos una medición de glucosa.")
          isValid = false
        } else if (formData.glucometer_usage.uses_glucometer) {
          // Validate fields for the first (and only) glucose measurement
          const gm = formData.glucose_measurements[0]
          if (
            gm.level_measured <= 0 ||
            !gm.measurement_date ||
            (gm.uncontrolled && !gm.control_level) ||
            !gm.peak_level
          ) {
            setError("Por favor, completa todos los campos de la medición de glucosa.")
            isValid = false
          }
        }
        break
      default:
        break
    }
    return isValid
  }

  const handleNextFlashcard = () => {
    if (validateFlashcard(currentFlashcard)) {
      setCurrentFlashcard((prev) => prev + 1)
    }
  }

  const handlePrevFlashcard = () => {
    setCurrentFlashcard((prev) => prev - 1)
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateFlashcard(currentFlashcard)) {
      return // Don't submit if the last flashcard is invalid
    }

    setIsLoading(true)
    setError(null)

    const token = localStorage.getItem("access_token")
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión nuevamente.")
      setIsLoading(false)
      router.push("/login")
      return
    }

    // Prepare data to send, handling optional fields
    const payload = {
      ...formData,
      // Doctor fields are conditional based on hasDoctorAssigned
      doctor_name: hasDoctorAssigned ? formData.doctor_name : null,
      doctor_phone: hasDoctorAssigned ? formData.doctor_phone : null,
      // Glucose measurements are conditional based on glucometer_usage
      glucose_measurements: formData.glucometer_usage.uses_glucometer
        ? formData.glucose_measurements.map((gm) => ({
            ...gm,
            // Remove peak_level_value from the payload
            // @ts-ignore - peak_level_value is removed from interface, but might exist in old data
            peak_level_value: undefined,
          }))
        : [],
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_MEDICAL_PROFILE}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      )

      if (response.ok) {
        setSuccess(true)
        console.log("Medical profile registered successfully!")
        // Clear user_id from local storage as registration is complete
        localStorage.removeItem("user_id")

        // Set flag and message in localStorage for the home page pop-up
        localStorage.setItem("medicalProfileCompleted", "true")
        localStorage.setItem(
          "medicalProfileSuccessMessage",
          "Turista, comensal, usuario(a), gracias por su dedicación al llenar este formulario. Lo haces para brindarle auto-ayudas para su tratamiento de diabetes, mientras disfruta de experiencias gastrosaludables, ecoturismo y sana recreación a través de la plataforma digital NutriAI con alarmas, notificaciones y mucho más. 👏 Le espera una experiencia gastrosaludable digna y agradable para Diabético(a).",
        )

        // Redirect to home page
        setTimeout(() => {
          router.push("/")
        }, 1000)
      } else if (response.status === 422) {
        const errorData = await response.json()
        const errorMessages = errorData.detail
          .map((err: any) => {
            const fieldName = err.loc[err.loc.length - 1]
            return `${fieldName}: ${err.msg}`
          })
          .join(", ")
        setError(`Error de validación: ${errorMessages}`)
      } else if (response.status === 401) {
        localStorage.removeItem("access_token")
        localStorage.removeItem("user_id")
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        router.push("/login")
      } else {
        try {
          const errorData = await response.json()
          setError(`Error ${response.status}: ${errorData.detail || JSON.stringify(errorData)}`)
        } catch {
          setError(`Error ${response.status}: ${await response.text()}`)
        }
      }
    } catch (err) {
      setError("Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.")
      console.error("Medical profile registration error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const flashcards = [
    // Flashcard 1: Basic Medical Info
    {
      title: "Información Médica Básica",
      description: "Datos generales para tu perfil de salud.",
      icon: FileText,
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="document_type">Tipo de Documento</Label>
              <Select
                name="document_type"
                value={formData.document_type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, document_type: value }))}
                disabled={isLoading}
                required
              >
                <SelectTrigger className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl">
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                  <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                  <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                  <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="document_number">Número de Documento</Label>
              <Input
                id="document_number"
                name="document_number"
                value={formData.document_number}
                onChange={handleInputChange}
                className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="height_cm">Altura (cm)</Label>
              <Input
                id="height_cm"
                name="height_cm"
                type="number"
                value={formData.height_cm === 0 ? "" : formData.height_cm}
                onChange={(e) => setFormData((prev) => ({ ...prev, height_cm: Number(e.target.value) }))}
                className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <Label htmlFor="weight_kg">Peso (kg)</Label>
              <Input
                id="weight_kg"
                name="weight_kg"
                type="number"
                value={formData.weight_kg === 0 ? "" : formData.weight_kg}
                onChange={(e) => setFormData((prev) => ({ ...prev, weight_kg: Number(e.target.value) }))}
                className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                disabled={isLoading}
                required
              />
            </div>
          </div>
        </div>
      ),
    },
    // Flashcard 2: Diabetes & Doctor Info
    {
      title: "Detalles de Diabetes y Médico",
      description: "Información específica sobre tu condición y contacto médico.",
      icon: Stethoscope,
      content: (
        <div className="space-y-6">
          {/* has_prediabetes and has_diabetes checkboxes removed */}
          <div>
            <Label htmlFor="diagnosis_date">Fecha de Diagnóstico (Diabetes)</Label>
            <Input
              id="diagnosis_date"
              name="diagnosis_date"
              type="date"
              value={formData.diagnosis_date}
              onChange={handleInputChange}
              className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
              disabled={isLoading}
              required // Always required now
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_doctor_assigned"
              name="has_doctor_assigned"
              checked={hasDoctorAssigned}
              onCheckedChange={(checked) => {
                setHasDoctorAssigned(!!checked)
                // Clear doctor fields if checkbox is unchecked
                if (!checked) {
                  setFormData((prev) => ({
                    ...prev,
                    doctor_name: "",
                    doctor_phone: "",
                  }))
                }
              }}
              disabled={isLoading}
            />
            <Label htmlFor="has_doctor_assigned">¿Tienes un médico asignado?</Label>
          </div>
          {hasDoctorAssigned && (
            <>
              <div>
                <Label htmlFor="doctor_name">Nombre del Médico</Label>
                <Input
                  id="doctor_name"
                  name="doctor_name"
                  value={formData.doctor_name}
                  onChange={handleInputChange}
                  className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                  disabled={isLoading}
                  required={hasDoctorAssigned}
                />
              </div>
              <div>
                <Label htmlFor="doctor_phone">Teléfono del Médico</Label>
                <Input
                  id="doctor_phone"
                  name="doctor_phone"
                  value={formData.doctor_phone}
                  onChange={handleInputChange}
                  className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                  disabled={isLoading}
                  required={hasDoctorAssigned}
                />
              </div>
            </>
          )}
        </div>
      ),
    },
    // Flashcard 3: Diabetes Type Details
    {
      title: "Tipo de Diabetes y Factores",
      description: "Detalles adicionales sobre tu tipo de diabetes y factores relacionados.",
      icon: Syringe,
      content: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="diabetes_type_type">Tipo de Diabetes</Label>
            <Select
              name="type"
              value={formData.diabetes_type.type}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  diabetes_type: { ...prev.diabetes_type, type: value },
                }))
              }
              disabled={isLoading} // Always enabled as has_diabetes is true
              required // Always required
            >
              <SelectTrigger className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl">
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Type 1">Tipo 1</SelectItem>
                <SelectItem value="Type 2">Tipo 2</SelectItem>
                <SelectItem value="Gestational">Gestacional</SelectItem>
                <SelectItem value="Other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            <Label className="font-semibold">Factores Relacionados:</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="insulin_production"
                  name="insulin_production"
                  checked={formData.diabetes_type.insulin_production}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      diabetes_type: { ...prev.diabetes_type, insulin_production: !!checked },
                    }))
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="insulin_production">Producción de Insulina</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="insulin_absorption"
                  name="insulin_absorption"
                  checked={formData.diabetes_type.insulin_absorption}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      diabetes_type: { ...prev.diabetes_type, insulin_absorption: !!checked },
                    }))
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="insulin_absorption">Absorción de Insulina</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="physical_inactivity"
                  name="physical_inactivity"
                  checked={formData.diabetes_type.physical_inactivity}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      diabetes_type: { ...prev.diabetes_type, physical_inactivity: !!checked },
                    }))
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="physical_inactivity">Inactividad Física</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="obesity_dt"
                  name="obesity"
                  checked={formData.diabetes_type.obesity}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      diabetes_type: { ...prev.diabetes_type, obesity: !!checked },
                    }))
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="obesity_dt">Obesidad</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="family_history"
                  name="family_history"
                  checked={formData.diabetes_type.family_history}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      diabetes_type: { ...prev.diabetes_type, family_history: !!checked },
                    }))
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="family_history">Historial Familiar</Label>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    // Flashcard 4: Insurance Details
    {
      title: "Información de Seguro Médico",
      description: "Detalles de tu póliza y centro médico.",
      icon: ShieldCheck,
      content: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="policy_name">Nombre de la Póliza</Label>
            <Input
              id="policy_name"
              name="policy_name"
              value={formData.insurance.policy_name}
              onChange={(e) => handleNestedInputChange("insurance", e)}
              className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <Label htmlFor="policy_number">Número de Póliza</Label>
            <Input
              id="policy_number"
              name="policy_number"
              value={formData.insurance.policy_number}
              onChange={(e) => handleNestedInputChange("insurance", e)}
              className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <Label htmlFor="eps">EPS / Aseguradora</Label>
            <Input
              id="eps"
              name="eps"
              value={formData.insurance.eps}
              onChange={(e) => handleNestedInputChange("insurance", e)}
              className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <Label htmlFor="medical_center">Centro Médico Principal</Label>
            <Input
              id="medical_center"
              name="medical_center"
              value={formData.insurance.medical_center}
              onChange={(e) => handleNestedInputChange("insurance", e)}
              className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
              disabled={isLoading}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="available_in_cartagena"
              name="available_in_cartagena"
              checked={formData.insurance.available_in_cartagena}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  insurance: { ...prev.insurance, available_in_cartagena: !!checked },
                }))
              }
              disabled={isLoading}
            />
            <Label htmlFor="available_in_cartagena">¿Disponible en Cartagena?</Label>
          </div>
        </div>
      ),
    },
    // Flashcard 5: Glucometer Usage & Glucose Measurements
    {
      title: "Uso de Glucómetro y Mediciones",
      description: "Registra tus hábitos de monitoreo de glucosa.",
      icon: Droplet,
      content: (
        <div className="space-y-6">
          <div>
            <Label className="font-semibold">Uso de Glucómetro:</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="uses_glucometer"
                name="uses_glucometer"
                checked={formData.glucometer_usage.uses_glucometer}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    glucometer_usage: { ...prev.glucometer_usage, uses_glucometer: !!checked },
                  }))
                }
                disabled={isLoading}
              />
              <Label htmlFor="uses_glucometer">¿Utilizas glucómetro?</Label>
            </div>
            {formData.glucometer_usage.uses_glucometer && (
              <div className="mt-4">
                <Label htmlFor="glucometer_brand">Marca del Glucómetro</Label>
                <Input
                  id="glucometer_brand"
                  name="brand"
                  value={formData.glucometer_usage.brand}
                  onChange={(e) => handleNestedInputChange("glucometer_usage", e)}
                  className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                  disabled={isLoading}
                  required={formData.glucometer_usage.uses_glucometer}
                />
              </div>
            )}
          </div>

          {formData.glucometer_usage.uses_glucometer && (
            <div className="space-y-4 border p-4 rounded-xl bg-gray-50">
              <h4 className="font-semibold text-gray-800 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Última Medición de Glucosa
              </h4>
              {/* Assuming only one glucose measurement for simplicity in flashcard */}
              {formData.glucose_measurements.length > 0 && (
                <>
                  <div>
                    <Label htmlFor="level_measured">Nivel Medido</Label>
                    <Input
                      id="level_measured"
                      name="level_measured"
                      type="number"
                      value={
                        formData.glucose_measurements[0].level_measured === 0
                          ? ""
                          : formData.glucose_measurements[0].level_measured
                      }
                      onChange={(e) => handleGlucoseMeasurementChange(0, e)}
                      className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="measurement_date">Fecha de Medición</Label>
                    <Input
                      id="measurement_date"
                      name="measurement_date"
                      type="date"
                      value={formData.glucose_measurements[0].measurement_date}
                      onChange={(e) => handleGlucoseMeasurementChange(0, e)}
                      className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="uncontrolled"
                      name="uncontrolled"
                      checked={formData.glucose_measurements[0].uncontrolled}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          glucose_measurements: [{ ...prev.glucose_measurements[0], uncontrolled: !!checked }],
                        }))
                      }
                      disabled={isLoading}
                    />
                    <Label htmlFor="uncontrolled">¿Nivel descontrolado?</Label>
                  </div>
                  {formData.glucose_measurements[0].uncontrolled && (
                    <div>
                      <Label htmlFor="control_level">Nivel de Control</Label>
                      <Input
                        id="control_level"
                        name="control_level"
                        value={formData.glucose_measurements[0].control_level}
                        onChange={(e) => handleGlucoseMeasurementChange(0, e)}
                        className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                        disabled={isLoading}
                        required={formData.glucose_measurements[0].uncontrolled}
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="peak_level">Nivel de glucosa en sangre pico para ese día?</Label>
                    <Input
                      id="peak_level"
                      name="peak_level"
                      type="text"
                      value={formData.glucose_measurements[0].peak_level}
                      onChange={(e) => handleGlucoseMeasurementChange(0, e)}
                      className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl"
                      disabled={isLoading}
                      placeholder="Más de 130_Cuánto? / Menos de 110_Cuánto?"
                      required
                    />
                  </div>
                  {/* peak_level_value input removed */}
                </>
              )}
            </div>
          )}
        </div>
      ),
    },
  ]

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Navigation disableNavigation={true} />
        <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="max-w-md border-red-200 bg-red-50 text-red-800 flex items-center p-6 rounded-lg shadow-md">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-lg font-semibold">Acceso denegado.</p>
            <p className="text-sm mt-2">Por favor, completa el registro inicial o inicia sesión.</p>
          </div>
        </div>
      </div>
    )
  }

  const currentCard = flashcards[currentFlashcard]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navigation disableNavigation={true} />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {flashcards.map((_, index) => (
                <React.Fragment key={index}>
                  <div
                    className={`flex items-center space-x-2 ${
                      currentFlashcard >= index ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        currentFlashcard >= index ? "bg-green-600 text-white" : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {React.createElement(flashcards[index].icon, { className: "w-5 h-5" })}
                    </div>
                    <span className="font-medium hidden sm:inline">{flashcards[index].title.split(" ")[0]}</span>
                  </div>
                  {index < flashcards.length - 1 && (
                    <div className={`w-8 h-0.5 ${currentFlashcard > index ? "bg-green-600" : "bg-gray-200"}`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8">
              <div className="mb-4">
                {React.createElement(currentCard.icon, { className: "w-16 h-16 mx-auto text-white" })}
              </div>
              <CardTitle className="text-3xl font-bold">{currentCard.title}</CardTitle>
              <CardDescription className="text-green-100 text-lg">{currentCard.description}</CardDescription>
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
                    ¡Perfil médico completado! Redirigiendo...
                  </AlertDescription>
                </Alert>
              )}

              {currentCard.content}

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
                {currentFlashcard > 0 && (
                  <Button
                    type="button"
                    onClick={handlePrevFlashcard}
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 hover:border-gray-400 py-3 rounded-xl bg-transparent"
                    disabled={isLoading}
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Anterior
                  </Button>
                )}
                {currentFlashcard < flashcards.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNextFlashcard}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Siguiente
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    onClick={handleFinalSubmit}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Completando registro...
                      </>
                    ) : (
                      "Completar Registro"
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
