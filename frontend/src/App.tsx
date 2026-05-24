import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, SignIn, useUser } from '@clerk/clerk-react'
import Layout from './components/Layout'
import ChatPage from './pages/ChatPage'
import LessonsPage from './pages/LessonsPage'
import CardsPage from './pages/CardsPage'
import ProgressPage from './pages/ProgressPage'
import NotesPage from './pages/NotesPage'

const SyncUser: React.FC = () => {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (!isLoaded || !user) return

    const sync = async () => {
      try {
        const token = await (window as any).Clerk?.session?.getToken()
        await fetch('http://localhost:3001/api/users/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName,
          }),
        })
      } catch (error) {
        console.error('Failed to sync user:', error)
      }
    }

    sync()
  }, [isLoaded, user])

  return null
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SignedOut>
        <div style={styles.authContainer}>
          <div style={styles.branding}>
            <h1 style={styles.logo}>Vivi</h1>
            <p style={styles.tagline}>Your German learning companion</p>
          </div>
          <SignIn routing="hash" />
        </div>
      </SignedOut>

      <SignedIn>
        <SyncUser />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/chat" replace />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="lessons" element={<LessonsPage />} />
            <Route path="cards" element={<CardsPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="notes" element={<NotesPage />} />
          </Route>
        </Routes>
      </SignedIn>
    </BrowserRouter>
  )
}

const styles = {
  authContainer: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0f',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '32px',
    padding: '24px',
  },
  branding: {
    textAlign: 'center' as const,
    marginBottom: '8px',
  },
  logo: {
    fontSize: '48px',
    fontWeight: 700,
    fontFamily: 'Syne, sans-serif',
    background: 'linear-gradient(135deg, #4d9fff, #b44dff)',
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
    margin: 0,
  },
  tagline: {
    fontSize: '16px',
    color: '#8888aa',
    fontFamily: 'Inter, sans-serif',
    margin: 0,
  },
}

export default App
