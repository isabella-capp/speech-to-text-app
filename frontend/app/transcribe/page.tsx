import { SpeechToTextApp } from "@/components/speech-to-text-app"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function TranscribePage() {
  const session = await auth()

  if (!session) {
    redirect("/")
  }

  return <SpeechToTextApp guestMode={false} />
}