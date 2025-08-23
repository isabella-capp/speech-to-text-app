import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { clearTranscriptionSession, clearAllTranscriptionSession } from "@/lib/utils/get-transcription-session";
import { useRouter } from "next/navigation";

// Funzioni per utenti autenticati
export async function deleteUserChat(chatId: string) {
    const res = await fetch(`/api/chats/${chatId}`, { method: "DELETE" });
    if (!res.ok){
        const errorData = await res.json();
        throw new Error(errorData.message || "Errore nell'eliminazione della chat");
    }
}

export async function clearAllUserChats() {
    const res = await fetch('/api/chats', { method: "DELETE" });
    if (!res.ok) throw new Error("Errore nella cancellazione di tutte le chat");
}

export async function deleteGuestChat(chatId: string) {
    clearTranscriptionSession(chatId);
}

export async function clearAllGuestChats() {
    clearAllTranscriptionSession();
}

export function useAllChatMutation(isGuest: boolean) {
    const queryClient = useQueryClient();
    const Router = useRouter();
    const deleteChat = useMutation({
        mutationFn: (chatId: string) =>
            isGuest ? deleteGuestChat(chatId) : deleteUserChat(chatId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chats", isGuest ? "guest" : "user"] });
            Router.push("/transcribe");
            toast.success("Chat eliminata con successo");
        },
        onError: (error: Error) => {
            console.error("Errore durante la cancellazione della chat:", error);
            toast.error(error.message || "Errore durante la cancellazione della chat");
        },
    });

    const clearAllChats = useMutation({
        mutationFn: () =>
            isGuest ? clearAllGuestChats() : clearAllUserChats(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chats", isGuest ? "guest" : "user"] });
            Router.push("/transcribe");
            toast.success("Tutte le chat sono state eliminate con successo");
        },
        onError: (error: Error) => {
            console.error("Errore durante la cancellazione di tutte le chat:", error);
            toast.error(error.message || "Errore durante la cancellazione di tutte le chat");
        }
    });

    return { deleteChat, clearAllChats };
}


