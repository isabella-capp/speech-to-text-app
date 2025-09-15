"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Evaluation } from "@/types/evaluation"

interface EvaluationTableProps {
  evaluations: Evaluation[]
}

export function EvaluationTable({ evaluations }: EvaluationTableProps) {
  
  const formatPercentage = (value?: number) => {
    if (value === undefined || value === null) return "N/A"
    return `${(value * 100).toFixed(1)}%`
  }

  const getScoreColor = (value?: number, isError = false) => {
    if (value === undefined || value === null) return "secondary"

    if (isError) {
      // For error rates, lower is better
      if (value < 0.1) return "default"
      if (value < 0.3) return "secondary"
      return "destructive"
    } else {
      // For similarity/BLEU scores, higher is better
      if (value > 0.8) return "default"
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
              <TableHead>Modello</TableHead>
              <TableHead>WER</TableHead>
              <TableHead>CER</TableHead>
              <TableHead>Similarità</TableHead>
              <TableHead>Trascrizione</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  Nessuna valutazione disponibile. Inizia a valutare le tue trascrizioni per vedere i dati qui.
                </TableCell>
              </TableRow>
            ) : (
              evaluations.flatMap((evaluation) => 
                evaluation.models.map((modelResult, index) => (
                  <TableRow key={`${evaluation.createdAt}-${modelResult.modelName}-${index}`}>
                    <TableCell className="text-sm">
                      {new Date(evaluation.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{modelResult.modelName}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getScoreColor(modelResult.wordErrorRate ? modelResult.wordErrorRate / 100 : undefined, true)}>
                        {modelResult.wordErrorRate ? `${(modelResult.wordErrorRate * 100).toFixed(1)}%` : "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{modelResult.characterErrorRate ? `${(modelResult.characterErrorRate * 100).toFixed(1)}%` : "N/A"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{modelResult.literalSimilarity ? `${(modelResult.literalSimilarity * 100).toFixed(1)}%` : "N/A"}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate text-sm text-gray-600">
                        {modelResult.transcription.substring(0, 50)}
                        {modelResult.transcription.length > 50 && "..."}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
