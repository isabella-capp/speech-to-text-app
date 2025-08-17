import db from "@/lib/db/db"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST(req: Request) {
  try {
    const session = await auth()
    const isGuest = !session?.user?.id

    console.log("API transcribe - session:", !isGuest ? "autenticato" : "guest")

    const formData = await req.formData()
    const file = formData.get("audio") as File
    const model = formData.get("model") as string

    if (!file) {
      return NextResponse.json({ error: "File audio mancante" }, { status: 400 })
    }

    // Salva il file audio
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const fileName = `${Date.now()}-${file.name}`
    const filePath = join(process.cwd(), "public", "uploads", fileName)
    
    await writeFile(filePath, buffer)

    // Chiama il backend per la trascrizione
    const backendFormData = new FormData()
    const blob = new Blob([buffer], { type: file.type })
    backendFormData.append("file", blob, fileName)

    console.log("Chiamando backend per trascrizione...")

    const backendResponse = await fetch(`http://localhost:8000/${model}/transcribe`, {
      method: "POST",
      body: backendFormData,
    })

    if (!backendResponse.ok) {
      console.error("Errore backend:", backendResponse.status)
      throw new Error("Errore nella trascrizione dal backend")
    }

    const transcriptionResult = await backendResponse.json()
    console.log("Risultato trascrizione:", transcriptionResult)
    const transcriptText = transcriptionResult.transcript || transcriptionResult.text

    if (!transcriptText) {
      throw new Error("Trascrizione vuota ricevuta dal backend")
    }

    console.log("Trascrizione completata:", transcriptText.substring(0, 50) + "...")

    if (isGuest) {
      // Modalità guest: non salvare nel database, restituire solo la trascrizione
      return NextResponse.json({
        success: true,
        chat: {
          id: Date.now(), // ID temporaneo per la modalità guest
          title: transcriptText.length > 50 ? transcriptText.substring(0, 50) + "..." : transcriptText,
          isGuest: true
        },
        transcript: transcriptText,
      })
    } 

    // Modalità autenticata: salva nel database
    const title = transcriptText.length > 25
      ? transcriptText.substring(0, 25) + "..."
      : transcriptText

    if (!session.user?.id) {
      throw new Error("ID utente mancante per la creazione della chat autenticata")
    }

    const chat = await db.chat.create({
      data: {
        title,
        userId: session.user.id,
        messages: {
          create: [
            {
              content: `Audio caricato: ${file.name}`,
              type: "USER",
              audioName: fileName,
              audioSize: file.size,
              audioPath: `/uploads/${fileName}`,
            },
            {
              content: transcriptText,
              type: "TRANSCRIPTION",
              modelName: model,
            },
          ],
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      chat,
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
