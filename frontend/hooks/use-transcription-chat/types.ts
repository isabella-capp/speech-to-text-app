export interface AudioFile {
  name: string
  size: number
  url?: string
}

export interface Message {
  id: string
  type: "user" | "assistant" | "transcription"
  content: string
  timestamp: Date
  model?: string
  audioFile?: AudioFile
}

export interface TranscriptionChat {
  id: string
  title: string
  timestamp: Date
  model?: string
  audioFile?: AudioFile
  messages: Message[]
}

// Tipi per API
export interface ChatApiMessage {
  id: string
  type: "user" | "assistant" | "transcription"
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

// Nuovo messaggio
export interface NewMessageData {
  content: string
  type: "user" | "assistant" | "transcription"
  model?: string
  audioFile?: File
}
