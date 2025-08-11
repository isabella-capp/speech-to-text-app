"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { useToast } from "@/hooks/use-toast"
import type { AuthState, LoginCredentials, RegisterCredentials } from "@/types/auth"

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (credentials: RegisterCredentials) => Promise<boolean>
  loginWithGoogle: () => Promise<boolean>
  loginWithGitHub: () => Promise<boolean>
  logout: () => Promise<void>
  continueAsGuest: () => void
  showAuth: () => void
  showLanding: () => void
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth deve essere usato all'interno di AuthProvider")
  }
  return context
}

export function useAuthProvider() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isGuest: false,
  })

  const [showAuthPage, setShowAuthPage] = useState(false)

  const { toast } = useToast()

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }))

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          isGuest: false,
        })

        toast({
          title: "Login effettuato",
          description: `Benvenuto, ${data.user.name}!`,
        })

        return true
      } else {
        toast({
          title: "Errore di login",
          description: data.error || "Credenziali non valide",
          variant: "destructive",
        })

        setAuthState((prev) => ({ ...prev, isLoading: false }))
        return false
      }
    } catch (error) {
      console.error("Errore login:", error)
      toast({
        title: "Errore di connessione",
        description: "Impossibile connettersi al server",
        variant: "destructive",
      })

      setAuthState((prev) => ({ ...prev, isLoading: false }))
      return false
    }
  }

  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }))

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          isGuest: false,
        })

        toast({
          title: "Registrazione completata",
          description: `Benvenuto, ${data.user.name}!`,
        })

        return true
      } else {
        toast({
          title: "Errore di registrazione",
          description: data.error || "Errore durante la registrazione",
          variant: "destructive",
        })

        setAuthState((prev) => ({ ...prev, isLoading: false }))
        return false
      }
    } catch (error) {
      console.error("Errore registrazione:", error)
      toast({
        title: "Errore di connessione",
        description: "Impossibile connettersi al server",
        variant: "destructive",
      })

      setAuthState((prev) => ({ ...prev, isLoading: false }))
      return false
    }
  }

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }))

      // Simulazione OAuth flow
      const code = "mock_google_code_" + Date.now()

      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          isGuest: false,
        })

        toast({
          title: "Login con Google effettuato",
          description: `Benvenuto, ${data.user.name}!`,
        })

        return true
      } else {
        toast({
          title: "Errore login Google",
          description: data.error || "Errore durante l'autenticazione",
          variant: "destructive",
        })

        setAuthState((prev) => ({ ...prev, isLoading: false }))
        return false
      }
    } catch (error) {
      console.error("Errore Google login:", error)
      toast({
        title: "Errore di connessione",
        description: "Impossibile connettersi al server",
        variant: "destructive",
      })

      setAuthState((prev) => ({ ...prev, isLoading: false }))
      return false
    }
  }

  const loginWithGitHub = async (): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }))

      // Simulazione OAuth flow
      const code = "mock_github_code_" + Date.now()

      const response = await fetch("/api/auth/github", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          isGuest: false,
        })

        toast({
          title: "Login con GitHub effettuato",
          description: `Benvenuto, ${data.user.name}!`,
        })

        return true
      } else {
        toast({
          title: "Errore login GitHub",
          description: data.error || "Errore durante l'autenticazione",
          variant: "destructive",
        })

        setAuthState((prev) => ({ ...prev, isLoading: false }))
        return false
      }
    } catch (error) {
      console.error("Errore GitHub login:", error)
      toast({
        title: "Errore di connessione",
        description: "Impossibile connettersi al server",
        variant: "destructive",
      })

      setAuthState((prev) => ({ ...prev, isLoading: false }))
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        isGuest: false,
      })
      setShowAuthPage(false)

      toast({
        title: "Logout effettuato",
        description: "Arrivederci!",
      })
    } catch (error) {
      console.error("Errore logout:", error)
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        isGuest: false,
      })
      setShowAuthPage(false)
    }
  }

  const continueAsGuest = () => {
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isGuest: true,
    })
    setShowAuthPage(false)

    toast({
      title: "Modalità ospite",
      description: "Stai usando l'app come ospite. Alcune funzionalità potrebbero essere limitate.",
    })
  }

  const showAuth = () => {
    setShowAuthPage(true)
  }

  const showLanding = () => {
    setAuthState((prev) => ({
      ...prev,
      isGuest: false,
    }))
    setShowAuthPage(false)
  }

  const checkAuth = async (): Promise<void> => {
    try {
      const response = await fetch("/api/auth/me")

      if (response.ok) {
        const data = await response.json()
        setAuthState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          isGuest: false,
        })
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          isGuest: false,
        })
      }
    } catch (error) {
      console.error("Errore verifica auth:", error)
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        isGuest: false,
      })
    }
  }

  // Verifica autenticazione al mount
  useEffect(() => {
    checkAuth()
  }, [])

  return {
    ...authState,
    login,
    register,
    loginWithGoogle,
    loginWithGitHub,
    logout,
    continueAsGuest,
    showAuth: showAuthPage ? () => {} : showAuth,
    showLanding,
    checkAuth,
  }
}

// Modifica il ProtectedRoute per gestire showAuthPage
export function useAuthFlow() {
  const auth = useAuth()
  const [showAuthPage, setShowAuthPage] = useState(false)

  const originalShowAuth = auth.showAuth
  const showAuth = () => {
    setShowAuthPage(true)
  }

  return {
    ...auth,
    showAuth,
    showAuthPage,
    setShowAuthPage,
  }
}

export { AuthContext }
