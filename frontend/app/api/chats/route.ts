import db from "@/lib/db/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache"

// GET: Recupera tutte le chat dell'utente autenticato
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Recupera tutte le chat con i relativi messaggi
    const chats = await db.chat.findMany({
      where: { userId: session.user.id },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(chats, {
      status: 200,
      headers: { "Cache-Tag": "chats" }, // lega la risposta al tag "chats"
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Errore nel recupero delle chat" },
      { status: 500 }
    );
  }
}

// POST: Crea una nuova chat
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { title, firstMessage } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Titolo mancante" }, { status: 400 });
    }

    const chat = await db.chat.create({
      data: {
        title,
        userId: session.user.id,
      },
      include: {
        messages: true,
      },
    });

    if (firstMessage) {
      await db.message.create({
        data: {
          content: firstMessage.content,
          type: firstMessage.type,
          modelName: firstMessage.modelName,
          audioName: firstMessage.audioName,
          audioSize: firstMessage.audioSize,
          chatId: chat.id,
        },
      });

      const updatedChat = await db.chat.findUnique({
        where: { id: chat.id },
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      // invalida cache lista chat
      revalidateTag("chats");
      if (updatedChat) revalidateTag(`chat-${updatedChat.id}`);

      return NextResponse.json(updatedChat, { status: 201 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Errore nella creazione della chat" },
      { status: 500 }
    );
  }
}

// DELETE: Elimina tutte le chat dell'utente
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Elimina tutte le chat dell'utente (i messaggi vengono eliminati automaticamente per cascade)
    await db.chat.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    // invalida cache lista chat
    revalidateTag("chats")


    return NextResponse.json({ message: "Tutte le chat sono state eliminate" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Errore nell'eliminazione delle chat" },
      { status: 500 }
    );
  }
}
