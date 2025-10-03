"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MapPin, Loader2, AlertCircle, ExternalLink } from "lucide-react"

// Define interfaces for the API response
interface Stop {
  id: number
  route_name: string
  stop_number: number
  stop_name: string
  arrival_time: string
  departure_time: string
  location_url: string
}

interface RouteResponse {
  id: number
  route_name: string
  stops: Stop[]
}

export default function MapsPage() {
  const [currentRouteId, setCurrentRouteId] = useState(1) // Default to Route #1
  const [routeData, setRouteData] = useState<RouteResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRouteData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_TOUR_ROUTE_DETAIL}/${currentRouteId}`,
        )

        if (response.ok) {
          const data: RouteResponse = await response.json()
          setRouteData(data)
        } else {
          const errorText = await response.text()
          setError(`Error al cargar la ruta: ${errorText || "Intenta nuevamente."}`)
        }
      } catch (err) {
        console.error("Error fetching route data:", err)
        setError("Error de conexión al cargar la información de la ruta.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRouteData()
  }, [currentRouteId]) // Re-fetch whenever currentRouteId changes

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navigation currentPage="explore" /> {/* Set currentPage to 'explore' to highlight parent menu */}
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Rutas Gastronómicas y Ecoturísticas</h1>
            <p className="text-gray-600">Explora los puntos de interés de Cartagena de Indias</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Section: Map Image */}
            <div className="lg:col-span-1 flex justify-center items-center p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100">
              <Image
                src="/mapa-cartagena.png" // This is the map image provided
                alt="Mapa del Centro Histórico de Cartagena de Indias"
                width={800}
                height={600}
                layout="responsive"
                objectFit="contain"
                className="rounded-lg"
              />
            </div>

            {/* Right Section: Route Details Table */}
            <div className="lg:col-span-1">
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg p-6">
                  <CardTitle className="flex items-center text-2xl">
                    <MapPin className="w-7 h-7 mr-3" />
                    {routeData?.route_name || "Cargando Ruta..."}
                  </CardTitle>
                  <div className="flex space-x-4 mt-4">
                    <Button
                      onClick={() => setCurrentRouteId(1)}
                      className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                        currentRouteId === 1
                          ? "bg-white text-green-700 shadow-md hover:bg-gray-100"
                          : "bg-green-700 text-white hover:bg-green-800 opacity-80"
                      }`}
                      disabled={isLoading}
                    >
                      Ruta #1
                    </Button>
                    <Button
                      onClick={() => setCurrentRouteId(2)}
                      className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                        currentRouteId === 2
                          ? "bg-white text-green-700 shadow-md hover:bg-gray-100"
                          : "bg-green-700 text-white hover:bg-green-800 opacity-80"
                      }`}
                      disabled={isLoading}
                    >
                      Ruta #2
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-4" />
                      <p className="text-gray-600">Cargando información de la ruta...</p>
                    </div>
                  ) : error ? (
                    <div className="p-8 text-center text-red-600 bg-red-50 rounded-b-lg">
                      <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-3" />
                      <p className="text-lg font-semibold">{error}</p>
                      <p className="text-sm mt-2">Por favor, verifica la conexión o intenta con otra ruta.</p>
                    </div>
                  ) : routeData && routeData.stops.length > 0 ? (
                    <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100">
                            <TableHead className="w-[200px]">Parada</TableHead>
                            <TableHead className="w-[120px]">Llegada</TableHead>
                            <TableHead className="w-[120px]">Salida</TableHead>
                            <TableHead className="text-right">Ver en Mapa</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {routeData.stops.map((stop) => (
                            <TableRow key={stop.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">{stop.stop_name}</TableCell>
                              <TableCell>{stop.arrival_time}</TableCell>
                              <TableCell>{stop.departure_time}</TableCell>
                              <TableCell className="text-right">
                                <Link href={stop.location_url} target="_blank" rel="noopener noreferrer">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Ir
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-600 bg-gray-50 rounded-b-lg">
                      <p className="text-lg">No hay paradas disponibles para esta ruta.</p>
                    </div>
                  )}
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
