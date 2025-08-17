import { AudioWaveformIcon as Waveform } from "lucide-react"

export function Footer() {
    return (
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
    )
}