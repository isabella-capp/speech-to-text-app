# Speech-to-Text App

Applicazione full-stack per la trascrizione automatica di audio in testo e valutazione comparativa dei modelli ASR, che combina un frontend moderno basato su Next.js con un backend FastAPI specializzato in ASR (Automatic Speech Recognition) e analisi delle prestazioni.

## 🎯 Caratteristiche Principali

- **Trascrizione audio multi-modello** con Wav2Vec2 e Whisper
- **Sistema di valutazione avanzato** con metriche WER, CER, accuratezza e similarità
- **Dashboard di analisi** con grafici interattivi e comparazione modelli
- **Confronto trascrizioni** con visualizzazione side-by-side
- **Database persistente** per storico valutazioni e analisi trend
- **Interfaccia utente moderna** e reattiva con supporto mobile
- **Sistema di autenticazione** integrato con OAuth
- **Chat interattiva** per gestione trascrizioni
- **Supporto multilingua** (focalizzato sull'italiano)
- **Architettura modulare** seguendo principi SOLID

## 🔧 Struttura del Progetto

Il progetto è diviso in due parti principali:

### Frontend (`/frontend`)

- **Framework**: Next.js 15.4.5 con React 19.1.0
- **UI/Styling**: 
  - Tailwind CSS
  - Radix UI per componenti accessibili
  - Lucide React per le icone
  - Recharts per visualizzazioni grafiche
- **Gestione State**: 
  - React Query (@tanstack/react-query)
  - Next Auth per autenticazione
  - Prisma per ORM database
- **Caratteristiche**:
  - Registrazione audio in-browser
  - Upload file audio
  - Chat interattiva per le trascrizioni
  - **Sistema di valutazione modelli** con upload audio e ground truth
  - **Dashboard analisi** con grafici WER, CER, tempi inferenza
  - **Confronto trascrizioni** con dialog side-by-side
  - **Tabella valutazioni** con cronologia e filtri
  - **Download audio** direttamente dall'interfaccia
  - Layout responsivo
  - Tema chiaro/scuro

### Backend (`/backend`)

- **Framework**: FastAPI con Uvicorn
- **Architettura**: Design Patterns SOLID, Singleton, Template Method
- **Nuove Funzionalità ASR**:

#### 1. Wav2Vec2 (Modelli Italiani) 
```
Modello Default: facebook/wav2vec2-large-xlsr-53-italian
```

Modelli disponibili:
- **Facebook** (DEFAULT)
  - Nome: `facebook/wav2vec2-large-xlsr-53-italian`
  - Qualità: Alta, Dimensione: Grande
- **Jonatas Grosman**
  - Nome: `jonatasgrosman/wav2vec2-large-xlsr-53-italian`
  - Qualità: Molto alta, Dimensione: Grande

#### 2. Whisper (Modelli Multilingua)
- Implementato tramite `faster-whisper`
- Modelli: tiny, base (default), small, medium, large
- Supporto multilingua con auto-detection

#### 3. Sistema Metriche ASR
- **Modulo utils/metrics.py**: Calcolo WER, CER, accuratezza, similarità
- **Libreria jiwer**: Per metriche standard ASR
- **Decorator timing**: Misurazione automatica tempi inferenza
- **Metriche dettagliate**: Sostituzioni, inserimenti, cancellazioni

## 🚀 Setup e Installazione

### Frontend
```bash
cd frontend
npm install
# Configura database
npx prisma generate
npx prisma db push
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
# Installa dipendenze metriche: jiwer, difflib (incluse)
uvicorn app.main:app --reload
```

## 📝 API Endpoints

### Trascrizione Standard
- `POST /wav2vec2/transcribe`: Trascrizione audio con Wav2Vec2
- `POST /whisper/transcribe`: Trascrizione audio con Whisper

### Trascrizione con Metriche (NUOVO)
- `POST /wav2vec2/transcribe-with-metrics`: Wav2Vec2 + metriche WER/CER
- `POST /whisper/transcribe-with-metrics`: Whisper + metriche WER/CER

### Gestione Modelli (NUOVO)
- `GET /models/status`: Status di tutti i modelli
- `POST /models/wav2vec2/update`: Cambio modello Wav2Vec2
- `POST /models/whisper/update`: Cambio modello Whisper

### API Frontend Interne (NUOVO)
- `GET /api/evaluations`: Recupera cronologia valutazioni
- `POST /api/evaluations`: Salva nuova valutazione
- `POST /api/whisper/transcribe-with-metrics`: Proxy per backend
- `POST /api/wav2vec2/transcribe-with-metrics`: Proxy per backend

## 🎯 Funzionalità di Valutazione (NUOVO)

### 📊 Sistema di Valutazione Modelli
1. **Input**: Upload audio + trascrizione corretta (ground truth)
2. **Processing**: Trascrizione parallela con Whisper e Wav2Vec2  
3. **Analisi**: Calcolo automatico metriche WER, CER, accuratezza, similarità
4. **Risultati**: Confronto side-by-side con vincitore e miglioramento percentuale
5. **Persistenza**: Salvataggio in database per analisi storica

### 📈 Dashboard Analisi
- **Grafici temporali**: Evoluzione WER/CER nel tempo
- **Confronti diretti**: Bar chart accuratezza per modello
- **Tempi inferenza**: Line chart performance temporali
- **Distribuzione vittorie**: Pie chart vincitori per modello
- **Metriche aggregate**: Cards con statistiche globali

### 🔍 Confronto Trascrizioni
- **Dialog interattivo**: Visualizzazione side-by-side
- **Scrolling sincronizzato**: Per testi lunghi
- **Statistiche dettagliate**: Lunghezza, differenze caratteri
- **Download audio**: Accesso diretto al file originale
- **Metriche in tempo reale**: WER, CER, accuratezza, similarità

### 📋 Tabella Cronologia
- **Filtri dinamici**: Per data, modello, accuracy range
- **Sorting avanzato**: Multi-colonna con indicatori visivi
- **Paginazione**: Per dataset grandi
- **Export capabilities**: Download risultati in CSV/JSON
- **Quick actions**: Preview, delete, compare con pulsanti rapidi

## 🔍 Note sui Modelli e Metriche

### Metriche di Valutazione Implementate

1. **WER (Word Error Rate)**: Percentuale di parole errate rispetto al ground truth
   - Formula: `(S + D + I) / N` dove S=sostituzioni, D=cancellazioni, I=inserimenti, N=parole totali
   - Range: 0% (perfetto) a >100% (molti inserimenti)

2. **CER (Character Error Rate)**: Percentuale di caratteri errati
   - Più granulare del WER, utile per analisi dettagliate
   - Meno sensibile a errori di segmentazione parole

3. **Accuratezza**: `1 - WER` (limitata a 0 per WER > 1)
   - Interpretazione diretta della performance

4. **Similarità Letterale**: Ratio di Levenshtein distance normalizzata
   - Misura similarità generale tra testi indipendentemente da segmentazione

## 🏗️ Architettura e Design Patterns

### Backend Architecture
- **Singleton Pattern**: ASRModelManager per gestione centralizzata modelli
- **Template Method**: ProcessingTemplate per workflow comune trascrizione
- **Dependency Injection**: Interfacce ASR per intercambiabilità servizi
- **Strategy Pattern**: Selezione algoritmo trascrizione runtime
- **Decorator Pattern**: Measurement timing e logging automatico

### Frontend Architecture  
- **Component Composition**: Componenti UI modulari e riutilizzabili
- **Custom Hooks**: useMetrics, useMetricsMutation per state management
- **API Layer**: Separazione logica tra UI e backend calls
- **Type Safety**: TypeScript strict per interfacce e dati metriche

## �📦 Requisiti di Sistema

### Frontend
- Node.js 18+
- NPM o Yarn  
- Browser con supporto MediaRecorder API

### Backend
- Python 3.10+
- GPU consigliata (CUDA) per performance ottimali
- FFmpeg per processing audio
- 4GB+ RAM per modelli large
- Spazio disco: 2GB+ per cache modelli

### Database
- SQLite (default) o PostgreSQL per production
- Prisma ORM per gestione schema

## 🔧 Variabili Ambiente

### Frontend (.env.local)
```env
# Database
DATABASE_URL="file:./dev.db"

# Auth (NextAuth.js)
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-secret"
GITHUB_ID="your-github-id"  
GITHUB_SECRET="your-github-secret"

# Backend Connection
BACKEND_BASE_URL="http://localhost:8000"
```

### Backend (config.py)
```python
# Modelli Default
DEFAULT_WAV2VEC2_MODEL = "facebook"
DEFAULT_WHISPER_MODEL = "base"

# Performance
MAX_AUDIO_SIZE_MB = 50
ENABLE_GPU = True
CACHE_MODELS = True
```

## 🔐 Setup Completo

### 1. Clona Repository
```bash
git clone <repository-url>
cd speech-to-text-app
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup  
```bash
cd frontend
npm install
cp .env.example .env.local
# Configura variabili in .env.local
npx prisma generate
npx prisma db push
npm run dev
```

### 4. Primo Utilizzo
1. Apri `http://localhost:3000`
2. Registrati/Login con provider OAuth
3. Vai a `/transcribe/evaluate` per testing modelli
4. Upload audio + ground truth per prime valutazioni
5. Visualizza risultati in `/transcribe/evaluate/dashboard`

## 📄 Licenza

MIT

---

Per domande o problemi, apri una issue su GitHub.
