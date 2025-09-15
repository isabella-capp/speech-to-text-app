# Metriche ASR - Implementazione WER, CER e Tempi di Inferenza

Questa implementazione aggiunge supporto per le metriche di valutazione dei modelli ASR (Automatic Speech Recognition) all'applicazione speech-to-text.

## 📊 Metriche Implementate

### Word Error Rate (WER)
- **Formula**: WER = (S + D + I) / N
- **S**: Sostituzioni di parole
- **D**: Cancellazioni di parole  
- **I**: Inserimenti di parole
- **N**: Numero totale di parole nel testo di riferimento

### Character Error Rate (CER)
- **Formula**: CER = (S + D + I) / N
- **S**: Sostituzioni di caratteri
- **D**: Cancellazioni di caratteri
- **I**: Inserimenti di caratteri
- **N**: Numero totale di caratteri nel testo di riferimento

### Tempi di Inferenza
- Misurazione precisa del tempo di elaborazione
- Visualizzazione in millisecondi o secondi
- Confronto tra modelli

## 🏗️ Architettura

### Backend (Python/FastAPI)

#### Nuovo Modulo: `app/utils/metrics.py`
```python
- calculate_wer(reference, hypothesis) -> float
- calculate_cer(reference, hypothesis) -> float  
- calculate_detailed_metrics(reference, hypothesis) -> Dict
- measure_inference_time(func) -> decorator
- format_metrics_for_display(metrics) -> Dict
```

#### Modelli Aggiornati: `app/models/transcribe.py`
```python
class TranscriptionResponse:
    text: str
    inference_time: Optional[float] = None
    metrics: Optional[Dict[str, Any]] = None
    model_info: Optional[Dict[str, Any]] = None

class TranscriptionWithReferenceRequest:
    reference_text: str
```

#### Interfaccia ASR Estesa: `app/interfaces/asr_interface.py`
```python
@abstractmethod
async def transcribe_with_metrics(
    audio_bytes: bytes, 
    reference_text: Optional[str] = None
) -> Dict[str, Any]
```

#### Servizi Aggiornati
- **WhisperService**: Nuovo metodo `transcribe_with_metrics()`
- **Wav2Vec2Service**: Nuovo metodo `transcribe_with_metrics()`

#### Nuovi Endpoint API
- `POST /api/v1/whisper/transcribe-with-metrics`
- `POST /api/v1/wav2vec2/transcribe-with-metrics`

**Parametri**:
- `file`: File audio (multipart/form-data)
- `reference_text`: Testo di riferimento opzionale (form field)

**Risposta**:
```json
{
  "text": "trascrizione ottenuta",
  "inference_time": 1.23,
  "model_info": {
    "model_name": "whisper-base",
    "model_type": "whisper"
  },
  "metrics": {
    "wer": 0.15,
    "cer": 0.08,
    "accuracy": 0.85,
    "similarity_ratio": 0.92,
    "word_count_reference": 10,
    "word_count_hypothesis": 9,
    "word_substitutions": 1,
    "word_deletions": 1,
    "word_insertions": 0
  }
}
```

### Frontend (React/Next.js)

#### Nuovo Hook: `hooks/use-transcription-with-metrics.ts`
```typescript
const {
  transcribe,
  transcribeSimple, 
  transcribeWithReference,
  isTranscribing,
  result,
  error,
  reset
} = useTranscriptionWithMetrics({ apiEndpoint })
```

#### Nuovi Componenti
- **TranscriptionMetrics**: Visualizzazione completa delle metriche
- **MetricsTestPage**: Pagina di test e confronto modelli

#### Nuove Route API
- `/api/whisper/transcribe-with-metrics`
- `/api/wav2vec2/transcribe-with-metrics`

#### Nuova Pagina
- `/metrics`: Interfaccia per test e confronto metriche

## 🚀 Come Utilizzare

### 1. Trascrizione Semplice (solo tempo di inferenza)
```typescript
const result = await transcribeSimple(audioFile)
console.log(`Tempo: ${result.inference_time}s`)
```

### 2. Trascrizione con Metriche
```typescript
const result = await transcribeWithReference(audioFile, "testo di riferimento")
console.log(`WER: ${result.metrics.wer}`)
console.log(`CER: ${result.metrics.cer}`)
```

### 3. Confronto Modelli
La pagina `/metrics` permette di:
- Caricare un file audio
- Inserire un testo di riferimento
- Testare singoli modelli o confrontare Whisper vs Wav2Vec2
- Visualizzare metriche dettagliate

## 📈 Interpretazione Metriche

### WER (Word Error Rate)
- **0.0 - 0.1** (0-10%): Eccellente
- **0.1 - 0.3** (10-30%): Buona
- **0.3 - 0.5** (30-50%): Media
- **> 0.5** (>50%): Scarsa

### CER (Character Error Rate)
- Generalmente inferiore al WER
- Utile per valutare errori di ortografia e punteggiatura

### Tempi di Inferenza
- Dipendono dalla lunghezza dell'audio e dal modello
- Whisper generalmente più lento ma più accurato
- Wav2Vec2 più veloce per audio italiani

## 🔧 Configurazione

### Variabili d'Ambiente (Frontend)
```env
BACKEND_BASE_URL=http://localhost:8000
```

### Dipendenze Backend
Già presenti nel `requirements.txt`:
- torch
- transformers  
- whisper
- numpy

### Dipendenze Frontend
Già presenti nel `package.json`:
- @radix-ui/react-progress
- @radix-ui/react-tabs
- lucide-react

## 🧪 Test

### Test Automatici Consigliati
1. **Test di Unità** per le funzioni di calcolo metriche
2. **Test di Integrazione** per gli endpoint API
3. **Test di Performance** per i tempi di inferenza

### Dataset di Test Suggeriti
- CommonVoice Italian per Wav2Vec2
- LibriSpeech per confronti generali
- Audio registrati manualmente con trascrizioni note

## 📊 Esempi di Output

### Risultato con Metriche
```
WER: 0.15 (15.0%)
CER: 0.08 (8.0%)
Accuracy: 0.85 (85.0%)
Similarity: 0.92 (92.0%)
Inference Time: 1.23 s

Statistiche:
- Parole riferimento: 10
- Parole trascritte: 9  
- Sostituzioni: 1
- Cancellazioni: 1
- Inserimenti: 0
```

## 🔮 Sviluppi Futuri

1. **Metriche Aggiuntive**:
   - BLEU Score
   - Confidence Score
   - Perplexity

2. **Visualizzazioni Avanzate**:
   - Grafici a barre per confronti
   - Timeline delle prestazioni
   - Heat map degli errori

3. **Storage Persistente**:
   - Salvataggio storico delle metriche
   - Analisi trend nel tempo
   - Benchmark database

4. **Ottimizzazioni**:
   - Cache dei risultati
   - Batch processing
   - GPU acceleration metrics