"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SidebarProvider } from "@/components/ui/sidebar"
import { LogIn, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranscriptionChats } from "@/hooks/use-transcription-chats"
import { useTranscription } from "@/hooks/use-transcription"
import { useTranscriptions } from "@/hooks/use-transcriptions"
import { getModelName, getDefaultModel } from "@/lib/models"
import type { TranscriptionChat, TranscriptionMessage, ModelType } from "@/types/transcription"
import { AppSidebar } from "./sidebar/app-sidebar"
import { ModelSelector } from "./layout/model-selector"
import { WelcomeScreen } from "./welcome/welcome-screen"
import { ChatView } from "./chat/chat-view"
import { GuestBanner } from "./guest-banner"
import { useRouter } from "next/navigation"

export function SpeechToTextApp({ guestMode = false }: { guestMode?: boolean }) {
  const router = useRouter()
  const [isGuest] = useState(guestMode)
  const [selectedModel, setSelectedModel] = useState<ModelType>(getDefaultModel())
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [currentTranscription, setCurrentTranscription] = useState<TranscriptionChat | null>(null)

  const { toast } = useToast()

  // Hook per gestire le chat di trascrizione
  const { transcriptionChats: chats, addChat, addMessageToChat, deleteChat, clearAllChats } = useTranscriptionChats()

  // Usa il nuovo hook per le trascrizioni
  const { isTranscribing, transcribeFile } = useTranscription({
    onError: (error: Error) => {
      toast({
        title: "Errore nella trascrizione",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // Hook per salvare le trascrizioni semplificate
  const { saveTranscription } = useTranscriptions({
    onError: (error: Error) => {
      console.error("Errore nel salvataggio trascrizione:", error)
    },
  })

  const transcribeAudio = async (audioFile: File) => {
    try {
      const modelName = getModelName(selectedModel)

      if (currentTranscription && currentTranscription.messages.length > 0) {
        // Adding to existing chat
        toast({
          title: "Aggiungendo alla chat esistente...",
          description: `Utilizzando ${modelName}`,
        })

        // Add user message for new audio file
        const userMessage = {
          content: `Ho caricato un nuovo file audio: ${audioFile.name}`,
          type: "user" as const,
          model: modelName,
          audioFile: audioFile,
        }

        await addMessageToChat(currentTranscription.id, userMessage)

        // Transcribe the audio
        const transcriptionText = await transcribeFile(audioFile, selectedModel)

        // Add assistant message with transcription
        const assistantMessage = {
          content: transcriptionText,
          type: "assistant" as const,
          model: modelName,
        }

        await addMessageToChat(currentTranscription.id, assistantMessage)

        // Salva la trascrizione anche nel modello Transcription semplificato
        if (!isGuest) {
          await saveTranscription(transcriptionText)
        }

        toast({
          title: "Messaggio aggiunto alla chat",
          description: `Utilizzato modello ${modelName}`,
        })
      } else {
        // Creating new chat
        const chatId = Date.now().toString()
        const userMessage: TranscriptionMessage = {
          id: `${chatId}-user`,
          type: "user",
          content: `Ho caricato il file audio: ${audioFile.name}`,
          audioFile: {
            name: audioFile.name,
            size: audioFile.size,
          },
          timestamp: new Date(),
        }

        const newChat: TranscriptionChat = {
          id: chatId,
          title: audioFile.name.replace(/\.[^/.]+$/, "") || "Nuova Trascrizione",
          timestamp: new Date(),
          messages: [userMessage],
        }

        // Passa subito alla chat view
        setCurrentTranscription(newChat)

        toast({
          title: "Avviando trascrizione...",
          description: `Utilizzando ${modelName}`,
        })

        // Trascrizione con il modello selezionato
        const transcriptionText = await transcribeFile(audioFile, selectedModel)

        // Aggiunge il messaggio dell'assistente alla chat esistente
        const assistantMessage: TranscriptionMessage = {
          id: `${chatId}-assistant`,
          type: "assistant",
          content: transcriptionText,
          timestamp: new Date(),
        }

        const updatedChat: TranscriptionChat = {
          ...newChat,
          messages: [...newChat.messages, assistantMessage],
        }

        setCurrentTranscription(updatedChat)

        if (!isGuest) {
          const realChatId = await addChat(updatedChat)
          if (realChatId) {
            // Aggiorna la chat corrente con l'ID reale dal database
            const finalChat: TranscriptionChat = {
              ...updatedChat,
              id: realChatId,
            }
            setCurrentTranscription(finalChat)
          }
          
          // Salva la trascrizione anche nel modello Transcription semplificato
          await saveTranscription(transcriptionText)
        }

        toast({
          title: "Trascrizione completata",
          description: `Utilizzato modello ${modelName}${isGuest ? " (modalità ospite)" : ""}`,
        })
      }
    } catch (error) {
      toast({
        title: "Errore nella trascrizione",
        description: error instanceof Error ? error.message : "Errore sconosciuto",
        variant: "destructive",
      })
    }
  }

  const handleNewChat = () => {
    setCurrentTranscription(null)
  }

  const handleFileSelect = (file: File) => {
    transcribeAudio(file)
  }

  const handleStartRecording = () => {
    // Implementazione per iniziare la registrazione dalla chat view
    console.log("Start recording from chat view")
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {!isGuest && (
          <AppSidebar
            sessions={chats}
            onDeleteSession={deleteChat}
            onClearAllSessions={clearAllChats}
            onNewSession={handleNewChat}
          />
        )}

        <div className="flex-1 flex flex-col h-screen">
          {/* Guest Banner */}
          <GuestBanner isGuest={isGuest} />
          {/* Header */}
          <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  showSelector={showModelSelector}
                  onShowSelectorChange={setShowModelSelector}
                />
                {/* Indicatore stato API */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isTranscribing ? "bg-yellow-500 animate-pulse" : "bg-green-500"
                    }`}
                  />
                  <span>{isTranscribing ? "Trascrivendo..." : "Pronto"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isGuest && (
                  <Button
                    onClick={() => router.push("/auth/login")}
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent py-4 rounded-full"
                  >
                    <LogIn className="w-4 h-4" />
                    Accedi
                  </Button>
                )}
                {currentTranscription && (
                  <Button
                    onClick={handleNewChat}
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent rounded-full"
                  >
                    <Plus className="w-4 h-4" />
                    Nuova
                  </Button>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {!currentTranscription ? (
              <WelcomeScreen onTranscribe={transcribeAudio} />
            ) : (
              <ChatView
                session={currentTranscription}
                onFileSelect={handleFileSelect}
                onStartRecording={handleStartRecording}
                onTranscribe={transcribeAudio}
                isTranscribing={isTranscribing}
              />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
