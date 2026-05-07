import React, { useState, useRef, useEffect, useCallback } from 'react'
import { sendMessage as sendMessageAPI } from '../services/api'
import type { ChatMessage } from '../types'
import Message from './Message'
import VoiceButton from './VoiceButton'

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  MESSAGES: 'deutschme_messages',
  VOICE: 'deutschme_voice',
} as const

const DEFAULT_VOICE = 'Google Deutsch'
const SPEAKING_INDICATOR_MS = 3000

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    'Hallo Bobby! 👋 Ich bin Anna, deine persönliche Deutschlehrerin!\n\nIch bin hier um dir zu helfen, Deutsch zu lernen und dein B2 Ziel zu erreichen! 🇩🇪\n\nWie geht es dir heute? Was möchtest du heute lernen?',
}

const NEW_CHAT_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    'Hallo Bobby! 👋 Ich bin Anna! Neue Unterhaltung — wie geht es dir heute? 😊',
}
// ─── Helpers ──────────────────────────────────────────────────────────────────

const loadMessages = (): ChatMessage[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES)
    if (saved) return JSON.parse(saved) as ChatMessage[]
  } catch {
    // fallback to default
  }
  return [WELCOME_MESSAGE]
}

const cleanTextForSpeech = (text: string): string => {
  return (
    text
      // Remove correction blocks
      .replace(/(?:Eine kleine |Kleine )?Korrektur:[\s\S]*?---/g, '')
      .replace(/❌[\s\S]*?✅[^\n]*/g, '')
      .replace(
        /(?:\*\*)?Erklärung:(?:\*\*)?[\s\S]*?(?=\n\n|\n---|\n\*\*|$)/g,
        ''
      )
      .replace(/I think you mean[\s\S]*?(?=\n\n|---|$)/g, '')
      // Remove markdown
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/---/g, '')
      // Remove emojis
      .replace(/\p{Emoji_Presentation}/gu, '')
      .replace(/\p{Extended_Pictographic}/gu, '')
      .replace(/[❌✅🔴🎤🔊●]/gu, '')
      // Clean whitespace
      .replace(/\s+/g, ' ')
      .trim()
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

const Chat: React.FC = () => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.VOICE) ?? DEFAULT_VOICE
  )
  const [availableVoices, setAvailableVoices] = useState<string[]>([])

  // ─── Refs ───────────────────────────────────────────────────────────────────
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const selectedVoiceRef = useRef<string>(selectedVoice)
  const speakingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── Speech ─────────────────────────────────────────────────────────────────

  const speak = useCallback((text: string, voiceOverride?: string) => {
    window.speechSynthesis.cancel()

    const cleanText = cleanTextForSpeech(text)
    if (!cleanText) return

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'de-DE'
    utterance.rate = 0.8
    utterance.pitch = 1

    const voices = window.speechSynthesis.getVoices()
    const targetVoiceName = voiceOverride ?? selectedVoiceRef.current
    const voice =
      voices.find((v) => v.name === targetVoiceName) ??
      voices.find((v) => v.name === DEFAULT_VOICE) ??
      voices.find((v) => v.lang.startsWith('de'))

    if (voice) utterance.voice = voice
    window.speechSynthesis.speak(utterance)
  }, [])

  // Speaks only when voices are ready — no arbitrary timeouts
  const speakWhenReady = useCallback(
    (text: string, voiceOverride?: string) => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        speak(text, voiceOverride)
      } else {
        window.speechSynthesis.addEventListener(
          'voiceschanged',
          () => speak(text, voiceOverride),
          { once: true }
        )
      }
    },
    [speak]
  )

  // ─── Effects ────────────────────────────────────────────────────────────────

  // Load available German voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis
        .getVoices()
        .filter((v) => v.lang.startsWith('de'))
        .map((v) => v.name)

      if (voices.length > 0) {
        setAvailableVoices(voices)
      }
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [])

  // Speak welcome message on first load only
  useEffect(() => {
    const isFirstMessage =
      messages.length === 1 && messages[0].role === 'assistant'
    if (isFirstMessage) {
      speakWhenReady(messages[0].content)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Persist messages to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages))
  }, [messages])

  // Cleanup speaking timer on unmount
  useEffect(() => {
    return () => {
      if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current)
    }
  }, [])

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || isLoading) return

      // Auto-capitalise first letter (speech recognition sends lowercase)
      const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
      const userMessage: ChatMessage = { role: 'user', content: formatted }
      const updatedMessages = [...messages, userMessage]

      setMessages(updatedMessages)
      setInput('')
      setIsLoading(true)

      try {
        // Send only last 10 messages to stay within token limits
        const recentMessages = updatedMessages.slice(-10)
        const responseText = await sendMessageAPI(recentMessages)

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: responseText,
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsSpeaking(true)
        speakWhenReady(responseText)

        // Hide speaking indicator after response finishes
        speakingTimerRef.current = setTimeout(
          () => setIsSpeaking(false),
          SPEAKING_INDICATOR_MS
        )
      } catch (error) {
        const err = error as {
          response?: { data?: { error?: string } }
          message?: string
        }
        console.error('Chat error:', err.response?.data ?? err.message)
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Entschuldigung! ${
              err.response?.data?.error ?? err.message ?? 'Something went wrong'
            }. Bitte versuche es nochmal. 😅`,
          },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, messages, speakWhenReady]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoice(voiceName)
    selectedVoiceRef.current = voiceName
    localStorage.setItem(STORAGE_KEYS.VOICE, voiceName)
    speak('Hallo Bobby! Ich bin deine neue Stimme!', voiceName)
  }

  const handleNewChat = () => {
    localStorage.removeItem(STORAGE_KEYS.MESSAGES)
    setMessages([NEW_CHAT_MESSAGE])
    speakWhenReady(NEW_CHAT_MESSAGE.content)
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatar}>🇩🇪</div>
          <div>
            <div style={styles.appName}>Anna 🇩🇪</div>
            <div style={styles.status}>
              {isSpeaking ? '🔊 Anna spricht...' : '● Online'}
            </div>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.levelInfo}>
            <span style={styles.levelLabel}>Level</span>
            <span style={styles.levelBadge}>A1 🌱</span>
            <span style={styles.lessonCount}>47/66</span>
          </div>

          <select
            value={selectedVoice}
            onChange={(e) => handleVoiceChange(e.target.value)}
            style={styles.voiceSelect}
            aria-label="Select voice"
          >
            {availableVoices.map((voice) => (
              <option key={voice} value={voice} style={styles.voiceOption}>
                {voice
                  .replace(' (German (Germany))', '')
                  .replace(' — de-DE', '')}
              </option>
            ))}
          </select>

          <button
            onClick={handleNewChat}
            style={styles.newChatButton}
            aria-label="Start new chat"
          >
            New Chat
          </button>
        </div>
      </header>

      {/* Messages */}
      <main style={styles.messages}>
        {messages.map((msg, i) => (
          <Message key={i} role={msg.role} content={msg.content} />
        ))}

        {isLoading && (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingAvatar}>🇩🇪</div>
            <div style={styles.loadingBubble}>...</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <footer style={styles.inputArea}>
        <VoiceButton
          onTranscript={sendMessage}
          disabled={isLoading}
          onStartListening={() => {
            console.log('cancelling speech')
            window.speechSynthesis.cancel()
          }}
        />
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Schreib auf Deutsch... (Enter to send)"
          disabled={isLoading}
          rows={1}
          style={styles.textarea}
          aria-label="Message input"
        />

        <button
          onClick={() => sendMessage(input)}
          disabled={isLoading || !input.trim()}
          style={{
            ...styles.sendButton,
            background: input.trim()
              ? 'linear-gradient(135deg, #4d9fff, #b44dff)'
              : '#2a2a3a',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
          }}
          aria-label="Send message"
        >
          {isLoading ? '⏳' : '➤'}
        </button>
      </footer>

      <style>{globalStyles}</style>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#0a0a0f',
    fontFamily: 'Inter, sans-serif',
  },
  header: {
    padding: '16px 20px',
    background: '#12121a',
    borderBottom: '1px solid #2a2a3a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00ff87, #4d9fff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  appName: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#ffffff',
    fontFamily: 'Syne, sans-serif',
  },
  status: {
    fontSize: '12px',
    color: '#00ff87',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  levelInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#12121a',
    padding: '4px 10px',
    borderRadius: '12px',
    border: '1px solid #2a2a3a',
  },
  levelLabel: {
    fontSize: '12px',
    color: '#8888aa',
  },
  levelBadge: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#00ff87',
  },
  lessonCount: {
    fontSize: '12px',
    color: '#555577',
  },
  voiceSelect: {
    background: '#1a1a28',
    border: '1px solid #2a2a3a',
    borderRadius: '12px',
    padding: '6px 12px',
    color: '#8888aa',
    fontSize: '12px',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '120px',
    maxWidth: '160px',
    position: 'relative' as const,
    zIndex: 100,
    pointerEvents: 'auto' as const,
  },
  voiceOption: {
    background: '#1a1a28',
  },
  newChatButton: {
    background: 'transparent',
    border: '1px solid #2a2a3a',
    borderRadius: '20px',
    padding: '6px 12px',
    color: '#8888aa',
    fontSize: '12px',
    cursor: 'pointer',
    marginLeft: '8px',
  },
  messages: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '20px 0',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    padding: '0 16px',
    marginBottom: '16px',
  },
  loadingAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00ff87, #4d9fff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    marginRight: '10px',
    flexShrink: 0,
  },
  loadingBubble: {
    padding: '12px 16px',
    borderRadius: '18px 18px 18px 4px',
    background: '#1e1e2e',
    border: '1px solid #2a2a3a',
    color: '#8888aa',
    fontSize: '20px',
    letterSpacing: '4px',
  },
  inputArea: {
    padding: '16px 20px',
    background: '#12121a',
    borderTop: '1px solid #2a2a3a',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    background: '#1a1a28',
    border: '1px solid #2a2a3a',
    borderRadius: '24px',
    padding: '12px 18px',
    color: '#ffffff',
    fontSize: '15px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    resize: 'none' as const,
    lineHeight: '1.5',
    maxHeight: '120px',
    overflowY: 'auto' as const,
  },
  sendButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: 'none',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
} as const

const globalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1);   }
    50%       { transform: scale(1.1); }
  }
  textarea::placeholder { color: #555577; }
  textarea:focus        { border-color: #4d9fff !important; }
`

export default Chat
