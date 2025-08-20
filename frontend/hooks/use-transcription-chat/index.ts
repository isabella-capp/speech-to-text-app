"use client";

import { useState, useEffect } from "react";
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

  return {
    transcriptionChats,
    loading,
    getChat: isGuest
      ? (chatId: string) => guest.getChat(chatId, transcriptionChats)
      : (chatId: string) => api.getChat(chatId, transcriptionChats),
    refreshChat: isGuest
      ? async (chatId: string) => {} // No-op per guest
      : async (chatId: string) => api.refreshChat(chatId, setChats, showToast),
    addChat: isGuest
      ? (chat: TranscriptionChat) =>
          guest.addChat(chat, transcriptionChats, setChats, showToast)
      : (chat: TranscriptionChat) => api.addChat(chat, setChats, showToast),
    addMessageToChat: isGuest
      ? (chatId: string, msg: Message) =>
          guest.addMessage(chatId, msg, transcriptionChats, setChats, showToast)
      : (chatId: string, msg: Message) =>
          api.addMessage(chatId, msg, setChats, showToast),
    deleteChat: isGuest
      ? (chatId: string) =>
          guest.deleteChat(chatId, transcriptionChats, setChats, showToast)
      : (chatId: string) => api.deleteChat(chatId, setChats, showToast),
    clearAllChats: isGuest
      ? () => guest.clearAllChats(setChats, showToast)
      : () => api.clearAllChats(setChats, showToast),
  };
}
