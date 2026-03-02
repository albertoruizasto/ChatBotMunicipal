import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { conversationService } from '@/services/chat.service'
import type { Conversation } from '@/types'

interface UseConversationsReturn {
  conversations: Conversation[]
  loading: boolean
  error: string | null
  createConversation: (title?: string) => Promise<Conversation>
  archiveConversation: (id: string) => Promise<void>
  renameConversation: (id: string, title: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useConversations(): UseConversationsReturn {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState<string | null>(null)

  const fetchConversations = useCallback(async () => {
    if (!user) return
    try {
      setError(null)
      const data = await conversationService.getAll(user.id)
      setConversations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar conversaciones')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  const createConversation = useCallback(async (title?: string): Promise<Conversation> => {
    if (!user) throw new Error('No hay sesión activa')
    setError(null)
    try {
      const conv = await conversationService.create(user.id, title)
      // Optimistic update: insertar al inicio
      setConversations((prev) => [conv, ...prev])
      return conv
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear conversación'
      setError(msg)
      throw err
    }
  }, [user])

  const archiveConversation = useCallback(async (id: string) => {
    await conversationService.archive(id)
    // Remover de la lista
    setConversations((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const renameConversation = useCallback(async (id: string, title: string) => {
    await conversationService.updateTitle(id, title)
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    )
  }, [])

  /** Mueve una conversación al tope (tras enviar mensaje) */
  const bumpConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === id)
      if (idx <= 0) return prev
      const updated = [...prev]
      const [conv] = updated.splice(idx, 1)
      return [{ ...conv, updated_at: new Date().toISOString() }, ...updated]
    })
  }, [])

  return {
    conversations,
    loading,
    error,
    createConversation,
    archiveConversation,
    renameConversation,
    refetch: fetchConversations,
    // @ts-expect-error — internal method exposed for ChatPage
    _bump: bumpConversation,
  }
}
