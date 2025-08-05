"use client"

import { useState, useRef, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const { toast } = useToast()

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      startTimer()

      toast({
        title: "Registrazione iniziata",
        description: "Parla nel microfono per registrare l'audio",
      })
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile accedere al microfono",
        variant: "destructive",
      })
    }
  }, [toast])

  const togglePauseRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        startTimer()
        setIsPaused(false)
      } else {
        mediaRecorderRef.current.pause()
        stopTimer()
        setIsPaused(true)
      }
    }
  }, [isPaused])

  const stopRecording = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
          const audioFile = new File([audioBlob], `recording-${Date.now()}.wav`, { type: "audio/wav" })

          // Ferma tutti i track
          if (mediaRecorderRef.current?.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
          }

          resolve(audioFile)
        }

        mediaRecorderRef.current.stop()
        setIsRecording(false)
        setIsPaused(false)
        stopTimer()
      } else {
        resolve(null)
      }
    })
  }, [])

  return {
    isRecording,
    isPaused,
    recordingTime,
    formatTime,
    startRecording,
    togglePauseRecording,
    stopRecording,
  }
}
