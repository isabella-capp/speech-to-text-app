"use client"

import React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAllChats } from "@/hooks/use-all-chats"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { GuestBanner } from "@/components/layout/headers/guest-banner"
import TranscribeHeader from "./headers/transcribe-header"
import { useAllChatMutation } from "@/hooks/use-all-chats-mutation"

interface TranscribeLayoutProps {
  children: React.ReactNode
  guestMode?: boolean
}

export default function TranscribeLayoutContent({ children, guestMode = false }: TranscribeLayoutProps) {
  const router = useRouter()
  
  const [isTranscribing, setIsTranscribing] = useState(false)
  const { data: chats = [], isLoading, isError, error } = useAllChats(guestMode)
  const { deleteChat, clearAllChats } = useAllChatMutation(guestMode)

  const handleNewChat = () => {
    router.push("/transcribe")
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {!guestMode && (
          <AppSidebar
            sessions={chats}
            onDeleteSession={(id) => deleteChat.mutate(id)}
            onClearAllSessions={() => clearAllChats.mutate()}
            onNewSession={handleNewChat}
          />
        )}

        <div className="flex-1 flex flex-col h-screen">
          {/* Guest Banner */}
          <GuestBanner isGuest={guestMode} />
          <TranscribeHeader
            guestMode={guestMode}
            onNewChat={handleNewChat}
            isTranscribing={isTranscribing}
          />

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p>Caricamento chat...</p>
                </div>
              </div>
            ) : isError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p>Errore nel caricamento: {error?.message || "Errore sconosciuto"}</p>
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
