export interface TranscriptionMessage {
  id: string
  type: "USER" | "ASSISTANT" | "TRANSCRIPTION"
  audioName?: string
  audioSize?: number
  audioPath?: string
  content: string
  timestamp: Date
  modelName?: string
}

export interface TranscriptionChat {
  id: string
  title: string
  timestamp: Date
  messages: TranscriptionMessage[]
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
