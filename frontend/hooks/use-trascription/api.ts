
export const transcribeAudio = async (
  file: File,
  model: "whisper" | "wav2vec2",
  showToast: (title: string, description: string, variant?: "destructive") => void
) => {
  try {
    const formData = new FormData()
    formData.append("audio", file)
    formData.append("model", model)

    console.log("Inviando file:", file, "con modello:", model)

    const response = await fetch(`/api/transcribe`, {
        method: "POST",
        body: formData,
    })

    if (!response.ok) {
        const errorData = await response.text()
        console.error("Errore API:", errorData)
        throw new Error("Errore trascrizione")
    }

    const result = await response.json()
    return result 
  } catch (error: any) {
    console.error("Errore completo:", error)
    showToast("Errore", error.message || "Impossibile trascrivere l'audio", "destructive")
    return null
  }
}
