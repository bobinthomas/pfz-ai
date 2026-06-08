import { useCallback, useEffect, useRef, useState } from 'react'

type SpeechCtor = new () => SpeechRecognition

function getSpeechRecognition(): SpeechCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & {
    SpeechRecognition?: SpeechCtor
    webkitSpeechRecognition?: SpeechCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function isSpeechRecognitionAvailable(): boolean {
  return getSpeechRecognition() !== null
}

export function useSpeechRecognition(lang: string) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  const start = useCallback(
    (onResult: (transcript: string) => void) => {
      const Ctor = getSpeechRecognition()
      if (!Ctor) return

      stop()

      const recognition = new Ctor()
      recognition.lang = lang
      recognition.interimResults = false
      recognition.maxAlternatives = 1
      recognition.continuous = false

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0]?.[0]?.transcript?.trim()
        if (transcript) onResult(transcript)
      }

      recognition.onerror = () => setListening(false)
      recognition.onend = () => setListening(false)

      recognitionRef.current = recognition
      recognition.start()
      setListening(true)
    },
    [lang, stop],
  )

  useEffect(() => () => stop(), [stop])

  return { listening, start, stop, available: isSpeechRecognitionAvailable() }
}
