"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Heart, Activity, Scale, Sparkles } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AIChatWidget } from "@/components/ai-chat-widget"
import { MedicalProfileSuccessDialog } from "@/components/medical-profile-success-dialog"
import { RateUsButton } from "@/components/rate-us-button" // Import the new component

interface Dish {
  id: number
  name: string
  restaurant: string | null
  rating: number | null
  description: string
  health_benefits: string
  category: string
  price_usd: number
  price_cop: number
  price_delivery: number
  main_protein: string
  ingredients: string
  is_active: boolean
}

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [featuredDishes, setFeaturedDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMedicalProfileSuccessDialogOpen, setIsMedicalProfileSuccessDialogOpen] = useState(false)
  const [medicalProfileSuccessMessage, setMedicalProfileSuccessMessage] = useState("")

  useEffect(() => {
    const fetchFeaturedDishes = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_DISHES}?limit=6`,
        )
        if (response.ok) {
          const dishes = await response.json()
          setFeaturedDishes(dishes.filter((dish: Dish) => dish.is_active))
        } else {
          setError("Error al cargar los platos destacados")
        }
      } catch (err) {
        setError("Error de conexión al cargar los platos")
        console.error("Error fetching dishes:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedDishes()

    // Check for medical profile completion flag in localStorage
    const medicalProfileCompleted = localStorage.getItem("medicalProfileCompleted")
    const successMessage = localStorage.getItem("medicalProfileSuccessMessage")

    if (medicalProfileCompleted === "true" && successMessage) {
      setIsMedicalProfileSuccessDialogOpen(true)
      setMedicalProfileSuccessMessage(successMessage)
      // Clear the flags so the dialog doesn't show again on refresh
      localStorage.removeItem("medicalProfileCompleted")
      localStorage.removeItem("medicalProfileSuccessMessage")
    }
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % featuredDishes.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + featuredDishes.length) % featuredDishes.length)

  const getCategoryColor = (category: string) => {
    const lowerCategory = category.toLowerCase()
    if (lowerCategory.includes("diabetes")) return "bg-blue-100 text-blue-800"
    if (lowerCategory.includes("hipertensión") || lowerCategory.includes("hipertension"))
      return "bg-red-100 text-red-800"
    if (lowerCategory.includes("obesidad")) return "bg-green-100 text-green-800"
    return "bg-gray-100 text-gray-800"
  }

  const getHealthBenefitsArray = (healthBenefits: string) => {
    return healthBenefits
      .split(",")
      .map((benefit) => benefit.trim())
      .slice(0, 3)
  }

  // Organized images for main carousel
  const getCarouselDishImage = (index: number) => {
    const carouselImages = [
      "/COSTILLAS_DE_CERDO_ASADO_A_LAS_FINAS_HIERBAS.jpg?height=300&width=400&text=Destacado+1",
      "/MOJARRA_HORNE_DA_EN_ZUMO_DE_COCO.jpg?height=300&width=400&text=Destacado+2",
      "/ALBÓNDIGAS_DE_CARNE_CON_VEGETALES.jpeg?height=300&width=400&text=Destacado+3",
      "/POSTA_NEGRA_CARTAGENERA.jpg?height=300&width=400&text=Destacado+4",
      "/GALLINA_GUISADA_EN_CALDO_DE_VEGETALES.jpg?height=300&width=400&text=Destacado+5",
      "/ROLLO_DE_CARNE_CON_PURÉ_DE_PAPAS_Y_VEGETALES.jpg?height=300&width=400&text=Destacado+6",
    ]
    return carouselImages[index % carouselImages.length]
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation currentPage="home" />

      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('/principal_image.jpg?height=1080&width=1920')] bg-cover bg-center opacity-30"></div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center pt-16">
          <div className="text-center w-full space-y-8">
            <div className="animate-bounce">
              <div className="relative inline-block">
                <Image
                  src="/images/MANA2-logo.jpeg"
                  alt="MANA2"
                  width={120}
                  height={120}
                  className="mx-auto rounded-full shadow-2xl"
                />
                <div className="absolute rounded-full bg-gradient-to-r from-green-400 to-emerald-400 opacity-30 blur-xl"></div>
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                Descubre la Alimentación
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Saludable
                </span>
                con MANA2
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Restaurantes especializados en comida saludable para diabéticos, hipertensos y personas con obesidad
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/restaurants">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-white to-gray-100 text-green-600 hover:from-gray-100 hover:to-gray-200 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Ver restaurantes y platos saludables
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-green-600 shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold bg-transparent"
                >
                  Regístrate Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What is MANA2 Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              ¿Qué es MANA2?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comida Saludable con menú adicional para Diabéticos, Hipertensos y/u Obesos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                title: "Para Diabéticos",
                description:
                  "Platos con bajo índice glucémico y control de carbohidratos para mantener niveles estables de azúcar.",
                gradient: "from-blue-500 to-cyan-500",
                bgGradient: "from-blue-50 to-cyan-50",
              },
              {
                icon: Heart,
                title: "Para Hipertensos",
                description: "Comidas bajas en sodio y ricas en potasio para ayudar a controlar la presión arterial.",
                gradient: "from-red-500 to-pink-500",
                bgGradient: "from-red-50 to-pink-50",
              },
              {
                icon: Scale,
                title: "Para Obesidad",
                description: "Opciones bajas en calorías y ricas en nutrientes para apoyar un peso saludable.",
                gradient: "from-green-500 to-emerald-500",
                bgGradient: "from-green-50 to-emerald-50",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 overflow-hidden"
              >
                <CardContent className={`p-8 text-center bg-gradient-to-br ${item.bgGradient} h-full`}>
                  <div
                    className={`w-20 h-20 bg-gradient-to-r ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                  >
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Dishes Carousel */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Platos Destacados
            </h2>
            <p className="text-xl text-gray-600">Descubre nuestras recomendaciones especializadas</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 bg-red-50 p-8 rounded-2xl">
              <p className="text-lg font-semibold">{error}</p>
              <p className="text-sm mt-2">Por favor, intenta nuevamente más tarde.</p>
            </div>
          ) : featuredDishes.length > 0 ? (
            <div className="relative">
              <div className="overflow-hidden rounded-3xl shadow-2xl">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {featuredDishes.map((dish, index) => (
                    <div key={dish.id} className="w-full flex-shrink-0">
                      <Card className="mx-4 overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50">
                        <div className="flex flex-col md:flex-row min-h-[400px]">
                          <div className="md:w-1/2 relative">
                            <Image
                              src={getCarouselDishImage(index) || "/placeholder.svg"}
                              alt={dish.name}
                              width={600}
                              height={400}
                              className="w-full h-64 md:h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          </div>
                          <div className="md:w-1/2 p-8 flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-4">
                              <Badge className={`px-4 py-2 text-sm font-semibold ${getCategoryColor(dish.category)}`}>
                                {dish.category}
                              </Badge>
                              <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                                <span className="text-yellow-500 text-lg">★</span>
                                <span className="ml-1 text-sm font-semibold text-gray-700">{dish.rating}</span>
                              </div>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">{dish.name}</h3>
                            {dish.restaurant && <p className="text-green-600 font-semibold mb-2">{dish.restaurant}</p>}
                            <p className="text-gray-600 mb-6 leading-relaxed">{dish.description}</p>
                            <div className="mb-6">
                              <h4 className="font-semibold text-gray-900 mb-3">Beneficios para la salud:</h4>
                              <div className="flex flex-wrap gap-2">
                                {getHealthBenefitsArray(dish.health_benefits).map((benefit, benefitIndex) => (
                                  <Badge
                                    key={benefitIndex}
                                    variant="outline"
                                    className="text-xs px-3 py-1 border-green-200 text-green-700"
                                  >
                                    {benefit}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-green-600">{dish.price_usd}</span>
                              {/* <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                Ver detalles completos
                              </Button> */}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              {featuredDishes.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl hover:bg-white hover:shadow-2xl transition-all duration-300 hover:scale-110"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl hover:bg-white hover:shadow-2xl transition-all duration-300 hover:scale-110"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-600 bg-gray-50 p-8 rounded-2xl">
              <p className="text-lg">No hay platos disponibles en este momento.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/restaurants">
              <Button
                variant="outline"
                className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 text-lg bg-transparent"
              >
                Ver todos los platos →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-emerald-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="animate-bounce">
            <Image
              src="/images/MANA2-logo.jpeg"
              alt="MANA2"
              width={200}
              height={80}
              className="mx-auto rounded-full shadow-2xl"
            />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            ¿Saludable, inclusiva para personas
            <span className="block text-yellow-300">con condiciones especiales?</span>
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Regístrate hoy y comienza a disfrutar de experiencias únicas mientras cuidas tu salud y el planeta.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 px-10 py-4 text-xl font-semibold"
            >
              <Sparkles className="w-6 h-6 mr-2" />
              Regístrate ahora
            </Button>
          </Link>
        </div>
      </section>

      <Footer />

      {/* AI Chat Widget */}
      <AIChatWidget />

      {/* Medical Profile Success Dialog */}
      <MedicalProfileSuccessDialog
        isOpen={isMedicalProfileSuccessDialogOpen}
        onOpenChange={setIsMedicalProfileSuccessDialogOpen}
        message={medicalProfileSuccessMessage}
      />

      {/* Rate Us Button */}
      <RateUsButton />
    </div>
  )
}
