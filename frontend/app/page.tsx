"use client"

import { AuthFlow } from "@/components/auth/auth-flow"
import { AuthProvider } from "@/components/auth/auth-provider"
import { SpeechToTextApp } from "@/components/speech-to-text-app"

export default function Page() {
  return (
    <AuthProvider>
      <AuthFlow>
        <SpeechToTextApp />
      </AuthFlow>
    </AuthProvider>
  )
}
