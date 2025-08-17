import { LandingPage } from "@/components/landing/landing-page"
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
