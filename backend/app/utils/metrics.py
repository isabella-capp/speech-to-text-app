"""
Modulo per il calcolo di metriche di valutazione ASR.

Implementa metriche standard come Word Error Rate (WER) e Character Error Rate (CER)
per valutare la qualità delle trascrizioni automatiche utilizzando la libreria jiwer.
"""

import time
from typing import Dict, Any
from functools import wraps
import jiwer
from difflib import SequenceMatcher

def calculate_wer(reference: str, hypothesis: str) -> float:
    """
    Calcola il Word Error Rate (WER) utilizzando jiwer con normalizzazione.
    
    Args:
        reference: Trascrizione di riferimento (ground truth)
        hypothesis: Trascrizione ottenuta dal modello ASR
        
    Returns:
        WER come valore float tra 0 e 1 (o superiore se ci sono molti inserimenti)
    """
    if not reference.strip() and not hypothesis.strip():
        return 0.0
    if not reference.strip():
        return float('inf')
    
    try:
        # Applica normalizzazione standard per confronti ASR
        transform = jiwer.Compose([
            jiwer.ToLowerCase(),
            jiwer.RemovePunctuation(),
            jiwer.RemoveMultipleSpaces(),
            jiwer.Strip()
        ])
        
        ref_normalized = transform(reference)
        hyp_normalized = transform(hypothesis)
        
        wer = jiwer.wer(ref_normalized, hyp_normalized)
        return wer
    except Exception as e:
        print(f"Errore nel calcolo WER: {e}")
        return 1.0


def calculate_cer(reference: str, hypothesis: str) -> float:
    """
    Calcola il Character Error Rate (CER) utilizzando jiwer con normalizzazione.
    
    Args:
        reference: Trascrizione di riferimento (ground truth)
        hypothesis: Trascrizione ottenuta dal modello ASR
        
    Returns:
        CER come valore float tra 0 e 1 (o superiore se ci sono molti inserimenti)
    """
    if not reference.strip() and not hypothesis.strip():
        return 0.0
    if not reference.strip():
        return float('inf')
    
    try:
        # Applica normalizzazione standard per confronti ASR
        transform = jiwer.Compose([
            jiwer.ToLowerCase(),
            jiwer.RemovePunctuation(),
            jiwer.RemoveMultipleSpaces(),
            jiwer.Strip()
        ])
        
        ref_normalized = transform(reference)
        hyp_normalized = transform(hypothesis)
        
        cer = jiwer.cer(ref_normalized, hyp_normalized)
        return cer
    except Exception as e:
        print(f"Errore nel calcolo CER: {e}")
        return 1.0


def calculate_detailed_metrics(reference: str, hypothesis: str) -> Dict[str, Any]:
    """
    Calcola metriche dettagliate utilizzando jiwer e statistiche aggiuntive.
    
    Args:
        reference: Trascrizione di riferimento (ground truth)
        hypothesis: Trascrizione ottenuta dal modello ASR
        
    Returns:
        Dizionario con metriche dettagliate
    """
    # Applica trasformazioni per normalizzare i testi
    transform = jiwer.Compose([
        jiwer.ToLowerCase(),
        jiwer.RemovePunctuation(),
        jiwer.RemoveMultipleSpaces(),
        jiwer.Strip()
    ])
    
    # Normalizza i testi per i calcoli
    ref_normalized = transform(reference)
    hyp_normalized = transform(hypothesis)
    
    # Calcola WER e CER sui testi normalizzati
    wer = calculate_wer(ref_normalized, hyp_normalized)
    cer = calculate_cer(ref_normalized, hyp_normalized)
    
    # Calcola operazioni dettagliate utilizzando jiwer sui testi normalizzati
    try:
        # Dividi in parole i testi normalizzati
        ref_words = ref_normalized.split()
        hyp_words = hyp_normalized.split()
        
        # Usa testi normalizzati per i dettagli
        details = jiwer.process_words(ref_normalized, hyp_normalized)

        word_substitutions = details.substitutions
        word_deletions = details.deletions
        word_insertions = details.insertions
        word_hits = details.hits
        
    except Exception as e:
        print(f"Errore nel calcolo delle operazioni dettagliate: {e}")
        # Fallback values usando testi normalizzati
        ref_words = ref_normalized.split()
        hyp_words = hyp_normalized.split()
        word_substitutions = 0
        word_deletions = 0
        word_insertions = 0
        word_hits = 0
    
    # Calcola similarità usando difflib sui testi normalizzati
    similarity = SequenceMatcher(None, ref_normalized, hyp_normalized).ratio()
    
    return {
        'wer': wer,
        'cer': cer,
        'word_count_reference': len(ref_words) if isinstance(ref_words, list) else len(reference.split()),
        'word_count_hypothesis': len(hyp_words) if isinstance(hyp_words, list) else len(hypothesis.split()),
        'char_count_reference': len(reference),
        'char_count_hypothesis': len(hypothesis),
        'word_substitutions': word_substitutions,
        'word_deletions': word_deletions,
        'word_insertions': word_insertions,
        'word_hits': word_hits,
        'similarity_ratio': similarity,
        'accuracy': max(0, 1 - wer)  # Accuracy = 1 - WER (limitata a 0)
    }

def measure_inference_time(func):
    """
    Decorator per misurare il tempo di inferenza di una funzione.
    
    Args:
        func: Funzione da decorare
        
    Returns:
        Tuple contenente (risultato_originale, tempo_inferenza_secondi)
    """
    @wraps(func)
    async def async_wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = await func(*args, **kwargs)
        end_time = time.perf_counter()
        inference_time = end_time - start_time
        return result, inference_time
    
    @wraps(func)
    def sync_wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        end_time = time.perf_counter()
        inference_time = end_time - start_time
        return result, inference_time
    
    # Restituisce il wrapper appropriato in base al tipo di funzione
    import asyncio
    if asyncio.iscoroutinefunction(func):
        return async_wrapper
    else:
        return sync_wrapper


def format_metrics_for_display(metrics: Dict[str, Any]) -> Dict[str, str]:
    """
    Formatta le metriche per la visualizzazione nell'interfaccia utente.
    
    Args:
        metrics: Dizionario con metriche calcolate
        
    Returns:
        Dizionario con metriche formattate come stringhe
    """
    formatted = {}
    
    if 'wer' in metrics:
        formatted['WER'] = f"{metrics['wer']:.3f} ({metrics['wer']*100:.1f}%)"
    
    if 'cer' in metrics:
        formatted['CER'] = f"{metrics['cer']:.3f} ({metrics['cer']*100:.1f}%)"
    
    if 'accuracy' in metrics:
        formatted['Accuracy'] = f"{metrics['accuracy']:.3f} ({metrics['accuracy']*100:.1f}%)"
    
    if 'similarity_ratio' in metrics:
        formatted['Similarity'] = f"{metrics['similarity_ratio']:.3f} ({metrics['similarity_ratio']*100:.1f}%)"
    
    if 'inference_time' in metrics:
        time_ms = metrics['inference_time'] * 1000
        if time_ms < 1000:
            formatted['Inference Time'] = f"{time_ms:.1f} ms"
        else:
            formatted['Inference Time'] = f"{metrics['inference_time']:.2f} s"
    
    if 'word_count_reference' in metrics and 'word_count_hypothesis' in metrics:
        formatted['Words'] = f"Ref: {metrics['word_count_reference']}, Hyp: {metrics['word_count_hypothesis']}"
    
    return formatted


def get_jiwer_version() -> str:
    """
    Restituisce la versione di jiwer utilizzata.
    
    Returns:
        Stringa con la versione di jiwer
    """
    try:
        return jiwer.__version__
    except AttributeError:
        return "unknown"


def validate_text_input(reference: str, hypothesis: str) -> bool:
    """
    Valida l'input per il calcolo delle metriche.
    
    Args:
        reference: Testo di riferimento
        hypothesis: Testo dell'ipotesi
        
    Returns:
        True se l'input è valido, False altrimenti
    """
    if not isinstance(reference, str) or not isinstance(hypothesis, str):
        return False
    
    # Almeno uno dei due testi deve avere contenuto
    return bool(reference.strip() or hypothesis.strip())