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
import { useAuth } from "@/hooks/use-auth"

export function LandingPage() {
  const { showAuth, continueAsGuest } = useAuth()

  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Registrazione Avanzata",
      description: "Registra audio di alta qualità direttamente dal browser con controlli professionali",
    },
    {
      icon: <Upload className="w-6 h-6" />,
      title: "Upload Multipli",
      description: "Carica file audio in diversi formati: MP3, WAV, M4A, FLAC e molti altri",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Trascrizione Istantanea",
      description: "Tecnologia AI avanzata per trascrizioni accurate e veloci in tempo reale",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy Garantita",
      description: "I tuoi dati audio sono sicuri e non vengono mai condivisi con terze parti",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multilingua",
      description: "Supporto per oltre 50 lingue con riconoscimento automatico della lingua",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Collaborazione",
      description: "Condividi e collabora sulle trascrizioni con il tuo team in tempo reale",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Waveform className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">SpeechGPT</span>
            </div>

            {/* Center Icon */}
            <div className="hidden md:flex">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Copy className="w-4 h-4 text-gray-500" />
              </Button>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Search className="w-4 h-4 text-gray-500" />
              </Button>
              <Button onClick={showAuth} variant="ghost" className="text-gray-700 hover:text-gray-900">
                Log in
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-20">
          {/* Date and Category */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="text-gray-500 text-sm">Dicembre 10, 2024</span>
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100">
              Prodotto
            </Badge>
          </div>

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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              onClick={continueAsGuest}
              size="lg"
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-full text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Prova SpeechGPT
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={showAuth}
              variant="outline"
              size="lg"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-full text-base font-medium bg-transparent"
            >
              Crea Account Gratuito
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
    </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <Waveform className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-600">© 2024 SpeechGPT. Tutti i diritti riservati.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-700 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-gray-700 transition-colors">
                Termini
              </a>
              <a href="#" className="hover:text-gray-700 transition-colors">
                Supporto
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
