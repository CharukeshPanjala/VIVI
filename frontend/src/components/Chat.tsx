import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import Message from './Message'
import VoiceButton from './VoiceButton'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const API_URL = 'http://localhost:3001'

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('deutschme_messages')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // fallback to default
      }
    }
    return [
      {
        role: 'assistant',
        content:
          'Hallo Bobby! 👋 Willkommen bei DeutschMe! \n\nIch bin dein persönlicher Deutschlehrer. Ich bin hier, um dir zu helfen, Deutsch zu lernen! 🇩🇪\n\nWie geht es dir heute? Was hast du heute gelernt?',
      },
    ]
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<string>(
    localStorage.getItem('deutschme_voice') || 'Google Deutsch'
  )
  const [availableVoices, setAvailableVoices] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const selectedVoiceRef = useRef<string>(selectedVoice)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) return

    // Speak welcome message once voices are loaded
    window.speechSynthesis.onvoiceschanged = () => {
      const isNewChat =
        messages.length === 1 && messages[0].role === 'assistant'
      if (isNewChat) {
        setTimeout(() => speak(messages[0].content), 500)
      }
    }
  }, [])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('deutschme_messages', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      const germanVoices = voices
        .filter((v) => v.lang.startsWith('de'))
        .map((v) => v.name)
      setAvailableVoices(germanVoices)
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  const speak = (text: string, voiceName?: string) => {
    window.speechSynthesis.cancel()

    // Extract only conversational parts — remove correction blocks
    let speakableText = text

    // Remove correction blocks (❌ ... ✅ ... Erklärung blocks)
    speakableText = speakableText
      .replace(/Eine kleine Korrektur:[\s\S]*?---/g, '')
      .replace(/Kleine Korrektur:[\s\S]*?---/g, '')
      .replace(/Korrektur:[\s\S]*?---/g, '')
      .replace(/❌[\s\S]*?✅[^\n]*/g, '')
      .replace(/\*\*Erklärung:\*\*[\s\S]*?(?=\n\n|\n---|\n\*\*|$)/g, '')
      .replace(/Erklärung:[\s\S]*?(?=\n\n|---|$)/g, '')
      .replace(/I think you mean[\s\S]*?(?=\n\n|---|$)/g, '')

    // Clean markdown and emojis
    const cleanText = speakableText
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
      .replace(/[❌✅🔴🎤🔊●]/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/---/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/🔊/g, '')
      .replace(/●/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!cleanText) return

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'de-DE'
    utterance.rate = 0.8
    utterance.pitch = 1

    const voices = window.speechSynthesis.getVoices()
    const selectedVoiceFound = voiceName
      ? voices.find((v) => v.name === voiceName)
      : voices.find((v) => v.name === selectedVoiceRef.current) ||
        voices.find((v) => v.name === 'Google Deutsch') ||
        voices.find((v) => v.lang.startsWith('de'))

    if (selectedVoiceFound) utterance.voice = selectedVoiceFound
    window.speechSynthesis.speak(utterance)
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    // Auto-capitalize first letter (speech recognition sends lowercase)
    const capitalizedContent =
      content.charAt(0).toUpperCase() + content.slice(1)

    const userMessage: ChatMessage = {
      role: 'user',
      content: capitalizedContent,
    }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      // Only send last 10 messages to avoid token limit errors
      const recentMessages = updatedMessages.slice(-10)

      const response = await axios.post(`${API_URL}/api/chat/message`, {
        messages: recentMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      })

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.data.message,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsSpeaking(true)
      speak(response.data.message)
      setTimeout(() => setIsSpeaking(false), 3000)
    } catch (error: any) {
      console.error('Chat error:', error.response?.data || error.message)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Entschuldigung! ${error.response?.data?.error || 'Something went wrong'}. Bitte versuche es nochmal. 😅`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoice(voiceName)
    selectedVoiceRef.current = voiceName
    localStorage.setItem('deutschme_voice', voiceName)
    // Preview the voice
    speak('Hallo Bobby! Ich bin deine neue Stimme!', voiceName)
  }

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a0f',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          background: '#12121a',
          borderBottom: '1px solid #2a2a3a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00ff87, #4d9fff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            🇩🇪
          </div>
          <div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#ffffff',
                fontFamily: 'Syne, sans-serif',
              }}
            >
              DeutschMe
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#00ff87',
              }}
            >
              {isSpeaking ? '🔊 Speaking...' : '● Online'}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#1a1a28',
            padding: '8px 14px',
            borderRadius: '20px',
            border: '1px solid #2a2a3a',
          }}
        >
          <span style={{ fontSize: '12px', color: '#8888aa' }}>Level</span>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#00ff87',
            }}
          >
            A1 🌱
          </span>
          <span style={{ fontSize: '12px', color: '#555577' }}>47/66</span>
          <select
            value={selectedVoice}
            onChange={(e) => handleVoiceChange(e.target.value)}
            style={{
              background: '#1a1a28',
              border: '1px solid #2a2a3a',
              borderRadius: '20px',
              padding: '6px 12px',
              color: '#8888aa',
              fontSize: '12px',
              cursor: 'pointer',
              outline: 'none',
              marginLeft: '8px',
            }}
          >
            {availableVoices.map((voice) => (
              <option
                key={voice}
                value={voice}
                style={{ background: '#1a1a28' }}
              >
                {voice
                  .replace(' (German (Germany))', '')
                  .replace(' — de-DE', '')}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              localStorage.removeItem('deutschme_messages')
              const welcomeMsg =
                'Hallo Bobby! Neue Unterhaltung! Wie geht es dir heute?'
              setMessages([
                {
                  role: 'assistant',
                  content:
                    'Hallo Bobby! 👋 Neue Unterhaltung! Wie geht es dir heute? 😊',
                },
              ])
              setTimeout(() => speak(welcomeMsg), 300)
            }}
            style={{
              background: 'transparent',
              border: '1px solid #2a2a3a',
              borderRadius: '20px',
              padding: '6px 12px',
              color: '#8888aa',
              fontSize: '12px',
              cursor: 'pointer',
              marginLeft: '8px',
            }}
          >
            New Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 0',
        }}
      >
        {messages.map((msg, i) => (
          <Message key={i} role={msg.role} content={msg.content} />
        ))}

        {isLoading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              padding: '0 16px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
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
              }}
            >
              🇩🇪
            </div>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '18px 18px 18px 4px',
                background: '#1e1e2e',
                border: '1px solid #2a2a3a',
                color: '#8888aa',
                fontSize: '20px',
                letterSpacing: '4px',
              }}
            >
              ...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '16px 20px',
          background: '#12121a',
          borderTop: '1px solid #2a2a3a',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
        }}
      >
        <VoiceButton
          onTranscript={(text) => sendMessage(text)}
          disabled={isLoading}
        />

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Schreib auf Deutsch... (Enter to send)"
          disabled={isLoading}
          rows={1}
          style={{
            flex: 1,
            background: '#1a1a28',
            border: '1px solid #2a2a3a',
            borderRadius: '24px',
            padding: '12px 18px',
            color: '#ffffff',
            fontSize: '15px',
            fontFamily: 'Inter, sans-serif',
            outline: 'none',
            resize: 'none',
            lineHeight: '1.5',
            maxHeight: '120px',
            overflowY: 'auto',
          }}
        />

        <button
          onClick={() => sendMessage(input)}
          disabled={isLoading || !input.trim()}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: 'none',
            background: input.trim()
              ? 'linear-gradient(135deg, #4d9fff, #b44dff)'
              : '#2a2a3a',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
        >
          {isLoading ? '⏳' : '➤'}
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        textarea::placeholder { color: #555577; }
        textarea:focus { border-color: #4d9fff !important; }
      `}</style>
    </div>
  )
}

export default Chat
