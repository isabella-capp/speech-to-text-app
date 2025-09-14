"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, Clock, FileAudio } from "lucide-react"
import type { SavedEvaluation } from "@/types/evaluation"
import { formatProcessingTime, formatWER } from "@/lib/format-utils"

interface EvaluationTableProps {
  evaluations: SavedEvaluation[]
}

export function EvaluationTable({ evaluations }: EvaluationTableProps) {
  const getBadgeVariant = (score: number) => {
    if (score < 0.1) return "default"
    if (score < 0.3) return "secondary"
    return "destructive"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cronologia Valutazioni</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {evaluations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileAudio className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nessuna valutazione disponibile</p>
              </div>
            ) : (
              evaluations.map((evaluation) => (
                <div key={evaluation.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{evaluation.audioFileName}</h4>
                      <p className="text-xs text-gray-500">{formatDate(evaluation.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant={getBadgeVariant(evaluation.winnerScore)}>
                        WER: {evaluation.winnerScore.toFixed(3)}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {evaluation.winner}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-blue-600 font-medium">Whisper:</span>
                        <span>{formatWER(1 - evaluation.whisperWer)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Tempo:</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatProcessingTime(evaluation.whisperProcessingTime)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-purple-600 font-medium">Wav2Vec2:</span>
                        <span>{formatWER(1 - evaluation.wav2vec2Wer)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Tempo:</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatProcessingTime(evaluation.wav2vec2ProcessingTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Miglioramento:</span>
                      <span className="font-medium text-green-600">+{(evaluation.improvement * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
