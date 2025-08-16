"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ChatView } from "@/components/chat/chat-view"
import type { TranscriptionChat } from "@/types/transcription"
import { useToast } from "@/hooks/use-toast"

interface ChatPageProps {
  guestMode: boolean
}

export default function ChatPage({ guestMode }: ChatPageProps) {
  const isGuest = guestMode
  const params = useParams()
  const chatId = params.id as string
  const { toast } = useToast()

  const [transcriptionChat, setTranscriptionChat] = useState<TranscriptionChat | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)

  useEffect(() => {
    if (isGuest) return

    const fetchChat = async () => {
      try {
        const res = await fetch(`/api/chats/${chatId}`)
        if (!res.ok) {
          throw new Error("Errore nel caricamento della chat")
        }
        const data = await res.json()
        const chatData: TranscriptionChat = {
          id: data.id,
          title: data.title,
          timestamp: new Date(data.createdAt),
          messages: data.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            type: msg.type.toLowerCase() as "user" | "assistant" | "transcription",
            audioFile: msg.audioName ? {
              name: msg.audioName,
              size: msg.audioSize || 0,
            } : undefined,
            timestamp: new Date(msg.createdAt),
            model: msg.modelName,
          })),
        }
        setTranscriptionChat(chatData)
      } catch (err) {
        console.error(err)
        toast({
          title: "Errore",
          description: "Impossibile caricare la chat",
          variant: "destructive",
        })
      }
    }

    if (chatId) {
      fetchChat()
    }
  }, [chatId])

  const handleTranscribe = async (file: File) => {
    setIsTranscribing(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch(`/api/chats/${chatId}/transcribe`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Errore nella trascrizione")

      const data = await res.json()
      const newMessages = data.messages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        type: msg.type.toLowerCase() as "user" | "assistant" | "transcription",
        audioFile: msg.audioName ? {
          name: msg.audioName,
          size: msg.audioSize || 0,
        } : undefined,
        timestamp: new Date(msg.createdAt),
        model: msg.modelName,
      }))

      setTranscriptionChat((prev) =>
        prev
          ? { ...prev, messages: [...prev.messages, ...newMessages] }
          : {
              id: chatId,
              title: "Nuova Chat",
              timestamp: new Date(),
              messages: newMessages,
            }
      )

      toast({
        title: "Successo",
        description: "Trascrizione completata",
      })
    } catch (err) {
      console.error(err)
      toast({
        title: "Errore",
        description: "Impossibile completare la trascrizione",
        variant: "destructive",
      })
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleFileSelect = (file: File) => {
    handleTranscribe(file)
  }

  const handleStartRecording = () => {
    // Implementazione per iniziare la registrazione
    console.log("Start recording from chat view")
  }

  if (!transcriptionChat) {
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
      session={transcriptionChat}
      onFileSelect={handleFileSelect}
      onStartRecording={handleStartRecording}
      onTranscribe={handleTranscribe}
      isTranscribing={isTranscribing}
      guestMode={guestMode}
    />
  )
}
