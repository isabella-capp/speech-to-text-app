import { Suspense } from "react"
import { MetricsDashboard } from "@/components/metrics/metrics-dashboard"

export default function MetricsPage() {
  return (
    <div className="h-full">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Caricamento metriche...</p>
            </div>
          </div>
        }
      >
        <MetricsDashboard />
      </Suspense>
    </div>
  )
}
