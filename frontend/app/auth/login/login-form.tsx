"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AudioWaveformIcon as Waveform,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  UserPlus,
  ArrowLeft,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

interface LoginFormProps {
  onBack?: () => void
}

export function LoginForm({ onBack }: LoginFormProps) {
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("login")

  const { login, register, loginWithGoogle, loginWithGitHub, continueAsGuest, isLoading } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await login({ email: loginEmail, password: loginPassword })
    if (success) {
      router.push("/")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await register({ name: registerName, email: registerEmail, password: registerPassword })
    if (success) {
      // Reset form
      setRegisterName("")
      setRegisterEmail("")
      setRegisterPassword("")
      router.push("/")
    }
  }

  const handleGoogleLogin = async () => {
    const success = await loginWithGoogle()
    if (success) {
      router.push("/")
    }
  }

  const handleGitHubLogin = async () => {
    const success = await loginWithGitHub()
    if (success) {
      router.push("/")
    }
  }

  const handleContinueAsGuest = () => {
    continueAsGuest()
    router.push("/")
  }

  const demoAccounts = [
    { email: "admin@speechgpt.com", password: "admin123", role: "Admin", color: "bg-purple-100 text-purple-800" },
    { email: "user@speechgpt.com", password: "user123", role: "User", color: "bg-blue-100 text-blue-800" },
    { email: "demo@example.com", password: "demo123", role: "Demo", color: "bg-green-100 text-green-800" },
  ]

  const fillDemoAccount = (demoEmail: string, demoPassword: string) => {
    setLoginEmail(demoEmail)
    setLoginPassword(demoPassword)
    setActiveTab("login")
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <Waveform className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SpeechGPT</h1>
          <p className="text-gray-600 mt-2">Trascrizione audio intelligente</p>
        </div>
      </div>

      {/* Auth Card */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold">Benvenuto</CardTitle>
              <CardDescription>Accedi o registrati per continuare</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-600 hover:text-gray-700">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Indietro
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleContinueAsGuest}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                Salta
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Social Login */}
          <div className="space-y-3">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full h-11 bg-white hover:bg-gray-50 border-gray-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continua con Google
            </Button>

            <Button
              onClick={handleGitHubLogin}
              variant="outline"
              className="w-full h-11 bg-white hover:bg-gray-50 border-gray-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              )}
              Continua con GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">oppure</span>
            </div>
          </div>

          {/* Login/Register Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Accedi</TabsTrigger>
              <TabsTrigger value="register">Registrati</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="nome@esempio.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="La tua password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      disabled={isLoading}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Accesso in corso...
                    </>
                  ) : (
                    "Accedi"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-sm font-medium">
                    Nome completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Il tuo nome"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="nome@esempio.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="register-password"
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="Almeno 6 caratteri"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      required
                      minLength={6}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      disabled={isLoading}
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registrazione...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Crea Account
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="w-full space-y-4">
            <Separator />

            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center font-medium">Account Demo</p>
              <div className="grid gap-2">
                {demoAccounts.map((account, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-between h-auto p-3 hover:bg-gray-50 transition-colors bg-transparent"
                    onClick={() => fillDemoAccount(account.email, account.password)}
                    disabled={isLoading}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{account.email}</span>
                    </div>
                    <Badge variant="secondary" className={account.color}>
                      {account.role}
                    </Badge>
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-500 text-center">
                Clicca su un account per compilare automaticamente i campi
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Guest Mode Notice */}
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={handleContinueAsGuest}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          disabled={isLoading}
        >
          Continua senza account
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Puoi usare l'app senza registrarti, ma alcune funzionalità saranno limitate
        </p>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>© 2024 SpeechGPT. Tutti i diritti riservati.</p>
      </div>
    </div>
  )
}
