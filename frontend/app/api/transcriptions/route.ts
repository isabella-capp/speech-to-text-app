import db from "@/lib/db/db"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// GET: Recupera tutte le trascrizioni dell'utente autenticato
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }
    
    // Recupera tutte le trascrizioni per questo utente
    const transcriptions = await db.transcription.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(transcriptions)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Errore nel recupero delle trascrizioni" }, { status: 500 })
  }
}

// POST: Salva una nuova trascrizione
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }

    const body = await req.json()
    const { transcript } = body

    if (!transcript) {
      return NextResponse.json({ error: "Trascrizione mancante" }, { status: 400 })
    }

    const transcription = await db.transcription.create({
      data: {
        transcript,
        userId: session.user.id
      }
    })

    return NextResponse.json(transcription)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Errore nel salvataggio" }, { status: 500 })
  }
}

// DELETE: Elimina tutte le trascrizioni dell'utente
export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 })
    }

    // Elimina tutte le trascrizioni dell'utente
    await db.transcription.deleteMany({
      where: {
        userId: session.user.id
      }
    })

    return NextResponse.json({ message: "Tutte le trascrizioni sono state eliminate" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Errore nell'eliminazione delle trascrizioni" }, { status: 500 })
  }
}
