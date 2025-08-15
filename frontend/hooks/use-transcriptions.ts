"use client"

import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

interface Transcription {
  id: string
  transcript: string
  userId: string
  createdAt: string
  updatedAt: string
}

interface UseTranscriptionsOptions {
  onError?: (error: Error) => void
}

export function useTranscriptions(options: UseTranscriptionsOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { onError } = options

  // Salva una trascrizione (solo il testo)
  const saveTranscription = useCallback(async (transcript: string): Promise<Transcription | null> => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/transcriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const savedTranscription: Transcription = await response.json()
      
      toast({
        title: "Trascrizione salvata",
        description: "La trascrizione è stata salvata con successo",
      })

      return savedTranscription

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
      console.error('Save transcription error:', errorMessage)
      
      toast({
        title: "Errore nel salvataggio",
        description: errorMessage,
        variant: "destructive",
      })

      onError?.(new Error(errorMessage))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [toast, onError])

  // Recupera tutte le trascrizioni dell'utente
  const getTranscriptions = useCallback(async (): Promise<Transcription[]> => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/transcriptions')

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const transcriptions: Transcription[] = await response.json()
      return transcriptions

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
      console.error('Get transcriptions error:', errorMessage)
      
      toast({
        title: "Errore nel caricamento",
        description: errorMessage,
        variant: "destructive",
      })

      onError?.(new Error(errorMessage))
      return []
    } finally {
      setIsLoading(false)
    }
  }, [toast, onError])

  // Elimina tutte le trascrizioni
  const clearAllTranscriptions = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/transcriptions', {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      toast({
        title: "Trascrizioni eliminate",
        description: "Tutte le trascrizioni sono state eliminate",
      })

      return true

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
      console.error('Clear transcriptions error:', errorMessage)
      
      toast({
        title: "Errore nell'eliminazione",
        description: errorMessage,
        variant: "destructive",
      })

      onError?.(new Error(errorMessage))
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast, onError])

  return {
    isLoading,
    saveTranscription,
    getTranscriptions,
    clearAllTranscriptions
  }
}
