"""
Modulo per il calcolo di metriche di valutazione ASR.

Implementa metriche standard come Word Error Rate (WER) e Character Error Rate (CER)
per valutare la qualità delle trascrizioni automatiche.
"""

import re
import time
from typing import List, Tuple, Dict, Any
from difflib import SequenceMatcher
from functools import wraps


def calculate_wer(reference: str, hypothesis: str) -> float:
    """
    Calcola il Word Error Rate (WER) tra una trascrizione di riferimento e una ipotesi.
    
    WER = (S + D + I) / N
    Dove:
    - S = Sostituzioni
    - D = Cancellazioni  
    - I = Inserimenti
    - N = Numero totale di parole nel riferimento
    
    Args:
        reference: Trascrizione di riferimento (ground truth)
        hypothesis: Trascrizione ottenuta dal modello ASR
        
    Returns:
        WER come valore float tra 0 e 1 (o superiore se ci sono molti inserimenti)
    """
    # Normalizza il testo (lowercase, rimuovi punteggiatura, spazi multipli)
    ref_words = _normalize_text(reference).split()
    hyp_words = _normalize_text(hypothesis).split()
    
    if len(ref_words) == 0:
        return 0.0 if len(hyp_words) == 0 else float('inf')
    
    # Calcola la distanza di edit (Levenshtein) tra le sequenze di parole
    edit_distance, operations = _edit_distance_with_operations(ref_words, hyp_words)
    
    # WER è la distanza di edit divisa per il numero di parole di riferimento
    wer = edit_distance / len(ref_words)
    
    return wer


def calculate_cer(reference: str, hypothesis: str) -> float:
    """
    Calcola il Character Error Rate (CER) tra una trascrizione di riferimento e una ipotesi.
    
    CER = (S + D + I) / N
    Dove:
    - S = Sostituzioni di caratteri
    - D = Cancellazioni di caratteri
    - I = Inserimenti di caratteri  
    - N = Numero totale di caratteri nel riferimento
    
    Args:
        reference: Trascrizione di riferimento (ground truth)
        hypothesis: Trascrizione ottenuta dal modello ASR
        
    Returns:
        CER come valore float tra 0 e 1 (o superiore se ci sono molti inserimenti)
    """
    # Normalizza il testo mantenendo gli spazi
    ref_chars = list(_normalize_text(reference, keep_spaces=True))
    hyp_chars = list(_normalize_text(hypothesis, keep_spaces=True))
    
    if len(ref_chars) == 0:
        return 0.0 if len(hyp_chars) == 0 else float('inf')
    
    # Calcola la distanza di edit tra le sequenze di caratteri
    edit_distance, _ = _edit_distance_with_operations(ref_chars, hyp_chars)
    
    # CER è la distanza di edit divisa per il numero di caratteri di riferimento
    cer = edit_distance / len(ref_chars)
    
    return cer


def calculate_detailed_metrics(reference: str, hypothesis: str) -> Dict[str, Any]:
    """
    Calcola metriche dettagliate includendo WER, CER e statistiche aggiuntive.
    
    Args:
        reference: Trascrizione di riferimento (ground truth)
        hypothesis: Trascrizione ottenuta dal modello ASR
        
    Returns:
        Dizionario con metriche dettagliate
    """
    wer = calculate_wer(reference, hypothesis)
    cer = calculate_cer(reference, hypothesis)
    
    # Normalizza per statistiche aggiuntive
    ref_words = _normalize_text(reference).split()
    hyp_words = _normalize_text(hypothesis).split()
    
    # Calcola operazioni dettagliate per WER
    _, word_operations = _edit_distance_with_operations(ref_words, hyp_words)
    word_substitutions = word_operations.get('substitutions', 0)
    word_deletions = word_operations.get('deletions', 0)
    word_insertions = word_operations.get('insertions', 0)
    
    # Calcola similarità
    similarity = SequenceMatcher(None, reference.lower(), hypothesis.lower()).ratio()
    
    return {
        'wer': wer,
        'cer': cer,
        'word_count_reference': len(ref_words),
        'word_count_hypothesis': len(hyp_words),
        'char_count_reference': len(reference),
        'char_count_hypothesis': len(hypothesis),
        'word_substitutions': word_substitutions,
        'word_deletions': word_deletions,
        'word_insertions': word_insertions,
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


def _normalize_text(text: str, keep_spaces: bool = False) -> str:
    """
    Normalizza il testo per il calcolo delle metriche.
    
    Args:
        text: Testo da normalizzare
        keep_spaces: Se True, mantiene gli spazi per il calcolo CER
        
    Returns:
        Testo normalizzato
    """
    if not text:
        return ""
    
    # Converti in lowercase
    text = text.lower()
    
    # Rimuovi punteggiatura (ma mantieni apostrofi per contrazioni)
    text = re.sub(r"[^\w\s']", "", text)
    
    if keep_spaces:
        # Per CER: rimuovi spazi multipli ma mantieni spazi singoli
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    else:
        # Per WER: rimuovi spazi multipli
        text = re.sub(r'\s+', ' ', text)
        return text.strip()


def _edit_distance_with_operations(seq1: List[str], seq2: List[str]) -> Tuple[int, Dict[str, int]]:
    """
    Calcola la distanza di edit (Levenshtein) tra due sequenze e conta le operazioni.
    
    Args:
        seq1: Prima sequenza (riferimento)
        seq2: Seconda sequenza (ipotesi)
        
    Returns:
        Tuple contenente (distanza_edit, dizionario_operazioni)
    """
    len1, len2 = len(seq1), len(seq2)
    
    # Matrice DP per la distanza di edit
    dp = [[0] * (len2 + 1) for _ in range(len1 + 1)]
    
    # Inizializzazione
    for i in range(len1 + 1):
        dp[i][0] = i
    for j in range(len2 + 1):
        dp[0][j] = j
    
    # Riempimento della matrice
    for i in range(1, len1 + 1):
        for j in range(1, len2 + 1):
            if seq1[i-1] == seq2[j-1]:
                dp[i][j] = dp[i-1][j-1]  # Nessuna operazione
            else:
                dp[i][j] = 1 + min(
                    dp[i-1][j],    # Cancellazione
                    dp[i][j-1],    # Inserimento
                    dp[i-1][j-1]   # Sostituzione
                )
    
    # Backtrack per contare le operazioni
    operations = {'substitutions': 0, 'deletions': 0, 'insertions': 0}
    i, j = len1, len2
    
    while i > 0 or j > 0:
        if i > 0 and j > 0 and seq1[i-1] == seq2[j-1]:
            # Match - nessuna operazione
            i -= 1
            j -= 1
        elif i > 0 and j > 0 and dp[i][j] == dp[i-1][j-1] + 1:
            # Sostituzione
            operations['substitutions'] += 1
            i -= 1
            j -= 1
        elif i > 0 and dp[i][j] == dp[i-1][j] + 1:
            # Cancellazione
            operations['deletions'] += 1
            i -= 1
        elif j > 0 and dp[i][j] == dp[i][j-1] + 1:
            # Inserimento
            operations['insertions'] += 1
            j -= 1
        else:
            break
    
    return dp[len1][len2], operations


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