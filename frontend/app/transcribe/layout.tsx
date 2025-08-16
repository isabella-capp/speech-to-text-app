"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { SidebarProvider } from "@/components/ui/sidebar"
import { LogIn, Plus } from "lucide-react"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useTranscriptionChats } from "@/hooks/use-transcription-chats"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { ModelSelector } from "@/components/layout/model-selector"
import { GuestBanner } from "@/components/guest-banner"
import { ModelProvider, useModel } from "@/contexts/model-context"
import type { ModelType } from "@/types/transcription"

interface TranscribeLayoutProps {
  children: React.ReactNode
  guestMode?: boolean
}

function TranscribeLayoutContent({ children, guestMode = false }: TranscribeLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const { selectedModel, setSelectedModel } = useModel()
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const { transcriptionChats: chats, deleteChat, clearAllChats } = useTranscriptionChats(guestMode)
  
  const handleNewChat = () => {
    router.push("/transcribe")
  }

  const isInChat = pathname.includes("/chat/")

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {!guestMode && (
          <AppSidebar
            sessions={chats}
            onDeleteSession={deleteChat}
            onClearAllSessions={clearAllChats}
            onNewSession={handleNewChat}
          />
        )}

        <div className="flex-1 flex flex-col h-screen">
          {/* Guest Banner */}
          <GuestBanner isGuest={guestMode} />
          
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
                {guestMode && (
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
                {isInChat && (
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
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default function TranscribeLayout({ children, guestMode = false }: TranscribeLayoutProps) {
  return (
    <ModelProvider>
      <TranscribeLayoutContent guestMode={guestMode}>
        {children}
      </TranscribeLayoutContent>
    </ModelProvider>
  )
}
