// hooks/use-transcription/index.ts
import { useState } from "react"
import { transcribeAudio } from "./api"
import { useToast } from "../use-toast"

export function useTranscription() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

   const showToast = (title: string, description: string, variant?: "destructive") =>
      toast({ title, description, variant })
   
  const transcribe = async (file: File, model: "whisper" | "wav2vec2") => {
    setLoading(true)
    const res = await transcribeAudio(file, model, showToast)
    if (res?.text) {
      setResult(res.text)
    }
    setLoading(false)
    return res
  }

  return { loading, result, transcribe }
}
