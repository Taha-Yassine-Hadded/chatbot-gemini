export interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  token_count?: number
  created_at?: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  message_count?: number
}

export interface StreamChunk {
  text: string
  tokens: number
  tokensPerSecond: number
}

export interface User {
  id: string
  email: string
}