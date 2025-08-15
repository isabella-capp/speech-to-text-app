"use client"

import { useState, useEffect, useRef } from "react"
import type { TranscriptionChat } from "@/types/transcription"
import { useToast } from "@/hooks/use-toast"

export function useTranscriptionChats() {
  const [transcriptionChats, setTranscriptionChats] = useState<TranscriptionChat[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const hasLoaded = useRef(false)

  useEffect(() => {
    if (hasLoaded.current) return // Previeni chiamate multiple
    
    console.log('useTranscriptionChats: fetchChats chiamato')
    const fetchChats = async () => {
      try {
        console.log('useTranscriptionChats: inizio fetch /api/chats')
        const response = await fetch("/api/chats")
        if (!response.ok) {
          throw new Error("Errore nel caricamento delle chat")
        }

        const chats = await response.json()
        console.log('useTranscriptionChats: chat caricate:', chats.length)

        // Converti le chat dal DB al formato delle chat di trascrizione
        const convertedChats: TranscriptionChat[] = chats.map((chat: any) => ({
          id: chat.id,
          title: chat.title,
          timestamp: new Date(chat.updatedAt),
          audioFile: chat.messages[0]?.audioPath
            ? {
                name: chat.messages[0].audioName,
                size: chat.messages[0].audioSize,
                url: chat.messages[0].audioPath,
              }
            : undefined,
          model: chat.messages[0]?.modelName,
          messages: chat.messages.map((msg: any) => ({
            id: msg.id,
            type: msg.type as "user" | "assistant" | "transcription",
            content: msg.content,
            timestamp: new Date(msg.createdAt),
            model: msg.modelName,
            audioFile: msg.audioPath
              ? {
                  name: msg.audioName,
                  size: msg.audioSize,
                }
              : undefined,
          })),
        }))

        setTranscriptionChats(convertedChats)
        hasLoaded.current = true
      } catch (error) {
        console.error("Errore nel caricamento delle chat:", error)
        toast({
          title: "Errore",
          description: "Impossibile caricare le chat",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchChats()
  }, []) // Rimuoviamo la dipendenza toast

  const addChat = async (chatData: TranscriptionChat) => {
    try {
      // Prima crea la chat
      const chatResponse = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: chatData.title,
        }),
      })

      if (!chatResponse.ok) {
        throw new Error("Errore nella creazione della chat")
      }

      const newChat = await chatResponse.json()

      // Per ora, non aggiungiamo i messaggi durante la creazione
      // I messaggi esistono solo in locale fino a quando non implementiamo il salvataggio completo

      // Aggiorna lo stato locale
      const updatedChat: TranscriptionChat = {
        ...chatData,
        id: newChat.id,
        timestamp: new Date(newChat.createdAt),
      }

      setTranscriptionChats((prev) => [updatedChat, ...prev])

      toast({
        title: "Chat creata",
        description: "La chat è stata salvata nel database",
      })

      return newChat.id
    } catch (error) {
      console.error("Errore nella creazione della chat:", error)
      toast({
        title: "Errore",
        description: "Impossibile creare la chat",
        variant: "destructive",
      })
      return null
    }
  }

  const addMessageToChat = async (
    chatId: string,
    messageData: {
      content: string
      type: "user" | "assistant" | "transcription"
      model?: string
      audioFile?: File
    },
  ) => {
    try {
      const formData = new FormData()
      formData.append("content", messageData.content)
      formData.append("type", messageData.type)
      if (messageData.model) {
        formData.append("modelName", messageData.model)
      }
      if (messageData.audioFile) {
        formData.append("audio", messageData.audioFile)
      }

      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Errore nell'aggiunta del messaggio")
      }

      const newMessage = await response.json()

      // Aggiorna lo stato locale
      setTranscriptionChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    id: newMessage.id,
                    type: newMessage.type,
                    content: newMessage.content,
                    timestamp: new Date(newMessage.createdAt),
                    model: newMessage.modelName,
                    audioFile: newMessage.audioPath
                      ? {
                          name: newMessage.audioName,
                          size: newMessage.audioSize,
                        }
                      : undefined,
                  },
                ],
                timestamp: new Date(), // Aggiorna il timestamp della chat
              }
            : chat,
        ),
      )

      toast({
        title: "Messaggio aggiunto",
        description: "Il messaggio è stato aggiunto alla chat",
      })

      return newMessage
    } catch (error) {
      console.error("Errore nell'aggiunta del messaggio:", error)
      toast({
        title: "Errore",
        description: "Impossibile aggiungere il messaggio",
        variant: "destructive",
      })
    }
  }

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Errore nell'eliminazione")
      }

      setTranscriptionChats((prev) => prev.filter((chat) => chat.id !== chatId))
      toast({
        title: "Chat eliminata",
        description: "La chat è stata rimossa dal database",
      })
    } catch (error) {
      console.error("Errore nell'eliminazione:", error)
      toast({
        title: "Errore",
        description: "Impossibile eliminare la chat",
        variant: "destructive",
      })
    }
  }

  const clearAllChats = async () => {
    try {
      const response = await fetch("/api/chats", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Errore nella pulizia")
      }

      setTranscriptionChats([])
      toast({
        title: "Cronologia pulita",
        description: "Tutte le chat sono state eliminate dal database",
      })
    } catch (error) {
      console.error("Errore nella pulizia:", error)
      toast({
        title: "Errore",
        description: "Impossibile pulire la cronologia",
        variant: "destructive",
      })
    }
  }

  return {
    transcriptionChats,
    addChat,
    addMessageToChat, // New function exported
    deleteChat,
    clearAllChats,
    loading,
  }
}
