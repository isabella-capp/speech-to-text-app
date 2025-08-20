// hooks/use-transcription-chats/guest.ts
import React from "react"
import type { TranscriptionChat, GuestStorageData, Message } from "./types"

const GUEST_STORAGE_KEY = "guest_transcription_chats"
const GUEST_STORAGE_DURATION = 10 * 60 * 1000

export const loadGuestChats = (): TranscriptionChat[] => {
  try {
    const stored = localStorage.getItem(GUEST_STORAGE_KEY)
    if (!stored) return []

    const data: GuestStorageData = JSON.parse(stored)
    if (Date.now() - data.timestamp > GUEST_STORAGE_DURATION) {
      localStorage.removeItem(GUEST_STORAGE_KEY)
      return []
    }

    return data.chats.map(chat => ({
      ...chat,
      timestamp: new Date(chat.timestamp),
      messages: chat.messages.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) })),
    }))
  } catch (error) {
    console.error("Errore nel caricamento delle chat guest:", error)
    return []
  }
}

export const getChat = (chatId: string, chats: TranscriptionChat[]): TranscriptionChat | undefined => {
  return chats.find(chat => chat.id === chatId);
}

export const saveGuestChats = (chats: TranscriptionChat[]) => {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify({ chats, timestamp: Date.now() }))
  } catch (e) {
    console.error("Errore salvataggio guest", e)
  }
}

export const addChat = (
  chatData: TranscriptionChat,
  chats: TranscriptionChat[],
  setChats: React.Dispatch<React.SetStateAction<TranscriptionChat[]>>,
  showToast: (title: string, description: string) => void
) => {
  const newChat: TranscriptionChat = { ...chatData }
  const updated = [newChat, ...chats]
  setChats(updated)
  saveGuestChats(updated)
  showToast("Chat creata", "La chat è stata salvata localmente (10 min)")
  return newChat.id
}

export const addMessage = (
  chatId: string,
  messageData: Message,
  chats: TranscriptionChat[],
  setChats: React.Dispatch<React.SetStateAction<TranscriptionChat[]>>,
  showToast: (title: string, description: string) => void
) => {
  const newMessage = { ...messageData }

  const updated = chats.map(chat =>
    chat.id === chatId
      ? { ...chat, messages: [...chat.messages, newMessage], timestamp: new Date() }
      : chat
  )
  setChats(updated)
  saveGuestChats(updated)
  showToast("Messaggio aggiunto", "Il messaggio è stato salvato localmente")
  return newMessage
}

export const deleteChat = (
  chatId: string,
  chats: TranscriptionChat[],
  setChats: React.Dispatch<React.SetStateAction<TranscriptionChat[]>>,
  showToast: (title: string, description: string) => void
) => {
  const updated = chats.filter(chat => chat.id !== chatId)
  setChats(updated)
  saveGuestChats(updated)
  showToast("Chat eliminata", "La chat è stata rimossa dal localStorage")
}

export const clearAllChats = (
  setChats: React.Dispatch<React.SetStateAction<TranscriptionChat[]>>,
  showToast: (title: string, description: string) => void
) => {
  setChats([])
  localStorage.removeItem(GUEST_STORAGE_KEY)
  showToast("Cronologia pulita", "Tutte le chat guest sono state eliminate")
}
