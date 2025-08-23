import db from "@/lib/db/db"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }

    const { id: chatId } = await params
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "File audio mancante" }, { status: 400 })
    }

    // Verifica che la chat esista e appartenga all'utente
    const chat = await db.chat.findFirst({
      where: {
        id: chatId,
        userId: session.user.id,
      },
    })

    if (!chat) {
      return NextResponse.json({ error: "Chat non trovata" }, { status: 404 })
    }

    // Salva il file audio
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const fileName = `${file.name}`
    const filePath = join(process.cwd(), "public", "uploads", fileName)
    
    await writeFile(filePath, buffer)

    // Chiama il backend per la trascrizione
    const backendFormData = new FormData()
    const blob = new Blob([buffer], { type: file.type })
    backendFormData.append("file", blob, fileName)

    const backendResponse = await fetch("http://localhost:8000/whisper/transcribe", {
      method: "POST",
      body: backendFormData,
    })

    if (!backendResponse.ok) {
      throw new Error("Errore nella trascrizione dal backend")
    }

    const transcriptionResult = await backendResponse.json()
    const transcriptText = transcriptionResult.transcript || transcriptionResult.text

    if (!transcriptText) {
      throw new Error("Trascrizione vuota ricevuta dal backend")
    }

    // Aggiungi i due nuovi messaggi alla chat esistente
    const userMessage = await db.message.create({
      data: {
        content: `Audio caricato: ${file.name}`,
        type: "USER",
        audioName: fileName,
        audioSize: file.size,
        audioPath: `/uploads/${fileName}`,
        chatId: chatId,
      },
    })

    const transcriptionMessage = await db.message.create({
      data: {
        content: transcriptText,
        type: "TRANSCRIPTION",
        modelName: "whisper",
        chatId: chatId,
      },
    })

    // Aggiorna il timestamp della chat
    await db.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      messages: [userMessage, transcriptionMessage],
      transcript: transcriptText,
    })

  } catch (error) {
    console.error("Errore nella trascrizione:", error)
    return NextResponse.json(
      { error: "Errore nella trascrizione: " + (error as Error).message },
      { status: 500 }
    )
  }
}
