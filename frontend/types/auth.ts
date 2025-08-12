export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  created_at: string
  picture?: string
  provider?: "email" | "google" | "github"
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isGuest: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user?: User
  error?: string
}
