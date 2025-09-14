import { NextRequest, NextResponse } from "next/server"
import type { EvaluationResult, SavedEvaluation, ModelEvaluationResult, TranscriptionMetrics } from "@/types/evaluation"
import { auth } from "@/lib/auth"
import db from "@/lib/db/db";

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Recupera le metriche dal DB
    const metrics = await db.transcriptionMetrics.findMany({
      where: { message: { chat: { userId } } },
      include: { 
        message: {
          select: {
            content: true,
            audioName: true,
            modelName: true,
            chat: { select: { title: true } }
          }
        }
      },
      orderBy: { evaluatedAt: "desc" },
    })

    // Raggruppa per valutazione (basato su audio name e ground truth)
    const groupedEvaluations = new Map<string, any[]>()
    
    metrics.forEach(metric => {
      const key = `${metric.message.audioName || 'unknown'}-${metric.groundTruthText}`
      if (!groupedEvaluations.has(key)) {
        groupedEvaluations.set(key, [])
      }
      groupedEvaluations.get(key)!.push(metric)
    })

    // Converti in SavedEvaluation format
    const evaluations: SavedEvaluation[] = Array.from(groupedEvaluations.entries()).map(([key, metrics]) => {
      const whisperMetrics = metrics.find(m => m.evaluationModel === 'whisper')
      const wav2vec2Metrics = metrics.find(m => m.evaluationModel === 'wav2vec2')
      
      const whisperWer = whisperMetrics?.wordErrorRate || 0
      const wav2vec2Wer = wav2vec2Metrics?.wordErrorRate || 0
      const winner = whisperWer < wav2vec2Wer ? "Whisper" : "Wav2Vec2"
      
      // Popola l'array models con i dati dei modelli
      const models = []
      if (whisperMetrics) {
        models.push({
          id: whisperMetrics.id,
          evaluationId: key,
          model: "Whisper",
          transcription: whisperMetrics.message.content,
          wer: whisperMetrics.wordErrorRate || 0,
          substitutions: 0, // TODO: Aggiungere se disponibile nel DB
          insertions: 0, // TODO: Aggiungere se disponibile nel DB
          deletions: 0, // TODO: Aggiungere se disponibile nel DB
          processingTime: (whisperMetrics.processingTimeMs || 0) / 1000,
        })
      }
      if (wav2vec2Metrics) {
        models.push({
          id: wav2vec2Metrics.id,
          evaluationId: key,
          model: "Wav2Vec2",
          transcription: wav2vec2Metrics.message.content,
          wer: wav2vec2Metrics.wordErrorRate || 0,
          substitutions: 0, // TODO: Aggiungere se disponibile nel DB
          insertions: 0, // TODO: Aggiungere se disponibile nel DB
          deletions: 0, // TODO: Aggiungere se disponibile nel DB
          processingTime: (wav2vec2Metrics.processingTimeMs || 0) / 1000,
        })
      }
      
      return {
        id: key,
        userId,
        audioFileName: metrics[0].message.audioName || 'unknown',
        correctTranscription: metrics[0].groundTruthText,
        models,
        winner,
        winnerScore: Math.min(whisperWer, wav2vec2Wer),
        improvement: Math.abs(whisperWer - wav2vec2Wer) / Math.max(whisperWer, wav2vec2Wer, 0.001),
        createdAt: metrics[0].evaluatedAt,
        updatedAt: metrics[0].evaluatedAt,
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

    const result: EvaluationResult = await request.json()

    if (!result) {
      return NextResponse.json({ error: "Valutazione modello mancante" }, { status: 400 });
    }
    
    // Funzione helper per salvare le metriche di un modello
    const saveModelMetrics = async (model: ModelEvaluationResult, modelName: string) => {
      return db.transcriptionMetrics.create({
        data: {
          message: {
            create: {
              content: model.transcription,
              modelName,
              type: "TRANSCRIPTION",
              chat: {
                connectOrCreate: {
                  where: { id: userId + "-chat" }, // o collegati a chat esistente
                  create: { title: "Default Chat", userId },
                },
              },
            },
          },
          groundTruthText: result.correctTranscription,
          wordErrorRate: model.wer,
          characterErrorRate: 0, // TODO: Aggiungere CER se disponibile
          accuracy: Math.max(0, 1 - model.wer),
          processingTimeMs: model.processingTime * 1000, // Converti da secondi a ms
          evaluatedAt: new Date(result.evaluatedAt),
          evaluationModel: modelName,
        },
      })
    }

    // Salva ogni modello nel database
    const savedMetrics = []
    
    for (const model of result.models) {
      const metrics = await saveModelMetrics(model, model.model)
      savedMetrics.push(metrics)
    }

    // Restituisce le metriche salvate
    return NextResponse.json({ evaluations: savedMetrics }, { status: 201 })
  } catch (error) {
    console.error("Errore nel salvataggio della valutazione:", error)
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    )
  }
}

