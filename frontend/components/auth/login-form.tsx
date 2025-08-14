"use client"

import type React from "react"
import { useState, type FormEvent } from "react"
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
import { signIn } from "@/lib/auth"
import { authenticate, signUpAction } from "@/lib/auth-actions"
import GitHubSignIn from "@/components/auth/github-sign-in"
import GoogleSignIn from "@/components/auth/google-sign-in"
import { redirect } from "next/navigation"

interface LoginFormProps {
  onBack?: () => void
}

export function LoginForm({ onBack }: LoginFormProps) {
  const [activeTab, setActiveTab] = useState("login")
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")

  const handleContinueAsGuest = () => {
    redirect("/")
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
            <GoogleSignIn />
            <GitHubSignIn />
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
              <form action={authenticate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      className="pl-10"
                      required
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
                      type="password"
                      name="password"
                      className="pl-10"
                      required
                    />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
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
                >
                  Accedi
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-4">
              <form action={signUpAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-sm font-medium">
                    Nome completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="register-name"
                      name="name"
                      type="text"
                      placeholder="Il tuo nome"
                      className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      required
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
                      name="email"
                      placeholder="nome@esempio.com"
                      className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      required
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
                      name="password"
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="Almeno 6 caratteri"
                      className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      required
                      minLength={6}
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
