"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button" // Added Button import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Music, Download } from "lucide-react" // Added Download icon

interface TranscriptionComparisonDialogProps {
    isOpen: boolean
    onClose: () => void
    modelTranscription: string
    correctTranscription: string
    modelName: string
    audioName: string
    audioPath: string // Added audioPath prop
    metrics?: {
        wordErrorRate?: number | null
        characterErrorRate?: number | null
        accuracy?: number | null
        literalSimilarity?: number | null
    }
}

export function TranscriptionComparisonDialog({
    isOpen,
    onClose,
    modelTranscription,
    correctTranscription,
    modelName,
    audioName,
    audioPath, // Added audioPath parameter
    metrics,
}: TranscriptionComparisonDialogProps) {
    const formatPercentage = (value?: number | null) => {
        if (value === undefined || value === null) return "N/A"
        return `${(value * 100).toFixed(1)}%`
    }

    const handleDownloadAudio = () => {
        console.log(`Downloading audio: ${audioName} from ${audioPath}`)

        const link = document.createElement("a")
        link.href = audioPath
        link.download = audioName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                            <Music className="h-5 w-5 text-gray-500" />
                            {audioName} - <Badge variant="outline">{modelName}</Badge>
                        </div>
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-2 justify-between">
                        Confronta la trascrizione del modello con quella corretta
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadAudio}
                            className="flex items-center gap-2 bg-transparent mx-4"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-4">
                        {/* Metriche di performance */}
                        {metrics && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <Card className="p-3">
                                    <div className="text-xs text-gray-500">WER</div>
                                    <div className="font-semibold text-sm">
                                        {formatPercentage(metrics.wordErrorRate)}
                                    </div>
                                </Card>
                                <Card className="p-3">
                                    <div className="text-xs text-gray-500">CER</div>
                                    <div className="font-semibold text-sm">
                                        {formatPercentage(metrics.characterErrorRate)}
                                    </div>
                                </Card>
                                <Card className="p-3">
                                    <div className="text-xs text-gray-500">Accuratezza</div>
                                    <div className="font-semibold text-sm">
                                        {formatPercentage(metrics.accuracy)}
                                    </div>
                                </Card>
                                <Card className="p-3">
                                    <div className="text-xs text-gray-500">Similarità</div>
                                    <div className="font-semibold text-sm">
                                        {formatPercentage(metrics.literalSimilarity)}
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Confronto delle trascrizioni */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                        Trascrizione del Modello
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-40">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{modelTranscription}</p>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                        Trascrizione Corretta
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-40">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{correctTranscription}</p>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Statistiche di confronto */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Statistiche di Confronto</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Lunghezza Modello:</span>
                                        <span className="ml-2 font-medium">{modelTranscription.length} caratteri</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Lunghezza Corretta:</span>
                                        <span className="ml-2 font-medium">{correctTranscription.length} caratteri</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Differenza:</span>
                                        <span className="ml-2 font-medium">
                                            {Math.abs(modelTranscription.length - correctTranscription.length)} caratteri
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
