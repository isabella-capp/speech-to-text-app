"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SidebarProvider } from "@/components/ui/sidebar"
import { LogIn, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranscriptionSessions } from "@/hooks/use-transcription-sessions"
import { useTranscription } from "@/hooks/use-transcription"
import { getModelName, getDefaultModel } from "@/lib/models"
import type { TranscriptionSession, TranscriptionMessage, ModelType } from "@/types/transcription"
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
  const [currentSession, setCurrentSession] = useState<TranscriptionSession | null>(null)
  const { sessions, addSession, deleteSession, clearAllSessions } = useTranscriptionSessions()
  const { toast } = useToast()

  // Usa il nuovo hook per le trascrizioni
  const { isTranscribing, transcribeFile } = useTranscription({
    onError: (error: Error) => {
      toast({
        title: "Errore nella trascrizione",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  const transcribeAudio = async (audioFile: File) => {
    try {
      const modelName = getModelName(selectedModel)
      
      // Crea immediatamente la sessione e passa alla chat view
      const sessionId = Date.now().toString()
      const userMessage: TranscriptionMessage = {
        id: `${sessionId}-user`,
        type: "user",
        content: `Ho caricato il file audio: ${audioFile.name}`,
        audioFile: {
          name: audioFile.name,
          size: audioFile.size,
        },
        timestamp: new Date(),
      }

      const newSession: TranscriptionSession = {
        id: sessionId,
        title: audioFile.name.replace(/\.[^/.]+$/, "") || "Nuova Trascrizione",
        timestamp: new Date(),
        messages: [userMessage],
      }

      // Passa subito alla chat view
      setCurrentSession(newSession)

      toast({
        title: "Avviando trascrizione...",
        description: `Utilizzando ${modelName}`,
      })

      // Trascrizione con il modello selezionato
      const transcriptionText = await transcribeFile(audioFile, selectedModel)

      // Aggiunge il messaggio dell'assistente alla sessione esistente
      const assistantMessage: TranscriptionMessage = {
        id: `${sessionId}-assistant`,
        type: "assistant",
        content: transcriptionText,
        timestamp: new Date(),
      }

      const updatedSession: TranscriptionSession = {
        ...newSession,
        messages: [...newSession.messages, assistantMessage],
      }

      setCurrentSession(updatedSession)

      if (!isGuest) {
        addSession(updatedSession)
      }

      toast({
        title: "Trascrizione completata",
        description: `Utilizzato modello ${modelName}${isGuest ? " (modalità ospite)" : ""}`,
      })
    } catch (error) {
      toast({
        title: "Errore nella trascrizione",
        description: error instanceof Error ? error.message : "Errore sconosciuto",
        variant: "destructive",
      })
    }
  }

  const handleNewSession = () => {
    setCurrentSession(null)
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
        <AppSidebar
          sessions={sessions}
          onDeleteSession={deleteSession}
          onClearAllSessions={clearAllSessions}
          onNewSession={handleNewSession}
        />

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
                  <div className={`w-2 h-2 rounded-full ${
                    isTranscribing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                  }`} />
                  <span>
                    {isTranscribing ? 'Trascrivendo...' : 'Pronto'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isGuest && (
                  <Button onClick={() => router.push('/auth/login')} variant="outline" size="sm" className="gap-2 bg-transparent">
                    <LogIn className="w-4 h-4" />
                    Accedi
                  </Button>
                )}
                {currentSession && (
                  <Button onClick={handleNewSession} variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Plus className="w-4 h-4" />
                    Nuova
                  </Button>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {!currentSession ? (
              <WelcomeScreen onTranscribe={transcribeAudio} />
            ) : (
              <ChatView
                session={currentSession}
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
