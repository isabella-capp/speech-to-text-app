export interface ModelEvaluationResult {
  transcription: string
  wer: number
  substitutions: number
  insertions: number
  deletions: number
  processingTime: number
}

export interface EvaluationResult {
  whisper: ModelEvaluationResult
  wav2vec2: ModelEvaluationResult
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
  whisperTranscription: string
  whisperWer: number
  whisperSubstitutions: number
  whisperInsertions: number
  whisperDeletions: number
  whisperProcessingTime: number
  wav2vec2Transcription: string
  wav2vec2Wer: number
  wav2vec2Substitutions: number
  wav2vec2Insertions: number
  wav2vec2Deletions: number
  wav2vec2ProcessingTime: number
  winner: string
  winnerScore: number
  improvement: number
  createdAt: string
  updatedAt: string
}

export interface EvaluationResultForDB {
  whisperResult: ModelEvaluationResult
  wav2vec2Result: ModelEvaluationResult
  winner: string
  winnerScore: number
  improvement: number
}
