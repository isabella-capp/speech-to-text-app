import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import type { Evaluation, EvaluationRequest, ModelResult } from "@/types/evaluation"

async function evaluateModelsApi(request: EvaluationRequest): Promise<Evaluation> {
  const formData = new FormData()
  formData.append("file", request.audioFile)
  formData.append("reference_text", request.correctTranscription)
  console.log(request.audioFile)
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
  const whisperResult: ModelResult = {
    modelName: "whisper",
    accuracy: whisperData.metrics.accuracy,
    wordErrorRate: whisperData.metrics.wer,
    substitutions: whisperData.metrics.word_substitutions,
    insertions: whisperData.metrics.word_insertions,
    deletions: whisperData.metrics.word_deletions,
    characterErrorRate: whisperData.metrics.cer,
    literalSimilarity: whisperData.metrics.similarity_ratio,
    processingTimeMs: whisperData.processingTime,
    transcription: whisperData.text,
  }

  const wav2vec2Result: ModelResult = {
    modelName: "wav2vec2",
    accuracy: wav2vec2Data.metrics.accuracy,
    wordErrorRate: wav2vec2Data.metrics.wer,
    substitutions: wav2vec2Data.metrics.word_substitutions,
    insertions: wav2vec2Data.metrics.word_insertions,
    deletions: wav2vec2Data.metrics.word_deletions,
    characterErrorRate: wav2vec2Data.metrics.cer,
    literalSimilarity: wav2vec2Data.metrics.similarity_ratio,
    processingTimeMs: wav2vec2Data.processingTime,
    transcription: wav2vec2Data.text,
  }

  const result: Evaluation = {
    models: [whisperResult, wav2vec2Result],
    groundTruthText: request.correctTranscription,
    comparison: {
      winner,
      winnerScore,
      improvement,
    },
    audio: {
      audioName: request.audioFile.name,
      audioPath: URL.createObjectURL(request.audioFile), // Genera un URL temporaneo per il file
      audioDurationMs: request.audioFile.size, // Nota: size è in bytes, non ms
    },  
    createdAt: new Date().toISOString(),
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
