"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AudioUploader } from "@/components/audio/audio-upload"
import { AudioRecorder } from "@/components/audio/audio-recorder"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Loader2, BarChart3 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useMetricsMutation } from "@/hooks/use-metrics-mutation"
import { EvaluationResults } from "./evaluation-results"
import { BackendStatusChecker } from "./backend-status-checker"
import Link from "next/link"

export function EvaluateModelsPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [correctTranscription, setCorrectTranscription] = useState("")
  const [dragActive, setDragActive] = useState(false)

  const { evaluateModels, isEvaluating, results, error } = useMetricsMutation()

  const handleRecordingComplete = (file: File) => {
    setAudioFile(file)
  }

  const handleEvaluate = () => {
    if (!audioFile || !correctTranscription.trim()) return

    evaluateModels({
      audioFile,
      correctTranscription: correctTranscription.trim(),
    })
  }

  const canEvaluate = audioFile && correctTranscription.trim() && !isEvaluating

  return (
    <div className="min-h-0 flex-1 p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Valutazione Modelli</h1>
            <p className="text-gray-600">
              Confronta le prestazioni dei modelli Whisper e Wav2Vec2 caricando un file audio e fornendo la trascrizione
              corretta
            </p>
          </div>
        </div>
      </div>

      <BackendStatusChecker />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sezione Input */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Input per Valutazione
              </CardTitle>
              <CardDescription>
                Carica un file audio e inserisci la trascrizione corretta per confrontare i modelli
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Audio Upload/Record */}
              <div>
                <Label className="text-sm font-medium mb-3 block">File Audio</Label>
                <AudioUploader
                  audioFile={audioFile}
                  onFileSelect={setAudioFile}
                  onFileRemove={() => setAudioFile(null)}
                  onTranscribe={() => {}} // Non usato in questa modalità
                  dragActive={dragActive}
                  onDragActiveChange={setDragActive}
                  isTranscribing={false}
                  hideTranscribeButton={true}
                />
                <div className="mt-4">
                  <AudioRecorder onRecordingComplete={handleRecordingComplete} />
                </div>
              </div>

              <Separator />

              {/* Correct Transcription */}
              <div>
                <Label htmlFor="correct-transcription" className="text-sm font-medium mb-3 block">
                  Trascrizione Corretta
                </Label>
                <Textarea
                  id="correct-transcription"
                  placeholder="Inserisci qui la trascrizione corretta del file audio..."
                  value={correctTranscription}
                  onChange={(e) => setCorrectTranscription(e.target.value)}
                  className="min-h-32 resize-none"
                  disabled={isEvaluating}
                />
                <p className="text-xs text-gray-500 mt-2">Caratteri: {correctTranscription.length}</p>
              </div>

              {/* Evaluate Button */}
              <Button onClick={handleEvaluate} disabled={!canEvaluate} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-lg w-full" size="lg">
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Valutazione in corso...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Valuta Modelli
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Progress Indicator */}
          {isEvaluating && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Elaborazione in corso...</span>
                    <Badge variant="secondary">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Attivo
                    </Badge>
                  </div>
                  <Progress value={50} className="h-2" />
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>• Trascrizione con Whisper...</div>
                    <div>• Trascrizione con Wav2Vec2...</div>
                    <div>• Calcolo metriche di valutazione...</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sezione Risultati */}
        <div>
          {results ? (
            <EvaluationResults results={results} />
          ) : (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-96 text-center">
                <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Risultati Valutazione</h3>
                <p className="text-gray-500 max-w-sm">
                  I risultati del confronto tra i modelli appariranno qui dopo aver completato la valutazione
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
