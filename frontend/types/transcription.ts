export interface TranscriptionChat {
  id: string
  title: string
  timestamp: Date
  messages: TranscriptionMessage[]
  model?: string
  audioFile?: {
    name: string
    size: number
    url?: string
  }
}

export interface TranscriptionMessage {
  id: string
  type: "user" | "assistant" | "transcription"
  content: string
  audioFile?: {
    name: string
    size: number
  }
  timestamp: Date
  model?: string
}

export type ModelType = "whisper" | "wav2vec2"

export interface ModelConfig {
  id: ModelType
  name: string
  description: string
  badge?: string
  gradientFrom: string
  gradientTo: string
  /** Tempo stimato di trascrizione in millisecondi per test */
  processingTime?: number
  /** Indica se il modello supporta trascrizioni in tempo reale */
  supportsRealTime?: boolean
}
