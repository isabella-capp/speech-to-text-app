"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, Mic } from "lucide-react"
import type { TranscriptionSession } from "@/types/transcription"
import { TranscriptionMessage } from "./transcription-message"

interface ChatViewProps {
  session: TranscriptionSession
  onFileSelect: (file: File) => void
  onStartRecording: () => void
}

export function ChatView({ session, onFileSelect, onStartRecording }: ChatViewProps) {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("audio/")) {
      onFileSelect(file)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {session.messages.map((message) => (
            <TranscriptionMessage key={message.id} message={message} sessionTitle={session.title} />
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative">
              <Input placeholder="Carica un nuovo file audio o registra..." className="pr-20 py-3 text-base" readOnly />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  onClick={() => document.getElementById("chat-file-input")?.click()}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <Button onClick={onStartRecording} variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <input id="chat-file-input" type="file" accept="audio/*" onChange={handleFileInput} className="hidden" />
        </div>
      </div>
    </div>
  )
}
