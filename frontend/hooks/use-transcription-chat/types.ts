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
