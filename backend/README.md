# Backend - Speech-to-Text App (Refactored)

## Descrizione generale

Il backend refactorizzato dell'applicazione Speech-to-Text implementa un'architettura modulare e scalabile seguendo i principi SOLID. Questa versione migliorata offre gestione dinamica dei modelli, interfacce ben definite e documentazione completa.

## Principi SOLID Implementati

### 1. Single Responsibility Principle (SRP)
- **ASRModelManager**: Gestisce esclusivamente la configurazione dei modelli
- **Wav2Vec2Service**: Si occupa solo della trascrizione con Wav2Vec2
- **WhisperService**: Si occupa solo della trascrizione con Whisper
- **Router separati**: Ogni router gestisce un singolo dominio funzionale

### 2. Open/Closed Principle (OCP)
- **ASRServiceInterface**: Interfaccia estendibile per nuovi provider ASR
- **Architettura modulare**: Facilità di aggiunta di nuovi modelli senza modificare codice esistente

### 3. Liskov Substitution Principle (LSP)
- I servizi Wav2Vec2 e Whisper sono intercambiabili tramite l'interfaccia comune
- Consistenza nel comportamento tra implementazioni diverse

### 4. Interface Segregation Principle (ISP)
- **ASRServiceInterface**: Interfaccia focalizzata con metodi specifici per ASR
- Router con responsabilità ben separate

### 5. Dependency Inversion Principle (DIP)
- I router dipendono dalle astrazioni (interfacce) non dalle implementazioni concrete
- Dependency injection tramite il pattern Singleton per il ModelManager

## Nuove Funzionalità

### Gestione Dinamica dei Modelli

#### Wav2Vec2
- **Modelli disponibili**: `facebook`, `jonatas`
- **Modello default**: `facebook` (facebook/wav2vec2-large-xlsr-53-italian)
- **Cambio modello**: `POST /models/wav2vec2/update`

#### Whisper
- **Modelli disponibili**: `tiny`, `base`, `small`, `medium`, `large`
- **Modello default**: `base`
- **Cambio modello**: `POST /models/whisper/update`

### Nuovi Endpoint

```
GET  /models/status              # Stato di tutti i modelli
GET  /models/wav2vec2/current    # Modello Wav2Vec2 attuale
POST /models/wav2vec2/update     # Cambia modello Wav2Vec2
GET  /models/whisper/current     # Modello Whisper attuale
POST /models/whisper/update      # Cambia modello Whisper
GET  /wav2vec2/model-info        # Info modello Wav2Vec2 corrente
GET  /whisper/model-info         # Info modello Whisper corrente
```

### Esempio di Cambio Modello

```bash
# Cambia a modello Wav2Vec2 leggero
curl -X POST "http://localhost:8000/models/wav2vec2/update" \
     -H "Content-Type: application/json" \
     -d '{"model_name": "jonatas"}'

# Cambia a Whisper small
curl -X POST "http://localhost:8000/models/whisper/update" \
     -H "Content-Type: application/json" \
     -d '{"model_name": "small"}'
```

## Architettura Refactorizzata

```
backend/
├── app/
│   ├── interfaces/
│   │   ├── __init__.py
│   │   └── asr_interface.py          # Interfaccia ASR comune
│   ├── models/
│   │   ├── __init__.py
│   │   ├── transcribe.py            # Schema response
│   │   └── model_manager.py         # Manager centralizzato modelli
│   ├── services/
│   │   ├── __init__.py
│   │   ├── wav2vec_service.py       # Servizio Wav2Vec2 refactorizzato
│   │   └── whisper_service.py       # Servizio Whisper refactorizzato
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── route_wav2vec2.py        # Router Wav2Vec2 documentato
│   │   ├── route_whisper.py         # Router Whisper documentato
│   │   ├── route_models.py          # NUOVO: Gestione modelli
│   │   └── health.py               # Health check
│   ├── utils/
│   │   ├── __init__.py
│   │   └── audio_utils.py          # Utilities audio documentate
│   ├── config.py                   # Configurazione semplificata
│   └── main.py                     # App principale documentata
├── requirements.txt
└── run.py
```

## Documentazione API

Tutte le funzioni seguono ora lo standard Google Style:

```python
def transcribe(self, audio_bytes: bytes) -> str:
    """
    Trascrivi audio bytes in testo utilizzando Wav2Vec2.

    Args:
        audio_bytes: Array di bytes contenente l'audio da trascrivere.

    Returns:
        Stringa contenente la trascrizione dell'audio.

    Raises:
        Exception: Se si verifica un errore durante la trascrizione.
    """
```

## Miglioramenti Implementati

### Eliminazione Codice Duplicato
- Centralizzazione logica comune in utilities
- Pattern Template Method per processing audio
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