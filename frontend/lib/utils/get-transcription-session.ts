import { Message } from "@/hooks/use-transcription-chat/types"
import { TranscriptionChat } from "@/types/transcription"

const GUEST_STORAGE_KEY = "guest-transcription-chat"
const GUEST_STORAGE_DURATION = 10 * 60 * 1000 // 10 minuti

export function createTranscriptionSession(chat: TranscriptionChat): TranscriptionChat {
  if (typeof window === "undefined") {
    throw new Error("Impossibile creare sessione sul server");
  }

  sessionStorage.setItem(`${GUEST_STORAGE_KEY}-${chat.id}`, JSON.stringify(chat));

  return chat;
}
export function addMessageToSession(sessionId: string, message: Message): void {
  if (typeof window === "undefined") return

  const chat = getTranscriptionSession(sessionId)
  if (chat) {
    const updatedChat: TranscriptionChat = {
      ...chat,
      messages: [...chat.messages, message],
    }
    sessionStorage.setItem(`${GUEST_STORAGE_KEY}-${sessionId}`, JSON.stringify(updatedChat))
  }
}

export function getTranscriptionSession(sessionId: string): TranscriptionChat | null {
  if (typeof window === "undefined") return null

  try {
    const raw = sessionStorage.getItem(`${GUEST_STORAGE_KEY}-${sessionId}`)
    if (!raw) return null

    const chat: TranscriptionChat & { createdAt?: number } = JSON.parse(raw)

    // opzionale: scadenza della sessione
    if (chat.createdAt && Date.now() - chat.createdAt > GUEST_STORAGE_DURATION) {
      clearTranscriptionSession(sessionId)
      return null
    }

    return chat
  } catch (err) {
    console.error("Errore parsing guest session:", err)
    return null
  }
}

export function clearTranscriptionSession(sessionId: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(`${GUEST_STORAGE_KEY}-${sessionId}`)
  }
}
