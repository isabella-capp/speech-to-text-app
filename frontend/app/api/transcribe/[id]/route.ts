import { NextResponse } from "next/server"
import db from "@/lib/db/db"
import { auth } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const chatId = params.id
    const session = await auth()
    const isGuest = !session?.user?.id
    
    const { fileInfo } = await req.json()

     if (!fileInfo?.buffer) {
      return NextResponse.json(
        { success: false, error: "File audio mancante" },
        { status: 400 }
      )
    }

    if (!fileInfo?.model) {
      return NextResponse.json(
        { success: false, error: "Modello mancante" },
        { status: 400 }
      )
    }

    const { buffer, fileName, type, model } = fileInfo
    const backendFormData = new FormData()
    backendFormData.append("file", new Blob([Uint8Array.from(buffer)], { type }), fileName)

    const backendResponse = await fetch(`http://localhost:8000/${model}/transcribe`, {
      method: "POST",
      body: backendFormData,
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      return NextResponse.json(
        { success: false, error: errorText },
        { status: 500 }
      )
    }

    const backendJson = await backendResponse.json()
    const transcriptText = backendJson.transcript || backendJson.text

    if (!transcriptText) {
      return NextResponse.json(
        { success: false, error: "Trascrizione vuota" },
        { status: 500 }
      )
    }

    let transcriptionMessage
    if (!isGuest) {
        transcriptionMessage = await db.message.create({
            data: {
            content: transcriptText,
            type: "TRANSCRIPTION",
            modelName: model,
            chatId,
            },
        })
        } else {
        // Guest: solo oggetto temporaneo
        transcriptionMessage = {
            id: `guest_trans_${Date.now()}`,
            content: transcriptText,
            type: "transcription",
            timestamp: new Date(),
        }
    }

  return NextResponse.json(
    { success: true, message: transcriptionMessage },
    { status: 200 }
  )
}
