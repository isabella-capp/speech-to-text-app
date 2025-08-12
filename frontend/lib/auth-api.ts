// lib/auth-api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export interface User {
  id: string
  name: string
  email: string
  created_at: string
}

export interface AuthResponse {
  user: User
  token: string
  token_type: string
}

export class AuthAPI {
  private static getHeaders(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    return headers
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Network error' }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }
    return response.json()
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    })
    
    return this.handleResponse<AuthResponse>(response)
  }

  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    })
    
    return this.handleResponse<AuthResponse>(response)
  }

  static async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(token),
    })
    
    return this.handleResponse<User>(response)
  }

  static async logout(token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(token),
    })
    
    return this.handleResponse<{ message: string }>(response)
  }

  static async googleLogin(): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/social/google`, {
      method: 'POST',
      headers: this.getHeaders(),
    })
    
    return this.handleResponse<AuthResponse>(response)
  }

  static async githubLogin(): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/social/github`, {
      method: 'POST',
      headers: this.getHeaders(),
    })
    
    return this.handleResponse<AuthResponse>(response)
  }
}

// Utility per gestire il token nel localStorage
export class TokenManager {
  private static readonly TOKEN_KEY = 'speechgpt_token'
  private static readonly USER_KEY = 'speechgpt_user'

  static getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.TOKEN_KEY)
  }

  static setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.TOKEN_KEY, token)
  }

  static removeToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.TOKEN_KEY)
  }

  static getUser(): User | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem(this.USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  }

  static setUser(user: User): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
  }

  static removeUser(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.USER_KEY)
  }

  static clearAll(): void {
    this.removeToken()
    this.removeUser()
  }
}
