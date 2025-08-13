// Funzione fetch standalone per trascrizioni
// Puoi usare questa funzione direttamente senza hook

export async function transcribeAudioFile(audioFile: File, model: 'whisper' | 'wav2vec2'): Promise<string> {
  // Determina l'endpoint in base al modello
  const endpoint = model === 'whisper' ? '/whisper/transcribe' : '/wav2vec2/transcribe'
  const apiUrl = `http://127.0.0.1:8000${endpoint}`

  console.log(`Transcribing with ${model} model at:`, apiUrl)

  // Prepara i dati per il form
  const formData = new FormData()
  formData.append('file', audioFile)

  try {
    // Chiama l'API
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    
    if (!result.text) {
      throw new Error('Nessun testo ricevuto dalla trascrizione')
    }

    console.log('Transcription completed:', result.text)
    return result.text

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    console.error('Transcription error:', errorMessage)
    throw new Error(errorMessage)
  }
}

// Esempio di utilizzo:
/*
try {
  const audioFile = new File([blob], 'audio.wav', { type: 'audio/wav' })
  const text = await transcribeAudioFile(audioFile, 'whisper')
  console.log('Trascrizione:', text)
} catch (error) {
  console.error('Errore:', error.message)
}
*/
