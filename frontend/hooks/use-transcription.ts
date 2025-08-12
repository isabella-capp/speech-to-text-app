import { useState, useCallback } from 'react'
import type { ModelType } from '@/types/transcription'

interface UseTranscriptionOptions {
  onError?: (error: Error) => void
}

interface TranscriptionResponse {
  text: string
}

export function useTranscription(options: UseTranscriptionOptions = {}) {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const { onError } = options

  const transcribeFile = useCallback(async (audioFile: File, model: ModelType): Promise<string> => {
    setIsTranscribing(true)

    try {
      // Determina l'endpoint in base al modello
      const endpoint = model === 'whisper' ? '/whisper/transcribe' : '/wav2vec2/transcribe'
      const apiUrl = `http://127.0.0.1:8000${endpoint}`

      console.log(`Transcribing with ${model} model at:`, apiUrl)

      // Prepara i dati per il form
      const formData = new FormData()
      formData.append('file', audioFile)

      // Chiama l'API
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        headers: {
          // Non impostare Content-Type, lascia che il browser lo faccia automaticamente per FormData
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result: TranscriptionResponse = await response.json()
      console.log('Full API Response:', result)
      
      if (!result.text) {
        console.error('Missing text in response:', result)
        throw new Error('Nessun testo ricevuto dalla trascrizione')
      }

      console.log('Transcription completed:', result.text)
      return result.text

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
      console.error('Transcription error:', errorMessage)
      onError?.(new Error(errorMessage))
      throw error
    } finally {
      setIsTranscribing(false)
    }
  }, [onError])

  return {
    isTranscribing,
    transcribeFile
  }
}
