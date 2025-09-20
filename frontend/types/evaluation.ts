export interface EvaluationRequest {
  audioFile: File;
  correctTranscription: string;
}

export interface ModelResult {
  modelName: string;
  transcription: string;
  wordErrorRate: number | null;
  substitutions: number | null;
  insertions: number | null;
  deletions: number | null;
  processingTimeMs: number | null;
  characterErrorRate: number | null;
  accuracy: number | null;
  literalSimilarity: number | null;
  evaluation?: Evaluation;

  createdAt?: string;
}

export interface Evaluation {
  models: ModelResult[]; // 1-N: risultati dei modelli su questo audio

  groundTruthText: string; // trascrizione corretta fornita dall’utente

  createdAt: string;
  comparison: {
    winner: string; // "Whisper" o "Wav2Vec2"
    winnerScore: number; // WER del vincitore
    improvement: number | null; // Miglioramento relativo in WER tra i due modelli (può essere null)
  };
  audio: {
    audioName: string;
    audioPath: string;
    audioDurationMs: number | null;
  };
}