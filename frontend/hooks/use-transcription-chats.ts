"use client"

import { useState, useEffect, useRef } from "react"
import type { TranscriptionChat } from "@/types/transcription"
import { useToast } from "@/hooks/use-toast"

const GUEST_STORAGE_KEY = "guest_transcription_chats"
const GUEST_STORAGE_DURATION = 10 * 60 * 1000 // 10 minuti in millisecondi

interface GuestStorageData {
  chats: TranscriptionChat[]
  timestamp: number
}

export function useTranscriptionChats(isGuest: boolean) {
  const [transcriptionChats, setTranscriptionChats] = useState<TranscriptionChat[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const hasLoaded = useRef(false)

  console.log("useTranscriptionChats - modalità guest:", isGuest)

  // Funzioni per gestire il localStorage degli utenti guest
  const getGuestChatsFromStorage = (): TranscriptionChat[] => {
    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY)
      if (!stored) return []

      const data: GuestStorageData = JSON.parse(stored)
      const now = Date.now()

      // Verifica se i dati sono scaduti (più di 10 minuti)
      if (now - data.timestamp > GUEST_STORAGE_DURATION) {
        localStorage.removeItem(GUEST_STORAGE_KEY)
        return []
      }

      // Converte le date da stringa a oggetto Date
      return data.chats.map(chat => ({
        ...chat,
        timestamp: new Date(chat.timestamp),
        messages: chat.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }))
    } catch (error) {
      console.error("Errore nel caricamento delle chat guest:", error)
      return []
    }
  }

  const saveGuestChatsToStorage = (chats: TranscriptionChat[]) => {
    try {
      const data: GuestStorageData = {
        chats,
        timestamp: Date.now()
      }
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error("Errore nel salvataggio delle chat guest:", error)
    }
  }
  
  useEffect(() => {
    if (hasLoaded.current) return // Previeni chiamate multiple
    
    if (isGuest) {
      // Per gli utenti guest, carica dal localStorage
      const guestChats = getGuestChatsFromStorage()
      setTranscriptionChats(guestChats)
      setLoading(false)
      hasLoaded.current = true
      return
    }
    
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
  }, [isGuest]) // Aggiungiamo isGuest come dipendenza

  const addChat = async (chatData: TranscriptionChat) => {
    if (isGuest) {
      // Per gli utenti guest, salva solo nel localStorage
      const newChat: TranscriptionChat = {
        ...chatData,
        id: `guest_${Date.now()}`, // ID temporaneo per gli utenti guest
        timestamp: new Date(),
      }

      const updatedChats = [newChat, ...transcriptionChats]
      setTranscriptionChats(updatedChats)
      saveGuestChatsToStorage(updatedChats)

      toast({
        title: "Chat creata",
        description: "La chat è stata salvata localmente (10 min)",
      })

      return newChat.id
    }

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
    if (isGuest) {
      // Per gli utenti guest, aggiungi il messaggio localmente
      const newMessage = {
        id: `guest_msg_${Date.now()}`,
        type: messageData.type,
        content: messageData.content,
        timestamp: new Date(),
        model: messageData.model,
        audioFile: messageData.audioFile ? {
          name: messageData.audioFile.name,
          size: messageData.audioFile.size,
        } : undefined,
      }

      const updatedChats = transcriptionChats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              timestamp: new Date(),
            }
          : chat,
      )

      setTranscriptionChats(updatedChats)
      saveGuestChatsToStorage(updatedChats)

      toast({
        title: "Messaggio aggiunto",
        description: "Il messaggio è stato salvato localmente",
      })

      return newMessage
    }

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
    if (isGuest) {
      // Per gli utenti guest, rimuovi dal localStorage
      const updatedChats = transcriptionChats.filter((chat) => chat.id !== chatId)
      setTranscriptionChats(updatedChats)
      saveGuestChatsToStorage(updatedChats)
      
      toast({
        title: "Chat eliminata",
        description: "La chat è stata rimossa dal localStorage",
      })
      return
    }

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
    if (isGuest) {
      // Per gli utenti guest, pulisci il localStorage
      setTranscriptionChats([])
      localStorage.removeItem(GUEST_STORAGE_KEY)
      
      toast({
        title: "Cronologia pulita",
        description: "Tutte le chat guest sono state eliminate",
      })
      return
    }

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
