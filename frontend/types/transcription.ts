export interface TranscriptionSession {
  id: string
  title: string
  timestamp: Date
  messages: TranscriptionMessage[]
}

export interface TranscriptionMessage {
  id: string
  type: "user" | "assistant"
  content: string
  audioFile?: {
    name: string
    size: number
    duration?: number
  }
  timestamp: Date
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
