'use client'

import { motion } from 'framer-motion'
import { LogOut, Menu, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import LanguageSwitcher from './LanguageSwitcher'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth()
  const { t } = useLanguage()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between"
    >
      {/* Left: Menu + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
            ChatBot Gemini
          </span>
        </div>
      </div>

      {/* Right: User info + Language + Logout */}
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {user?.email?.split('@')[0]}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {user?.email}
          </span>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={signOut}
          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
          title={t('logout')}
        >
          <LogOut className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.header>
  )
}