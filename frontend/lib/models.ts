import type { ModelConfig, ModelType } from "@/types/transcription"

/**
 * Configurazione dei modelli di trascrizione disponibili
 * Per aggiungere un nuovo modello:
 * 1. Aggiorna il tipo ModelType in types/transcription.ts
 * 2. Aggiungi la configurazione qui sotto
 */
export const MODELS: ModelConfig[] = [
  {
    id: "whisper",
    name: "Whisper",
    description: "Modello robusto di OpenAI per trascrizioni multilingue",
    badge: "OpenAI",
    gradientFrom: "blue-500",
    gradientTo: "purple-600",
    processingTime: 3000,
    supportsRealTime: false,
  },
  {
    id: "wav2vec2",
    name: "Wav2Vec2",
    description: "Modello Meta per riconoscimento vocale ad alta precisione",
    badge: "Meta",
    gradientFrom: "purple-500",
    gradientTo: "pink-600",
    processingTime: 2000,
    supportsRealTime: true,
  },
]

/**
 * Ottiene la configurazione di un modello specifico
 */
export const getModelConfig = (modelId: ModelType): ModelConfig | undefined => {
  return MODELS.find(model => model.id === modelId)
}

/**
 * Ottiene il nome visualizzato di un modello
 */
export const getModelName = (modelId: ModelType): string => {
  const model = getModelConfig(modelId)
  return model?.name || modelId
}

/**
 * Ottiene il primo modello disponibile (default)
 */
export const getDefaultModel = (): ModelType => {
  return MODELS[0]?.id || "whisper"
}
