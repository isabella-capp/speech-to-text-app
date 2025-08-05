"use client"

import { useState, useEffect } from "react"
import type { TranscriptionSession } from "@/types/transcription"
import { useToast } from "@/hooks/use-toast"

export function useTranscriptionSessions() {
  const [sessions, setSessions] = useState<TranscriptionSession[]>([])
  const { toast } = useToast()

  // Carica sessioni dal localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem("transcription-sessions")
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions)
      setSessions(
        parsed.map((session: any) => ({
          ...session,
          timestamp: new Date(session.timestamp),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        })),
      )
    }
  }, [])

  // Salva sessioni nel localStorage
  useEffect(() => {
    localStorage.setItem("transcription-sessions", JSON.stringify(sessions))
  }, [sessions])

  const addSession = (session: TranscriptionSession) => {
    setSessions((prev) => [session, ...prev])
  }

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId))
    toast({
      title: "Sessione eliminata",
      description: "La sessione è stata rimossa dalla cronologia",
    })
  }

  const clearAllSessions = () => {
    setSessions([])
    toast({
      title: "Cronologia pulita",
      description: "Tutte le sessioni sono state eliminate",
    })
  }

  return {
    sessions,
    addSession,
    deleteSession,
    clearAllSessions,
  }
}
