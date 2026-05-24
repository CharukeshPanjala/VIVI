import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.tsx'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!publishableKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        variables: {
          colorBackground: '#12121a',
          colorInputBackground: '#1a1a28',
          colorPrimary: '#4d9fff',
          colorText: '#ffffff',
          colorTextSecondary: '#8888aa',
          colorInputText: '#ffffff',
          colorNeutral: '#8888aa',
          borderRadius: '18px',
          fontFamily: 'Inter, sans-serif',
        },
        elements: {
          card: {
            backgroundColor: '#12121a',
            border: '1px solid #2a2a3a',
            boxShadow: 'none',
          },
          formButtonPrimary: {
            background: 'linear-gradient(135deg, #4d9fff, #b44dff)',
            border: 'none',
          },
        },
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>
)
