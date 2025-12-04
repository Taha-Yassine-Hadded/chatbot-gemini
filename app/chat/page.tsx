'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createConversation } from '@/lib/supabase/client'
import ChatInterface from '@/components/ChatInterface'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Loader2 } from 'lucide-react'

function ChatPageContent() {
  const searchParams = useSearchParams()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const initConversation = async () => {
      const id = searchParams.get('id')
      
      if (id) {
        setConversationId(id)
      } else {
        try {
          const newConv = await createConversation()
          setConversationId(newConv.id)
          window.history.replaceState({}, '', `/chat?id=${newConv.id}`)
        } catch (error) {
          console.error('Erreur de création:', error)
        }
      }
      setLoading(false)
    }

    initConversation()
  }, [searchParams])

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true)
    }
  }, [])

  if (loading || !conversationId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarOpen ? 'lg:pl-72' : 'lg:pl-0'
      }`}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-hidden">
          <ChatInterface conversationId={conversationId} />
        </main>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  )
}