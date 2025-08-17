import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
    return(
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
              asChild
              size="lg"
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-full text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="/transcribe" className="flex items-center">
                Prova SpeechGPT
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-full text-base font-medium bg-transparent"
            >
              <Link href="/auth/login" className="flex items-center">
                Crea un Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
    )
}