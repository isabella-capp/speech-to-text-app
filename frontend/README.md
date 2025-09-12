
# Frontend - Speech-to-Text App

## Descrizione generale

La cartella `frontend` contiene l'interfaccia utente dell'applicazione Speech-to-Text, sviluppata con Next.js e React. Il frontend è progettato per offrire un'esperienza moderna, intuitiva e responsiva, facilitando la trascrizione automatica di file audio e la gestione delle interazioni utente.

## Funzionalità principali

- **Autenticazione**: Supporto per login tramite provider OAuth (Google, GitHub), gestione sicura delle sessioni utente e protezione delle rotte sensibili.
- **Registrazione e upload audio**: Componenti dedicati per la registrazione audio direttamente dal browser e per l'upload di file audio locali.
- **Chat di trascrizione**: Interfaccia conversazionale che consente agli utenti di inviare audio e ricevere trascrizioni, con visualizzazione cronologica dei messaggi.
- **Gestione trascrizioni**: Salvataggio, visualizzazione e recupero delle trascrizioni associate a ciascun utente.
- **Sidebar e navigazione**: Layout dinamico con sidebar per la navigazione tra le diverse sezioni dell'app (trascrizioni, chat, impostazioni, ecc.).
- **UI avanzata**: Utilizzo di componenti personalizzati (badge, card, dialog, toast, skeleton, ecc.) per migliorare l'usabilità e la coerenza visiva.
- **Tema chiaro/scuro**: Possibilità di alternare tra modalità light e dark per una migliore accessibilità.

## Architettura delle API interne

Il frontend implementa un sistema di API interne (API routes di Next.js) per la gestione delle operazioni lato server, tra cui:

- **Gestione utenti**: Registrazione, login, recupero dati utente, aggiornamento profilo.
- **Gestione trascrizioni**: Salvataggio, aggiornamento e recupero delle trascrizioni audio associate agli utenti.
- **Integrazione con FastAPI**: Le richieste di trascrizione audio vengono inviate alle API interne, che a loro volta effettuano chiamate HTTP al backend FastAPI per l'elaborazione e la restituzione del testo trascritto.

Questa architettura consente di:
- Mantenere la logica di business e la sicurezza lato server
- Gestire la persistenza dei dati utente e delle trascrizioni tramite database (Prisma ORM)
- Astrarre la comunicazione con il backend, facilitando l'integrazione e la scalabilità

## Flusso di trascrizione

1. L'utente registra o carica un file audio tramite l'interfaccia.
2. Il file viene inviato ad una API interna (`/api/transcribe`), che si occupa di inoltrare la richiesta al backend FastAPI.
3. FastAPI elabora l'audio e restituisce la trascrizione.
4. La trascrizione viene salvata nel database e visualizzata nella chat dell'utente.

## Gestione dati e sicurezza

- Tutte le informazioni sensibili (dati utente, trascrizioni) sono gestite tramite API interne e salvate in modo sicuro nel database.
- L'autenticazione protegge le rotte e le operazioni critiche.
- La comunicazione tra frontend e backend avviene tramite chiamate HTTP sicure.

## Componenti principali

- `components/audio/`: Registrazione e upload audio
- `components/chat/`: Chat e visualizzazione trascrizioni
- `components/auth/`: Login e autenticazione
- `lib/db/`: Gestione database e schema Prisma
- `app/api/`: API interne per utenti, chat, trascrizioni

## Conclusione

Il frontend rappresenta il punto di accesso principale per l'utente, orchestrando la raccolta, la gestione e la visualizzazione delle trascrizioni audio, integrando funzionalità avanzate di autenticazione e persistenza dati, e fungendo da ponte tra l'interfaccia utente e il backend FastAPI tramite API interne sicure ed efficienti.
