import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export const sendMessage = async (
  messages: ChatMessage[],
  context?: string
): Promise<string> => {
  const response = await api.post('/api/chat/message', {
    messages,
    context,
  })
  return response.data.message
}

export default api
