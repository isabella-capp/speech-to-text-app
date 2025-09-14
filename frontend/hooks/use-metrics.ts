import { useQuery } from "@tanstack/react-query"
import type { SavedEvaluation } from "@/types/evaluation"

export function useMetrics() {
  return useQuery<SavedEvaluation[], Error>({
    queryKey: ["evaluations"],
    queryFn: async () => {
      const response = await fetch("/api/evaluations")
      if (!response.ok) {
        throw new Error("Errore nel caricamento della cronologia")
      }
      return response.json()
    },
  })
}
