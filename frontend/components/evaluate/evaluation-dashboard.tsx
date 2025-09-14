"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Trophy, TrendingUp, FileAudio } from "lucide-react"
import { useMetrics } from "@/hooks/use-metrics"
import { EvaluationChart } from "./evaluation-chart"
import { EvaluationTable } from "./evaluation-table"
import type { SavedEvaluation } from "@/types/evaluation"
import Link from "next/link"

export function EvaluationDashboard() {
  const { data: evaluations = [], isLoading, error } = useMetrics()

  if (isLoading) {
    return (
      <div className="min-h-0 flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Caricamento dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-0 flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Errore nel caricamento dei dati</p>
        </div>
      </div>
    )
  }

  const totalEvaluations = evaluations.length
  const whisperWins = evaluations.filter((e: SavedEvaluation) => e.winner === "Whisper").length
  const wav2vec2Wins = evaluations.filter((e: SavedEvaluation) => e.winner === "Wav2Vec2").length
  const avgImprovement = 
    evaluations.length > 0 ? evaluations.reduce((sum: number, e: SavedEvaluation) => sum + e.improvement, 0) / evaluations.length : 0;

  return (
    <div className="min-h-0 flex-1 p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Valutazioni</h1>
            <p className="text-gray-600">Analisi delle prestazioni dei modelli di trascrizione</p>
          </div>
        </div>
      </div>

      {totalEvaluations === 0 ? (
        <Card className="h-96">
          <CardContent className="flex flex-col items-center justify-center h-full text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna valutazione disponibile</h3>
            <p className="text-gray-500 max-w-sm mb-4">
              Inizia a valutare i modelli per vedere le statistiche e i confronti qui
            </p>
            <Link href="/transcribe/evaluate">
              <Button>
                <BarChart3 className="w-4 h-4 mr-2" />
                Inizia Valutazione
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valutazioni Totali</CardTitle>
                <FileAudio className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEvaluations}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vittorie Whisper</CardTitle>
                <Trophy className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{whisperWins}</div>
                <p className="text-xs text-muted-foreground">
                  {totalEvaluations > 0 ? Math.round((whisperWins / totalEvaluations) * 100) : 0}% del totale
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vittorie Wav2Vec2</CardTitle>
                <Trophy className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{wav2vec2Wins}</div>
                <p className="text-xs text-muted-foreground">
                  {totalEvaluations > 0 ? Math.round((wav2vec2Wins / totalEvaluations) * 100) : 0}% del totale
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Miglioramento Medio</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{(avgImprovement * 100).toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EvaluationChart evaluations={evaluations} />
            <EvaluationTable evaluations={evaluations} />
          </div>
        </div>
      )}
    </div>
  )
}
