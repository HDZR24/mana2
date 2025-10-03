"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, X } from "lucide-react"

interface MedicalProfileSuccessDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  message: string
}

export function MedicalProfileSuccessDialog({ isOpen, onOpenChange, message }: MedicalProfileSuccessDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-6 text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-600 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 mr-2 text-green-600" />
            ¡Registro Completado!
          </DialogTitle>
          <DialogDescription className="text-gray-700 mt-4 whitespace-pre-line">{message}</DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
