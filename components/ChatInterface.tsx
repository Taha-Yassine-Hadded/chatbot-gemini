'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Sparkles } from 'lucide-react'
import { Message } from '@/types'
import { saveMessage, getConversationMessages } from '@/lib/supabase/client'
import ChatMessage from './ChatMessage'
import toast from 'react-hot-toast'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface ChatInterfaceProps {
  conversationId: string
}

export default function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [tokensPerSecond, setTokensPerSecond] = useState<number>(0)
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingTokens, setStreamingTokens] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { t } = useLanguage()

  const EXAMPLE_PROMPTS = [
    t('examplePrompt1'),
    t('examplePrompt2'),
    t('examplePrompt3'),
    t('examplePrompt4')
  ]

  useEffect(() => {
    if (conversationId) {
      loadHistory()
    }
  }, [conversationId])

  const loadHistory = async () => {
    try {
      const history = await getConversationMessages(conversationId)
      setMessages(history)
    } catch (error) {
      console.error('Erreur de chargement:', error)
      toast.error(t('errorLoadingHistory'))
    } finally {
      setLoadingHistory(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  const handleSubmit = async (content?: string) => {
    const userMessage = content || input.trim()
    if (!userMessage || isLoading) return

    setInput('')
    setIsLoading(true)
    setStreamingContent('')
    setStreamingTokens(0)
    setTokensPerSecond(0)

    const newUserMessage: Message = { role: 'user', content: userMessage }
    setMessages(prev => [...prev, newUserMessage])

    try {
      await saveMessage(conversationId, 'user', userMessage)

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newUserMessage]
        })
      })

      if (!response.ok) throw new Error('Erreur de réponse')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''
      let totalTokens = 0

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data)
              fullResponse += parsed.text
              totalTokens = parsed.tokens
              setStreamingContent(fullResponse)
              setStreamingTokens(totalTokens)
              setTokensPerSecond(parsed.tokensPerSecond)
            } catch (e) {}
          
          }
        }
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: fullResponse,
        token_count: totalTokens
      }
      setMessages(prev => [...prev, assistantMessage])
      setStreamingContent('')

      await saveMessage(conversationId, 'assistant', fullResponse, totalTokens)
    } catch (error) {
      console.error('Erreur chat:', error)
      toast.error(t('errorOccurred'))
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: t('sorry')
      }])
    } finally {
      setIsLoading(false)
      setTokensPerSecond(0)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mb-6 shadow-xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {t('howCanIHelp')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {t('askMeAnything')}
            </p>

            {/* Example prompts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {EXAMPLE_PROMPTS.map((prompt, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSubmit(prompt)}
                  className="p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md"
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300">{prompt}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <AnimatePresence>
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}

              {/* Streaming message */}
              {streamingContent && (
                <ChatMessage
                  message={{ role: 'assistant', content: streamingContent, token_count: streamingTokens }}
                  isStreaming={true}
                  tokensPerSecond={tokensPerSecond}
                />
              )}

              {/* Loading indicator */}
              {isLoading && !streamingContent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input form */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('typeMessage')}
              disabled={isLoading}
              rows={1}
              className="flex-1 resize-none rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all max-h-40"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </form>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
            {t('poweredBy')}
          </p>
        </div>
      </div>
    </div>
  )
}