
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AIChatWidget } from "@/components/ai-chat-widget"
import { MapPin, Star, Utensils, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Dish {
  id: number
  name: string
  restaurant: string | null
  location: string | null
  rating: number
  description: string
  health_benefits: string
  category: string
  price: string
  is_active: boolean
}

interface Restaurant {
  id: number
  name: string
  location: string | null
  rating: number | null
  image: string | null
  description: string | null
  specialties: string[] | null
  certified: boolean | null
}

// Add this helper function at the top of the component, after the interfaces
const processSpecialties = (specialties: string[] | string | null): string[] => {
  if (!specialties) return []

  // If it's already an array, return it
  if (Array.isArray(specialties)) {
    return specialties.filter((s) => s && s.trim().length > 0)
  }

  // If it's a string, try to split it by common delimiters
  if (typeof specialties === "string") {
    // Try splitting by comma, semicolon, or pipe
    const delimiters = [",", ";", "|", "\n"]
    for (const delimiter of delimiters) {
      if (specialties.includes(delimiter)) {
        return specialties
          .split(delimiter)
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      }
    }
    // If no delimiters found, return as single item
    return specialties.trim() ? [specialties.trim()] : []
  }

  return []
}

export default function RestaurantsPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true)
  const [restaurantError, setRestaurantError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_RESTAURANTS}?limit=50`,
        )
        if (response.ok) {
          const restaurantsData = await response.json()
          setRestaurants(restaurantsData)
        } else {
          setRestaurantError("Error al cargar los restaurantes")
        }
      } catch (err) {
        setRestaurantError("Error de conexión al cargar los restaurantes")
        console.error("Error fetching restaurants:", err)
      } finally {
        setIsLoadingRestaurants(false)
      }
    }

    fetchRestaurants()
  }, [])

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_DISHES}?limit=50`,
        )
        if (response.ok) {
          const dishesData = await response.json()
          setDishes(dishesData.filter((dish: Dish) => dish.is_active))
        } else {
          setError("Error al cargar los platos")
        }
      } catch (err) {
        setError("Error de conexión al cargar los platos")
        console.error("Error fetching dishes:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDishes()
  }, [])

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
      .slice(0, 2)
  }

  // Organized image arrays for different sections
  const getDishImageForRestaurantsTab = (index: number) => {
    const images = [
      "/COSTILLAS_DE_CERDO_ASADO_A_LAS_FINAS_HIERBAS.jpg?height=200&width=300",
      "/MOJARRA_HORNE_DA_EN_ZUMO_DE_COCO.jpg?height=200&width=300",
      "/ALBÓNDIGAS_DE_CARNE_CON_VEGETALES.jpeg?height=200&width=300",
      "/POSTA_NEGRA_CARTAGENERA.jpg?height=200&width=300",
      "/GALLINA_GUISADA_EN_CALDO_DE_VEGETALES.jpg?height=200&width=300",
      "/ROLLO_DE_CARNE_CON_PURÉ_DE_PAPAS_Y_VEGETALES.jpg?height=200&width=300",
      "/SOBREBARRIGA_GUISADA_AGUACATE.jpg?height=200&width=300",
      "/CANELONES_DE_POLLO_ESPINACA_Y_TOMATE.jpg?height=200&width=300",
      "/PESCADO_SUDADO_CON_ABUNDANTES_VEGETALES.jpg?height=200&width=300",
      "/BERENJENAS_RELLENAS_DE_CARNE_MOLIDA.jpg?height=200&width=300",
    ]
    return images[index % images.length]
  }

  const getRestaurantImage = (index: number) => {
    const restaurantImages = [
      "/crespo.jpeg?height=200&width=300&text=Restaurante+1",
      "/centro-historico.jpeg?height=200&width=300&text=Restaurante+2",
      "/bocagrande.jpeg?height=200&width=300&text=Restaurante+3",
      "/placeholder.svg?height=200&width=300&text=Restaurante+4",
      "/placeholder.svg?height=200&width=300&text=Restaurante+5",
    ]
    return restaurantImages[index % restaurantImages.length]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation currentPage="explore" />

      {/* Header */}
      <div className="pt-20 pb-12 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Explora Nuestro Menu</h1>
          <p className="text-xl text-green-100">Descubre platos saludables y restaurantes especializados</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="dishes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-12 bg-white shadow-lg rounded-2xl p-2 border-0">
            <TabsTrigger
              value="dishes"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-xl py-3 font-semibold transition-all duration-300"
            >
              <Utensils className="w-5 h-5 mr-2" />
              Platos Disponibles
            </TabsTrigger>
            <TabsTrigger
              value="restaurants"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-xl py-3 font-semibold transition-all duration-300"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Restaurantes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dishes">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-600 bg-red-50 p-8 rounded-2xl">
                <p className="text-lg font-semibold">{error}</p>
                <p className="text-sm mt-2">Por favor, intenta nuevamente más tarde.</p>
              </div>
            ) : dishes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {dishes.map((dish, index) => (
                  <Card
                    key={dish.id}
                    className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white"
                  >
                    <div className="relative overflow-hidden">
                      <Image
                        src={getDishImageForRestaurantsTab(index) || "/placeholder.svg"}
                        alt={dish.name}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Badge className="absolute top-3 right-3 bg-green-600 text-white shadow-lg">
                        <Leaf className="w-3 h-3 mr-1" />
                        Saludable
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={`px-3 py-1 font-semibold ${getCategoryColor(dish.category)}`}>
                          {dish.category}
                        </Badge>
                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="ml-1 text-sm font-semibold text-gray-700">{dish.rating}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-green-600 transition-colors">
                        {dish.name}
                      </h3>
                      {dish.restaurant && (
                        <p className="text-green-600 text-sm font-semibold mb-1">{dish.restaurant}</p>
                      )}
                      {dish.location && (
                        <p className="text-gray-500 text-sm mb-3 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {dish.location}
                        </p>
                      )}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{dish.description}</p>
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {getHealthBenefitsArray(dish.health_benefits).map((benefit, benefitIndex) => (
                            <Badge
                              key={benefitIndex}
                              variant="outline"
                              className="text-xs border-green-200 text-green-700"
                            >
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-600">{dish.price}</span>
                        <Link href="https://wa.me/573003646096" target="_blank" rel="noopener noreferrer">
                          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            Realizar pedido aquí
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 bg-gray-50 p-8 rounded-2xl">
                <p className="text-lg">No hay platos disponibles en este momento.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="restaurants">
            {isLoadingRestaurants ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : restaurantError ? (
              <div className="text-center text-red-600 bg-red-50 p-8 rounded-2xl">
                <p className="text-lg font-semibold">{restaurantError}</p>
                <p className="text-sm mt-2">Por favor, intenta nuevamente más tarde.</p>
              </div>
            ) : restaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {restaurants.map((restaurant, index) => (
                  <Card
                    key={restaurant.id}
                    className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white"
                  >
                    <div className="relative overflow-hidden">
                      <Image
                        src={getRestaurantImage(index) || "/placeholder.svg"}
                        alt={restaurant.name}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      {restaurant.certified && (
                        <Badge className="absolute top-3 right-3 bg-green-600 text-white shadow-lg">
                          <Leaf className="w-3 h-3 mr-1" />
                          Eco Certificado
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        {restaurant.rating && (
                          <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="ml-1 text-sm font-semibold text-gray-700">{restaurant.rating}</span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-green-600 transition-colors">
                        {restaurant.name}
                      </h3>
                      {restaurant.location && (
                        <p className="text-gray-500 text-sm mb-3 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {restaurant.location}
                        </p>
                      )}
                      {restaurant.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{restaurant.description}</p>
                      )}
                      {restaurant.specialties && processSpecialties(restaurant.specialties).length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2 font-semibold">Especialidades:</p>
                          <div className="flex flex-wrap gap-1">
                            {processSpecialties(restaurant.specialties).map((specialty, specialtyIndex) => (
                              <Badge
                                key={specialtyIndex}
                                variant="outline"
                                className="text-xs border-green-200 text-green-700"
                              >
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      Ver detalle
                    </Button> */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 bg-gray-50 p-8 rounded-2xl">
                <p className="text-lg">No hay restaurantes disponibles en este momento.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Interactive Map Notice */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-6 py-4 rounded-2xl shadow-lg border border-green-200">
            <MapPin className="w-5 h-5 mr-3 text-green-600" />
            <span className="font-semibold">
              Explora nuestras rutas GASTRO-ECO-TURÍSTICAS.
            </span>
          </div>
        </div>
      </div>

      <Footer />

      {/* AI Chat Widget */}
      <AIChatWidget />
    </div>
  )
}
