import React, { useState, useRef, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface VoiceButtonProps {
  onTranscript: (text: string) => void
  disabled: boolean
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognitionResult {
  readonly 0: SpeechRecognitionAlternative
  readonly length: number
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_RECORDING_MS = 30_000

// ─── Component ────────────────────────────────────────────────────────────────

const VoiceButton: React.FC<VoiceButtonProps> = ({
  onTranscript,
  disabled,
}) => {
  // ─── State & Refs ──────────────────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const clearAutoStop = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
    clearAutoStop()
  }, [])

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const startListening = useCallback(() => {
    if (isListening) {
      stopListening()
      return
    }

    const win = window as WindowWithSpeech
    const SpeechRecognition =
      win.SpeechRecognition ?? win.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Speech recognition not supported. Try Chrome!')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'de-DE'
    recognition.continuous = true
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
      // Auto-stop after 30 seconds
      timeoutRef.current = setTimeout(stopListening, MAX_RECORDING_MS)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(
        { length: event.results.length },
        (_, i) => event.results[i][0].transcript
      ).join(' ')

      onTranscript(transcript)
      stopListening()
    }

    recognition.onend = () => {
      setIsListening(false)
      clearAutoStop()
    }

    recognition.onerror = () => {
      setIsListening(false)
      clearAutoStop()
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isListening, onTranscript, stopListening])

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <button
      onClick={startListening}
      disabled={disabled}
      style={styles.button(isListening, disabled)}
      title={isListening ? 'Click to stop' : 'Click to speak'}
      aria-label={isListening ? 'Stop recording' : 'Start recording'}
    >
      {isListening ? '🔴' : '🎤'}
    </button>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  button: (isListening: boolean, disabled: boolean): React.CSSProperties => ({
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: 'none',
    background: isListening
      ? 'linear-gradient(135deg, #ff4d4d, #ff6b9d)'
      : 'linear-gradient(135deg, #00ff87, #4d9fff)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
    animation: isListening ? 'pulse 1s infinite' : 'none',
  }),
}

export default VoiceButton
