"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { ChatView } from "@/components/chat/chat-view"
import { useSession } from "next-auth/react"
import { useModel } from "@/contexts/model-context"
import { useTranscriptionData } from "@/hooks/use-transcription-data"
import { useChatMutation } from "@/hooks/use-chat-mutation"

export default function ChatPage() {
  const { selectedModel } = useModel()
  const { data: session } = useSession()
  const isGuest = !session

  const params = useParams()
  const chatId = params.id as string

  console.log("Chat ID:", chatId);
  // Usa useQuery per ottenere i dati della chat
  const { data: chat, isLoading, isError, error } = useTranscriptionData(chatId, isGuest)
  
  // Usa useMutation per gestire messaggi e trascrizioni
  const { requestMessage, transcribeMessage } = useChatMutation(chatId, isGuest, selectedModel)

  // Effetto automatico per trascrivere il primo messaggio, se presente
  useEffect(() => {
    if (chat?.messages.length === 1 && !transcribeMessage.isPending) {
      const firstMessage = chat.messages[0]
      if (firstMessage.audioPath) {
        transcribeMessage.mutate(firstMessage)
      }
    }
  }, [chat?.messages.length, chatId])

  // Gestione nuovo file audio - ora semplificata usando la mutation
  const handleTranscribe = (file: File) => {
    requestMessage.mutate(file)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Caricamento chat...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p>Errore nel caricamento della chat: {error?.message}</p>
        </div>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p>Chat non trovata</p>
        </div>
      </div>
    )
  }

  return (
    <ChatView
      session={chat}
      onFileSelect={handleTranscribe}
      onStartRecording={() => console.log("Start recording")}
      onTranscribe={handleTranscribe}
      isTranscribing={requestMessage.isPending || transcribeMessage.isPending}
    />
  )
}
