"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import { LoginPage } from "./login-page"
import { LandingPage } from "../welcome/landing-page"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isGuest, isLoading } = useAuth()

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

  // Se non è autenticato e non è ospite, mostra la landing page
  if (!isAuthenticated && !isGuest) {
    return <LandingPage />
  }

  // Se l'utente ha cliccato "showAuth" dalla landing, mostra il login
  if (!isAuthenticated && !isGuest) {
    return <LoginPage />
  }

  return <>{children}</>
}
