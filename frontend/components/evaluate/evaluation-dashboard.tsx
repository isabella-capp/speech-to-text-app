"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Clock, Target, Mic, Headphones } from "lucide-react"
import { useMetrics } from "@/hooks/use-metrics"
import type { Evaluation } from "@/types/evaluation"
import { formatWER, formatProcessingTime } from "@/lib/format-utils"
import { EvaluationChart } from "./evaluation-chart"
import { EvaluationTable } from "./evaluation-table"

export function EvaluationDashboard() {
  const { data: evaluations = [], isLoading, error } = useMetrics()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Caricamento metriche...</p>
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

  // Calcola le metriche aggregate dai dati SavedEvaluation
  const totalEvaluations = evaluations.length
  const whisperWins = evaluations.filter((e: Evaluation) => e.comparison.winner === "Whisper").length
  const wav2vec2Wins = evaluations.filter((e: Evaluation) => e.comparison.winner === "Wav2Vec2").length
  
  // Calcola WER medio da tutti i modelli
  const allModels = evaluations.flatMap((e: Evaluation) => e.models)
  const avgWER = allModels.length > 0
    ? allModels.reduce((sum, model) => sum + (model.wordErrorRate || 0), 0) / allModels.length
    : 0
  
  // Calcola tempo di processing totale
  const totalProcessingTime = allModels.reduce((sum, model) => sum + ((model.processingTimeMs || 0) / 1000), 0)
  
  // Calcola miglioramento medio
  const avgCER = allModels.length > 0
    ? allModels.reduce((sum, model) => sum + (model.characterErrorRate || 0), 0) / allModels.length
    : 0

  // Calcola accuratezza media
  const avgAccuracy = 1 - avgWER

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Metriche</h1>
          <p className="text-gray-600">Analisi delle performance di trascrizione</p>
        </div>
      </div>

      {totalEvaluations === 0 ? (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna valutazione disponibile</h3>
          <p className="text-gray-600 mb-4">Inizia a valutare i modelli per vedere le metriche qui</p>
          <p className="text-sm text-gray-500">
            Vai su <strong>Valuta Modelli</strong> per iniziare a confrontare Whisper e Wav2Vec2
          </p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trascrizioni Totali</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEvaluations}</div>
                <p className="text-xs text-muted-foreground">
                  Whisper: {whisperWins} | Wav2Vec2: {wav2vec2Wins}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">WER Medio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatWER(avgWER)}</div>
                <p className="text-xs text-muted-foreground">Word Error Rate medio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accuratezza Media</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(avgAccuracy * 100).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Accuratezza media</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Totale</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatProcessingTime(totalProcessingTime)}</div>
                <p className="text-xs text-muted-foreground">Tempo di elaborazione</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Metrics */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Panoramica</TabsTrigger>
              <TabsTrigger value="charts">Grafici</TabsTrigger>
              <TabsTrigger value="details">Dettagli</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Performance Metriche
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Word Error Rate</span>
                        <span>{formatWER(avgWER)}</span>
                      </div>
                      <Progress value={avgAccuracy * 100} />
                    </div>
 
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Character Error Rate</span>
                        <span>{(avgCER * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={avgCER * 100} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Accuratezza</span>
                        <span>{(avgAccuracy * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={avgAccuracy * 100} />
                    </div>

                  </CardContent>
                </Card>

                {/* Model Usage */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="w-5 h-5" />
                      Utilizzo Modelli
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Whisper</span>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {whisperWins} wins
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Wav2Vec2</span>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {wav2vec2Wins} wins
                      </Badge>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Valutazioni totali:</span>
                          <span>{totalEvaluations}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Tempo di elaborazione:</span>
                          <span>{formatProcessingTime(totalProcessingTime)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="charts">
              <EvaluationChart evaluations={evaluations} />
            </TabsContent>

            <TabsContent value="details">
              <EvaluationTable evaluations={evaluations} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}