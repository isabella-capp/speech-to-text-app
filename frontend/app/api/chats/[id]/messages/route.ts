import db from "@/lib/db/db"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { MessageType } from "@prisma/client"

// POST: Aggiunge un nuovo messaggio a una chat esistente
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }

    const { id: chatId } = await params
    const form = await req.formData()
    const file = form.get("audio") as File
    const content = form.get("content") as string
    const modelName = form.get("modelName") as string
    const typeStr = (form.get("type") as string) || "TRANSCRIPTION"
    
    // Converte la stringa nel tipo MessageType
    const type = typeStr.toUpperCase() as MessageType

    // Verifica che la chat appartenga all'utente
    const chat = await db.chat.findFirst({
      where: {
        id: chatId,
        userId: session.user.id,
      },
    })

    if (!chat) {
      return NextResponse.json({ error: "Chat non trovata" }, { status: 404 })
    }

    let audioPath = null
    let audioName = null
    let audioSize = null

    // Gestione file audio se presente
    if (file && file.size > 0) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads")
      await mkdir(uploadsDir, { recursive: true })

      const fileName = `${Date.now()}-${file.name}`
      const filePath = path.join(uploadsDir, fileName)
      const fileBuffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filePath, fileBuffer)

      audioPath = `/uploads/${fileName}`
      audioName = file.name
      audioSize = file.size
    }

    // Crea il nuovo messaggio
    const message = await db.message.create({
      data: {
        content: content || "",
        audioName,
        audioSize,
        audioPath,
        modelName,
        type,
        chatId,
      },
    })

    // Aggiorna il timestamp della chat
    await db.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Errore nell'aggiunta del messaggio" }, { status: 500 })
  }
}