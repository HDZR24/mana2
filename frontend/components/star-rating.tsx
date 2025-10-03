"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  initialRating?: number
  onRatingChange: (rating: number) => void
  size?: number
  className?: string
}

export function StarRating({ initialRating = 0, onRatingChange, size = 24, className }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const [currentRating, setCurrentRating] = useState(initialRating)

  const handleStarClick = (ratingValue: number) => {
    setCurrentRating(ratingValue)
    onRatingChange(ratingValue)
  }

  return (
    <div className={cn("flex items-center", className)}>
      {[1, 2, 3, 4, 5].map((starValue) => (
        <Star
          key={starValue}
          size={size}
          className={cn(
            "cursor-pointer transition-colors duration-200",
            (hoverRating || currentRating) >= starValue ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
          )}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => handleStarClick(starValue)}
        />
      ))}
    </div>
  )
}
