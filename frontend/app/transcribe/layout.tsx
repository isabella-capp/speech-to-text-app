import { ModelProvider } from "@/lib/providers/model-provider"
import TranscribeLayoutContent from "@/components/layout/transcribe-layout-content"
import { auth } from "@/lib/auth"

interface TranscribeLayoutProps {
  children: React.ReactNode
}

export default async function TranscribeLayout({ children }: TranscribeLayoutProps) {
  const session = await auth()

  return (
    <ModelProvider>
      <TranscribeLayoutContent guestMode={!session}>
        {children}
      </TranscribeLayoutContent>
    </ModelProvider>
  )
}
