"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, Square, Play, Pause, RotateCcw, Check, Volume2 } from "lucide-react"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"

interface AudioRecorderProps {
  onRecordingComplete: (file: File) => void
}

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const { isRecording, isPaused, recordingTime, formatTime, startRecording, togglePauseRecording, stopRecording } = useAudioRecorder()

  const [recordedFile, setRecordedFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  const handleStopRecording = async () => {
    const file = await stopRecording()
    if (file) {
      setRecordedFile(file)
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
    }
  }

  const handlePlayPause = () => {
    if (!audioUrl) return

    if (!audioElement) {
      const audio = new Audio(audioUrl)
      audio.onended = () => setIsPlaying(false)
      audio.onplay = () => setIsPlaying(true)
      audio.onpause = () => setIsPlaying(false)
      setAudioElement(audio)
      audio.play()
    } else {
      if (isPlaying) {
        audioElement.pause()
      } else {
        audioElement.play()
      }
    }
  }

  const handleConfirm = () => {
    if (recordedFile) {
      onRecordingComplete(recordedFile)
      handleReset()
    }
  }

  const handleReset = () => {
    if (audioElement) {
      audioElement.pause()
      audioElement.src = ""
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setRecordedFile(null)
    setAudioUrl(null)
    setIsPlaying(false)
    setAudioElement(null)
  }

  // Se abbiamo un file registrato, mostra la preview
  if (recordedFile && audioUrl) {
    return (
      <div className="mt-8 p-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border border-green-200 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Volume2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Registrazione Completata</h3>
          <p className="text-sm text-gray-600">Riascolta l'audio prima di procedere con la trascrizione</p>
        </div>

        {/* Info del file */}
        <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-800">{recordedFile.name}</div>
                <div className="text-sm text-gray-500">
                  {(recordedFile.size / 1024 / 1024).toFixed(2)} MB •{" "}
                  {formatTime(Math.floor(recordedFile.size / 16000))}
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Pronto
            </Badge>
          </div>
        </div>

        {/* Controlli audio */}
        <div className="flex justify-center mb-6">
          <Button
            onClick={handlePlayPause}
            size="lg"
            className={`${
              isPlaying
                ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                : "bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
            } text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 rounded-full`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pausa
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Riproduci
              </>
            )}
          </Button>
        </div>

        {/* Azioni finali */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            className="bg-white hover:bg-gray-50 border-2 px-6 py-3 rounded-full transition-all duration-200 hover:shadow-md flex-1"
          >
            <RotateCcw className="w-5 h-5 mr-2 text-gray-600" />
            <span className="text-gray-600 font-medium">Registra di nuovo</span>
          </Button>
          <Button
            onClick={handleConfirm}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-full flex-1"
          >
            <Check className="w-5 h-5 mr-2" />
            Conferma
          </Button>
        </div>

        {/* Suggerimento */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Riascolta l'audio per verificare la qualità prima della trascrizione</span>
          </div>
        </div>
      </div>
    )
  }

  // Interfaccia di registrazione normale
  return (
    <div className="mt-8 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-sm w-full max-w-md">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Registrazione Audio</h3>
        <p className="text-sm text-gray-600">Registra direttamente dal tuo microfono</p>
      </div>

      {/* Visualizzatore audio centrale */}
      <div className="flex justify-center">
        <div className="relative">
          {/* Cerchio principale del microfono */}
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording
                ? isPaused
                  ? "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/25"
                  : "bg-gradient-to-br from-red-500 to-pink-600 shadow-lg shadow-red-500/25 animate-pulse"
                : "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
            } cursor-pointer relative overflow-hidden`}
            onClick={!isRecording ? startRecording : undefined}
          >
            {!isRecording &&(
              <Mic className="w-8 h-8 text-white z-10" />
            )}

            {isPaused &&(
              <Mic className="w-8 h-8 text-white z-10" />
            )}

            {/* Onde sonore centrate nel cerchio */}
            {isRecording && !isPaused && (
              <div className="absolute inset-0 mt-2 flex items-center justify-center">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-white/70 rounded-full animate-bounce"
                      style={{
                        height: `${Math.random() * 20 + 10}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: "0.6s",
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Anelli animati durante la registrazione */}
          {isRecording && !isPaused && (
            <>
              <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-red-400 animate-ping opacity-75"></div>
              <div className="absolute inset-0 w-24 h-24 rounded-full border border-red-300 animate-ping opacity-50 animation-delay-75"></div>
              <div className="absolute inset-0 w-24 h-24 rounded-full border border-red-200 animate-ping opacity-25 animation-delay-150"></div>
            </>
          )}
        </div>
      </div>

      {/* Timer e stato */}
      {isRecording && (
        <div className="text-center my-6">
          <div className="inline-flex justify-between w-[80%] mx-auto items-center gap-3 bg-white rounded-full px-6 py-3 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isPaused ? "bg-yellow-500" : "bg-red-500 animate-pulse"}`}></div>
              <Badge variant={isPaused ? "secondary" : "destructive"} className="text-xs text-white font-medium rounded-full">
                {isPaused ? "In Pausa" : "Registrando"} 
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-px h-4 bg-gray-300"></div>
              <span className="font-mono text-lg font-bold text-gray-800 tabular-nums">{formatTime(recordingTime)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Controlli */}
      <div className="flex justify-center gap-4 w-full">
        {isRecording && (
          <div className="flex gap-3 w-[80%] justify-between">
            <Button
              onClick={togglePauseRecording}
              variant="outline"
              size="lg"
              className="bg-white hover:bg-gray-50 border-2 px-6 py-3 rounded-full transition-all duration-200 hover:shadow-md flex-1"
            >
              {isPaused ? (
                <>
                  <Play className="w-5 h-5 mr-2 text-green-600" />
                  <span className="text-green-600 font-medium">Riprendi</span>
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5 mr-2 text-yellow-600" />
                  <span className="text-yellow-600 font-medium">Pausa</span>
                </>
              )}
            </Button>
            <Button
              onClick={handleStopRecording}
              size="lg"
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-full flex-1"
            >
              <Square className="w-5 h-5 mr-2" />
              Termina
            </Button>
          </div>
        )}
      </div>

      {/* Suggerimenti */}
      <div className="mt-6 text-center">
        {!isRecording ? (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Clicca sul microfono o sul pulsante per iniziare</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Parla chiaramente nel microfono</span>
            </div>
            
          </div>
        )}
      </div>
    </div>
  )
}
