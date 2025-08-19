"use client"

import React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranscriptionChats } from "@/hooks/use-transcription-chat"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { GuestBanner } from "@/components/layout/headers/guest-banner"
import TranscribeHeader from "./headers/transcribe-header"

interface TranscribeLayoutProps {
  children: React.ReactNode
  guestMode?: boolean
}

export default function TranscribeLayoutContent({ children, guestMode = false }: TranscribeLayoutProps) {
  const router = useRouter()
  
  const [isTranscribing, setIsTranscribing] = useState(false)
  const { transcriptionChats: chats, deleteChat, clearAllChats } = useTranscriptionChats(guestMode)
  
  const handleNewChat = () => {
    router.push("/transcribe")
  }

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
          <TranscribeHeader
            guestMode={guestMode}
            onNewChat={handleNewChat}
            isTranscribing={isTranscribing}
          />

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
