import { useQuery } from "@tanstack/react-query"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"

export function BackendStatusChecker() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["backend-status"],
    queryFn: async () => {
      const response = await fetch("http://localhost:8000/")
      if (!response.ok) {
        throw new Error(`Backend unreachable: ${response.status}`)
      }
      return response.json()
    },
    retry: false,
    refetchOnWindowFocus: false,
  })

  return (
    <div className="mb-4">
      {isLoading && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>Checking backend connection...</AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Backend non raggiungibile. Assicurati che il server Python sia in esecuzione su localhost:8000.
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2" 
              onClick={() => refetch()}
            >
              Riprova
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {data && (
        <Alert>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            Backend connesso: {data.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}