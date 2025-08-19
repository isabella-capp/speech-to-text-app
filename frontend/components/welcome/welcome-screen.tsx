"use client"

import { useState } from "react"
import { AudioWaveformIcon as Waveform } from "lucide-react"
import { AudioUploader } from "../audio/audio-upload"
import { AudioRecorder } from "../audio/audio-recorder"
import { useToast } from "@/hooks/use-toast"
import { useModel } from "@/contexts/model-context"
import { useSession } from "next-auth/react"
import { useTranscription } from "@/hooks/use-trascription"
import { TranscriptionChat } from "@/hooks/use-transcription-chat/types"
import { useTranscriptionChats } from "@/hooks/use-transcription-chat"

export default function WelcomeScreen() {
  const { toast } = useToast()
  const { selectedModel } = useModel()
  const { data: session } = useSession()
  const isGuest = !session
  const { addChat } = useTranscriptionChats(isGuest)
  
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const {loading ,  transcribe} = useTranscription()

  const handleRecordingComplete = (file: File) => {
    setAudioFile(file)
  }

  const onTranscribe = async (file: File) => {
    setIsLoading(loading)
    console.log(file)
    try {
      const res = await transcribe(file, selectedModel as "whisper" | "wav2vec2")
      if (!res) return

      if (isGuest) {
      const newChat: TranscriptionChat = {
        id: `chat_${Date.now()}`,
        title: file.name || "Nuova Trascrizione",
        timestamp: new Date(),
        model: selectedModel,
        audioFile: { name: file.name, size: file.size },
        messages: [
          {
            id: `msg_${Date.now()}_user`,
            type: "user",
            content: `File audio: ${file.name}`,
            timestamp: new Date(),
            audioFile: { name: file.name, size: file.size },
          },
          {
            id: `msg_${Date.now()}_transcription`,
            type: "transcription",
            content: res.transcription,
            timestamp: new Date(),
            model: res.model || selectedModel,
          },
        ],
      }
        const chatId = await addChat(newChat)
        window.location.href = `/transcribe/chat/${chatId}`
      } else {
        if (res.chat?.id) {
          const targetPath = `/transcribe/chat/${res.chat.id}`
          window.location.href = targetPath
        }
      }
    }
    catch (error) {
      console.error("Errore durante la trascrizione:", error)
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore durante la trascrizione",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-0 flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Waveform className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Come posso aiutarti oggi?</h2>
        <p className="text-gray-600">Carica un file audio o registra dal microfono per iniziare</p>
      </div>

      <AudioUploader
        audioFile={audioFile}
        onFileSelect={setAudioFile}
        onFileRemove={() => setAudioFile(null)}
        onTranscribe={(file) => onTranscribe(file)}
        dragActive={dragActive}
        onDragActiveChange={setDragActive}
        isTranscribing={isLoading}
      />

      <AudioRecorder onRecordingComplete={handleRecordingComplete} />
    </div>
  )
}

