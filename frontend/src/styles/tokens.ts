export const tokens = {
  colors: {
    bg: {
      base: '#0a0a0f',
      surface: '#12121a',
      elevated: '#1a1a28',
      message: '#1e1e2e',
    },
    accent: {
      green: '#00ff87',
      blue: '#4d9fff',
      purple: '#b44dff',
      yellow: '#ffd93d',
      pink: '#ff6b9d',
      gradient: 'linear-gradient(135deg, #4d9fff, #b44dff)',
      avatarGradient: 'linear-gradient(135deg, #00ff87, #4d9fff)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#8888aa',
      muted: '#555577',
    },
    border: {
      default: '#2a2a3a',
    },
    status: {
      error: '#ff4d4d',
      success: '#00ff87',
    },
  },
  font: {
    body: 'Inter, sans-serif',
    heading: 'Syne, sans-serif',
  },
  radius: {
    sm: '12px',
    md: '18px',
    lg: '24px',
    full: '50%',
  },
} as const
