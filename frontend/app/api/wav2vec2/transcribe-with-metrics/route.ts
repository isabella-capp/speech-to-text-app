import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const referenceText = formData.get("reference_text") as string

    if (!file || !referenceText) {
      return NextResponse.json(
        { error: "File e testo di riferimento sono richiesti" },
        { status: 400 }
      )
    }

    // Crea FormData per il backend Python
    const backendFormData = new FormData()
    backendFormData.append("file", file)
    backendFormData.append("reference_text", referenceText)

    // Chiamata al backend Python
    const backendResponse = await fetch("http://localhost:8000/wav2vec2/transcribe-with-metrics", {
      method: "POST",
      body: backendFormData,
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error("Backend error:", errorText)
      return NextResponse.json(
        { error: "Errore del backend durante la trascrizione Wav2Vec2" },
        { status: backendResponse.status }
      )
    }

    const result = await backendResponse.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error("Errore durante la trascrizione Wav2Vec2:", error)
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    )
  }
}