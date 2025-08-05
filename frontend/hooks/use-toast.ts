import { useState, useCallback } from "react"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive"
}

interface ToastState {
  toasts: Toast[]
}

let toastCount = 0

export function useToast() {
  const [state, setState] = useState<ToastState>({ toasts: [] })

  const toast = useCallback(
    ({ title, description, variant = "default" }: Omit<Toast, "id">) => {
      const id = (++toastCount).toString()
      const newToast: Toast = {
        id,
        title,
        description,
        variant,
      }

      setState((prevState) => ({
        toasts: [...prevState.toasts, newToast],
      }))

      // Automatically remove toast after 5 seconds
      setTimeout(() => {
        setState((prevState) => ({
          toasts: prevState.toasts.filter((t) => t.id !== id),
        }))
      }, 5000)

      // For debugging - log to console
      console.log(`Toast: ${title}${description ? ` - ${description}` : ""}`)
    },
    []
  )

  const dismiss = useCallback((toastId: string) => {
    setState((prevState) => ({
      toasts: prevState.toasts.filter((t) => t.id !== toastId),
    }))
  }, [])

  return {
    toast,
    dismiss,
    toasts: state.toasts,
  }
}
