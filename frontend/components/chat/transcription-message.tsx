"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, FileAudio, User, AudioWaveform as Waveform, BarChart3 } from "lucide-react"
import type { TranscriptionMessage as TMessage } from "@/types/transcription"
import type { TranscriptionMetrics } from "@/types/metrics"
import { toast } from "sonner"
import { MetricsForm } from "./metrics-form"
import { MetricsDisplay } from "./metrics-display"
import { useSession } from "next-auth/react"

interface TranscriptionMessageProps {
  message: TMessage
  sessionTitle?: string
}

export function TranscriptionMessage({ message, sessionTitle }: TranscriptionMessageProps) {
  const { data: session } = useSession()
  const [showMetricsForm, setShowMetricsForm] = useState(false)
  const [metrics, setMetrics] = useState<TranscriptionMetrics | null>(null)

  const copyTranscription = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Testo copiato negli appunti")
  }

  const downloadTranscription = (text: string, fileName: string) => {
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName}-trascrizione.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleMetricsCalculated = (calculatedMetrics: TranscriptionMetrics) => {
    setMetrics(calculatedMetrics)
    setShowMetricsForm(false)
  }

  const handleShowMetricsForm = () => {
    setShowMetricsForm(true)
  }

  const handleCancelMetrics = () => {
    setShowMetricsForm(false)
  }

  useEffect(() => {
    console.log(message.type)
  }, [])

  return (
    <div className={`flex gap-4 ${message.type === "USER" ? "justify-end" : "justify-start"}`}>
      {message.type === "TRANSCRIPTION" && (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Waveform className="w-4 h-4 text-white" />
        </div>
      )}
      <div className="max-w-[80%] space-y-2">
        <div
          className={`rounded-2xl p-4 ${
            message.type === "USER"
              ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
              : "bg-gray-100 text-gray-900 border border-gray-200"
          }`}
        >
          {message.audioPath && (
            <div className="mb-3 p-3 bg-white/10 rounded-lg">
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <FileAudio className="w-4 h-4" />
                  <span className="text-sm font-medium">{message.audioName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs bg-white/40">
                    {message.audioSize
                      ? (message.audioSize / 1024 / 1024).toFixed(2) + " MB"
                      : "Dimensione sconosciuta"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <p className="whitespace-pre-wrap">{message.content}</p>

          {message.type === "TRANSCRIPTION" && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-300/50">
              <Button
                onClick={() => copyTranscription(message.content)}
                variant="ghost"
                size="sm"
                className="gap-2 h-8 px-3 hover:bg-gray-300/50 rounded-lg text-gray-700 hover:text-gray-900 border border-gray-300/30"
              >
                <Copy className="w-3 h-3" />
                Copia
              </Button>
              <Button
                onClick={() => downloadTranscription(message.content, sessionTitle || "trascrizione")}
                variant="ghost"
                size="sm"
                className="gap-2 h-8 px-3 hover:bg-gray-300/50 rounded-lg text-gray-700 hover:text-gray-900 border border-gray-300/30"
              >
                <Download className="w-3 h-3" />
                Download
              </Button>
              {session && (
                <Button
                  onClick={handleShowMetricsForm}
                  variant="ghost"
                  size="sm"
                  className="gap-2 h-8 px-3 hover:bg-blue-100 rounded-lg text-blue-700 hover:text-blue-800 border border-blue-300/50 bg-blue-50/50"
                  disabled={showMetricsForm}
                >
                  <BarChart3 className="w-3 h-3" />
                  {metrics ? "Rivaluta" : "Valuta"}
                </Button>
              )}
            </div>
          )}
        </div>

        {message.type === "TRANSCRIPTION" && session && (
          <>
            {showMetricsForm && (
              <div className="mt-2">
                <MetricsForm
                  message={message}
                  onMetricsCalculated={handleMetricsCalculated}
                  onCancel={handleCancelMetrics}
                />
              </div>
            )}

            {metrics && (
              <div className="mt-2">
                <MetricsDisplay metrics={metrics} />
              </div>
            )}
          </>
        )}
      </div>
      {message.type === "USER" && (
        session?.user?.image ? (
          <div className="w-8 h-8 rounded-full overflow-hidden bg-black flex items-center justify-center">
            <img
              src={session.user.image || "/placeholder.svg"}
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
        )
      )}
    </div>
  )
}
