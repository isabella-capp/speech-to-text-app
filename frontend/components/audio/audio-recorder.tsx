"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, Square, Play, Pause } from "lucide-react"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"

interface AudioRecorderProps {
  onRecordingComplete: (file: File) => void
}

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const { isRecording, isPaused, recordingTime, formatTime, startRecording, togglePauseRecording, stopRecording } =
    useAudioRecorder()

  const handleStopRecording = async () => {
    const file = await stopRecording()
    if (file) {
      onRecordingComplete(file)
    }
  }

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!isRecording ? (
            <Button onClick={startRecording} className="gap-2">
              <Mic className="w-4 h-4" />
              Registra Audio
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={togglePauseRecording} variant="outline" className="gap-2 bg-transparent">
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? "Riprendi" : "Pausa"}
              </Button>
              <Button onClick={handleStopRecording} variant="destructive" className="gap-2">
                <Square className="w-4 h-4" />
                Stop
              </Button>
            </div>
          )}
        </div>

        {isRecording && (
          <div className="flex items-center gap-3">
            <Badge variant={isPaused ? "secondary" : "destructive"}>{isPaused ? "In Pausa" : "Registrando"}</Badge>
            <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      {isRecording && (
        <div className="mt-4 flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Registrazione in corso...</span>
        </div>
      )}
    </div>
  )
}
