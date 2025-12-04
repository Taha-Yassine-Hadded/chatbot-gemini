'use client'

import { motion } from 'framer-motion'
import { Zap, Hash } from 'lucide-react'

interface TokenMetricsProps {
  tokensPerSecond: number
  totalTokens: number
}

export default function TokenMetrics({ tokensPerSecond, totalTokens }: TokenMetricsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-1.5">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Zap className="w-3.5 h-3.5 text-yellow-500" />
        </motion.div>
        <span className="font-medium">{tokensPerSecond.toFixed(1)}</span>
        <span className="text-gray-400">tokens/s</span>
      </div>
      
      <div className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
      
      <div className="flex items-center gap-1.5">
        <Hash className="w-3.5 h-3.5 text-blue-500" />
        <span className="font-medium">{totalTokens}</span>
        <span className="text-gray-400">tokens</span>
      </div>
    </motion.div>
  )
}