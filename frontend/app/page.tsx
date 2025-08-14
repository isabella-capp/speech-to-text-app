import { SpeechToTextApp } from "@/components/speech-to-text-app"
import { LandingPage } from "@/components/welcome/landing-page"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Page() {
  const session = await auth()

  if (session) {
    redirect("/transcribe")
  }

  return (
    <LandingPage />
  )
}
