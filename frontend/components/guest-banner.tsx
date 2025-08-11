"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LogIn, X } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"

export function GuestBanner() {
  const { isGuest, showAuth } = useAuth()
  const [dismissed, setDismissed] = useState(false)

  if (!isGuest || dismissed) {
    return null
  }

  return (
    <Card className="mx-4 mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">Modalità Ospite</h3>
          <p className="text-sm text-gray-600 mt-1">
            Stai usando l'app come ospite. Registrati per salvare le tue trascrizioni e accedere a tutte le
            funzionalità.
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
