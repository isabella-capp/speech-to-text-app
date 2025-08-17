"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ChatView } from "@/components/chat/chat-view"
import type { TranscriptionChat } from "@/types/transcription"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"

export default function ChatPage() {
  const { data: session } = useSession()
  const isGuest = !session
  const params = useParams()
  const chatId = params.id as string
  const { toast } = useToast()

  const [transcriptionChat, setTranscriptionChat] = useState<TranscriptionChat | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)

  useEffect(() => {
    if (isGuest) {
      // Per gli utenti guest, prova a caricare dal localStorage
      const guestChats = localStorage.getItem("guest_transcription_chats")
      if (guestChats) {
        try {
          const data = JSON.parse(guestChats)
          const chat = data.chats?.find((c: TranscriptionChat) => c.id === chatId)
          if (chat) {
            setTranscriptionChat({
              ...chat,
              timestamp: new Date(chat.timestamp),
              messages: chat.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              }))
            })
          } else {
            // Se la chat non esiste nel localStorage, crea una chat vuota
            setTranscriptionChat({
              id: chatId,
              title: "Nuova Chat Guest",
              timestamp: new Date(),
              messages: [],
            })
          }
        } catch (error) {
          console.error("Errore nel parsing delle chat guest:", error)
          // In caso di errore, crea una chat vuota
          setTranscriptionChat({
            id: chatId,
            title: "Nuova Chat Guest",
            timestamp: new Date(),
            messages: [],
          })
        }
      } else {
        // Se non ci sono chat nel localStorage, crea una chat vuota
        setTranscriptionChat({
          id: chatId,
          title: "Nuova Chat Guest",
          timestamp: new Date(),
          messages: [],
        })
      }
      return // Importante: esce qui per gli utenti guest
    }

    // Solo per utenti autenticati
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
  }, [chatId, isGuest])

  const handleTranscribe = async (file: File) => {
    setIsTranscribing(true)
    try {
      if (isGuest) {
        // Per gli utenti guest, gestisci la trascrizione localmente
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) throw new Error("Errore nella trascrizione")

        const data = await res.json()
        
        // Crea i nuovi messaggi per la trascrizione
        const newMessages = [
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
            model: data.model,
          }
        ]

        // Aggiorna lo stato locale
        setTranscriptionChat((prev) => {
          const updatedChat = prev
            ? { ...prev, messages: [...prev.messages, ...newMessages] }
            : {
                id: chatId,
                title: "Nuova Chat",
                timestamp: new Date(),
                messages: newMessages,
              }

          // Salva nel localStorage
          const existingChats = localStorage.getItem("guest_transcription_chats")
          let guestChatsData: { chats: TranscriptionChat[], timestamp: number } = { chats: [], timestamp: Date.now() }
          
          if (existingChats) {
            try {
              guestChatsData = JSON.parse(existingChats)
            } catch (error) {
              console.error("Errore nel parsing delle chat guest:", error)
            }
          }

          // Trova e aggiorna la chat esistente o aggiungila
          const chatIndex = guestChatsData.chats.findIndex((c: TranscriptionChat) => c.id === chatId)
          if (chatIndex >= 0) {
            guestChatsData.chats[chatIndex] = updatedChat
          } else {
            guestChatsData.chats.unshift(updatedChat)
          }

          guestChatsData.timestamp = Date.now()
          localStorage.setItem("guest_transcription_chats", JSON.stringify(guestChatsData))

          return updatedChat
        })

        toast({
          title: "Successo",
          description: "Trascrizione completata (salvata localmente)",
        })
        return
      }

      // Logica originale per gli utenti autenticati
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

  console.log(transcriptionChat)
  console.log("Trascriptions:", transcriptionChat?.messages)

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
    />
  )
}
