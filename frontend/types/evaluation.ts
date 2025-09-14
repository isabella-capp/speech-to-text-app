export interface ModelEvaluationResult {
  model: string             
  transcription: string
  wer: number
  substitutions: number
  insertions: number
  deletions: number
  processingTime: number
}

export interface EvaluationResult {
  models: ModelEvaluationResult[]  // array di risultati, estensibile
  comparison: {
    winner: string
    winnerScore: number
    improvement: number
  }
  correctTranscription: string
  audioFileName: string
  evaluatedAt: string
}

export interface EvaluationRequest {
  audioFile: File
  correctTranscription: string
}

export interface SavedEvaluation {
  id: string
  userId: string
  audioFileName: string
  correctTranscription: string
  models: SavedModelResult[]     // relazione 1-N
  winner: string
  winnerScore: number
  improvement: number
  createdAt: string
  updatedAt: string
}

// Tipo basato sul database reale  
export interface TranscriptionMetrics {
  id: string
  messageId: string
  groundTruthText: string
  wordErrorRate: number | null
  characterErrorRate: number | null
  literalSimilarity: number | null
  accuracy: number | null
  processingTimeMs: number | null
  audioLengthMs: number | null
  evaluationModel: string | null
  evaluatedAt: string
  message: {
    content: string
    audioName: string | null
    modelName: string | null
  }
}

export interface SavedModelResult {
  id: string
  evaluationId: string
  model: string                  // "whisper", "wav2vec2"
  transcription: string
  wer: number
  substitutions: number
  insertions: number
  deletions: number
  processingTime: number
}
