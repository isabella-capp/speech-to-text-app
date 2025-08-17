import { notFound } from "next/navigation"
import ChatPage from "@/components/chat/chat-page"

// Pagina temporanea per le chat guest
export default function GuestChatPage({
  params,
}: {
  params: { id: string }
}) {

  return (
    <ChatPage />
  )
}