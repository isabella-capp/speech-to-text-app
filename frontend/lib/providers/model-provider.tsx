"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { ModelType } from '@/types/transcription'
import { getDefaultModel } from '@/lib/models'

interface ModelContextType {
  selectedModel: ModelType
  setSelectedModel: (model: ModelType) => void
}

const ModelContext = createContext<ModelContextType | undefined>(undefined)

export function ModelProvider({ children }: { children: ReactNode }) {
  const [selectedModel, setSelectedModel] = useState<ModelType>(getDefaultModel())

  return (
    <ModelContext.Provider value={{ selectedModel, setSelectedModel }}>
      {children}
    </ModelContext.Provider>
  )
}

export function useModel() {
  const context = useContext(ModelContext)
  if (context === undefined) {
    throw new Error('useModel must be used within a ModelProvider')
  }
  return context
}
