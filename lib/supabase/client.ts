// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Message, Conversation } from '@/types'

export const supabase = createClientComponentClient()

// Sauvegarder un message
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  tokenCount?: number
): Promise<Message> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      user_id: user.id,
      role,
      content,
      token_count: tokenCount
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Créer une nouvelle conversation
export async function createConversation(title: string = 'Nouvelle conversation'): Promise<Conversation> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: user.id,
      title
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getUserConversations(): Promise<Conversation[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      messages (count)
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) throw error
  
  return (data || []).map(conv => ({
    ...conv,
    message_count: conv.messages?.[0]?.count || 0
  }))
}

// Supprimer une conversation
export async function deleteConversation(conversationId: string): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)

  if (error) throw error
}

// Mettre à jour le titre d'une conversation
export async function updateConversationTitle(conversationId: string, title: string): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({ title })
    .eq('id', conversationId)

  if (error) throw error
}