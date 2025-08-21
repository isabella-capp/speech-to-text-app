"use client";

import { useState, useEffect, useCallback } from "react";
import type { TranscriptionChat, Message } from "./types";
import { useToast } from "@/hooks/use-toast";
import * as guest from "./guest";
import * as api from "./api";

export function useTranscriptionChats(isGuest: boolean) {
  const { toast } = useToast();
  const [transcriptionChats, setChats] = useState<TranscriptionChat[]>([]);
  const [loading, setLoading] = useState(true);

  const showToast = (
    title: string,
    description: string,
    variant?: "destructive"
  ) => toast({ title, description, variant });

  useEffect(() => {
    const fetchChats = async () => {
      if (isGuest) {
        setChats(guest.loadGuestChats());
      } else {
        const chats = await api.fetchChats(showToast);
        setChats(chats);
      }
      setLoading(false);
    };
    fetchChats();
  }, [isGuest]);

  // Memoizza getChat per evitare richieste multiple
  const getChat = useCallback(
    async (chatId: string) => {
      if (isGuest) {
        // Per gli ospiti, aspetta che il loading sia completato
        if (loading) {
          return null;
        }
        return guest.getChat(chatId, transcriptionChats) ?? null;
      } else {
        return api.getChat(chatId);
      }
    },
    [isGuest, transcriptionChats, loading]
  );

  return {
    transcriptionChats,
    loading,
    setChats,
    getChat,
    addChat: isGuest
      ? (chat: TranscriptionChat) =>
          guest.addChat(chat, transcriptionChats, setChats, showToast)
      : (chat: TranscriptionChat) => api.addChat(chat, setChats, showToast),
    addMessageToChat: isGuest
      ? (chatId: string, msg: Message) =>
          guest.addMessage(chatId, msg, transcriptionChats, setChats, showToast)
      : (chatId: string, file: File, model: "whisper" | "wav2vec2") =>
          api.addMessage(chatId, file, model, setChats, showToast),
    deleteChat: isGuest
      ? (chatId: string) =>
          guest.deleteChat(chatId, transcriptionChats, setChats, showToast)
      : (chatId: string) => api.deleteChat(chatId, setChats, showToast),
    clearAllChats: isGuest
      ? () => guest.clearAllChats(setChats, showToast)
      : () => api.clearAllChats(setChats, showToast),
  };
}
