# Backend - Speech-to-Text App (Refactored + Metrics)

## Descrizione generale

Il backend refactorizzato dell'applicazione Speech-to-Text implementa un'architettura modulare e scalabile seguendo i principi SOLID. Questa versione migliorata offre **gestione dinamica dei modelli**, **sistema di metriche ASR avanzato**, interfacce ben definite e documentazione completa.

## 🎯 Nuove Funzionalità Metriche

### Sistema di Valutazione ASR
- **Calcolo WER/CER automatico** con libreria jiwer
- **Misurazione tempi inferenza** con decorator dedicato  
- **Metriche dettagliate**: sostituzioni, inserimenti, cancellazioni, accuratezza
- **Similarità letterale** con algoritmo Levenshtein
- **Supporto ground truth** per valutazione comparativa

### Endpoint con Metriche
```python
POST /wav2vec2/transcribe-with-metrics    # Wav2Vec2 + WER/CER
POST /whisper/transcribe-with-metrics     # Whisper + WER/CER
```

### Struttura Response Metriche
```python
{
    "text": "trascrizione generata",
    "inference_time": 2.34,
    "metrics": {
        "wer": 0.12,
        "cer": 0.08,
        "accuracy": 0.88,
        "similarity_ratio": 0.92,
        "word_substitutions": 3,
        "word_insertions": 1,
        "word_deletions": 2
    },
    "model_info": {
        "name": "facebook/wav2vec2-large-xlsr-53-italian",
        "size": "large"
    }
}
```

## 🏗️ Design Patterns Implementati

### 1. Singleton Pattern
**Classe**: `ASRModelManager`
- **Scopo**: Gestione centralizzata configurazione modelli
- **Benefici**: Stato globale consistente, evita inizializzazioni multiple
- **Implementazione**: Lazy initialization con flag `_initialized`

```python
class ASRModelManager:
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
```

### 2. Template Method Pattern  
**Applicazione**: Processing workflow trascrizioni
- **Metodo template**: `transcribe_with_metrics()`
- **Step customizzabili**: preprocessing, inference, postprocessing
- **Benefici**: Workflow standardizzato, customizzazione punti specifici

### 3. Strategy Pattern
**Implementazione**: Selezione modelli runtime
- **Contesto**: Router endpoints
- **Strategie**: Wav2Vec2Service, WhisperService
- **Benefici**: Intercambiabilità algoritmi, estendibilità

### 4. Decorator Pattern
**Modulo**: `utils/metrics.py`
- **Decorators**: `@measure_inference_time`
- **Applicazione**: Timing automatico funzioni trascrizione
- **Benefici**: Separazione concerns, misurazione trasparente

```python
@measure_inference_time
async def transcribe_internal(self, audio_bytes: bytes) -> str:
    # Logica trascrizione
    return result
```

### 5. Dependency Injection Pattern
**Implementazione**: Interfacce ASR
- **Astrazioni**: `ASRServiceInterface`
- **Implementazioni**: Services concreti
- **Injection**: Tramite constructor/factory methods
- **Benefici**: Testabilità, loose coupling, mockability

## 🎯 Principi SOLID Implementati

Il backend è progettato seguendo rigorosamente i **principi SOLID** per garantire codice mantenibile, estendibile e testabile:

### 1. **Single Responsibility Principle (SRP)** ✅
Ogni classe ha una singola responsabilità ben definita:

```python
# ✅ ASRModelManager - Solo gestione configurazione modelli
class ASRModelManager:
    def get_wav2vec2_model_name(self) -> str: ...
    def set_wav2vec2_model(self, model: str) -> bool: ...
    def get_supported_models(self) -> Dict: ...

# ✅ Wav2Vec2Service - Solo logica trascrizione Wav2Vec2  
class Wav2Vec2Service(ASRServiceInterface):
    async def transcribe(self, audio_bytes: bytes) -> str: ...
    async def transcribe_with_metrics(self, audio_bytes, reference) -> Dict: ...

# ✅ MetricsCalculator - Solo calcolo metriche ASR
def calculate_wer(reference: str, hypothesis: str) -> float: ...
def calculate_cer(reference: str, hypothesis: str) -> float: ...
```

**Benefici**: 
- Facilità di manutenzione e testing
- Bassa complessità ciclomatica
- Responsabilità chiaramente separate

### 2. **Open/Closed Principle (OCP)** ✅
Il sistema è aperto all'estensione ma chiuso alle modificazioni:

```python
# ✅ Nuovi modelli ASR senza modificare codice esistente
class NewASRService(ASRServiceInterface):
    """Nuovo servizio ASR (es. Vosk, DeepSpeech) senza modifiche esistenti"""
    async def transcribe(self, audio_bytes: bytes) -> str:
        # Implementazione specifica del nuovo modello
        pass

# ✅ Estensione metriche senza modificare funzioni base
def calculate_advanced_metrics(reference: str, hypothesis: str) -> Dict:
    """Nuove metriche (BLEU, METEOR) riutilizzando base esistente"""
    base_metrics = calculate_detailed_metrics(reference, hypothesis)
    # Aggiunta nuove metriche
    return {**base_metrics, "bleu": calculate_bleu(...)}
```

**Implementazione**:
- **Abstract Base Classes**: `ASRServiceInterface` definisce contratti estendibili
- **Plugin Architecture**: Nuovi servizi implementano interfaccia senza modifiche
- **Metrics Pipeline**: Sistema modulare per aggiungere nuove metriche

### 3. **Liskov Substitution Principle (LSP)** ✅
Le implementazioni concrete sono completamente sostituibili:

```python
# ✅ Perfetta sostituibilità tra servizi ASR
def process_transcription(service: ASRServiceInterface, audio: bytes) -> Dict:
    """Funziona identicamente con qualsiasi implementazione ASR"""
    return await service.transcribe_with_metrics(audio, reference_text)

# Utilizzo intercambiabile:
wav2vec_service = Wav2Vec2Service()      # ✅ Implementazione concreta
whisper_service = WhisperService()       # ✅ Implementazione concreta

# Entrambi rispettano il contratto dell'interfaccia:
result1 = await process_transcription(wav2vec_service, audio_data)
result2 = await process_transcription(whisper_service, audio_data)
# Struttura response identica garantita dall'interfaccia
```

**Garanzie**:
- **Contratti Rispettati**: Tutti i metodi astratti implementati correttamente
- **Comportamento Consistente**: Response format uniforme tra implementazioni
- **Precondizioni/Postcondizioni**: Stesse aspettative input/output

### 4. **Interface Segregation Principle (ISP)** ✅
Interfacce specifiche e coese, senza metodi non necessari:

```python
# ✅ Interfaccia focalizzata solo su operazioni ASR essenziali
class ASRServiceInterface(ABC):
    @abstractmethod
    async def transcribe(self, audio_bytes: bytes) -> str:
        """Core transcription - tutti i servizi ASR la implementano"""
        
    @abstractmethod
    async def transcribe_with_metrics(self, audio_bytes: bytes, 
                                    reference_text: Optional[str] = None) -> Dict:
        """Transcription + metrics - funzionalità valutazione"""
        
    @abstractmethod
    def get_model_info(self) -> Dict[str, Any]:
        """Model metadata - info configurazione"""

# ❌ Evitato: interfaccia monolitica con responsabilità multiple
# class MonolithicASRInterface(ABC):
#     @abstractmethod
#     async def transcribe(self, audio_bytes: bytes) -> str: ...
#     @abstractmethod 
#     def train_model(self, dataset): ...          # Non tutti i servizi trainano
#     @abstractmethod
#     def deploy_to_cloud(self, config): ...       # Non tutti deployano
#     @abstractmethod
#     def manage_database(self, query): ...        # Non gestione DB
```

**Principi Applicati**:
- **Coesione Alta**: Metodi correlati alle operazioni ASR core
- **Nessuna Dipendenza Forzata**: Client usano solo metodi necessari
- **Segregazione Funzionale**: Interfacce separate per concerns diversi

### 5. **Dependency Inversion Principle (DIP)** ✅
Dipendenza da astrazioni, non da implementazioni concrete:

```python
# ✅ Router dipende da astrazione, non implementazione concreta
class ASRRouter:
    def __init__(self, asr_service: ASRServiceInterface):  # Dipendenza da interfaccia
        self.asr_service = asr_service
    
    async def handle_transcription(self, audio_bytes: bytes) -> Dict:
        # Usa astrazione, funziona con qualsiasi implementazione
        return await self.asr_service.transcribe_with_metrics(audio_bytes)

# ✅ Dependency Injection in practice
def create_wav2vec_router() -> ASRRouter:
    """Factory function per dependency injection"""
    wav2vec_service = Wav2Vec2Service()  # Implementazione concreta
    return ASRRouter(wav2vec_service)    # Injection nell'astrazione

def create_whisper_router() -> ASRRouter:
    """Stesso router, diversa implementazione"""
    whisper_service = WhisperService()   # Diversa implementazione concreta
    return ASRRouter(whisper_service)    # Stessa interface, diverso comportamento
```

**Architettura Risultante**:
```
High-level modules (Routers, Controllers)
         ↓ depends on ↓  
    Abstractions (ASRServiceInterface)
         ↑ implemented by ↑
Low-level modules (Wav2Vec2Service, WhisperService)
```

**Benefici SOLID Combinati**:
- **Manutenibilità**: Modifiche localizzate, impatto limitato
- **Testabilità**: Mock facili tramite interfacce
- **Scalabilità**: Nuovi servizi senza refactoring esistente  
- **Riusabilità**: Componenti intercambiabili e modulari
- **Robustezza**: Separazione concerns riduce accoppiamento

## 📊 Modulo Metriche - `utils/metrics.py`

### Funzioni Principali

#### 1. `calculate_wer(reference: str, hypothesis: str) -> float`
- Calcola Word Error Rate usando jiwer
- Gestione edge cases (testo vuoto, reference vuoto)
- Normalizzazione automatica testi

#### 2. `calculate_cer(reference: str, hypothesis: str) -> float` 
- Calcola Character Error Rate
- Processing carattere per carattere
- Sensibilità a punteggiatura/spaziatura

#### 3. `get_detailed_metrics(reference: str, hypothesis: str) -> Dict`
- Metriche complete: WER, CER, accuracy, similarity
- Dettaglio operazioni: sostituzioni, inserimenti, cancellazioni
- Statistiche conteggio parole/caratteri

#### 4. `@measure_inference_time` (Decorator)
- Misurazione automatica tempi esecuzione
- Supporto funzioni sync/async
- Precisione sub-millisecondi con `time.perf_counter()`

### Preprocessing Pipeline
```python
transform = jiwer.Compose([
    jiwer.ToLowerCase(),           # Normalizza case
    jiwer.RemovePunctuation(),     # Rimuove punteggiatura  
    jiwer.RemoveMultipleSpaces(),  # Normalizza spazi
    jiwer.Strip()                  # Trim whitespace
])
```

## 🚀 Gestione Dinamica Modelli

### Wav2Vec2 Models Configuration
```python
# facebook/wav2vec2-large-xlsr-53-italian (DEFAULT)
"facebook": {
    "name": "facebook/wav2vec2-large-xlsr-53-italian",
    "description": "Modello ufficiale Facebook per l'italiano", 
    "quality": "alto",
    "size": "grande",
    "language": "it"
}

# jonatasgrosman/wav2vec2-large-xlsr-53-italian  
"jonatas": {
    "name": "jonatasgrosman/wav2vec2-large-xlsr-53-italian",
    "description": "Modello fine-tuned specifico per l'italiano",
    "quality": "molto alto", 
    "size": "grande",
    "language": "it"
}
```

### Whisper Models Configuration
```python
ModelSize.TINY: {
    "name": "tiny",
    "description": "Modello più piccolo e veloce",
    "quality": "basso",
    "size": "39 MB"
}
ModelSize.BASE: {  # DEFAULT
    "name": "base", 
    "description": "Modello bilanciato",
    "quality": "medio",
    "size": "142 MB"
}
# ... small, medium, large
```

## 📝 API Endpoints Completa

### Trascrizione Standard
```http
POST /wav2vec2/transcribe
POST /whisper/transcribe
Content-Type: multipart/form-data
Body: file=@audio.wav
```

### Trascrizione con Metriche (NUOVO)
```http
POST /wav2vec2/transcribe-with-metrics  
POST /whisper/transcribe-with-metrics
Content-Type: multipart/form-data
Body: 
  file=@audio.wav
  reference_text="trascrizione corretta" (optional)
```

### Gestione Modelli (NUOVO)
```http
GET  /models/status                    # Status tutti modelli
GET  /models/wav2vec2/current         # Modello Wav2Vec2 attuale  
POST /models/wav2vec2/update          # Cambia modello Wav2Vec2
GET  /models/whisper/current          # Modello Whisper attuale
POST /models/whisper/update           # Cambia modello Whisper
```

### Health Check
```http
GET /health                           # Status generale applicazione
### Esempio Uso API con Metriche

```bash
# Trascrizione con calcolo WER/CER automatico
curl -X POST "http://localhost:8000/wav2vec2/transcribe-with-metrics" \
     -F "file=@audio.wav" \
     -F "reference_text=ciao mondo come stai"

# Response:
{
  "text": "ciao mondo come sta",
  "inference_time": 2.34,
  "metrics": {
    "wer": 0.25,                    # 1 parola sbagliata su 4
    "cer": 0.05,                    # 1 carattere sbagliato su 20  
    "accuracy": 0.75,               # 1 - WER
    "similarity_ratio": 0.95,       # Similarità letterale
    "word_substitutions": 1,        # "stai" -> "sta"
    "word_insertions": 0,
    "word_deletions": 0,
    "word_hits": 3                  # Parole corrette
  },
  "model_info": {
    "name": "facebook/wav2vec2-large-xlsr-53-italian",
    "current_model": "facebook",
    "size": "large"
  }
}
```

## 🏗️ Architettura Refactorizzata

```
backend/
├── app/
│   ├── interfaces/
│   │   ├── __init__.py
│   │   └── asr_interface.py          # Interfaccia ASR comune
│   ├── models/
│   │   ├── __init__.py
│   │   ├── transcribe.py            # Schema response  
│   │   └── model_manager.py         # NUOVO: Manager centralizzato modelli
│   ├── services/
│   │   ├── __init__.py
│   │   ├── asr_services.py          # Service aggregator
│   │   ├── wav2vec_service.py       # Servizio Wav2Vec2 refactorizzato
│   │   └── whisper_service.py       # Servizio Whisper refactorizzato
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── route_wav2vec2.py        # Router Wav2Vec2 + metriche
│   │   ├── route_whisper.py         # Router Whisper + metriche
│   │   ├── route_models.py          # NUOVO: Gestione modelli
│   │   └── health.py               # Health check
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── audio_utils.py          # Utilities audio
│   │   └── metrics.py              # NUOVO: Modulo metriche ASR
│   ├── config.py                   # Configurazione semplificata
│   └── main.py                     # App principale documentata
├── requirements.txt                # Include: jiwer, difflib, transformers
└── run.py                         # Entry point
```

## 📚 Documentazione API

Tutte le funzioni seguono lo standard Google Style con typing completo:

```python
async def transcribe_with_metrics(
    self, 
    audio_bytes: bytes, 
    reference_text: Optional[str] = None
) -> Dict[str, Any]:
    """
    Trascrivi audio e calcola metriche di valutazione.

    Args:
        audio_bytes: Array di bytes contenente l'audio da trascrivere.
        reference_text: Testo di riferimento per calcolo WER/CER (opzionale).

    Returns:
        Dizionario contenente:
        - text: Trascrizione dell'audio
        - inference_time: Tempo di inferenza in secondi
        - metrics: Metriche WER, CER se reference_text è fornito
        - model_info: Informazioni sul modello utilizzato

    Raises:
        Exception: Se si verifica un errore durante la trascrizione.
    """
```

## ⚡ Performance e Ottimizzazioni

### Cache Management
- **Lazy Loading**: Modelli caricati solo al primo utilizzo
- **Memory Reuse**: Riutilizzo istanze modelli tra richieste
- **Model Caching**: Conservazione modelli pre-caricati in memoria

### Error Handling
- **Graceful Degradation**: Fallback su metriche parziali se errori
- **Timeout Management**: Gestione timeout inferenza modelli grandi
- **Resource Cleanup**: Cleanup automatico risorse GPU

### Logging Strutturato
```python
import logging
logger = logging.getLogger(__name__)

# Esempio log con metriche
logger.info(f"Transcription completed", extra={
    "model": "wav2vec2",
    "inference_time": 2.34,
    "wer": 0.12,
    "audio_length": 30.5
})
```

## 🛠️ Setup e Deployment

### Requisiti Sistema
```bash
# Python 3.10+
python --version

# GPU Support (opzionale ma raccomandato)
nvidia-smi

# FFmpeg per audio processing
ffmpeg -version
```

### Installazione Dipendenze
```bash
# Virtual environment  
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Core dependencies
pip install -r requirements.txt

# Verifica installazione metriche
python -c "import jiwer; print('jiwer OK')"
```

### Configurazione Modelli
```python
# config.py - Configurazione default
DEFAULT_WAV2VEC2_MODEL = "facebook"  # o "jonatas" 
DEFAULT_WHISPER_MODEL = ModelSize.BASE  # TINY, BASE, SMALL, MEDIUM, LARGE

# Abilitazione GPU
USE_GPU = True
TORCH_DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
```

### Avvio Applicazione
```bash
# Development
python run.py
# o 
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production  
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 🧪 Testing e Validazione

### Test Unitari Metriche
```python
# test_metrics.py (suggerito)
def test_wer_calculation():
    reference = "ciao mondo"
    hypothesis = "ciao mondo"
    assert calculate_wer(reference, hypothesis) == 0.0

def test_cer_edge_cases():
    assert calculate_cer("", "") == 0.0
    assert calculate_cer("test", "") == 1.0
```

### Benchmark Performance
```bash
# Test carico endpoint metriche
curl -X POST "http://localhost:8000/wav2vec2/transcribe-with-metrics" \
     -F "file=@test_audio.wav" \
     -F "reference_text=testo di test" \
     -w "Time: %{time_total}s\n"
```

## 🔧 Troubleshooting

### Problemi Comuni

#### 1. Out of Memory (GPU)
```python
# Riduzione batch size modelli
torch.cuda.empty_cache()  # Cleanup memoria GPU
# Switcha a modelli più piccoli: tiny, base
```

#### 2. Slow Inference  
```python
# Verifica utilizzo GPU
print(f"Using device: {torch.cuda.is_available()}")
# Considera modelli più piccoli per speed/accuracy trade-off
```

#### 3. Metriche NaN
```python
# Verifica reference_text non vuoto
if not reference_text or not reference_text.strip():
    return {"metrics": None}
```

## 📊 Monitoring e Observability

### Health Checks
```http
GET /health
Response: {
  "status": "healthy",
  "models": {
    "wav2vec2": "loaded",
    "whisper": "loaded"  
  },
  "gpu_available": true,
  "memory_usage": "2.1GB"
}
```

### Metrics Collection
```python
# Suggerimenti integrazione monitoring
import time
import psutil

def log_performance_metrics():
    return {
        "cpu_percent": psutil.cpu_percent(),
        "memory_percent": psutil.virtual_memory().percent,
        "gpu_memory": torch.cuda.memory_allocated() if torch.cuda.is_available() else 0
    }
```
- Manager singleton per configurazione modelli

### Gestione Errori Migliorata
- Exception handling specifico per tipo di errore
- Logging dettagliato per debugging
- Fallback graceful per operazioni critiche

### Performance Ottimizzate
- Lazy loading dei modelli
- Riuso istanze quando possibile
- Caching configurazioni modelli

### Testabilità
- Interfacce mockabili
- Dependency injection
- Separazione responsabilità

## Configurazione Default

```python
# Modelli di default
DEFAULT_WAV2VEC2_MODEL = "facebook"  # Bilanciato
DEFAULT_WHISPER_MODEL = ModelSize.BASE  # Ottimo compromise size/quality
```

## Comandi Utili

```bash
# Avvia il server
python run.py

# Verifica stato modelli
curl http://localhost:8000/models/status

# Test trascrizione
curl -X POST "http://localhost:8000/wav2vec2/transcribe" \
     -F "file=@audio.wav"
```

## Note Tecniche

- **Thread Safety**: Tutti i servizi sono thread-safe
- **Memory Management**: Lazy loading previene OOM su deployment limitati
- **Scalabilità**: Architettura pronta per microservizi
- **Monitoring**: Logging strutturato per osservabilità

---

Il refactoring mantiene la compatibilità con il frontend esistente aggiungendo nuove capacità di gestione dinamica dei modelli.