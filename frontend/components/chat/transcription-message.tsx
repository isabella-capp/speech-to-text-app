"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, FileAudio, User, AudioWaveformIcon as Waveform } from "lucide-react"
import type { TranscriptionMessage as TMessage } from "@/types/transcription"
import { useToast } from "@/hooks/use-toast"

interface TranscriptionMessageProps {
  message: TMessage
  sessionTitle?: string
}

export function TranscriptionMessage({ message, sessionTitle }: TranscriptionMessageProps) {
  const { toast } = useToast()

  const copyTranscription = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiato",
      description: "Testo copiato negli appunti",
    })
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

  return (
    <div className={`flex gap-4 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
      {message.type === "assistant" && (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Waveform className="w-4 h-4 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl p-4 ${
          message.type === "user" ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white" : "bg-gray-100 text-gray-900 border border-gray-200"
        }`}
      >
        {message.audioFile && (
          <div className="mb-3 p-3 bg-white/10 rounded-lg">
            <div className="flex items-center gap-2 justify-between ">
              <div className="flex items-center gap-2">
                <FileAudio className="w-4 h-4" />
                <span className="text-sm font-medium">{message.audioFile.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs bg-white/40">
                  {(message.audioFile.size / 1024 / 1024).toFixed(2)} MB
                </Badge>
                {message.audioFile.duration && (
                  <Badge variant="secondary" className="text-xs bg-white/40">
                    {message.audioFile.duration}s
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.type === "assistant" && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
            <Button onClick={() => copyTranscription(message.content)} variant="ghost" size="sm" className="gap-2 h-8 hover:bg-gray-200/50 rounded-lg cursor-pointer">
              <Copy className="w-3 h-3" />
              Copia
            </Button>
            <Button
              onClick={() => downloadTranscription(message.content, sessionTitle || "trascrizione")}
              variant="ghost"
              size="sm"
              className="gap-2 h-8 hover:bg-gray-200/50 rounded-lg cursor-pointer"
            >
              <Download className="w-3 h-3" />
              Download
            </Button>
          </div>
        )}
      </div>
      {message.type === "user" && (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  )
}
