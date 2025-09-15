import { useQuery } from "@tanstack/react-query"
import type { Evaluation } from "@/types/evaluation";
const fetchSavedEvaluations = async (): Promise<Evaluation[]> => {
  try {
    const response = await fetch(`/api/evaluations`);

    if (!response.ok) {
      throw new Error("Errore nel caricamento della cronologia delle valutazioni");
    }

    return await response.json();
  } catch (error) {
    throw new Error("Errore nel caricamento della cronologia delle valutazioni: " + error);
  }
};

export function useMetrics() {
  return useQuery<Evaluation[], Error>({
    queryKey: ["evaluations"],
    queryFn: fetchSavedEvaluations,
  })
}
