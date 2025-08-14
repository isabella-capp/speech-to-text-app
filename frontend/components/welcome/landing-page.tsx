"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AudioWaveformIcon as Waveform,
  Search,
  Copy,
  ArrowRight,
  Mic,
  Upload,
  Zap,
  Shield,
  Globe,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { SpeechToTextApp } from "../speech-to-text-app"

export function LandingPage() {
  const [guestMode, setGuestMode] = useState(false)

  if (guestMode) {
    return <SpeechToTextApp guestMode={true} />;
  }
  
  const router = useRouter()

  const handleLoginClick = () => {
    router.push("/auth/login")
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Waveform className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">SpeechGPT</span>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <Button onClick={handleLoginClick} variant="ghost" className="text-gray-700 rounded-full hover:text-gray-900">
                Log in
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-normal text-gray-900 mb-12 leading-tight">
            Introducing{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SpeechGPT
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Trasforma il tuo audio in testo con l'intelligenza artificiale più avanzata. Registra, carica e trascrivi
            con precisione professionale.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => setGuestMode(true)}
              size="lg"
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-full text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Prova SpeechGPT
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={handleLoginClick}
              variant="outline"
              size="lg"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-full text-base font-medium bg-transparent"
            >
              Crea un Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-5 flex-shrink-0">
        <div className="max-w-7xl items-center mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <Waveform className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-600">© 2024 SpeechGPT. Tutti i diritti riservati.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
