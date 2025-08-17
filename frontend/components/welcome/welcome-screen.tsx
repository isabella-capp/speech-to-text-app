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
      console.log("ID chat:", data.chat?.id)
      
      if (data.chat?.id) {
        let targetPath = `/transcribe/chat/guest-${data.chat.id}`
       
        console.log("Navigando verso:", targetPath)
        router.push(targetPath)
      } else {
        throw new Error("ID chat mancante nella risposta")
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

