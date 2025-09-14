export interface TranscriptionMetrics {
  id: string
  messageId: string
  groundTruthText: string
  wordErrorRate?: number
  characterErrorRate?: number
  bleuScore?: number
  semanticSimilarity?: number
  processingTimeMs?: number
  audioLengthMs?: number
  evaluatedAt: Date
  evaluationModel?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserMetrics {
  id: string
  userId: string
  totalTranscriptions: number
  averageWER?: number
  averageCER?: number
  averageBLEU?: number
  averageSemanticSim?: number
  whisperUsage: number
  wav2vec2Usage: number
  totalProcessingTime: number
  totalAudioLength: number
  lastUpdated: Date
  createdAt: Date
  updatedAt: Date
}

export interface MetricsFormData {
  messageId: string
  groundTruthText: string
  processingTimeMs?: number
  audioLengthMs?: number
}
