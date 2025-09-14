import { NextRequest, NextResponse } from "next/server"
import type { EvaluationResult, SavedEvaluation } from "@/types/evaluation"

// Mock storage per le valutazioni (in produzione useresti un database)
let evaluations: SavedEvaluation[] = []

export async function GET() {
  try {
    return NextResponse.json(evaluations)
  } catch (error) {
    console.error("Errore nel recupero delle valutazioni:", error)
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const result: EvaluationResult = await request.json()

    // Converti EvaluationResult in SavedEvaluation
    const savedEvaluation: SavedEvaluation = {
      id: Math.random().toString(36).substring(7),
      userId: "temp-user", // TODO: Implementare autenticazione
      audioFileName: result.audioFileName,
      correctTranscription: result.correctTranscription,
      whisperTranscription: result.whisper.transcription,
      whisperWer: result.whisper.wer,
      whisperSubstitutions: result.whisper.substitutions,
      whisperInsertions: result.whisper.insertions,
      whisperDeletions: result.whisper.deletions,
      whisperProcessingTime: result.whisper.processingTime,
      wav2vec2Transcription: result.wav2vec2.transcription,
      wav2vec2Wer: result.wav2vec2.wer,
      wav2vec2Substitutions: result.wav2vec2.substitutions,
      wav2vec2Insertions: result.wav2vec2.insertions,
      wav2vec2Deletions: result.wav2vec2.deletions,
      wav2vec2ProcessingTime: result.wav2vec2.processingTime,
      winner: result.comparison.winner,
      winnerScore: result.comparison.winnerScore,
      improvement: result.comparison.improvement,
      createdAt: result.evaluatedAt,
      updatedAt: result.evaluatedAt,
    }

    evaluations.push(savedEvaluation)

    return NextResponse.json(savedEvaluation, { status: 201 })
  } catch (error) {
    console.error("Errore nel salvataggio della valutazione:", error)
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    )
  }
}