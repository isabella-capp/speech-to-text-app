import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import type { EvaluationRequest, EvaluationResult, ModelEvaluationResult } from "@/types/evaluation"

async function evaluateModelsApi(request: EvaluationRequest): Promise<EvaluationResult> {
  const formData = new FormData()
  formData.append("file", request.audioFile)
  formData.append("reference_text", request.correctTranscription)

  // Chiamate parallele ai due modelli
  const [whisperResponse, wav2vec2Response] = await Promise.all([
    fetch("/api/whisper/transcribe-with-metrics", { method: "POST", body: formData }),
    fetch("/api/wav2vec2/transcribe-with-metrics", { method: "POST", body: formData }),
  ])

  if (!whisperResponse.ok || !wav2vec2Response.ok) {
    const whisperError = !whisperResponse.ok ? await whisperResponse.text() : null
    const wav2vec2Error = !wav2vec2Response.ok ? await wav2vec2Response.text() : null
    throw new Error(
      `Errore durante la valutazione dei modelli: 
      ${whisperError ? `Whisper: ${whisperError}` : ''} 
      ${wav2vec2Error ? `Wav2Vec2: ${wav2vec2Error}` : ''}`
    )
  }

  const whisperData = await whisperResponse.json()
  const wav2vec2Data = await wav2vec2Response.json()

  console.log(whisperData)
  console.log(wav2vec2Data)
  // Estrai metriche
  const whisperMetrics = whisperData.metrics || {}
  const wav2vec2Metrics = wav2vec2Data.metrics || {}

  // Determina vincitore
  const whisperWer = whisperMetrics.wer
  const wav2vec2Wer = wav2vec2Metrics.wer
  const winner = whisperWer < wav2vec2Wer ? "Whisper" : "Wav2Vec2"
  const winnerScore = Math.min(whisperWer, wav2vec2Wer)
  const improvement = Math.abs(whisperWer - wav2vec2Wer) / Math.max(whisperWer, wav2vec2Wer)

  // Crea i risultati del modello
  const whisperResult: ModelEvaluationResult = {
    model: "whisper",
    transcription: whisperData.text,
    wer: whisperWer,
    substitutions: whisperMetrics.word_substitutions ?? 0,
    insertions: whisperMetrics.word_insertions ?? 0,
    deletions: whisperMetrics.word_deletions ?? 0,
    processingTime: whisperData.inference_time ?? 0,
  }

  const wav2vec2Result: ModelEvaluationResult = {
    model: "wav2vec2",
    transcription: wav2vec2Data.text,
    wer: wav2vec2Wer,
    substitutions: wav2vec2Metrics.word_substitutions ?? 0,
    insertions: wav2vec2Metrics.word_insertions ?? 0,
    deletions: wav2vec2Metrics.word_deletions ?? 0,
    processingTime: wav2vec2Data.inference_time ?? 0,
  }

  const result: EvaluationResult = {
    models: [whisperResult, wav2vec2Result],
    comparison: {
      winner,
      winnerScore,
      improvement,
    },
    correctTranscription: request.correctTranscription,
    audioFileName: request.audioFile.name,
    evaluatedAt: new Date().toISOString(),
  }

  // Salva nel DB
  await fetch("/api/evaluations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result),
  })

  return result
}

export function useMetricsMutation() {
  const mutation = useMutation({
    mutationFn: evaluateModelsApi,
    onSuccess: () => toast.success("Valutazione completata con successo!"),
    onError: (error: Error) => toast.error(error.message || "Errore durante la valutazione dei modelli"),
  })

  return {
    evaluateModels: mutation.mutate,
    isEvaluating: mutation.isPending,
    results: mutation.data,
    error: mutation.error?.message,
  }
}
