# Speech-to-Text App

Applicazione full-stack per la trascrizione automatica di audio in testo, che combina un frontend moderno basato su Next.js con un backend FastAPI specializzato in ASR (Automatic Speech Recognition).

## 🎯 Caratteristiche Principali

- Trascrizione audio
- Supporto per multiple fonti di ASR (Wav2Vec2 e Whisper)
- Interfaccia utente moderna e reattiva
- Sistema di autenticazione integrato
- Chat per la gestione delle trascrizioni
- Supporto multilingua (focalizzato sull'italiano)

## 🔧 Struttura del Progetto

Il progetto è diviso in due parti principali:

### Frontend (`/frontend`)

- **Framework**: Next.js 15.4.5 con React 19.1.0
- **UI/Styling**: 
  - Tailwind CSS
  - Radix UI per componenti accessibili
  - Lucide React per le icone
- **Gestione State**: 
  - React Query (@tanstack/react-query)
  - Next Auth per autenticazione
- **Caratteristiche**:
  - Registrazione audio in-browser
  - Upload file audio
  - Chat interattiva per le trascrizioni
  - Layout responsivo
  - Tema chiaro/scuro

### Backend (`/backend`)

- **Framework**: FastAPI con Uvicorn
- **Modelli ASR**:

#### 1. Wav2Vec2 (Modelli Italiani)
```
Modello Default: facebook/wav2vec2-large-xlsr-53-italian
```

Modelli disponibili:
- **Facebook** (DEFAULT)
  - Nome: `facebook/wav2vec2-large-xlsr-53-italian`
  - Qualità: Alta
  - Dimensione: Grande

- **Jonatas Grosman**
  - Nome: `jonatasgrosman/wav2vec2-large-xlsr-53-italian`
  - Qualità: Molto alta
  - Dimensione: Grande

- **Lightweight**
  - Nome: `leandroreturns/wav2vec2-xlsr-italian`
  - Qualità: Media
  - Dimensione: Media

#### 2. Whisper
- Implementato tramite `faster-whisper`
- Supporto per trascrizioni multilingua

## 🚀 Setup e Installazione

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 📝 API Endpoints

### Wav2Vec2
- `POST /wav2vec2/transcribe`: Trascrizione audio con Wav2Vec2
- `GET /wav2vec2/supported-formats`: Formati audio supportati

### Whisper
- `POST /whisper/transcribe`: Trascrizione audio con Whisper
- `GET /whisper/supported-formats`: Formati audio supportati

## 🔍 Note sui Modelli

Il modello predefinito (`facebook/wav2vec2-large-xlsr-53-italian`) è stato scelto per il suo ottimo equilibrio tra accuratezza e performance. È possibile modificare il modello predefinito modificando la variabile `DEFAULT_ITALIAN_MODEL` in `backend/app/models/wav2vec2_models.py`.

### Confronto Modelli

1. **Facebook (Default)**
   - Ottimo per uso generale
   - Bilanciato tra accuratezza e velocità
   - Supporto ufficiale

2. **Jonatas Grosman**
   - Maggiore accuratezza
   - Ottimizzato specificamente per l'italiano
   - Richiede più risorse

3. **Lightweight**
   - Performance più veloce
   - Minore utilizzo di memoria
   - Leggermente meno accurato

## 📦 Requisiti di Sistema

### Frontend
- Node.js 18+
- NPM o Yarn

### Backend
- Python 3.10+
- GPU consigliata per migliori performance
- FFmpeg per la gestione audio

## 🔐 Configurazione

1. **Frontend**
   - Copia `.env.example` in `.env.local`
   - Configura le variabili di ambiente per autenticazione

2. **Backend**
   - Configura le variabili in `app/config.py`
   - Assicurati che FFmpeg sia installato

## 📄 Licenza

MIT

---

Per domande o problemi, apri una issue su GitHub.
