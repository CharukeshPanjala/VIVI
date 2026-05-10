import React from 'react'
import { tokens } from '../styles/tokens'

const LessonsPage: React.FC = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Lessons</h1>
      <p style={styles.subtitle}>YouTube lessons coming soon — Step 4</p>
    </div>
  )
}

const { colors, font } = tokens

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '12px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    fontFamily: font.heading,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: '14px',
    color: colors.text.muted,
  },
} as const

export default LessonsPage
