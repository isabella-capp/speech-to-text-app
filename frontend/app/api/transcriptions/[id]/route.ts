import db from "@/lib/db/db"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// DELETE: Elimina una trascrizione specifica
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }

    const { id } = await params

    // Verifica che la trascrizione appartenga all'utente
    const transcription = await db.transcription.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!transcription) {
      return NextResponse.json({ error: "Trascrizione non trovata" }, { status: 404 })
    }

    // Elimina la trascrizione
    await db.transcription.delete({
      where: {
        id
      }
    })

    return NextResponse.json({ message: "Trascrizione eliminata con successo" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Errore nell'eliminazione della trascrizione" }, { status: 500 })
  }
}

// GET: Recupera una trascrizione specifica
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }

    const { id } = await params

    // Recupera la trascrizione
    const transcription = await db.transcription.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!transcription) {
      return NextResponse.json({ error: "Trascrizione non trovata" }, { status: 404 })
    }

    return NextResponse.json(transcription)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Errore nel recupero della trascrizione" }, { status: 500 })
  }
}
