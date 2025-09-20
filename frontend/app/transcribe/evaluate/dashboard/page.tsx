import { EvaluationDashboard } from "@/components/evaluate/evaluation-dashboard"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function EvaluationDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    // Se l'utente non è autenticato, reindirizza alla pagina di login
    redirect("/auth/login")
  }
  
  return <EvaluationDashboard />
}
