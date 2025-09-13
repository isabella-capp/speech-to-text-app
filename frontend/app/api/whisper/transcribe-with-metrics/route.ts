import { NextResponse } from "next/server"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8000"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    
    // Crea un nuovo FormData per il backend
    const backendFormData = new FormData()
    
    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json(
        { detail: "File audio mancante" },
        { status: 400 }
      )
    }
    
    backendFormData.append("file", file)
    
    // Se c'è un testo di riferimento, aggiungilo
    const referenceText = formData.get("reference_text") as string
    if (referenceText) {
      backendFormData.append("reference_text", referenceText)
    }

    // Invia la richiesta al backend Python
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/whisper/transcribe-with-metrics`, {
      method: "POST",
      body: backendFormData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error("Errore durante la trascrizione Whisper:", error)
    return NextResponse.json(
      { detail: "Errore interno del server" },
      { status: 500 }
    )
  }
}