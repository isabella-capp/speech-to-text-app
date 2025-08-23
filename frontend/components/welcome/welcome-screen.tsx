"use client"

import { useState } from "react"
import { AudioWaveformIcon as Waveform } from "lucide-react"
import { AudioUploader } from "../audio/audio-upload"
import { AudioRecorder } from "../audio/audio-recorder"
import { useModel } from "@/lib/providers/model-provider"
import { useSession } from "next-auth/react"
import { useStartTranscription } from "@/hooks/use-start-transcription"

export default function WelcomeScreen() {
  const { selectedModel } = useModel()
  const { data: session } = useSession()
  const isGuest = !session
  
  const { startTranscription } = useStartTranscription(isGuest)

  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleRecordingComplete = (file: File) => {
    setAudioFile(file)
  }

  const onTranscribe = (file: File) => {
    startTranscription.mutate({ file, selectedModel })
  }

  return (
    <div className="min-h-0 flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto">
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
        onTranscribe={(file) => onTranscribe(file)}
        dragActive={dragActive}
        onDragActiveChange={setDragActive}
        isTranscribing={startTranscription.isPending}
      />

      <AudioRecorder onRecordingComplete={handleRecordingComplete} />
    </div>
  )
}

