import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Message } from "@/types/transcription";
import { addMessageToSession } from "@/lib/utils/get-transcription-session";

async function getTranscription({
  chatId,
  message,
  selectedModel,
}: {
  chatId: string;
  message: Message;
  selectedModel: string;
}) {
  if (!message.audioPath) {
    throw new Error("Percorso audio non trovato");
  }

  console.log("Fetching audio from:", message.audioPath);

  const response = await fetch(message.audioPath);
  if (!response.ok) {
    throw new Error(await response.text());
  }

  const buffer = await response.arrayBuffer();
  const fileName = message.audioName || `audio_${Date.now()}.wav`;
  const type = response.headers.get("content-type") || "audio/wav";

  const fileInfo = {
    buffer: Array.from(new Uint8Array(buffer)),
    fileName,
    type,
    model: selectedModel,
  };

  const res = await fetch(`/api/transcribe/${chatId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileInfo }),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

async function requestGuestMessage({
  chatId,
  file,
  selectedModel,
}: {
  chatId: string;
  file: File;
  selectedModel: string;
}) {
  const audioMessage: Message = {
    id: `temp-${Date.now()}`,
    type: "USER",
    content: `File audio: ${file.name}`,
    audioPath: URL.createObjectURL(file),
    audioName: file.name,
    audioSize: file.size,
    modelName: selectedModel,
    timestamp: new Date(),
  };

  addMessageToSession(chatId, audioMessage);
  return audioMessage;
}

async function requestUserMessage({
  chatId,
  file,
  selectedModel,
}: {
  chatId: string;
  file: File;
  selectedModel: string;
}) {
  const formData = new FormData();
  formData.append("audio", file);
  formData.append("model", selectedModel);

  const res = await fetch(`/api/chats/${chatId}/messages`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

async function updateTitle(title: string, chatId: string): Promise<{ success: boolean, chat?: any }> {
  const res = await fetch(`/api/chats/${chatId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();

}

export function useChatMutation(chatId: string, isGuest: boolean, selectedModel: string) {
  const queryClient = useQueryClient();

  const transcribeMessage = useMutation({
    mutationFn: (message: Message) =>
      getTranscription({ chatId, message, selectedModel }),
    onSuccess: async (data) => {
        if(isGuest){
            addMessageToSession(chatId, data.message);
        } else {
            const title = data.message.content.substring(0, 25);
            const updatedChat = await updateTitle(title, chatId);
            if (updatedChat.success) {
                queryClient.invalidateQueries({ queryKey: ["chats", "user"] });
            }
        }
        queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
        toast.success("Trascrizione completata");
    },
    onError: (error: Error) => {
      console.error("Errore durante la trascrizione:", error);
      toast.error(error.message || "Errore durante la trascrizione");
    },
  });

  const requestMessage = useMutation({
    mutationFn: (file: File) =>
      isGuest
        ? requestGuestMessage({ chatId, file, selectedModel })
        : requestUserMessage({ chatId, file, selectedModel }),
    onSuccess: (data) => {
        transcribeMessage.mutate(data);
        queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
    },
    onError: (error: Error) => {
      console.error("Errore nell'invio del messaggio:", error);
      toast.error(error.message || "Errore nell'invio del messaggio");
    },
  });

  return { requestMessage, transcribeMessage };
}
