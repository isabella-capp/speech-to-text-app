"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ChatView } from "@/components/chat/chat-view"
import type { TranscriptionChat } from "@/types/transcription"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useTranscriptionChats } from "@/hooks/use-transcription-chat"
import { useTranscription } from "@/hooks/use-trascription"
import { useModel } from "@/contexts/model-context"
import { is } from "zod/v4/locales"

export default function ChatPage() {
  const { data: session } = useSession()
  const { selectedModel } = useModel()
  const isGuest = !session
  const params = useParams()
  const chatId = params.id as string
  const { toast } = useToast()
  const { getChat, addMessageToChat, refreshChat } = useTranscriptionChats(isGuest)
  const { loading, transcribe } = useTranscription()
  const chat = getChat(chatId)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const handleTranscribeMessage = async (index: number) => {
    if (!chat || chat.messages.length === 0 || index < 0) return
    
    const message = chat.messages[index]
    console.log(message)
    if (!message.audioPath) {
      toast({
        title: "Errore",
        description: "Percorso audio non trovato",
        variant: "destructive"
      })
      return
    }

    try {
      setIsTranscribing(true) // Inizia lo stato di trascrizione
      
      // Recupera il file audio dal percorso
      const response = await fetch(message.audioPath)
      if (!response.ok) {
        throw new Error("Impossibile recuperare il file audio")
      }
      
      const buffer = await response.arrayBuffer()
      const fileName = message.audioName || `audio_${Date.now()}.wav`
      const type = response.headers.get('content-type') || 'audio/wav'
      
      const fileInfo = {
        buffer: Array.from(new Uint8Array(buffer)),
        fileName,
        type,
        model: selectedModel
      }

      console.log("Sending fileInfo:", {
        bufferLength: fileInfo.buffer.length,
        fileName: fileInfo.fileName,
        type: fileInfo.type,
        model: fileInfo.model
      })

      const res = await fetch(`/api/transcribe/${chatId}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fileInfo })
      })

      if (!res.ok) {
        const error = await res.text()
        throw new Error(error)
      }

      const result = await res.json()
      
      if (result.success) {
        // Aggiorna la chat con il messaggio di trascrizione

        if (isGuest) {
          addMessageToChat(chatId, result.message)
        } else {
          // per utenti loggati faccio il refresh dal backend
          await refreshChat(chatId)
        }

        toast({
          title: "Successo",
          description: "Trascrizione completata"
        })
      } else {
        throw new Error(result.error || "Errore nella trascrizione")
      }
    } catch (error: any) {
      console.error("Errore trascrizione:", error)
      toast({
        title: "Errore",
        description: error.message || "Errore durante la trascrizione",
        variant: "destructive"
      })
    } finally {
      setIsTranscribing(false) // Fine dello stato di trascrizione
    }
  }

  useEffect(() => {
    if (chat?.messages.length === 1 && !isTranscribing) {
      handleTranscribeMessage(0)
    }
  }, [chat?.messages.length, chatId])

  const handleTranscribe = async (file: File) => {
    console.log("Handling transcribe for file:", file)
    setIsTranscribing(true)
    try {
      const res = await transcribe(file, selectedModel as "whisper" | "wav2vec2")
      if(!res) {
        return
      }
      console.log("Transcription result:", res)
      const index = chat?.messages ? chat.messages.length : -1
      console.log("Transcribing message at index:", index)
      console.log("Chat messages:", chat?.messages)
      if (index >= 0) {
        setIsTranscribing(false) // Reset prima di chiamare handleTranscribeMessage che lo gestirà
        await handleTranscribeMessage(index)
      }
    } catch (error) {
      console.error("Errore in handleTranscribe:", error)
      setIsTranscribing(false)
    }
  }

  const handleFileSelect = async (file: File) => {
    await handleTranscribe(file)
  }

  const handleStartRecording = () => {
    console.log("Start recording from chat view")
  }

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Caricamento chat...</p>
        </div>
      </div>
    )
  }

  return (
    <ChatView
      session={chat}
      onFileSelect={handleFileSelect}
      onStartRecording={handleStartRecording}
      onTranscribe={handleTranscribe}
      isTranscribing={isTranscribing}
    />
  )
}
