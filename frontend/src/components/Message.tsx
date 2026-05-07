import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MessageProps {
  role: 'user' | 'assistant'
  content: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseContent = (
  content: string
): { text: string; correction: string | null } => {
  const match = content.match(/\[CORRECTION\](.*?)\[\/CORRECTION\]/s)
  if (!match) return { text: content.trim(), correction: null }
  const text = content.replace(/\[CORRECTION\].*?\[\/CORRECTION\]/s, '').trim()
  return { text, correction: match[1].trim() }
}

// ─── Component ────────────────────────────────────────────────────────────────

const Message: React.FC<MessageProps> = ({ role, content }) => {
  const isUser = role === 'user'
  const { text, correction } = parseContent(content)

  return (
    <div style={styles.wrapper(isUser)}>
      {!isUser && <div style={styles.avatar.assistant}>A</div>}

      <div style={styles.bubble(isUser)}>
        <div style={styles.text}>{text}</div>

        {correction && (
          <div style={styles.correction}>
            <div style={styles.correctionDivider} />
            <span style={styles.correctionText}>{correction}</span>
          </div>
        )}
      </div>

      {isUser && <div style={styles.avatar.user}>B</div>}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  wrapper: (isUser: boolean): React.CSSProperties => ({
    display: 'flex',
    justifyContent: isUser ? 'flex-end' : 'flex-start',
    marginBottom: '16px',
    padding: '0 16px',
    animation: 'fadeIn 0.3s ease',
    alignItems: 'flex-end',
    gap: '8px',
  }),

  bubble: (isUser: boolean): React.CSSProperties => ({
    maxWidth: '75%',
    padding: '10px 14px',
    borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
    background: isUser
      ? 'linear-gradient(135deg, #6366f1, #06b6d4)'
      : 'rgba(99,102,241,0.08)',
    border: isUser ? 'none' : '0.5px solid rgba(99,102,241,0.2)',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#f1f5f9',
    fontFamily: 'Inter, sans-serif',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  }),

  text: {
    color: '#f1f5f9',
    fontSize: '14px',
    lineHeight: '1.6',
  } as React.CSSProperties,

  correction: {
    marginTop: '8px',
  } as React.CSSProperties,

  correctionDivider: {
    height: '0.5px',
    background: 'rgba(244,63,94,0.25)',
    marginBottom: '6px',
  } as React.CSSProperties,

  correctionText: {
    fontSize: '11px',
    color: '#fda4af',
    fontFamily: 'Inter, sans-serif',
    lineHeight: '1.5',
  } as React.CSSProperties,

  avatar: {
    assistant: {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: 600,
      color: '#fff',
      flexShrink: 0,
    } as React.CSSProperties,

    user: {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #ffd93d, #ff6b9d)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: 600,
      color: '#fff',
      flexShrink: 0,
    } as React.CSSProperties,
  },
} as const

export default Message
