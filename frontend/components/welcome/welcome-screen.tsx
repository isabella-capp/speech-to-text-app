"use client"

import { useState } from "react"
import { AudioWaveformIcon as Waveform } from "lucide-react"
import { AudioUploader } from "../audio/audio-upload"
import { AudioRecorder } from "../audio/audio-recorder"

interface WelcomeScreenProps {
  onTranscribe: (file: File) => void
  isTranscribing: boolean
}

export function WelcomeScreen({ onTranscribe, isTranscribing }: WelcomeScreenProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleTranscribe = () => {
    if (audioFile) {
      onTranscribe(audioFile)
    }
  }

  const handleRecordingComplete = (file: File) => {
    setAudioFile(file)
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Waveform className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Come posso aiutarti oggi?</h2>
        <p className="text-gray-600">Carica un file audio o registra dal microfono per iniziare</p>
      </div>

      <AudioUploader
        audioFile={audioFile}
        onFileSelect={setAudioFile}
        onFileRemove={() => setAudioFile(null)}
        onTranscribe={handleTranscribe}
        isTranscribing={isTranscribing}
        dragActive={dragActive}
        onDragActiveChange={setDragActive}
      />

      <AudioRecorder onRecordingComplete={handleRecordingComplete} />
    </div>
  )
}
