import { TranscriptionMessage } from "@/types/transcription";
import { useQuery } from "@tanstack/react-query";
import { TranscriptionChat } from "./use-transcription-chat/types";
import { loadGuestChats } from "./use-transcription-chat/guest";
import { getTranscriptionSession } from "@/lib/utils/get-transcription-session";

const fetchUserChat = async (chatId: string): Promise<TranscriptionChat> => {
	try {
		const response = await fetch(`/api/chats/${chatId}`);

		if (!response.ok) {
			throw new Error("Errore nel caricamento della chat per l'utente");
		}

		return await response.json();
	} catch (error) {
		throw new Error("Errore nel caricamento della chat per l'utente: " + error);
	}
};

async function loadGuestChat(chatId: string): Promise<TranscriptionChat> {
    const sessionParams = getTranscriptionSession(chatId);
    
    if (!sessionParams) {
        throw new Error("Sessione scaduta o non trovata");
    }

    return sessionParams;
}

export const useTranscriptionData = (chatId: string, isGuest: boolean) => {
	return useQuery<TranscriptionChat>({
		queryKey: ["chat", chatId],
		queryFn: () => (isGuest ? loadGuestChat(chatId) : fetchUserChat(chatId)),
		retry: 1,
		refetchOnWindowFocus: false,
	});
};