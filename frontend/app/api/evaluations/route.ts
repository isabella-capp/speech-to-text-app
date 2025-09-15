import { NextRequest, NextResponse } from "next/server"
import type { Evaluation, ModelResult } from "@/types/evaluation"
import { auth } from "@/lib/auth"
import db from "@/lib/db/db";

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }

    // Recupera tutte le valutazioni dell'utente con i risultati dei modelli
    const evaluationsFromDb = await db.evaluation.findMany({
      where: { userId },
      include: { models: true },
      orderBy: { createdAt: "desc" },
    })

    // Converte in tipo TS `Evaluation`
    const evaluations: Evaluation[] = evaluationsFromDb.map((ev) => {
      return {
        models: ev.models.map((m) => ({
          modelName: m.modelName,
          transcription: m.transcription,
          wordErrorRate: m.wordErrorRate,
          substitutions: null, // se in futuro calcoli queste metriche aggiungile qui
          insertions: null,
          deletions: null,
          processingTimeMs: m.processingTimeMs,
          characterErrorRate: m.characterErrorRate,
          accuracy: m.accuracy,
          literalSimilarity: m.literalSimilarity,
          createdAt: m.createdAt.toISOString(),
        })),
        groundTruthText: ev.groundTruthText,
        comparison: {
          winner: ev.winner,
          winnerScore: ev.winnerScore,
          improvement: ev.improvement,
        },
        audio: {
          audioName: ev.audioName ?? "unknown",
          audioPath: ev.audioPath,
          audioDurationMs: ev.audioDurationMs,
        },
        createdAt: ev.createdAt.toISOString(),
      }
    })

    return NextResponse.json(evaluations, { status: 200 })
  } catch (error) {
    console.error("Errore nel recupero delle valutazioni:", error)
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    )
  }
}

// POST: Salva una nuova valutazione
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const result: Evaluation = await request.json();

    if (!result) {
      return NextResponse.json(
        { error: "Valutazione modello mancante" },
        { status: 400 }
      );
    }

    // Salva la valutazione con i risultati dei modelli
    const savedEvaluation = await db.evaluation.create({
      data: {
        userId,
        audioName: result.audio.audioName,
        audioPath: result.audio.audioPath,
        audioDurationMs: result.audio.audioDurationMs,
        winner: result.comparison.winner,
        winnerScore: result.comparison.winnerScore,
        improvement: result.comparison.improvement,
        groundTruthText: result.groundTruthText,
        models: {
          create: result.models.map((model: ModelResult) => ({
            modelName: model.modelName,
            transcription: model.transcription,
            wordErrorRate: model.wordErrorRate ?? null,
            characterErrorRate: model.characterErrorRate ?? null,
            accuracy: model.accuracy ?? null,
            literalSimilarity: model.literalSimilarity ?? null,
            processingTimeMs: model.processingTimeMs ?? null,
          })),
        },
      },
      include: {
        models: true,
      },
    });

    // Restituisce la valutazione salvata nel formato atteso
    const evaluationResponse: Evaluation = {
      models: savedEvaluation.models.map((m) => ({
        modelName: m.modelName,
        transcription: m.transcription,
        wordErrorRate: m.wordErrorRate,
        substitutions: null, // non gestiti dal DB
        insertions: null,    // non gestiti dal DB
        deletions: null,     // non gestiti dal DB
        processingTimeMs: m.processingTimeMs,
        characterErrorRate: m.characterErrorRate,
        accuracy: m.accuracy,
        literalSimilarity: m.literalSimilarity,
        createdAt: m.createdAt.toISOString(),
      })),
      groundTruthText: savedEvaluation.groundTruthText,
      createdAt: savedEvaluation.createdAt.toISOString(),
      comparison: {
        winner: savedEvaluation.winner,
        winnerScore: savedEvaluation.winnerScore,
        improvement: savedEvaluation.improvement,
      },
      audio: {
        audioName: savedEvaluation.audioName ?? "unknown",
        audioPath: savedEvaluation.audioPath,
        audioDurationMs: savedEvaluation.audioDurationMs,
      },
    };

    return NextResponse.json(evaluationResponse, { status: 201 });
  } catch (error) {
    console.error("Errore nel salvataggio della valutazione:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
