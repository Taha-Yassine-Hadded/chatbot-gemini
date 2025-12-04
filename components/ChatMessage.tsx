'use client'

import { motion } from 'framer-motion'
import { User, Bot } from 'lucide-react'
import { Message } from '@/types'
import ReactMarkdown from 'react-markdown'
import TokenMetrics from './TokenMetrics'

interface ChatMessageProps {
  message: Message
  isStreaming?: boolean
  tokensPerSecond?: number
}

export default function ChatMessage({ message, isStreaming, tokensPerSecond }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-purple-600'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message bubble */}
      <div className={`flex-1 ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
        <div
          className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-sm'
          }`}
        >
          <ReactMarkdown
            className={`prose prose-sm max-w-none ${
              isUser
                ? 'prose-invert'
                : 'dark:prose-invert prose-headings:font-semibold prose-a:text-blue-600 dark:prose-a:text-blue-400'
            }`}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) =>
                inline ? (
                  <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                    {children}
                  </code>
                ) : (
                  <code className="block p-3 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm overflow-x-auto">
                    {children}
                  </code>
                ),
            }}
          >
            {message.content}
          </ReactMarkdown>

          {/* Token metrics */}
          {!isUser && (isStreaming || message.token_count) && (
            <TokenMetrics
              tokensPerSecond={tokensPerSecond || 0}
              totalTokens={message.token_count || 0}
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}