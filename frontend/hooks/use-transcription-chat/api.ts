// hooks/use-transcription-chats/api.ts
import React from "react"
import type { TranscriptionChat} from "./types"

const BASE_URL = "/api/chats";

// Cache in memoria per evitare richieste multiple
const chatCache = new Map<string, { data: TranscriptionChat | null; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 secondi

export async function fetchChats(showToast: Function): Promise<TranscriptionChat[]> {
  try {
    const res = await fetch(BASE_URL, {
      method: "GET",
      next: { tags: ["chats"] },
    });

    if (!res.ok) {
      throw new Error("Errore nel caricamento delle chat");
    }

    return res.json();

  } catch (error: any) {
    showToast("Errore", error.message, "destructive");
    return [];
  }
}

// Recupera una singola chat con cache in memoria
export async function getChat(chatId: string): Promise<TranscriptionChat | null> {
  // Controlla cache
  const cached = chatCache.get(chatId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const res = await fetch(`${BASE_URL}/${chatId}`, {
      method: "GET",
      next: { tags: [`chat-${chatId}`] },
    });
    
    const data = res.ok ? await res.json() : null;
    
    // Salva in cache
    chatCache.set(chatId, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error("Errore nel recupero chat:", error);
    return null;
  }
}

// Funzione per invalidare la cache quando necessario
export function invalidateChatCache(chatId?: string) {
  if (chatId) {
    chatCache.delete(chatId);
  } else {
    chatCache.clear();
  }
}

// Crea una nuova chat
export async function addChat(
  chat: TranscriptionChat,
  setChats: Function,
  showToast: Function
) {
  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify(chat),
    });
    
    if (!res.ok) throw new Error("Errore nella creazione della chat");

  } catch (error: any) {
    showToast("Errore", error.message, "destructive");
  }
}
// Aggiunge un messaggio a una chat
export async function addMessage(
  chatId: string,
  file: File,
  model: "whisper" | "wav2vec2",
  setChats: Function,
  showToast: Function
) {
  try {
    const formData = new FormData();
    formData.append("audio", file);
    formData.append("model", model);

    const res = await fetch(`${BASE_URL}/${chatId}/messages`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Errore nell'aggiunta del messaggio");

    // Invalida la cache per questa chat
    invalidateChatCache(chatId);

  } catch (error: any) {
    showToast("Errore", error.message, "destructive");
  }
}

// Elimina una chat
export async function deleteChat(chatId: string, setChats: Function, showToast: Function) {
  try {
    const res = await fetch(`${BASE_URL}/${chatId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Errore nell'eliminazione della chat");

  } catch (error: any) {
    showToast("Errore", error.message, "destructive");
  }
}

// Cancella tutte le chat
export async function clearAllChats(setChats: Function, showToast: Function) {
  try {
    const res = await fetch(BASE_URL, { method: "DELETE" });
    if (!res.ok) throw new Error("Errore nella cancellazione di tutte le chat");

  } catch (error: any) {
    showToast("Errore", error.message, "destructive");
  }
}