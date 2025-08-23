import { notFound } from "next/navigation"
import ChatPage from "@/components/chat/chat-page"

// Pagina temporanea per le chat guest
export default async function GuestChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <ChatPage />
  )
}