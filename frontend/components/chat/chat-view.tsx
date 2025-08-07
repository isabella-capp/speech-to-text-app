"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Upload, Mic, Send, Square, Play, Pause, RotateCcw, Check, Volume2, Loader2, X } from "lucide-react"
import type { TranscriptionSession } from "@/types/transcription"
import { TranscriptionMessage } from "./transcription-message"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { useToast } from "@/hooks/use-toast"

interface ChatViewProps {
  session: TranscriptionSession
  onFileSelect: (file: File) => void
  onStartRecording: () => void
  onTranscribe: (file: File) => void
  isTranscribing: boolean
}

export function ChatView({ session, onFileSelect, onStartRecording, onTranscribe, isTranscribing }: ChatViewProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showRecorder, setShowRecorder] = useState(false)
  const [recordedFile, setRecordedFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const { isRecording, isPaused, recordingTime, formatTime, startRecording, togglePauseRecording, stopRecording } =
    useAudioRecorder()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [session.messages])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("audio/")) {
      setSelectedFile(file)
      toast({
        title: "File selezionato",
        description: `${file.name} pronto per la trascrizione`,
      })
    } else {
      toast({
        title: "Formato non supportato",
        description: "Seleziona un file audio valido",
        variant: "destructive",
      })
    }
  }

  const handleStartRecording = async () => {
    setShowRecorder(true)
    await startRecording()
  }

  const handleStopRecording = async () => {
    const file = await stopRecording()
    if (file) {
      setRecordedFile(file)
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
    }
  }

  const handlePlayPause = () => {
    if (!audioUrl) return

    if (!audioElement) {
      const audio = new Audio(audioUrl)
      audio.onended = () => setIsPlaying(false)
      audio.onplay = () => setIsPlaying(true)
      audio.onpause = () => setIsPlaying(false)
      setAudioElement(audio)
      audio.play()
    } else {
      if (isPlaying) {
        audioElement.pause()
      } else {
        audioElement.play()
      }
    }
  }

  const handleConfirmRecording = () => {
    if (recordedFile) {
      onTranscribe(recordedFile)
      handleResetRecording()
    }
  }

  const handleResetRecording = () => {
    if (audioElement) {
      audioElement.pause()
      audioElement.src = ""
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setRecordedFile(null)
    setAudioUrl(null)
    setIsPlaying(false)
    setAudioElement(null)
    setShowRecorder(false)
  }

  const handleSendFile = () => {
    if (selectedFile) {
      onTranscribe(selectedFile)
      setSelectedFile(null)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {session.messages.map((message) => (
            <TranscriptionMessage key={message.id} message={message} sessionTitle={session.title} />
          ))}

          {/* Loading indicator when transcribing */}
          {isTranscribing && (
            <div className="flex justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="max-w-[80%] rounded-2xl p-4 bg-gray-100 text-gray-900 border border-gray-200 ml-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Trascrizione in corso...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Recording Interface */}
      {showRecorder && (
        <div className="mb-2 p-4">
          <div className="max-w-3xl mx-auto">
            {recordedFile && audioUrl ? (
              // Preview recorded audio
              <div className="bg-white rounded-3xl p-4 border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Volume2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{recordedFile.name}</div>
                      <div className="text-sm text-gray-500">{(recordedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      onClick={handlePlayPause} 
                      variant="outline" 
                      size="sm" 
                      className="cursor-pointer bg-transparent py-[18px] rounded-full hover:gap-2 gap-0 transition-all duration-300 overflow-hidden group border hover:bg-gradient-to-br hover:from-green-100 hover:to-blue-100 "
                    >
                      {isPlaying ? <Pause className="w-4 h-4 flex-shrink-0" /> : <Play className="w-4 h-4 flex-shrink-0" />}
                      <span className="max-w-0 group-hover:max-w-20 transition-all duration-300 overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100">
                        {isPlaying ? "Pausa" : "Riproduci"}
                      </span>
                    </Button>
                    <Button 
                      onClick={handleResetRecording} 
                      variant="outline" 
                      size="sm" 
                      className="py-[18px] bg-transparent rounded-full hover:bg-gradient-to-br hover:from-green-100 hover:to-blue-100 cursor-pointer hover:gap-2 gap-0 transition-all duration-300 overflow-hidden group"
                    >
                      <RotateCcw className="w-4 h-4 flex-shrink-0" />
                      <span className="max-w-0 group-hover:max-w-20 transition-all duration-300 overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100">
                        Reset
                      </span>
                    </Button>
                    <Button
                      onClick={handleConfirmRecording}
                      size="sm"
                      className="rounded-full py-[18px] bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center cursor-pointer hover:from-green-600 hover:to-blue-700"
                      disabled={isTranscribing}
                    >
                      {isTranscribing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Trascrizione...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Recording controls
              <div className="bg-white rounded-3xl p-4 border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Recording indicator */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording
                            ? isPaused
                              ? "bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse"
                              : "bg-gradient-to-br from-red-500 to-pink-600 animate-pulse"
                            : "bg-gradient-to-br from-blue-500 to-purple-600"
                          }`}
                      >
                        <Mic className="w-5 h-5 text-white" />
                      </div>

                      {isRecording && (
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${isPaused ? "bg-yellow-500" : "bg-red-500 animate-pulse"}`}
                          ></div>
                          <Badge variant={isPaused ? "secondary" : "destructive"} className="text-xs rounded-full">
                            {isPaused ? "In Pausa" : "Registrando"}
                          </Badge>
                          <span className="font-mono text-sm font-bold text-gray-800">{formatTime(recordingTime)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!isRecording ? (
                      <>
                        <Button
                          onClick={handleResetRecording}
                          variant="outline"
                          size="sm"
                          className="py-[18px] rounded-full bg-transparent hover:gap-2 gap-0 transition-all duration-300 overflow-hidden group cursor-pointer"
                        >
                          <X className="w-4 h-4 flex-shrink-0" />
                          <span className="max-w-0 group-hover:max-w-20 transition-all duration-300 overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100">
                            Annulla
                          </span>
                        </Button>
                        <Button 
                          onClick={startRecording} 
                          size="sm" 
                          className="py-[18px] rounded-full bg-blue-600 hover:bg-blue-700 hover:gap-2 gap-0 transition-all duration-300 overflow-hidden group cursor-pointer"
                        >
                          <Mic className="w-4 h-4 flex-shrink-0" />
                          <span className="max-w-0 group-hover:max-w-20 transition-all duration-300 overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100">
                            Inizia
                          </span>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={togglePauseRecording}
                          variant="outline"
                          size="sm"
                          className="py-[18px] rounded-full bg-transparent hover:gap-2 gap-0 transition-all duration-300 overflow-hidden group cursor-pointer"
                        >
                          {isPaused ? (
                            <>
                              <Play className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="max-w-0 group-hover:max-w-20 transition-all duration-300 overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 text-green-600">
                                Riprendi
                              </span>
                            </>
                          ) : (
                            <>
                              <Pause className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                              <span className="max-w-0 group-hover:max-w-20 transition-all duration-300 overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 text-yellow-600">
                                Pausa
                              </span>
                            </>
                          )}
                        </Button>
                        <Button 
                          onClick={handleStopRecording} 
                          size="sm" 
                          className="py-[18px] rounded-full bg-red-600 hover:bg-red-700 hover:gap-2 gap-0 transition-all duration-300 overflow-hidden group cursor-pointer"
                        >
                          <Square className="w-4 h-4 flex-shrink-0" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* File Preview */}
      {selectedFile && (
        <div className="mb-2 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl p-4 border border-yellow-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{selectedFile.name}</div>
                    <div className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleRemoveFile} 
                    variant="outline" 
                    size="sm" 
                    className="py-[18px] rounded-full bg-transparent hover:gap-2 gap-0 transition-all duration-300 overflow-hidden group bg-gradient-to-br hover:from-yellow-200 hover:to-orange-300 cursor-pointer"
                  >
                    <X className="w-4 h-4 flex-shrink-0" />
                    <span className="max-w-0 group-hover:max-w-20 transition-all duration-300 overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100">
                      Rimuovi
                    </span>
                  </Button>
                  <Button
                    onClick={handleSendFile}
                    size="sm"
                    className="gap-2 bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 rounded-full py-[18px] flex items-center justify-center cursor-pointer"
                    disabled={isTranscribing}
                  >
                    {isTranscribing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Trascrizione...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Trascrivi
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      {!showRecorder && !selectedFile && (
        <div className="bg-white p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Input
                  placeholder="Carica un file audio o inizia una registrazione..."
                  className="items-center px-5 py-7 text-base rounded-full bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  readOnly
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    onClick={handleStartRecording}
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0  hover:bg-[#f3f3f3] rounded-full cursor-pointer"
                    title="Registra audio"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => document.getElementById("chat-file-input")?.click()}
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 bg-blue-200 rounded-full hover:bg-blue-100 cursor-pointer"
                    title="Carica file audio"
                  >
                    <Upload className="w-4 h-4 text-blue-600" />
                  </Button>
                </div>
              </div>
            </div>
            <input id="chat-file-input" type="file" accept="audio/*" onChange={handleFileInput} className="hidden" />
          </div>
        </div>
      )}
    </div>
  )
}
