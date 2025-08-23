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

export interface Message {
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
  createdAt?: Date
  messages: Message[]
}

// Tipi per API
export interface ChatApiMessage {
  id: string
  type: "USER" | "ASSISTANT" | "TRANSCRIPTION"
  content: string
  modelName?: string
  audioPath?: string
  audioName?: string
  audioSize?: number
  createdAt: string
}

export interface ChatApiResponse {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: ChatApiMessage[]
}

// Tipi per guest
export interface GuestStorageData {
  chats: TranscriptionChat[]
  timestamp: number
}
