"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import type { Evaluation, ModelResult } from "@/types/evaluation"

interface EvaluationChartProps {
  evaluations: Evaluation[]
}

export function EvaluationChart({ evaluations }: EvaluationChartProps) {

 // Prepara i dati per il grafico a barre (WER comparison)
  const werData = evaluations.slice(-10).map((evaluation, index) => {
    const whisper = evaluation.models.find((m: ModelResult) => m.modelName === "whisper")
    const wav2vec2 = evaluation.models.find((m: ModelResult) => m.modelName === "wav2vec2")

    return {
      name: `Test ${index + 1}`,
      Whisper: whisper ? (1 - (whisper.wordErrorRate || 0)) * 100 : 0,
      Wav2Vec2: wav2vec2 ? (1 - (wav2vec2.wordErrorRate || 0)) * 100 : 0,
    }
  })

  // Prepara i dati per il grafico a torta (vittorie)
  const whisperWins = evaluations.filter((e: Evaluation) => e.comparison.winner === "Whisper").length
  const wav2vec2Wins = evaluations.filter((e: Evaluation) => e.comparison.winner === "Wav2Vec2").length

  const pieData = [
    { name: "Whisper", value: whisperWins, color: "#3b82f6" },
    { name: "Wav2Vec2", value: wav2vec2Wins, color: "#8b5cf6" },
  ]

  return (
    <div className="space-y-6">
      {/* Bar Chart - Accuracy Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Confronto Accuratezza (Ultimi 10 Test)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={werData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, ""]}
                labelFormatter={(label) => `Test: ${label}`}
              />
              <Bar dataKey="Whisper" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Wav2Vec2" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Chart - Win Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuzione Vittorie</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
