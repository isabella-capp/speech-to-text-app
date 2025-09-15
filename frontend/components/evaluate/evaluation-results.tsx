"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Trophy, Clock } from "lucide-react"
import type { Evaluation, ModelResult } from "@/types/evaluation"
import { formatProcessingTime, formatWER } from "@/lib/format-utils"

interface EvaluationResultsProps {
  results: Evaluation
}

export function EvaluationResults({ results }: EvaluationResultsProps) {
  const whisper = results.models.find((m: ModelResult) => m.modelName === "whisper")
  const wav2vec2 = results.models.find((m: ModelResult) => m.modelName === "wav2vec2")
  const comparison = results.comparison

  // Se non abbiamo entrambi i modelli, mostra un messaggio di errore
  if (!whisper || !wav2vec2) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Dati incompleti: mancano risultati per Whisper o Wav2Vec2</p>
      </div>
    )
  }

  const getBadgeVariant = (score: number) => {
    if (score >= 0.9) return "default"
    if (score >= 0.7) return "secondary"
    return "destructive"
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return "text-green-600"
    if (score >= 0.7) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Winner Card */}
      <Card className="border-2 border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Trophy className="w-5 h-5" />
            Modello Vincente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-yellow-900">{comparison.winner}</h3>
              <p className="text-sm text-yellow-700">Punteggio WER: {formatWER(comparison.winnerScore)}</p>
            </div>
            <Badge variant="default" className="bg-yellow-600">
              <Trophy className="w-3 h-3 mr-1" />
              Vincitore
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Whisper Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Whisper</span>
              <Badge variant={getBadgeVariant(1 - (whisper.wordErrorRate || 0))}>WER: {(whisper.wordErrorRate || 0).toFixed(3)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Accuratezza</span>
                <span className={getScoreColor(1 - (whisper.wordErrorRate || 0))}>{((1 - (whisper.wordErrorRate || 0)) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(1 - (whisper.wordErrorRate || 0)) * 100} className="h-2" />
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tempo di elaborazione:</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatProcessingTime((whisper.processingTimeMs || 0) / 1000)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sostituzioni:</span>
                <span>{whisper.substitutions}</span>
              </div>
              <div className="flex justify-between">
                <span>Inserimenti:</span>
                <span>{whisper.insertions}</span>
              </div>
              <div className="flex justify-between">
                <span>Cancellazioni:</span>
                <span>{whisper.deletions}</span>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs text-gray-500 mb-2">Trascrizione generata:</p>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">{whisper.transcription}</div>
            </div>
          </CardContent>
        </Card>

        {/* Wav2Vec2 Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Wav2Vec2</span>
              <Badge variant={getBadgeVariant(1 - (wav2vec2.wordErrorRate || 0))}>WER: {(wav2vec2.wordErrorRate || 0).toFixed(3)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Accuratezza</span>
                <span className={getScoreColor(1 - (wav2vec2.wordErrorRate || 0))}>{((1 - (wav2vec2.wordErrorRate || 0)) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(1 - (wav2vec2.wordErrorRate || 0)) * 100} className="h-2" />
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tempo di elaborazione:</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatProcessingTime((wav2vec2.processingTimeMs || 0) / 1000)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sostituzioni:</span>
                <span>{wav2vec2.substitutions}</span>
              </div>
              <div className="flex justify-between">
                <span>Inserimenti:</span>
                <span>{wav2vec2.insertions}</span>
              </div>
              <div className="flex justify-between">
                <span>Cancellazioni:</span>
                <span>{wav2vec2.deletions}</span>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs text-gray-500 mb-2">Trascrizione generata:</p>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">{wav2vec2.transcription}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Riepilogo Confronto</CardTitle>
          <CardDescription>Analisi dettagliata delle differenze tra i modelli</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">{Math.abs((whisper.wordErrorRate || 0) - (wav2vec2.wordErrorRate || 0)).toFixed(3)}</div>
              <div className="text-sm text-gray-500">Differenza WER</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {formatProcessingTime(Math.abs(((whisper.processingTimeMs || 0) / 1000) - ((wav2vec2.processingTimeMs || 0) / 1000)))}
              </div>
              <div className="text-sm text-gray-500">Differenza Tempo</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-600">
                {comparison.improvement > 0 ? "+" : ""}
                {(comparison.improvement * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Miglioramento</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
