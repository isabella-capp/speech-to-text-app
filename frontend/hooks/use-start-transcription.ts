import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { TranscriptionChat } from "./use-transcription-chat/types";
import { createTranscriptionSession } from "@/lib/utils/get-transcription-session";

async function startTranscriptionChat({
  file,
  selectedModel
}: {
  file: File;
  selectedModel: string;
}) {
  const formData = new FormData()
  formData.append("audio", file)
  formData.append("model", selectedModel)

  const response = await fetch(`/api/transcribe`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(errorData)
  }

  const result = await response.json()
  return result 
}

export function useStartTranscription(isGuest: boolean) {
  const startTranscription = useMutation({
    mutationFn: ({ file, selectedModel }: { file: File; selectedModel: string }) =>
      startTranscriptionChat({ file, selectedModel }),
    onSuccess: (data) => {
      if (isGuest) {
        const chatData: TranscriptionChat = {
          ...data.chat,
          timestamp: new Date(),
        }
        const sessionId = createTranscriptionSession(chatData);
        window.location.href = `/transcribe/chat/${sessionId}`
      } else {
        if (data.chat.id) {
          const targetPath = `/transcribe/chat/${data.chat.id}`
          window.location.href = targetPath
        }
      }
    },
    onError: (error: Error) => {
      console.error("Errore durante l'avvio della trascrizione:", error);
      toast.error(error.message || "Errore durante l'avvio della trascrizione");
    },
  });

  return { startTranscription };
}
