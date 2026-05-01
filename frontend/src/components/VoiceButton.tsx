import React, { useState, useRef } from 'react'

interface VoiceButtonProps {
  onTranscript: (text: string) => void
  disabled: boolean
}

const VoiceButton: React.FC<VoiceButtonProps> = ({
  onTranscript,
  disabled,
}) => {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const timeoutRef = useRef<any>(null)

  const startListening = () => {
    if (isListening) {
      stopListening()
      return
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

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
      // Auto stop after 30 seconds
      timeoutRef.current = setTimeout(() => {
        stopListening()
      }, 30000)
    }

    recognition.onresult = (event: any) => {
      const results = Array.from(event.results as SpeechRecognitionResultList)
      const transcript = results.map((r: any) => r[0].transcript).join(' ')
      onTranscript(transcript)
      stopListening()
    }

    recognition.onend = () => {
      setIsListening(false)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }

    recognition.onerror = () => {
      setIsListening(false)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  return (
    <button
      onClick={startListening}
      disabled={disabled}
      style={{
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
      }}
      title={isListening ? 'Click to stop' : 'Click to speak'}
    >
      {isListening ? '🔴' : '🎤'}
    </button>
  )
}

export default VoiceButton
