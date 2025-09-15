"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Music } from "lucide-react"
import type { Evaluation } from "@/types/evaluation"
import { TranscriptionComparisonDialog } from "./transcription-comparison-dialog"

interface EvaluationTableProps {
  evaluations: Evaluation[]
}

export function EvaluationTable({ evaluations }: EvaluationTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedComparison, setSelectedComparison] = useState<{
    modelTranscription: string
    correctTranscription: string
    modelName: string
    audioName: string
    audioPath: string
    metrics: {
      wordErrorRate?: number | null
      characterErrorRate?: number | null
      accuracy?: number | null
      literalSimilarity?: number | null
    }
  } | null>(null)

  const openComparisonDialog = (
    modelTranscription: string,
    correctTranscription: string,
    modelName: string,
    audioName: string,
    audioPath: string,
    metrics: {
      wordErrorRate?: number | null
      characterErrorRate?: number | null
      accuracy?: number | null
      literalSimilarity?: number | null
    },
  ) => {
    setSelectedComparison({
      modelTranscription,
      correctTranscription,
      modelName,
      audioName,
      audioPath,
      metrics,
    })
    setDialogOpen(true)
  }

  const formatPercentage = (value?: number) => {
    if (value === undefined || value === null) return "N/A"
    return `${(value * 100).toFixed(1)}%`
  }

  const getScoreColor = (value?: number, isError = false) => {
    if (value === undefined || value === null) return "secondary"

    if (isError) {
      // For error rates, lower is better
      if (value < 0.1) return "success"
      if (value < 0.3) return "secondary"
      return "destructive"
    } else {
      // For similarity/BLEU scores, higher is better
      if (value > 0.8) return "success"
      if (value > 0.5) return "secondary"
      return "destructive"
    }
  }
  console.log("Evaluations data:", evaluations)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dettaglio Trascrizioni Valutate</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Audio</TableHead>
              <TableHead>Modello</TableHead>
              <TableHead>WER</TableHead>
              <TableHead>CER</TableHead>
              <TableHead>Similarità</TableHead>
              <TableHead>Accuratezza</TableHead>
              <TableHead>Trascrizione</TableHead>
              <TableHead>Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                  Nessuna valutazione disponibile. Inizia a valutare le tue trascrizioni per vedere i dati qui.
                </TableCell>
              </TableRow>
            ) : (
              evaluations.flatMap((evaluation) =>
                evaluation.models.map((modelResult, index) => (
                  <TableRow key={`${evaluation.createdAt}-${modelResult.modelName}-${index}`}>
                    <TableCell className="text-sm">{new Date(evaluation.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium truncate max-w-[120px]" title={evaluation.audio.audioName}>
                          {evaluation.audio.audioName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{modelResult.modelName}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getScoreColor(
                          modelResult.wordErrorRate ? modelResult.wordErrorRate / 100 : undefined,
                          true,
                        )}
                      >
                        {modelResult.wordErrorRate ? `${(modelResult.wordErrorRate * 100).toFixed(1)}%` : "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {modelResult.characterErrorRate
                          ? `${(modelResult.characterErrorRate * 100).toFixed(1)}%`
                          : "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {modelResult.literalSimilarity ? `${(modelResult.literalSimilarity * 100).toFixed(1)}%` : "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {modelResult.accuracy ? `${(modelResult.accuracy * 100).toFixed(1)}%` : "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate text-sm text-gray-600">
                        {modelResult.transcription.substring(0, 50)}
                        {modelResult.transcription.length > 50 && "..."}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openComparisonDialog(
                              modelResult.transcription,
                              evaluation.groundTruthText,
                              modelResult.modelName,
                              evaluation.audio.audioName,
                              evaluation.audio.audioPath,
                              {
                                wordErrorRate: modelResult.wordErrorRate,
                                characterErrorRate: modelResult.characterErrorRate,
                                accuracy: modelResult.accuracy,
                                literalSimilarity: modelResult.literalSimilarity,
                              },
                            )
                          }
                          className="h-8 w-8 p-0"
                          title="Visualizza confronto"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )),
              )
            )}
          </TableBody>
        </Table>
      </CardContent>

      {selectedComparison && (
        <TranscriptionComparisonDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          modelTranscription={selectedComparison.modelTranscription}
          correctTranscription={selectedComparison.correctTranscription}
          modelName={selectedComparison.modelName}
          audioName={selectedComparison.audioName}
          audioPath={selectedComparison.audioPath}
          metrics={selectedComparison.metrics}
        />
      )}
    </Card>
  )
}
