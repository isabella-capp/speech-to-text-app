// hooks/use-transcription-chats/api.ts
import React from "react"
import type { TranscriptionChat, ChatApiResponse, NewMessageData } from "./types"

export const fetchChats = async (showToast: (title: string, description: string, variant?: "destructive") => void) => {
  try {
    const response = await fetch("/api/chats")

    if (!response.ok) {
        throw new Error("Errore caricamento chat")
    }    
    
    const data: ChatApiResponse[] = await response.json()

    return data.map(chat => ({
      id: chat.id,
      title: chat.title,
      timestamp: new Date(chat.updatedAt),
      audioFile: chat.messages[0]?.audioPath && chat.messages[0]?.audioName
        ? { 
            name: chat.messages[0].audioName, 
            size: chat.messages[0].audioSize || 0, 
            url: chat.messages[0].audioPath 
          }
        : undefined,
      model: chat.messages[0]?.modelName,
      messages: chat.messages.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: new Date(msg.createdAt),
        model: msg.modelName,
        audioFile: msg.audioPath && msg.audioName ? { 
          name: msg.audioName, 
          size: msg.audioSize || 0 
        } : undefined,
      })),
    }))
  } catch (e) {
    console.error(e)
    showToast("Errore", "Impossibile caricare le chat", "destructive")
    return []
  }
}


export const addChat = async (
  chatData: TranscriptionChat,
  setChats: React.Dispatch<React.SetStateAction<TranscriptionChat[]>>,
  showToast: (title: string, description: string, variant?: "destructive") => void
) => {
  try {
    const res = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: chatData.title }),
    })

    if (!res.ok) {
        throw new Error("Errore creazione chat")
    }
    const newChat = await res.json()
    const updated: TranscriptionChat = { ...chatData, id: newChat.id, timestamp: new Date(newChat.createdAt) }
    setChats((prev: TranscriptionChat[]) => [updated, ...prev])
    showToast("Chat creata", "La chat è stata salvata nel database")
    return newChat.id
  } catch (e) {
    console.error(e)
    showToast("Errore", "Impossibile creare la chat", "destructive")
    return null
  }
}

export const addMessage = async (
  chatId: string,
  messageData: NewMessageData,
  setChats: React.Dispatch<React.SetStateAction<TranscriptionChat[]>>,
  showToast: (title: string, description: string, variant?: "destructive") => void
) => {
  try {
    const formData = new FormData()
    Object.entries(messageData).forEach(([k, v]) => v && formData.append(k, v as any))

    const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST", 
        body: formData 
    })

    if (!res.ok) {
        throw new Error("Errore aggiunta messaggio")
    }
    
    const newMessage = await res.json()

    setChats((prev: TranscriptionChat[]) =>
        prev.map((chat: TranscriptionChat) =>
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
                    audioFile: newMessage.audioPath && newMessage.audioName
                      ? {
                          name: newMessage.audioName,
                          size: newMessage.audioSize || 0,
                        }
                      : undefined,
                  },
                ],
                timestamp: new Date(),  
              }
            : chat,
        ),
    )

    showToast("Messaggio aggiunto", "Il messaggio è stato aggiunto alla chat")
    return newMessage
  } catch (e) {
    console.error(e)
    showToast("Errore", "Impossibile aggiungere il messaggio", "destructive")
  }
}

export const deleteChat = async (
  chatId: string,
  setChats: React.Dispatch<React.SetStateAction<TranscriptionChat[]>>,
  showToast: (title: string, description: string, variant?: "destructive") => void
) => {
  try {
    const res = await fetch(`/api/chats/${chatId}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Errore eliminazione")
    setChats((prev: TranscriptionChat[]) => prev.filter((chat: TranscriptionChat) => chat.id !== chatId))
    showToast("Chat eliminata", "La chat è stata rimossa dal database")
  } catch (e) {
    console.error(e)
    showToast("Errore", "Impossibile eliminare la chat", "destructive")
  }
}

export const clearAllChats = async (
  setChats: React.Dispatch<React.SetStateAction<TranscriptionChat[]>>,
  showToast: (title: string, description: string) => void
) => {
  try {
    const res = await fetch("/api/chats", { method: "DELETE" })
    if (!res.ok) throw new Error("Errore pulizia chat")
    setChats([])
    window.location.href = "/transcribe"
    showToast("Cronologia pulita", "Tutte le chat sono state eliminate dal database")
  } catch (e) {
    console.error(e)
    showToast("Errore", "Impossibile pulire la cronologia")
  }
}
