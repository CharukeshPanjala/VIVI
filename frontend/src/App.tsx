import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ChatPage from './pages/ChatPage'
import LessonsPage from './pages/LessonsPage'
import CardsPage from './pages/CardsPage'
import ProgressPage from './pages/ProgressPage'
import NotesPage from './pages/NotesPage'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/chat" replace />} />
          <Route path="chat"     element={<ChatPage />}     />
          <Route path="lessons"  element={<LessonsPage />}  />
          <Route path="cards"    element={<CardsPage />}    />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="notes"    element={<NotesPage />}    />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
