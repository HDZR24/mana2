"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, AlertCircle, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { LayoutDashboard } from "lucide-react"

interface User {
  id: number
  email: string
  full_name: string | null
  age: number | null
  gender: string | null
  diabetes: boolean
  hypertension: boolean
  obesity: boolean
  allergies: string | null
  is_active: boolean
  is_superuser: boolean
  last_rating?: number | null // Added last_rating field
}

interface UsersResponse {
  users: User[]
  page: number
  per_page: number
  total: number
  total_pages: number
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const rowsPerPage = 10
  const router = useRouter()

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      setError(null)
      const token = localStorage.getItem("access_token")

      if (!token) {
        setError("No estás autenticado o tu sesión ha expirado. Por favor, inicia sesión.")
        setIsLoading(false)
        router.push("/login")
        return
      }

      try {
        const usersResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_USER_ALL_USERS}?page=${currentPage}&per_page=${rowsPerPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (usersResponse.ok) {
          const usersData: UsersResponse = await usersResponse.json()
          const fetchedUsers = usersData.users

          // Fetch ratings for each user concurrently
          const usersWithRatings = await Promise.all(
            fetchedUsers.map(async (user) => {
              try {
                // Corrected API path using environment variable
                const ratingsResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/${user.id}/califications`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  },
                )
                if (ratingsResponse.ok) {
                  const ratingsData = await ratingsResponse.json()
                  // Assuming the latest rating is desired, or the first if multiple
                  const lastRating =
                    ratingsData.califications && ratingsData.califications.length > 0
                      ? ratingsData.califications[ratingsData.califications.length - 1].rating
                      : null
                  return { ...user, last_rating: lastRating }
                } else {
                  console.warn(`Could not fetch rating for user ${user.id}: ${ratingsResponse.statusText}`)
                  return { ...user, last_rating: null }
                }
              } catch (ratingError) {
                console.error(`Error fetching rating for user ${user.id}:`, ratingError)
                return { ...user, last_rating: null }
              }
            }),
          )

          setUsers(usersWithRatings)
          setTotalPages(usersData.total_pages)
        } else if (usersResponse.status === 401 || usersResponse.status === 403) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("token_type")
          setError("Acceso denegado. No tienes permisos de superusuario o tu sesión ha expirado.")
          router.push("/login")
        } else {
          setError("Error al cargar los usuarios.")
        }
      } catch (err) {
        setError("Error de conexión al cargar los usuarios.")
        console.error("Error fetching users:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [currentPage, router])

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Navigation />
        <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Navigation />
        <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="max-w-md border-red-200 bg-red-50 text-red-800 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-lg font-semibold">{error}</p>
            <p className="text-sm mt-2">Por favor, asegúrate de tener los permisos adecuados.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navigation />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
            <p className="text-gray-600">Gestión de usuarios del sistema MANA2</p>
          </div>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <LayoutDashboard className="w-6 h-6 mr-2 text-purple-600" />
                Usuarios Registrados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Nombre Completo</TableHead>
                      <TableHead>Edad</TableHead>
                      <TableHead>Género</TableHead>
                      <TableHead>Superuser</TableHead>
                      <TableHead>Condiciones</TableHead>
                      <TableHead>Activo</TableHead>
                      <TableHead>Calificación</TableHead> {/* New Table Head */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{user.id}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.full_name || "N/A"}</TableCell>
                          <TableCell>{user.age || "N/A"}</TableCell>
                          <TableCell className="capitalize">{user.gender || "N/A"}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${
                                user.is_superuser
                                  ? "bg-purple-100 text-purple-800 border-purple-200"
                                  : "bg-gray-100 text-gray-600 border-gray-200"
                              }`}
                            >
                              {user.is_superuser ? "Sí" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.diabetes && (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">Diabetes</Badge>
                              )}
                              {user.hypertension && (
                                <Badge className="bg-red-100 text-red-800 border-red-200">Hipertensión</Badge>
                              )}
                              {user.obesity && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">Obesidad</Badge>
                              )}
                              {!user.diabetes && !user.hypertension && !user.obesity && (
                                <span className="text-xs text-gray-500 italic">Ninguna</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${
                                user.is_active
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-red-100 text-red-800 border-red-200"
                              }`}
                            >
                              {user.is_active ? "Sí" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.last_rating !== null && user.last_rating !== undefined ? (
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                                {user.last_rating}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500 italic">N/A</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No hay usuarios para mostrar.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-between items-center p-4 border-t bg-gray-50 rounded-b-lg">
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
