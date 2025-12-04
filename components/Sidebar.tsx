'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MessageSquare, Clock, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getUserConversations, deleteConversation, createConversation } from '@/lib/supabase/client'
import { Conversation } from '@/types'
import Link from 'next/link'
import Swal from 'sweetalert2'
import toast from 'react-hot-toast'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onToggle: () => void
}

export default function Sidebar({ isOpen, onClose, onToggle }: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { t, language } = useLanguage()

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const data = await getUserConversations()
      setConversations(data)
    } catch (error) {
      console.error('Erreur de chargement:', error)
      toast.error(t('errorLoading'))
    } finally {
      setLoading(false)
    }
  }
  const handleNewChat = async () => {
    try {
      const newConv = await createConversation()
      router.push(`/chat?id=${newConv.id}`)
      toast.success(t('conversationCreated'))
      if (window.innerWidth < 1024) {
        onClose()
      }
    } catch (error) {
      console.error('Erreur de création:', error)
      toast.error(t('errorCreating'))
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const result = await Swal.fire({
      title: t('deleteConfirmTitle'),
      text: t('deleteConfirmText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('confirmDelete'),
      cancelButtonText: t('cancel')
    })
    
    if (!result.isConfirmed) return
    
    try {
      await deleteConversation(id)
      setConversations(prev => prev.filter(c => c.id !== id))
      toast.success(t('conversationDeleted'))
    } catch (error) {
      console.error('Erreur de suppression:', error)
      toast.error(t('errorDeleting'))
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return t('today')
    if (days === 1) return t('yesterday')
    if (days < 7) return `${days} ${t('daysAgo')}`
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <>
      {/* Overlay mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed top-0 left-0 h-screen w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 flex flex-col"
      >
        {/* Toggle button - centered on the right edge */}
        <motion.button
          onClick={onToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`hidden lg:flex absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-12 border rounded-r-lg items-center justify-center shadow-lg transition-colors z-10 ${
            isOpen 
              ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 border-purple-600 hover:from-blue-700 hover:to-purple-700'
          }`}
        >
          {isOpen ? (
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-white" />
          )}
        </motion.button>

        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('conversations')}</h2>
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewChat}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('newConversation')}
          </motion.button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">{t('noConversations')}</p>
            </div>
          ) : (
            conversations.map(conv => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <Link
                  href={`/chat?id=${conv.id}`}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative"
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {conv.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(conv.updated_at)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/history"
            onClick={() => window.innerWidth < 1024 && onClose()}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Clock className="w-4 h-4" />
            {t('viewFullHistory')}
          </Link>
        </div>
      </motion.aside>
    </>
  )
}