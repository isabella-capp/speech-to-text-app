import { SpeechToTextApp } from "@/components/speech-to-text-app"
import { LandingPage } from "@/components/welcome/landing-page"
import { auth } from "@/lib/auth"

export default async function Page() {
  const session = await auth()

  return (
    !session ? (
      <LandingPage />
    ) : (
      <SpeechToTextApp />
    )
  )
}
