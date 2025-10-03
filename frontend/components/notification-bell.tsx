"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { AlarmPanel } from "./alarm-panel"

export function NotificationBell() {
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsPanelOpen(true)}
        className="relative text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-full h-10 w-10"
        aria-label="Abrir panel de notificaciones"
      >
        <Bell className="h-5 w-5" />
        {/* Optional: Notification badge if there are unread notifications or upcoming alarms */}
        {/* <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" /> */}
      </Button>
      <AlarmPanel isOpen={isPanelOpen} onOpenChange={setIsPanelOpen} />
    </>
  )
}
