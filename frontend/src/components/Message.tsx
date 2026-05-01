import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MessageProps {
  role: 'user' | 'assistant'
  content: string
}

// ─── Component ────────────────────────────────────────────────────────────────

const Message: React.FC<MessageProps> = ({ role, content }) => {
  const isUser = role === 'user'

  return (
    <div style={styles.wrapper(isUser)}>
      {!isUser && <div style={styles.avatar.assistant}>🇩🇪</div>}

      <div style={styles.bubble(isUser)}>{content}</div>

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
  }),

  bubble: (isUser: boolean): React.CSSProperties => ({
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
    background: isUser
      ? 'linear-gradient(135deg, #4d9fff, #b44dff)'
      : '#1e1e2e',
    border: isUser ? 'none' : '1px solid #2a2a3a',
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#ffffff',
    fontFamily: 'Inter, sans-serif',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  }),

  avatar: {
    assistant: {
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
      marginTop: '4px',
    } as React.CSSProperties,

    user: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #ffd93d, #ff6b9d)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      marginLeft: '10px',
      flexShrink: 0,
      marginTop: '4px',
    } as React.CSSProperties,
  },
} as const

export default Message
