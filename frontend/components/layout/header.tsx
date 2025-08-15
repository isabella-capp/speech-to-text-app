"use client"

import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Plus } from "lucide-react"
import { TranscriptionChat } from "@/types/transcription"

interface HeaderProps {
  currentSession: TranscriptionChat | null
  onReset: () => void
}

export function Header({ currentSession, onReset }: HeaderProps) {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">{currentSession ? currentSession.title : "Nuova Trascrizione"}</h1>
        </div>
        {currentSession && (
          <Button onClick={onReset} variant="outline" size="sm" className="gap-2 bg-transparent">
            <Plus className="w-4 h-4" />
            Nuova
          </Button>
        )}
      </div>
    </header>
  )
}
