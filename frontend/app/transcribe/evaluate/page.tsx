import { EvaluateModelsPage } from "@/components/evaluate/evaluate-models-page"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function EvaluatePage() {
  const session = await auth()

  if (!session?.user) {
    // Se l'utente non è autenticato, reindirizza alla pagina di login
    redirect("/auth/login")
  }
  return <EvaluateModelsPage />
}
