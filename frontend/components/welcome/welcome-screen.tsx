"use client"

import { useState } from "react"
import { AudioWaveformIcon as Waveform } from "lucide-react"
import { AudioUploader } from "../audio/audio-upload"
import { AudioRecorder } from "../audio/audio-recorder"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useModel } from "@/contexts/model-context"
import { useSession } from "next-auth/react"

export default function WelcomeScreen() {
  const { data: session } = useSession()
  const isGuest = !session
  const { toast } = useToast()
  const router = useRouter()
  const { selectedModel } = useModel() // Ora puoi accedere al modello selezionato
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)

  console.log("WelcomeScreen - modalità guest:", isGuest)
  console.log("WelcomeScreen - modello selezionato:", selectedModel)

  const handleRecordingComplete = (file: File) => {
    setAudioFile(file)
  }

  const onTranscribe = async (file: File) => {
    setIsTranscribing(true)
    try {
      console.log("Iniziando trascrizione per file:", file.name)
      console.log("Usando modello:", selectedModel)
      console.log("Modalità guest:", isGuest)
      
      const formData = new FormData()
      formData.append("audio", file)
      formData.append("model", selectedModel) // Aggiungi il modello alla richiesta

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      console.log("Risposta API ricevuta:", response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error("Errore API:", errorData)
        throw new Error("Errore nella trascrizione")
      }

      const data = await response.json()
      console.log("Dati ricevuti:", data)
      
      if (isGuest) {
        // Per gli utenti guest, crea un ID locale e gestisci tutto lato client
        const guestChatId = `guest_${Date.now()}`
        
        // Crea la chat guest nel localStorage
        const newChat = {
          id: guestChatId,
          title: "Nuova Chat",
          timestamp: new Date(),
          messages: [
            {
              id: `guest_msg_${Date.now()}_user`,
              content: file.name,
              type: "user" as const,
              audioFile: {
                name: file.name,
                size: file.size,
              },
              timestamp: new Date(),
              model: undefined,
            },
            {
              id: `guest_msg_${Date.now()}_transcription`,
              content: data.transcript || data.transcription,
              type: "transcription" as const,
              timestamp: new Date(),
              model: data.model || selectedModel,
            }
          ]
        }

        // Salva nel localStorage
        const existingChats = localStorage.getItem("guest_transcription_chats")
        let guestChatsData: { chats: any[], timestamp: number } = { chats: [], timestamp: Date.now() }

        if (existingChats) {
          try {
            guestChatsData = JSON.parse(existingChats)
          } catch (error) {
            console.error("Errore nel parsing delle chat guest:", error)
          }
        }

        guestChatsData.chats.unshift(newChat)
        guestChatsData.timestamp = Date.now()
        localStorage.setItem("guest_transcription_chats", JSON.stringify(guestChatsData))

        console.log("Chat guest creata:", newChat)
        console.log("Navigando verso:", `/transcribe/chat/${guestChatId}`)
        window.location.href = `/transcribe/chat/${guestChatId}`
      } else {
        // Per utenti autenticati, usa l'ID dal database
        console.log("ID chat:", data.chat?.id)
        
        if (data.chat?.id) {
          const targetPath = `/transcribe/chat/${data.chat.id}`
          console.log("Navigando verso:", targetPath)
          window.location.href = targetPath
        } else {
          throw new Error("ID chat mancante nella risposta")
        }
      }
    } catch (error: any) {
      console.error("Errore completo:", error)
      toast({
        title: "Errore",
        description: error.message || "Impossibile trascrivere il file",
        variant: "destructive",
      })
    } finally {
      setIsTranscribing(false)
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
        isTranscribing={isTranscribing}
      />

      <AudioRecorder onRecordingComplete={handleRecordingComplete} />
    </div>
  )
}

