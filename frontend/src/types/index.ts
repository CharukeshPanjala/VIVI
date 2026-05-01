export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface UserProfile {
  name: string
  nativeLanguage: string
  currentLevel: string
  totalXP: number
  streak: number
  lessonsCompleted: number
  totalLessons: number
}

export interface Lesson {
  id: string
  videoId: string
  title: string
  level: string
  watched: boolean
  vocabExtracted: boolean
}

export interface Mistake {
  original: string
  corrected: string
  explanation: string
  timestamp: Date
}
