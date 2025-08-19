"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogIn, X, Clock } from "lucide-react"
import { useState } from "react"

interface GuestBannerProps {
  isGuest: boolean
}

export function GuestBanner({ isGuest }: GuestBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (!isGuest || dismissed) {
    return null
  }

  return (
    <Card className="mx-4 mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">Modalità Ospite</h3>
            <Badge variant="default" className="text-xs text-black bg-blue-200">
              <Clock className="w-3 h-3" />
              10 min
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Le tue trascrizioni sono salvate localmente per 10 minuti. Registrati per salvare permanentemente le tue trascrizioni.
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button onClick={() => setDismissed(true)} variant="ghost" size="sm" className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
