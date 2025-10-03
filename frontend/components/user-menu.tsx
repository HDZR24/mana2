"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { User, Settings, LogOut, Loader2, LayoutDashboard } from "lucide-react" // Added LayoutDashboard icon
import { useRouter, usePathname } from "next/navigation"

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
  is_superuser: boolean // Added is_superuser
}

export function UserMenu() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuthStatus()
  }, [pathname])

  useEffect(() => {
    const handleUserLoggedIn = () => {
      console.log("🔄 User logged in event received, refreshing auth state")
      checkAuthStatus()
    }

    const handleUserLoggedOut = () => {
      console.log("🔄 User logged out event received, clearing state")
      setUser(null)
      setIsLoading(false)
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "access_token") {
        console.log("🔄 Storage change detected, refreshing auth state")
        checkAuthStatus()
      }
    }

    window.addEventListener("userLoggedIn", handleUserLoggedIn)
    window.addEventListener("userLoggedOut", handleUserLoggedOut)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("userLoggedIn", handleUserLoggedIn)
      window.removeEventListener("userLoggedOut", handleUserLoggedOut)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("access_token")
    console.log("🔍 Checking auth state:", { hasToken: !!token, pathname })

    if (!token) {
      console.log("❌ No token found")
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      console.log("📡 Making API call to /api/v1/me")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_USER_PROFILE}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      console.log("📡 API response:", response.status, response.statusText)

      if (response.ok) {
        const userData = await response.json()
        console.log("✅ User data received:", userData)
        setUser(userData)
      } else if (response.status === 401) {
        console.log("🔒 Token expired, clearing auth")
        localStorage.removeItem("access_token")
        localStorage.removeItem("token_type")
        setUser(null)
      } else {
        console.log("❌ API error:", response.status)
        setUser(null)
      }
    } catch (error) {
      console.error("❌ Auth check failed:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)

    const token = localStorage.getItem("access_token")

    // Call logout API endpoint
    if (token) {
      try {
        console.log("📡 Calling logout API...")
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_AUTH_LOGOUT}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        )

        if (response.ok) {
          const result = await response.json()
          console.log("✅ Logout successful:", result.message || result)
        } else {
          console.log("⚠️ Logout API failed, but continuing with local cleanup")
        }
      } catch (error) {
        console.error("❌ Logout API error:", error)
        console.log("⚠️ Continuing with local cleanup despite API error")
      }
    }

    // Always clear local storage and redirect (even if API fails)
    localStorage.removeItem("access_token")
    localStorage.removeItem("token_type")
    setUser(null)
    setIsLoggingOut(false)

    // Dispatch logout event
    window.dispatchEvent(new CustomEvent("userLoggedOut"))

    // Redirect to home
    router.push("/")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getHealthBadges = () => {
    const badges = []
    if (user?.diabetes) badges.push({ label: "Diabetes", color: "bg-blue-100 text-blue-800 border-blue-200" })
    if (user?.hypertension) badges.push({ label: "Hipertensión", color: "bg-red-100 text-red-800 border-red-200" })
    if (user?.obesity) badges.push({ label: "Obesidad", color: "bg-green-100 text-green-800 border-green-200" })
    return badges
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <Button
          variant="ghost"
          className="text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-300 font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md w-full sm:w-auto"
          onClick={() => router.push("/login")}
        >
          Iniciar sesión
        </Button>
        <Button
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold w-full sm:w-auto"
          onClick={() => router.push("/register")}
        >
          Registrarse
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Logout Button - enhanced styling */}
      <Button
        variant="outline"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg font-semibold px-4 py-2 rounded-lg"
      >
        {isLoggingOut ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Cerrando...
          </>
        ) : (
          <>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </>
        )}
      </Button>

      {/* Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-12 w-12 rounded-full hover:bg-green-50 transition-all shadow-md hover:shadow-lg"
          >
            <Avatar className="h-12 w-12 border-2 border-green-500 shadow-lg hover:shadow-xl transition-shadow">
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-lg">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-80 p-4 shadow-2xl border-0 bg-white/95 backdrop-blur-lg rounded-2xl"
          align="end"
          forceMount
        >
          <DropdownMenuLabel className="font-normal p-0">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <Avatar className="h-14 w-14 border-2 border-green-500 shadow-md">
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-lg">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1">
                  <p className="text-lg font-semibold text-gray-900 leading-none">{user.full_name}</p>
                  <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 font-medium">Cuenta activa</span>
                  </div>
                </div>
              </div>

              {getHealthBadges().length > 0 && (
                <div className="px-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Condiciones de Salud</p>
                  <div className="flex flex-wrap gap-2">
                    {getHealthBadges().map((badge, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className={`text-xs px-3 py-1 border ${badge.color} font-medium`}
                      >
                        {badge.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-3" />
          <DropdownMenuItem
            onClick={() => router.push("/profile")}
            className="cursor-pointer py-3 px-3 rounded-lg hover:bg-green-50 transition-colors border border-transparent hover:border-green-100"
          >
            <User className="mr-3 h-5 w-5 text-green-600" />
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">Mi Perfil</span>
              <span className="text-xs text-gray-500">Gestionar toda mi información</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/profile/settings")}
            className="cursor-pointer py-3 px-3 rounded-lg hover:bg-green-50 transition-colors border border-transparent hover:border-green-100"
          >
            <Settings className="mr-3 h-5 w-5 text-gray-600" />
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">Configuración</span>
              <span className="text-xs text-gray-500">Preferencias y privacidad</span>
            </div>
          </DropdownMenuItem>
          {user.is_superuser && ( // Only show if user is a superuser
            <DropdownMenuItem
              onClick={() => router.push("/admin")}
              className="cursor-pointer py-3 px-3 rounded-lg hover:bg-green-50 transition-colors border border-transparent hover:border-green-100"
            >
              <LayoutDashboard className="mr-3 h-5 w-5 text-purple-600" /> {/* Admin icon */}
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">Panel de Administración</span>
                <span className="text-xs text-gray-500">Gestionar usuarios y datos</span>
              </div>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
