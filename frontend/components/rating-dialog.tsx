"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StarRating } from "./star-rating"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface RatingDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  userId: number | null
}

export function RatingDialog({ isOpen, onOpenChange, userId }: RatingDialogProps) {
  const [rating, setRating] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast({
        title: "Error de calificación",
        description: "Por favor, selecciona una calificación con estrellas.",
        variant: "destructive",
      })
      return
    }
    if (!userId) {
      toast({
        title: "Error de usuario",
        description: "No se pudo identificar al usuario para enviar la calificación.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const token = localStorage.getItem("access_token")

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_CREATE_RATING}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user_id: userId, rating: rating }), // Removed feedback field
        },
      )

      if (response.ok) {
        toast({
          title: "¡Gracias por tu calificación! 🎉",
          description: "Tu opinión nos ayuda a mejorar tu experiencia en NutriAI.",
          variant: "default",
        })
        onOpenChange(false) // Close dialog on success
        setRating(0)
      } else {
        const errorData = await response.json()
        toast({
          title: "Error al enviar calificación",
          description: errorData.detail || "Hubo un problema al procesar tu calificación. Inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting rating:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Por favor, verifica tu conexión.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-6 rounded-lg shadow-xl bg-white/95 backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Califica tu experiencia</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            ¿Cómo fue tu experiencia en NutriAI? ¡Tu opinión es muy importante!
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-2">
            <p className="text-lg font-semibold text-gray-800">¿Qué calificación le das?</p>
            <StarRating onRatingChange={setRating} initialRating={rating} size={36} />
          </div>
          {/* Removed the feedback textarea */}
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmitRating}
            disabled={isLoading || rating === 0}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Calificación"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
