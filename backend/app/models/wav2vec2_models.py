# Lista di modelli Wav2Vec2 italiani testati e raccomandati

ITALIAN_WAV2VEC2_MODELS = {
    # Modello principale - Facebook ufficiale
    "facebook": {
        "name": "facebook/wav2vec2-large-xlsr-53-italian",
        "description": "Modello ufficiale Facebook per l'italiano",
        "quality": "alto",
        "size": "grande"
    },
    
    # Modello alternativo - Jonatas Grosman 
    "jonatas": {
        "name": "jonatasgrosman/wav2vec2-large-xlsr-53-italian", 
        "description": "Modello fine-tuned specifico per l'italiano",
        "quality": "molto alto",
        "size": "grande"
    },
    
    # Modello più leggero
    "lightweight": {
        "name": "leandroreturns/wav2vec2-xlsr-italian",
        "description": "Modello più leggero per l'italiano",
        "quality": "medio",
        "size": "medio"
    }
}

# Modello di default (puoi cambiare questo per testare)
DEFAULT_ITALIAN_MODEL = "facebook"

def get_model_info(model_key: str = DEFAULT_ITALIAN_MODEL):
    """Ottieni informazioni sul modello"""
    return ITALIAN_WAV2VEC2_MODELS.get(model_key, ITALIAN_WAV2VEC2_MODELS["facebook"])

def get_model_name(model_key: str = DEFAULT_ITALIAN_MODEL):
    """Ottieni il nome del modello per Hugging Face"""
    return get_model_info(model_key)["name"]
