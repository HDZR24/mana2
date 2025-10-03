"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { RatingDialog } from "./rating-dialog"

interface UserProfile {
  id: number
  email: string
  full_name: string
  // ... other user properties
}

export function RateUsButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("access_token")
      setIsLoggedIn(!!token)
      if (token) {
        // Fetch user data to get user ID
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_USER_PROFILE}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data && data.id) {
              setUser(data)
            } else {
              setUser(null)
            }
          })
          .catch((error) => {
            console.error("Error fetching user profile for rating button:", error)
            setUser(null)
          })
      } else {
        setUser(null)
      }
    }

    checkAuthStatus()

    // Listen for login/logout events
    window.addEventListener("userLoggedIn", checkAuthStatus)
    window.addEventListener("userLoggedOut", checkAuthStatus)

    return () => {
      window.removeEventListener("userLoggedIn", checkAuthStatus)
      window.removeEventListener("userLoggedOut", checkAuthStatus)
    }
  }, [])

  if (!isLoggedIn) {
    return null // Don't render if not logged in
  }

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
      >
        <Star className="w-5 h-5" />
        <span>Califícanos</span>
      </Button>

      <RatingDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} userId={user?.id || null} />
    </>
  )
}
