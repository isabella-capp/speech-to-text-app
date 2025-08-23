"use client"

import type React from "react"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileAudio, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface AudioUploaderProps {
  audioFile: File | null
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  onTranscribe: (file: File) => void
  dragActive: boolean
  onDragActiveChange: (active: boolean) => void
  isTranscribing: boolean
}

export function AudioUploader({ audioFile, onFileSelect, onFileRemove, onTranscribe, dragActive, onDragActiveChange, isTranscribing }: AudioUploaderProps) {

  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.type === "dragenter" || e.type === "dragover") {
        onDragActiveChange(true)
      } else if (e.type === "dragleave") {
        onDragActiveChange(false)
      }
    },
    [onDragActiveChange],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onDragActiveChange(false)

      const files = Array.from(e.dataTransfer.files)
      const audioFile = files.find((file) => file.type.startsWith("audio/"))

      if (audioFile) {
        onFileSelect(audioFile)
        toast.success(`File caricato: ${audioFile.name} pronto per la trascrizione`)
      } else {
        toast.error("Formato non supportato: Carica un file audio valido")
      }
    }, [onFileSelect, onDragActiveChange, toast],
  )

const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (file && file.type.startsWith("audio/")) {
    onFileSelect(file)
    toast.success(`File caricato: ${file.name} pronto per la trascrizione`)
  }
}

return (
  <div className="w-full max-w-xl">
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive
          ? "border-blue-500 bg-blue-50"
          : audioFile
            ? "border-green-500 bg-green-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {audioFile ? (
        <div className="space-y-4">
          <FileAudio className="w-12 h-12 mx-auto text-green-600" />
          <div>
            <p className="font-medium text-green-800">{audioFile.name}</p>
            <p className="text-sm text-green-600">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => audioFile && onTranscribe(audioFile)}
              className="py-5 rounded-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              disabled={!audioFile}
            >
              <FileAudio className="w-4 h-4" />
              {isTranscribing ? "Trascrivendo..." : "Trascrivi"}
            </Button>
            <Button onClick={onFileRemove} variant="outline" className="py-5 rounded-full bg-gradient-to-r from-red-400 to-red-600 hover:from-orange-600 hover:to-red-700">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Upload className="w-12 h-12 mx-auto text-gray-400" />
          <div>
            <p className="text-lg font-medium text-gray-700 mb-2">Trascina il file audio qui</p>
            <p className="text-gray-500 mb-4">Supporta MP3, WAV, M4A, FLAC e altri formati</p>
          </div>
          <Button onClick={() => document.getElementById("file-input")?.click()} variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Seleziona File
          </Button>
          <input id="file-input" type="file" accept="audio/*" onChange={handleFileInput} className="hidden" />
        </div>
      )}
    </div>
  </div>
)
}
