import { useQuery } from "@tanstack/react-query";
import { TranscriptionChat } from "@/types/transcription";
import { loadGuestChats } from "@/lib/utils/get-transcription-session";

const fetchUserChats = async (): Promise<TranscriptionChat[]> => {
  try {
    const response = await fetch(`/api/chats`);

    if (!response.ok) {
      throw new Error("Errore nel caricamento delle chat per l'utente");
    }

    return await response.json();
  } catch (error) {
    throw new Error("Errore nel caricamento delle chat per l'utente: " + error);
  }
};

async function loadAllGuestChats(): Promise<TranscriptionChat[]> {
  const guestChats = loadGuestChats();
  return guestChats;
}

export const useAllChats = (isGuest: boolean) => {
  return useQuery<TranscriptionChat[]>({
    queryKey: ["chats", isGuest ? "guest" : "user"],
    queryFn: () => (isGuest ? loadAllGuestChats() : fetchUserChats()),
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
