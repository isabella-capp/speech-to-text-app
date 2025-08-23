import db from "@/lib/db/db"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: chatId } = await params

    // Recupera tutte le chat con i relativi messaggi
    const messages = await db.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Errore nel recupero dei messaggi" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Non autenticato"
        },
        { status: 401 }
      )
    }

    const { id: chatId } = await params
    const form = await req.formData()
    const file = form.get("audio") as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File audio mancante" },
        { status: 400 }
      )
    }

    const modelName = form.get("model") as string
   
    // Verifica che la chat appartenga all'utente
    const chat = await db.chat.findFirst({
      where: {
        id: chatId,
        userId: session.user.id,
      },
    })

    if (!chat) {
      return NextResponse.json(
        { 
          success: false,
          error: "Chat non trovata"
        }, 
        { status: 404 }
      )
    }

   
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${file.name}`
    
    const uploadDir = join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })
    const filePath = join(process.cwd(), "public", "uploads", fileName)
  
    await writeFile(filePath, buffer)
  
    const audioPath = `/uploads/${fileName}`
    const audioName = fileName
    const audioSize = file.size
    const content = `Audio caricato: ${file.name}`

    // Crea il nuovo messaggio
    const message = await db.message.create({
      data: {
        content,
        audioName,
        audioSize,
        audioPath,
        modelName,
        type: "USER",
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