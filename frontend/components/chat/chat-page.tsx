"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ChatView } from "@/components/chat/chat-view"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useTranscriptionChats } from "@/hooks/use-transcription-chat"
import { useModel } from "@/contexts/model-context"
import * as guest from "@/hooks/use-transcription-chat/guest"
import * as api from "@/hooks/use-transcription-chat/api"
import { Message, TranscriptionChat } from "@/hooks/use-transcription-chat/types"

export default function ChatPage() {
  const { data: session } = useSession()
  const { selectedModel } = useModel()
  const isGuest = !session
  const params = useParams()
  const chatId = params.id as string
  const { toast } = useToast()
  const { getChat, transcriptionChats, setChats, loading } = useTranscriptionChats(isGuest)
  const [chat, setChat] = useState<TranscriptionChat | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const showToast = (title: string, description: string, variant?: "destructive") =>
    toast({ title, description, variant })

  // Carica la chat al mount o quando cambia chatId
  useEffect(() => {
    const loadChat = async () => {
      // Aspetta che il loading sia completato prima di tentare di caricare la chat
      if (loading) return;
      
      // Evita di ricaricare se la chat è già quella corretta
      if (chat?.id === chatId) return;
      
      try {
        const foundChat = await getChat(chatId)
        setChat(foundChat)
      } catch (err) {
        console.error("Errore nel caricamento chat:", err)
        setChat(null)
      }
    }
    loadChat()
  }, [chatId, loading, getChat]) // Aggiunto loading come dipendenza

  // Trascrive un singolo messaggio
  const handleTranscribeMessage = async (message: Message) => {
    if (!message.audioPath) {
      showToast("Errore", "Percorso audio non trovato", "destructive")
      return
    }

    try {
      setIsTranscribing(true)

      const response = await fetch(message.audioPath)
      if (!response.ok) throw new Error("Impossibile recuperare il file audio")

      const buffer = await response.arrayBuffer()
      const fileName = message.audioName || `audio_${Date.now()}.wav`
      const type = response.headers.get("content-type") || "audio/wav"

      const fileInfo = {
        buffer: Array.from(new Uint8Array(buffer)),
        fileName,
        type,
        model: selectedModel,
      }

      const res = await fetch(`/api/transcribe/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileInfo }),
      })

      if (!res.ok) {
        const error = await res.text()
        throw new Error(error)
      }

      const result = await res.json()
      if (result.success) {
        if (isGuest) {
          guest.addMessage(chatId, result.message, transcriptionChats, setChats, showToast)
        } else {
          const updatedChat = await api.getChat(chatId)
          if (updatedChat) {
            setChat(updatedChat)
            setChats((prev) =>
              prev.map((c) => (c.id === updatedChat.id ? updatedChat : c))
            )
          }
        }

        showToast("Successo", "Trascrizione completata")
      } else {
        throw new Error(result.error || "Errore nella trascrizione")
      }
    } catch (error: any) {
      console.error("Errore trascrizione:", error)
      showToast("Errore", error.message || "Errore durante la trascrizione", "destructive")
    } finally {
      setIsTranscribing(false)
    }
  }

  // Effetto automatico per trascrivere il primo messaggio, se presente
  useEffect(() => {
    if (chat?.messages.length === 1 && !isTranscribing) {
      handleTranscribeMessage(chat.messages[0])
    }
  }, [chat?.messages.length, chatId])

  // Gestione nuovo file audio
  const handleTranscribe = async (file: File) => {
    setIsTranscribing(true)
    try {
      if (isGuest) {
        const audioMessage: Message = {
          id: `temp-${Date.now()}`,
          type: "USER",
          content: `File audio: ${file.name}`,
          audioPath: URL.createObjectURL(file),
          audioName: file.name,
          audioSize: file.size,
          modelName: selectedModel,
          timestamp: new Date(),
        }

        guest.addMessage(chatId, audioMessage, transcriptionChats, setChats, showToast)

        const updatedChat = await getChat(chatId)
        const lastMessage = updatedChat?.messages.at(-1)
        if (lastMessage) await handleTranscribeMessage(lastMessage)
      } else {
        await api.addMessage(
          chatId,
          file,
          selectedModel as "whisper" | "wav2vec2",
          setChats,
          showToast
        )
        
        // Recupera la chat aggiornata e l'ultimo messaggio
        const updatedChat = await api.getChat(chatId)
        if (updatedChat) {
          setChat(updatedChat)
          const lastMessage = updatedChat.messages.at(-1)
          if (lastMessage) await handleTranscribeMessage(lastMessage)
        }
      }
    } catch (error) {
      console.error("Errore in handleTranscribe:", error)
      showToast("Errore", "Errore durante l'aggiunta del file audio", "destructive")
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleFileSelect = async (file: File) => {
    await handleTranscribe(file)
  }

  const handleStartRecording = () => {
    console.log("Start recording from chat view")
  }

  if (loading || !chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>{loading ? "Caricamento chats..." : "Caricamento chat..."}</p>
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
