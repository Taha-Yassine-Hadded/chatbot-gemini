import { GoogleGenAI } from '@google/genai'
import { StreamChunk } from '@/types'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables')
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function* streamGeminiResponse(
  messages: Array<{ role: string; content: string }>
): AsyncGenerator<StreamChunk> {
  try {
    let prompt = ''
    for (const msg of messages) {
      if (msg.role === 'user') {
        prompt += `User: ${msg.content}\n\n`
      } else {
        prompt += `Assistant: ${msg.content}\n\n`
      }
    }
    
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    })

    let totalTokens = 0
    const startTime = Date.now()

    for await (const chunk of response.stream) {
      const text = chunk.text()
      
      if (!text) continue
      
      const chunkTokens = Math.ceil(text.length / 4)
      totalTokens += chunkTokens

      const elapsedSeconds = (Date.now() - startTime) / 1000
      const tokensPerSecond = elapsedSeconds > 0 ? totalTokens / elapsedSeconds : 0

      yield {
        text,
        tokens: totalTokens,
        tokensPerSecond: Math.round(tokensPerSecond * 10) / 10
      }
    }
  } catch (error: any) {
    console.error('Gemini API Error:', error)
    console.error('Error details:', error.message)
    throw new Error(`Gemini API Error: ${error.message || 'Unknown error'}`)
  }
}