"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { LoginPage } from "./login-page"
import { LandingPage } from "../welcome/landing-page"
import { Loader2 } from "lucide-react"

interface AuthFlowProps {
  children: ReactNode
}

export function AuthFlow({ children }: AuthFlowProps) {
  const { isAuthenticated, isGuest, isLoading } = useAuth()
  const [showAuthPage, setShowAuthPage] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  // Se l'utente ha cliccato per vedere la pagina di auth
  if (showAuthPage && !isAuthenticated) {
    return <LoginPage onBack={() => setShowAuthPage(false)} />
  }

  // Se non è autenticato e non è ospite, mostra la landing page
  if (!isAuthenticated && !isGuest) {
    return <LandingPage />
  }

  return <>{children}</>
}
