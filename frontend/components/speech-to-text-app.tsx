"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranscriptionSessions } from "@/hooks/use-transcription-sessions"
import { getModelName, getDefaultModel, getModelConfig } from "@/lib/models"
import type { TranscriptionSession, TranscriptionMessage, ModelType } from "@/types/transcription"
import { AppSidebar } from "./sidebar/app-sidebar"
import { ModelSelector } from "./layout/model-selector"
import { WelcomeScreen } from "./welcome/welcome-screen"
import { ChatView } from "./chat/chat-view"

export function SpeechToTextApp() {
  const [selectedModel, setSelectedModel] = useState<ModelType>(getDefaultModel())
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [currentSession, setCurrentSession] = useState<TranscriptionSession | null>(null)

  const { sessions, addSession, deleteSession, clearAllSessions } = useTranscriptionSessions()
  const { toast } = useToast()

  const transcribeAudio = async (audioFile: File) => {
    setIsTranscribing(true)

    try {
      // Simulazione della trascrizione con modello selezionato
      const modelConfig = getModelConfig(selectedModel)
      const processingTime = modelConfig?.processingTime || 3000
      await new Promise((resolve) => setTimeout(resolve, processingTime))

      const modelName = getModelName(selectedModel)
      const transcriptionText = `Trascrizione del file "${audioFile.name}" usando ${modelName}: Questa è una trascrizione di esempio generata dall'AI. ${selectedModel === "wav2vec2" ? "Utilizzando il modello Meta per una maggiore accuratezza e velocità." : "Utilizzando il modello OpenAI per trascrizioni multilingue affidabili."}`

      const sessionId = Date.now().toString()
      const userMessage: TranscriptionMessage = {
        id: `${sessionId}-user`,
        type: "user",
        content: `Ho caricato il file audio: ${audioFile.name}`,
        audioFile: {
          name: audioFile.name,
          size: audioFile.size,
          duration: 15,
        },
        timestamp: new Date(),
      }

      const assistantMessage: TranscriptionMessage = {
        id: `${sessionId}-assistant`,
        type: "assistant",
        content: transcriptionText,
        timestamp: new Date(),
      }

      const newSession: TranscriptionSession = {
        id: sessionId,
        title: audioFile.name.replace(/\.[^/.]+$/, "") || "Nuova Trascrizione",
        timestamp: new Date(),
        messages: [userMessage, assistantMessage],
      }

      setCurrentSession(newSession)
      addSession(newSession)

      toast({
        title: "Trascrizione completata",
        description: `Utilizzato modello ${modelName}`,
      })
    } catch (error) {
      toast({
        title: "Errore nella trascrizione",
        description: "Riprova più tardi",
        variant: "destructive",
      })
    } finally {
      setIsTranscribing(false)
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

                {currentSession && <span className="text-gray-400">•</span>}
                {currentSession && <span className="text-gray-600">{currentSession.title}</span>}
              </div>
              {currentSession && (
                <Button onClick={handleNewSession} variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Plus className="w-4 h-4" />
                  Nuova
                </Button>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {!currentSession ? (
              <WelcomeScreen onTranscribe={transcribeAudio} isTranscribing={isTranscribing} />
            ) : (
              <ChatView
                session={currentSession}
                onFileSelect={handleFileSelect}
                onStartRecording={handleStartRecording}
              />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
