#!/usr/bin/env python3
"""
Script semplificato per valutare tutti i modelli ASR sui file audio.

Versione con requests (sincrona) più semplice da usare.
"""

import os
import requests
import json
import time
from pathlib import Path
from typing import Dict, Any, List
import mimetypes

# Configurazione
BACKEND_URL = "http://127.0.0.1:8000"  # URL del backend Python (modelli ASR)
FRONTEND_URL = "http://localhost:3000"  # URL del frontend Next.js (per salvare in DB)
AUDIO_FOLDER = "../backend/audio"
OUTPUT_FILE = "evaluation_results_simple.json"  # Solo come backup locale

# Testi di riferimento per ogni file audio (PERSONALIZZA QUESTI!)
REFERENCE_TEXTS = {
    "audio_1.mp3": "La frequenza di campionamento dell'audio è fissata a quarantotto kilohertz.",
    "audio_2.mp3": "Il protocollo TCP garantisce l'affidabilità del trasferimento dei dati.",
    "audio_3.mp3": "La latenza della rete si misura in millisecondi.",
    "audio_4.mp3": "Un gemello digitale è una rappresentazione virtuale di un oggetto fisico.",
    "audio_5.mp3": "Il calcolatore elettronico è un sistema digitale di elaborazione dell'informazione, programmabile e general purpose.",
    "audio_6.mp3": "L'algoritmo di ricerca utilizza una struttura dati ad albero binario.",
    "audio_7.mp3": "Nonostante la paura, decise di aprire quella porta misteriosa.",
    "audio_8.mp3": "La voce del narratore riempiva la stanza con un tono calmo e profondo.",
    "audio_9.mp3": "Era una mattina d'inverno e la neve copriva ogni cosa di bianco.",
    "audio_10.mp3": "Camminava veloce, quasi senza respirare, come se qualcuno la stesse inseguendo.",
    "audio_11.opus": "La luna si specchiava silenziosa sul lago immobile.",
    "audio_12.opus": "Il Lonfo non vaterca né gluisce e molto raramente barigatta, ma quando soffia il bego a bisce bisce sdilenca un poco e gnagio s'archipatta. È frusco il Lonfo! È pieno di lupigna arrafferia malversa e sofolenta! Se cionfi ti sbiduglia e ti arrupigna se lugri ti botalla e ti criventa. Eppure il vecchio Lonfo ammargelluto che bete e zugghia e fonca nei trombazzi fa lègica busìa, fa gisbuto; e quasi quasi in segno di sberdazzi gli affarferesti un gniffo. Ma lui zuto t'alloppa, ti sbernecchia; e tu l'accazzi.",
    "audio_13.opus": "Allora, nei sistemi distribuiti, la coerenza dei dati deve essere garantita attraverso protocolli di consenso, come Paxos o Raft, i quali introducono inevitabilmente un compromesso tra disponibilità e tolleranza ai guasti.",
    "audio_14.opus": "Nei moderni algoritmi di apprendimento automatico, l'uso di reti neurali profonde permette l'estrazione automatica di caratteristiche dai dati grezzi, eliminando gran parte della fase manuale di feature engineering.",
    "audio_15.opus": "La virtualizzazione hardware, realizzata attraverso hypervisor di tipo bare-metal o hosted, consente di eseguire più sistemi operativi isolati sulla stessa macchina fisica, migliorando l'utilizzo complessivo delle risorse.",
    "audio_16.opus": "La complessità computazionale di un algoritmo non si misura soltanto in termini di tempo di esecuzione, ma deve considerare anche il consumo di memoria e la scalabilità rispetto alla dimensione dell'input.",
    "audio_17.opus": "L'integrazione continua e il deploy continuo costituiscono pratiche fondamentali nello sviluppo agile, poiché permettono di rilevare rapidamente bug, automatizzare i test e ridurre i tempi di rilascio del software.",
    "audio_18.opus": "Il linguaggio di programmazione Rust viene spesso scelto per applicazioni di sistema ad alte prestazioni, grazie al suo modello di ownership che previene errori di memoria senza necessità di garbage collector.",
    "audio_19.opus": "L'architettura a microservizi, sebbene favorisca la scalabilità orizzontale e l'indipendenza dei team di sviluppo, introduce notevoli complessità legate all'orchestrazione dei container e alla gestione delle comunicazioni asincrone.",
    "audio_20.opus": "L'ottimizzazione delle query in un database relazionale dipende non solo dall'indicizzazione corretta delle tabelle, ma anche dall'ordine di esecuzione dei join e dalla capacità del motore di rilevare sottoselezioni ridondanti.",
}

def get_mime_type(file_path: str) -> str:
    """Ottieni il MIME type del file audio."""
    mime_type, _ = mimetypes.guess_type(file_path)
    if mime_type:
        return mime_type
    
    ext = Path(file_path).suffix.lower()
    mime_types = {
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.opus': 'audio/opus',
        '.m4a': 'audio/mp4',
        '.ogg': 'audio/ogg'
    }
    return mime_types.get(ext, 'audio/mpeg')

def call_model_api(model: str, audio_path: str, reference_text: str) -> Dict[str, Any]:
    """Chiama l'API di un modello specifico."""
    
    url = f"{BACKEND_URL}/{model}/transcribe-with-metrics"
    
    # Prepara i file
    with open(audio_path, 'rb') as audio_file:
        files = {
            'file': (Path(audio_path).name, audio_file, get_mime_type(audio_path))
        }
        data = {
            'reference_text': reference_text
        }
        
        try:
            response = requests.post(url, files=files, data=data, timeout=120)
            
            if response.status_code == 200:
                result = response.json()
                wer = result.get('metrics', {}).get('wer', 'N/A')
                print(f"  🟢 {model.upper()}: WER={wer:.3f}")
                return result
            else:
                print(f"  🔴 {model.upper()}: HTTP {response.status_code} - {response.text}")
                raise Exception(f"HTTP {response.status_code}: {response.text}")
                
        except requests.exceptions.Timeout:
            print(f"  🔴 {model.upper()}: Timeout (>120s)")
            raise Exception("Timeout")
        except Exception as e:
            print(f"  🔴 {model.upper()}: Errore - {e}")
            raise

def evaluate_single_file(audio_path: str, reference_text: str) -> Dict[str, Any]:
    """Valuta un singolo file audio con entrambi i modelli."""
    
    file_name = Path(audio_path).name
    print(f"📄 Evaluating: {file_name}")
    
    try:
        # Chiamate ai due modelli
        print("  Chiamando Whisper...")
        whisper_result = call_model_api("whisper", audio_path, reference_text)
        
        print("  Chiamando Wav2Vec2...")  
        wav2vec2_result = call_model_api("wav2vec2", audio_path, reference_text)
        
        # Processa risultati
        evaluation = process_results(whisper_result, wav2vec2_result, reference_text, file_name)
        
        print(f"✅ {file_name}: Winner = {evaluation['comparison']['winner']}")
        return evaluation
        
    except Exception as e:
        print(f"❌ Errore nella valutazione di {file_name}: {e}")
        return {"error": str(e), "file": file_name}

def process_results(whisper_data: Dict[str, Any], wav2vec2_data: Dict[str, Any], 
                   reference_text: str, file_name: str) -> Dict[str, Any]:
    """Processa i risultati dei due modelli."""
    
    # Estrai metriche
    whisper_metrics = whisper_data.get('metrics', {})
    wav2vec2_metrics = wav2vec2_data.get('metrics', {})
    
    # Calcola scores: (1-WER)/Tempo
    whisper_wer = whisper_metrics.get('wer', 1.0)
    wav2vec2_wer = wav2vec2_metrics.get('wer', 1.0)
    whisper_time = whisper_data.get('inference_time', 1.0)
    wav2vec2_time = wav2vec2_data.get('inference_time', 1.0)
    
    whisper_score = (1 - whisper_wer) / whisper_time if whisper_time > 0 else 0
    wav2vec2_score = (1 - wav2vec2_wer) / wav2vec2_time if wav2vec2_time > 0 else 0
    
    winner = "Whisper" if whisper_score > wav2vec2_score else "Wav2Vec2"
    winner_score = max(whisper_score, wav2vec2_score)
    improvement = abs(whisper_wer - wav2vec2_wer) / max(whisper_wer, wav2vec2_wer) if max(whisper_wer, wav2vec2_wer) > 0 else 0
    
    return {
        "file": file_name,
        "groundTruthText": reference_text,
        "models": [
            {
                "modelName": "whisper",
                "transcription": whisper_data.get('text', ''),
                "accuracy": whisper_metrics.get('accuracy', 0),
                "wordErrorRate": whisper_wer,
                "characterErrorRate": whisper_metrics.get('cer', 0),
                "substitutions": whisper_metrics.get('word_substitutions', 0),
                "insertions": whisper_metrics.get('word_insertions', 0),
                "deletions": whisper_metrics.get('word_deletions', 0),
                "literalSimilarity": whisper_metrics.get('similarity_ratio', 0),
                "processingTimeMs": whisper_time * 1000,
                "score": whisper_score
            },
            {
                "modelName": "wav2vec2", 
                "transcription": wav2vec2_data.get('text', ''),
                "accuracy": wav2vec2_metrics.get('accuracy', 0),
                "wordErrorRate": wav2vec2_wer,
                "characterErrorRate": wav2vec2_metrics.get('cer', 0),
                "substitutions": wav2vec2_metrics.get('word_substitutions', 0),
                "insertions": wav2vec2_metrics.get('word_insertions', 0),
                "deletions": wav2vec2_metrics.get('word_deletions', 0),
                "literalSimilarity": wav2vec2_metrics.get('similarity_ratio', 0),
                "processingTimeMs": wav2vec2_time * 1000,
                "score": wav2vec2_score
            }
        ],
        "comparison": {
            "winner": winner,
            "winnerScore": winner_score,
            "improvement": improvement
        },
        "timestamp": time.time()
    }

def check_authentication() -> bool:
    """
    Controlla se l'utente è autenticato nel frontend.
    
    Returns:
        True se autenticato, False altrimenti
    """
    try:
        # Prova a fare una richiesta GET all'endpoint evaluations
        response = requests.get(
            f"{FRONTEND_URL}/api/evaluations",
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ Utente autenticato")
            return True
        elif response.status_code == 401:
            print("❌ Utente non autenticato")
            print("   Accedi al frontend (localhost:3000) prima di eseguire lo script")
            return False
        else:
            print(f"⚠️  Stato autenticazione sconosciuto: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Errore controllo autenticazione: {e}")
        return False

def save_to_database(evaluation: Dict[str, Any]) -> bool:
    """
    Salva una valutazione nel database tramite l'API frontend.
    
    Args:
        evaluation: Dizionario con i risultati della valutazione
        
    Returns:
        True se salvato con successo, False altrimenti
    """
    try:
        # Converte il formato per l'API
        api_payload = {
            "models": [
                {
                    "modelName": model["modelName"],
                    "transcription": model["transcription"],
                    "wordErrorRate": model["wordErrorRate"],
                    "characterErrorRate": model["characterErrorRate"],
                    "accuracy": model["accuracy"],
                    "literalSimilarity": model["literalSimilarity"],
                    "processingTimeMs": model["processingTimeMs"],
                    "substitutions": model.get("substitutions"),
                    "insertions": model.get("insertions"),
                    "deletions": model.get("deletions")
                } for model in evaluation["models"]
            ],
            "groundTruthText": evaluation["groundTruthText"],
            "comparison": evaluation["comparison"],
            "audio": {
                "audioName": evaluation["file"],
                "audioPath": f"/uploads/{evaluation['file']}",  # Path virtuale
                "audioDurationMs": None  # Non calcolato dallo script
            },
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z")
        }
        
        # Invia all'API frontend
        response = requests.post(
            f"{FRONTEND_URL}/api/evaluations",
            json=api_payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code in [200, 201]:
            print(f"  💾 Salvato nel database")
            return True
        else:
            print(f"  ❌ Errore salvataggio DB: HTTP {response.status_code}")
            print(f"      Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"  ❌ Errore salvataggio DB: {e}")
        return False

def print_summary(results: List[Dict[str, Any]]):
    """Stampa un riassunto dei risultati."""
    
    successful_results = [r for r in results if 'error' not in r]
    failed_results = [r for r in results if 'error' in r]
    
    print("\n" + "=" * 60)
    print("📊 RIASSUNTO VALUTAZIONE")
    print("=" * 60)
    print(f"✅ Valutazioni riuscite: {len(successful_results)}")
    print(f"❌ Valutazioni fallite: {len(failed_results)}")
    print()
    
    if failed_results:
        print("💥 ERRORI:")
        for result in failed_results:
            print(f"  - {result['file']}: {result['error']}")
        print()
    
    if successful_results:
        # Statistiche vincitori
        whisper_wins = sum(1 for r in successful_results if r['comparison']['winner'] == 'Whisper')
        wav2vec2_wins = len(successful_results) - whisper_wins
        
        print("🏆 VINCITORI:")
        print(f"  🤖 Whisper: {whisper_wins} vittorie ({whisper_wins/len(successful_results)*100:.1f}%)")
        print(f"  🎯 Wav2Vec2: {wav2vec2_wins} vittorie ({wav2vec2_wins/len(successful_results)*100:.1f}%)")
        print()
        
        # Metriche medie
        avg_whisper_wer = sum(r['models'][0]['wordErrorRate'] for r in successful_results) / len(successful_results)
        avg_wav2vec2_wer = sum(r['models'][1]['wordErrorRate'] for r in successful_results) / len(successful_results)
        avg_whisper_time = sum(r['models'][0]['processingTimeMs'] for r in successful_results) / len(successful_results)
        avg_wav2vec2_time = sum(r['models'][1]['processingTimeMs'] for r in successful_results) / len(successful_results)
        
        print("📈 METRICHE MEDIE:")
        print(f"  Whisper  - WER: {avg_whisper_wer:.3f}, Tempo: {avg_whisper_time:.0f}ms")
        print(f"  Wav2Vec2 - WER: {avg_wav2vec2_wer:.3f}, Tempo: {avg_wav2vec2_time:.0f}ms")
        
        # Migliori e peggiori
        best_whisper = min(successful_results, key=lambda x: x['models'][0]['wordErrorRate'])
        best_wav2vec2 = min(successful_results, key=lambda x: x['models'][1]['wordErrorRate'])
        
        print("\n🥇 MIGLIORI PERFORMANCE:")
        print(f"  Whisper: {best_whisper['file']} (WER: {best_whisper['models'][0]['wordErrorRate']:.3f})")
        print(f"  Wav2Vec2: {best_wav2vec2['file']} (WER: {best_wav2vec2['models'][1]['wordErrorRate']:.3f})")

def main():
    """Funzione principale."""
    
    print("🚀 Avvio valutazione modelli ASR...")
    print()
    
    # Controlla backend
    try:
        response = requests.get(f"{BACKEND_URL}/health/status", timeout=5)
        if response.status_code == 200:
            print(f"✅ Backend raggiungibile su {BACKEND_URL}")
        else:
            print(f"❌ Backend risponde con status {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Backend non raggiungibile: {e}")
        print("   Assicurati che il server Python sia in esecuzione su localhost:8000!")
        return
    
    # Trova file audio
    audio_path = Path(AUDIO_FOLDER)
    if not audio_path.exists():
        print(f"❌ Cartella audio non trovata: {AUDIO_FOLDER}")
        return
    
    audio_extensions = {'.mp3', '.wav', '.opus', '.m4a', '.ogg'}
    audio_files = [
        f for f in audio_path.iterdir()
        if f.is_file() and f.suffix.lower() in audio_extensions
    ]
    
    if not audio_files:
        print(f"❌ Nessun file audio trovato in {AUDIO_FOLDER}")
        return
    
    print(f"🎵 Trovati {len(audio_files)} file audio")
    print(f"📊 Inizio valutazione dei modelli...\n")
    
    # Controlla connessione al frontend e autenticazione
    frontend_available = False
    authenticated = True
    
    try:
        frontend_response = requests.get(f"{FRONTEND_URL}/", timeout=5)
        if frontend_response.status_code == 200:
            print(f"✅ Frontend raggiungibile su {FRONTEND_URL}")
            frontend_available = True
        else:
            print(f"⚠️  Frontend risponde con status {frontend_response.status_code}")
    except Exception as e:
        print(f"⚠️  Frontend non raggiungibile: {e}")
        print("   Le valutazioni verranno salvate solo localmente")
    
    # Valuta tutti i file
    results = []
    saved_to_db = 0
    
    for i, audio_file in enumerate(sorted(audio_files), 1):
        file_name = audio_file.name
        reference_text = REFERENCE_TEXTS.get(file_name, "Testo di riferimento non disponibile")
        
        print(f"[{i}/{len(audio_files)}] Processing: {file_name}")
        
        if reference_text == "Testo di riferimento non disponibile":
            print(f"⚠️  Warning: Nessun testo di riferimento per {file_name}")
        
        result = evaluate_single_file(str(audio_file), reference_text)
        
        # Se la valutazione è riuscita e l'utente è autenticato, prova a salvarla nel database
        if 'error' not in result and frontend_available and authenticated:
            if save_to_database(result):
                saved_to_db += 1
        
        results.append(result)
        
        # Pausa tra file
        time.sleep(1)
        print()
    
    # Salva backup locale e mostra risultati
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print_summary(results)
    print(f"\n💾 Backup locale salvato in: {OUTPUT_FILE}")
    
    successful_evaluations = len([r for r in results if 'error' not in r])
    if frontend_available and authenticated:
        print(f"🗄️  Valutazioni salvate nel database: {saved_to_db}/{successful_evaluations}")
        if saved_to_db < successful_evaluations:
            print(f"⚠️  {successful_evaluations - saved_to_db} valutazioni non sono state salvate nel DB")
    else:
        print("ℹ️  Valutazioni salvate solo localmente (frontend non disponibile o non autenticato)")

if __name__ == "__main__":
    main()