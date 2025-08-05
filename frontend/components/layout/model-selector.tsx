"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Check, AudioWaveformIcon as Waveform } from "lucide-react"
import type { ModelType } from "@/types/transcription"
import { MODELS, getModelName } from "@/lib/models"

interface ModelSelectorProps {
  selectedModel: ModelType
  onModelChange: (model: ModelType) => void
  showSelector: boolean
  onShowSelectorChange: (show: boolean) => void
}

export function ModelSelector({
  selectedModel,
  onModelChange,
  showSelector,
  onShowSelectorChange,
}: ModelSelectorProps) {
  const selectedModelName = getModelName(selectedModel)

  return (
    <DropdownMenu open={showSelector} onOpenChange={onShowSelectorChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 font-semibold text-lg">
          {selectedModelName}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-w-110">
        <div className="p-2">
          {MODELS.map((model, index) => (
            <div
              key={model.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                selectedModel === model.id ? "bg-gray-50" : "hover:bg-gray-50"}`}
              onClick={() => {
                onModelChange(model.id)
                onShowSelectorChange(false)
              }}
            >
              <div className="flex items-center justify-between gap-5">
                <div className="flex items-center gap-5">
                  <div className={`w-6 h-6 flex-shrink-0 bg-gradient-to-br from-${model.gradientFrom} to-${model.gradientTo} rounded flex items-center justify-center`}>
                    <Waveform className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{model.name}</div>
                    <div className="text-sm text-gray-500">{model.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {model.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {model.badge}
                    </Badge>
                  )}
                  {selectedModel === model.id && <Check className="w-4 h-4 text-green-600" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
