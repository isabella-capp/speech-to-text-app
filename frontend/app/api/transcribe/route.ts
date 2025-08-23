
import { NextResponse } from "next/server"
import db from "@/lib/db/db"
import { auth } from "@/lib/auth"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST(req: Request) {
  const session = await auth()

  const formData = await req.formData()
  const file = formData.get("audio") as File
  const model = formData.get("model") as string
  const chatId = formData.get("chatId") as string

  if (!file) 
    return NextResponse.json(
      { success: false, error: "File audio mancante" },
      { status: 400 }
    )

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
      
  const fileName = `${file.name}`
  const filePath = join(process.cwd(), "public", "uploads", fileName)
      
  await writeFile(filePath, buffer)

  // Salva solo il primo messaggio
  let chat
  if (session?.user?.id) {
    chat = await db.chat.create({
      data: {
        id: chatId || undefined,
        title: "Nuova chat in corso...",
        userId: session.user.id,
        messages: {
          create: [
            {
              content: `Audio caricato: ${file.name}`,
              type: "USER",
              modelName: model,
              audioName: fileName,
              audioSize: file.size,
              audioPath: `/uploads/${fileName}`
            },
          ],
        },
      },
      include: { messages: true },
    })
  } else {
    chat = {
      id: `guest_${Date.now()}`,
      title: "Nuova chat in corso...",
      messages:[ 
        {
          id: `guest_trans_${Date.now()}`,
          content: `Audio caricato: ${file.name}`,
          type: "USER",
          modelName: model,
          audioName: fileName,
          audioSize: file.size,
          audioPath: `/uploads/${fileName}`,
          timestamp: new Date(),
        },
      ]
    }
  }

  return NextResponse.json({
    success: true,
    chat: chat
  })
}