import db from "@/lib/db/db"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"

// GET: Recupera una chat specifica con tutti i suoi messaggi
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }

    const { id } = await params

    const chat = await db.chat.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })

    if (!chat) {
      return NextResponse.json({ error: "Chat non trovata" }, { status: 404 })
    }

    return NextResponse.json(chat)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Errore nel recupero della chat" }, { status: 500 })
  }
}

// DELETE: Elimina una chat specifica
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }

    const { id } = await params

    // Verifica che la chat appartenga all'utente
    const chat = await db.chat.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!chat) {
      return NextResponse.json({ error: "Chat non trovata" }, { status: 404 })
    }

    // Elimina la chat (i messaggi vengono eliminati automaticamente per cascade)
    await db.chat.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ message: "Chat eliminata con successo" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Errore nell'eliminazione della chat" }, { status: 500 })
  }
}

// PUT: Aggiorna il titolo di una chat
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }

    const { id } = await params
    const { title } = await req.json()

    if (!title) {
      return NextResponse.json({ error: "Titolo mancante" }, { status: 400 })
    }

    // Verifica che la chat appartenga all'utente
    const chat = await db.chat.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!chat) {
      return NextResponse.json({ error: "Chat non trovata" }, { status: 404 })
    }

    // Aggiorna il titolo
    const updatedChat = await db.chat.update({
      where: { id },
      data: { title },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })

    return NextResponse.json(updatedChat)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Errore nell'aggiornamento della chat" }, { status: 500 })
  }
}
