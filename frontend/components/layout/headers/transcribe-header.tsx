"use client"

import { Button } from "@/components/ui/button"
import { LogIn, Plus } from "lucide-react"
import { ModelSelector } from "./model-selector"
import { useModel } from "@/contexts/model-context"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"

interface Props {
  guestMode: boolean
  isTranscribing?: boolean
  onNewChat: () => void
}

export default function TranscribeHeader({ guestMode, isTranscribing, onNewChat }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const { selectedModel, setSelectedModel } = useModel()
  const [showModelSelector, setShowModelSelector] = useState(false)
  
  const isInChat = pathname.includes("/chat/")

  return (
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
              className={`w-2 h-2 rounded-full ${isTranscribing ? "bg-yellow-500 animate-pulse" : "bg-green-500"
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
              onClick={onNewChat}
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
  )
}
