"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
} from "recharts"
import type { Evaluation, ModelResult } from "@/types/evaluation"

interface ImprovedEvaluationChartProps {
  evaluations: Evaluation[]
}

export function EvaluationChart({ evaluations }: ImprovedEvaluationChartProps) {
  // Prepara i dati per il confronto WER
  const werComparisonData = evaluations.map((evaluation, index) => {
    const whisper = evaluation.models.find((m: ModelResult) => m.modelName === "whisper")
    const wav2vec2 = evaluation.models.find((m: ModelResult) => m.modelName === "wav2vec2")

    return {
      test: `Test ${index + 1}`,
      date: new Date(evaluation.createdAt).toLocaleDateString("it-IT", { 
        month: "short", 
        day: "numeric", 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
      whisperWER: whisper ? (whisper.wordErrorRate || 0) * 100 : 0,
      wav2vec2WER: wav2vec2 ? (wav2vec2.wordErrorRate || 0) * 100 : 0,
    }
  })

  // Prepara i dati per il confronto CER
  const cerComparisonData = evaluations.map((evaluation, index) => {
    const whisper = evaluation.models.find((m: ModelResult) => m.modelName === "whisper")
    const wav2vec2 = evaluation.models.find((m: ModelResult) => m.modelName === "wav2vec2")

    return {
      test: `Test ${index + 1}`,
      date: new Date(evaluation.createdAt).toLocaleDateString("it-IT", { 
        month: "short", 
        day: "numeric", 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
      whisperCER: whisper ? (whisper.characterErrorRate || 0) * 100 : 0,
      wav2vec2CER: wav2vec2 ? (wav2vec2.characterErrorRate || 0) * 100 : 0,
    }
  })

  const inferenceTimeData = evaluations.map((evaluation, index) => {
    const whisper = evaluation.models.find((m: ModelResult) => m.modelName === "whisper")
    const wav2vec2 = evaluation.models.find((m: ModelResult) => m.modelName === "wav2vec2")

    return {
      test: `Test ${index + 1}`,
      date: new Date(evaluation.createdAt).toLocaleDateString("it-IT", { 
        month: "short", 
        day: "numeric", 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
      whisperTime: whisper ? (whisper.processingTimeMs || 0) / 1000 : 0, // Convert ms to seconds
      wav2vec2Time: wav2vec2 ? (wav2vec2.processingTimeMs || 0) / 1000 : 0, // Convert ms to seconds
    }
  })

  const modelWinsData = evaluations.reduce(
    (acc, evaluation) => {
      const winner = evaluation.comparison.winner.toLowerCase()
      if (winner === "whisper") {
        acc.whisperWins += 1
      } else if (winner === "wav2vec2") {
        acc.wav2vec2Wins += 1
      }
      return acc
    },
    { whisperWins: 0, wav2vec2Wins: 0 },
  )

  // Custom label render function for pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }: any) => {
    const RADIAN = Math.PI / 180
    // Position labels outside the pie chart
    const radius = outerRadius + 30
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    const percent = totalWins > 0 ? ((value / totalWins) * 100).toFixed(0) : 0

    return (
      <text
        x={x}
        y={y}
        fill="#374151"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="500"
      >
        {`${name}: ${value} (${percent}%)`}
      </text>
    )
  }

  // Calculate total wins for percentage calculation
  const totalWins = modelWinsData.whisperWins + modelWinsData.wav2vec2Wins

  const winsChartData = [
    { name: "Whisper", wins: modelWinsData.whisperWins, color: "#3b82f6" },
    { name: "Wav2Vec2", wins: modelWinsData.wav2vec2Wins, color: "#8b5cf6" },
  ]

  const accuracyComparisonData = evaluations.map((evaluation, index) => {
    const whisper = evaluation.models.find((m: ModelResult) => m.modelName === "whisper")
    const wav2vec2 = evaluation.models.find((m: ModelResult) => m.modelName === "wav2vec2")

    return {
      test: `Test ${index + 1}`,
      date: new Date(evaluation.createdAt).toLocaleDateString("it-IT", { 
        month: "short", 
        day: "numeric", 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
      whisperAccuracy: whisper ? (whisper.accuracy || 0) * 100 : 0,
      wav2vec2Accuracy: wav2vec2 ? (wav2vec2.accuracy || 0) * 100 : 0,
    }
  })

  // Calcola le metriche medie per modello
  const whisperMetrics = evaluations.flatMap((e) => e.models.filter((m) => m.modelName === "whisper"))
  const wav2vec2Metrics = evaluations.flatMap((e) => e.models.filter((m) => m.modelName === "wav2vec2"))

  const avgWhisperWER =
    whisperMetrics.length > 0
      ? (whisperMetrics.reduce((sum, m) => sum + (m.wordErrorRate || 0), 0) / whisperMetrics.length) * 100
      : 0

  const avgWav2vec2WER =
    wav2vec2Metrics.length > 0
      ? (wav2vec2Metrics.reduce((sum, m) => sum + (m.wordErrorRate || 0), 0) / wav2vec2Metrics.length) * 100
      : 0

  const avgWhisperCER =
    whisperMetrics.length > 0
      ? (whisperMetrics.reduce((sum, m) => sum + (m.characterErrorRate || 0), 0) / whisperMetrics.length) * 100
      : 0

  const avgWav2vec2CER =
    wav2vec2Metrics.length > 0
      ? (wav2vec2Metrics.reduce((sum, m) => sum + (m.characterErrorRate || 0), 0) / wav2vec2Metrics.length) * 100
      : 0

  const avgWhisperAccuracy =
    whisperMetrics.length > 0
      ? (whisperMetrics.reduce((sum, m) => sum + (m.accuracy || 0), 0) / whisperMetrics.length) * 100
      : 0

  const avgWav2vec2Accuracy =
    wav2vec2Metrics.length > 0
      ? (wav2vec2Metrics.reduce((sum, m) => sum + (m.accuracy || 0), 0) / wav2vec2Metrics.length) * 100
      : 0

  const avgWhisperTime =
    whisperMetrics.length > 0
      ? whisperMetrics.reduce((sum, m) => sum + (m.processingTimeMs || 0), 0) / whisperMetrics.length
      : 0

  const avgWav2vec2Time =
    wav2vec2Metrics.length > 0
      ? wav2vec2Metrics.reduce((sum, m) => sum + (m.processingTimeMs || 0), 0) / wav2vec2Metrics.length
      : 0

  return (
    <div className="space-y-6">
      {/* Metriche Medie */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">WER Medio per Modello</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Whisper</span>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {avgWhisperWER.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium">Wav2Vec2</span>
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {avgWav2vec2WER.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">CER Medio per Modello</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Whisper</span>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {avgWhisperCER.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium">Wav2Vec2</span>
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {avgWav2vec2CER.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Accuratezza Media</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Whisper</span>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {avgWhisperAccuracy.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium">Wav2Vec2</span>
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {avgWav2vec2Accuracy.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tempo Medio Inferenza</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Whisper</span>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {avgWhisperTime.toFixed(2)}s
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium">Wav2Vec2</span>
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {avgWav2vec2Time.toFixed(2)}s
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confronto WER nel tempo */}
      <Card>
        <CardHeader>
          <CardTitle>Confronto Word Error Rate (WER) nel Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={werComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: "WER (%)", angle: -90, position: "insideLeft" }} domain={[0, "dataMax + 1"]} />
              <Tooltip
                formatter={(value: any, name: string) => {
                  if (typeof value === "number") {
                    return [`${value.toFixed(1)}%`, name]
                  }
                  return [value, name]
                }}
                labelFormatter={(label: any) => (typeof label === "string" ? `Data: ${label}` : `Data: ${String(label)}`)}
                cursor={{ stroke: '#8884d8', strokeWidth: 1 }}
                allowEscapeViewBox={{ x: false, y: false }}
                wrapperStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', borderRadius: '4px' }}
              />

              <Legend />
              <Line
                type="monotone"
                dataKey="whisperWER"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Whisper WER"
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="wav2vec2WER"
                stroke="#8b5cf6"
                strokeWidth={3}
                name="Wav2Vec2 WER"
                dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Confronto CER nel tempo */}
      <Card>
        <CardHeader>
          <CardTitle>Confronto Character Error Rate (CER) nel Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={cerComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: "CER (%)", angle: -90, position: "insideLeft" }} domain={[0, "dataMax + 1"]} />
              <Tooltip
                formatter={(value: any, name: string) => {
                  if (typeof value === "number") {
                    return [`${value.toFixed(1)}%`, name]
                  }
                  return [value, name]
                }}
                labelFormatter={(label: any) => (typeof label === "string" ? `Data: ${label}` : `Data: ${String(label)}`)}
                cursor={{ stroke: '#8884d8', strokeWidth: 1 }}
                allowEscapeViewBox={{ x: false, y: false }}
                wrapperStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', borderRadius: '4px' }}
              />

              <Legend />
              <Area
                type="monotone"
                dataKey="whisperCER"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                name="Whisper CER"
              />
              <Area
                type="monotone"
                dataKey="wav2vec2CER"
                stackId="2"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.3}
                name="Wav2Vec2 CER"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tempi di Inferenza per Modello</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={inferenceTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: "Tempo (s)", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (typeof value === "number") {
                      return [`${value.toFixed(2)}s`, name]
                    }
                    return [value, name]
                  }}
                  labelFormatter={(label: any) => (typeof label === "string" ? `Data: ${label}` : `Data: ${String(label)}`)}
                  cursor={{ stroke: '#8884d8', strokeWidth: 1 }}
                  allowEscapeViewBox={{ x: false, y: false }}
                  wrapperStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', borderRadius: '4px' }}
                />

                <Legend />
                <Line
                  type="monotone"
                  dataKey="whisperTime"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Whisper"
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="wav2vec2Time"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  name="Wav2Vec2"
                  dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confronto Vittorie per Modello</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={winsChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="wins"
                >
                  {winsChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} vittorie`, "Vittorie"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Confronto Accuratezza nel Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={accuracyComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: "Accuratezza (%)", angle: -90, position: "insideLeft" }} domain={[0, 100]} />
              <Tooltip
                formatter={(value: any, name: string) => {
                  if (typeof value === "number") {
                    return [`${value.toFixed(1)}%`, name]
                  }
                  return [value, name]
                }}
                labelFormatter={(label: any) => (typeof label === "string" ? `Data: ${label}` : `Data: ${String(label)}`)}
                cursor={{ fill: 'rgba(136, 132, 216, 0.1)' }}
                allowEscapeViewBox={{ x: false, y: false }}
                wrapperStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <Legend />
              <Bar dataKey="whisperAccuracy" fill="#3b82f6" name="Whisper" radius={[4, 4, 0, 0]} />
              <Bar dataKey="wav2vec2Accuracy" fill="#8b5cf6" name="Wav2Vec2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
