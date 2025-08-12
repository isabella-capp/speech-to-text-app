# Speech-to-Text Backend

Backend FastAPI per applicazione di speech-to-text con supporto per Wav2Vec2 e Whisper.

## Installazione

1. Installa le dipendenze:
```bash
pip install -r requirements.txt
```

## Avvio

### Metodo 1: Script di avvio
```bash
python run.py
```

### Metodo 2: Uvicorn diretto
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Endpoint

- `GET /` - Status del server
- `GET /health` - Health check
- `GET /health/status` - Status dettagliato
- `WS /wav2vec2/ws` - WebSocket per trascrizione Wav2Vec2
- `WS /whisper/ws` - WebSocket per trascrizione Whisper
- `GET /docs` - Documentazione API (Swagger)

## Configurazione

Il server può essere configurato tramite variabili d'ambiente:

- `HOST` - Host del server (default: 127.0.0.1)
- `PORT` - Porta del server (default: 8000)
- `DEBUG` - Modalità debug (default: True)
- `FORCE_CPU` - Forza uso CPU invece di GPU (default: False)
- `WAV2VEC2_MODEL` - Modello Wav2Vec2 (default: facebook/wav2vec2-large-960h-lv60-self)
- `WHISPER_MODEL` - Modello Whisper (default: small)

## Modelli AI

I modelli vengono caricati con lazy loading per migliorare i tempi di avvio:
- **Wav2Vec2**: facebook/wav2vec2-large-960h-lv60-self
- **Whisper**: small (scaricato automaticamente)

## Formato Audio

Il backend accetta audio in formato:
- Sample rate: 16kHz
- Canali: mono
- Formato: PCM 16-bit o file audio supportati da soundfile
