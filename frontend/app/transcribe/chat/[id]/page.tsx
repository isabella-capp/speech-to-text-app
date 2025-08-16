import ChatPage from "@/components/chat/chat-page"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Chat() {
  const session = await auth()

  if (!session) {
    redirect("/")
  }

  return <ChatPage guestMode={false} />;
}