/**
 * Arrotonda un numero a un numero specifico di cifre significative
 */
export function roundToSignificantDigits(num: number, digits: number = 2): number {
  if (num === 0) return 0
  const magnitude = Math.floor(Math.log10(Math.abs(num)))
  const factor = Math.pow(10, digits - 1 - magnitude)
  return Math.round(num * factor) / factor
}

/**
 * Formatta il tempo di processing per la visualizzazione
 */
export function formatProcessingTime(timeInSeconds: number): string {
  const rounded = roundToSignificantDigits(timeInSeconds, 2)
  return `${rounded}s`
}

/**
 * Formatta la percentuale per la visualizzazione
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

/**
 * Formatta il WER per la visualizzazione
 */
export function formatWER(wer: number): string {
  return formatPercentage(wer)
}

/**
 * Formatta il score di performance per la visualizzazione
 * Score = (1-WER)/Tempo, quindi valori più alti sono migliori
 */
export function formatScore(score: number): string {
  return score.toFixed(4)
}