import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { messageService, sendMessage as sendMessageFlow } from '@/services/chat.service'
import type { ChatMessage } from '@/types'

interface UseMessagesReturn {
  messages: ChatMessage[]
  loading: boolean
  sending: boolean
  isTyping: boolean
  error: string | null
  sendMessage: (content: string) => Promise<void>
  clearError: () => void
}

export function useMessages(
  conversationId: string | null,
  onMessageSent?: () => void,
): UseMessagesReturn {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading]   = useState(false)
  const [sending, setSending]   = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  // Ref para evitar carreras entre conversaciones
  const currentConvId = useRef<string | null>(null)

  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      setLoading(false)
      return
    }

    currentConvId.current = conversationId
    setLoading(true)
    setMessages([])

    messageService
      .getAll(conversationId)
      .then((data) => {
        // Solo actualiza si la conversación no cambió
        if (currentConvId.current === conversationId) {
          setMessages(data)
        }
      })
      .catch((err) => {
        if (currentConvId.current === conversationId) {
          setError(err instanceof Error ? err.message : 'Error al cargar mensajes')
        }
      })
      .finally(() => {
        if (currentConvId.current === conversationId) {
          setLoading(false)
        }
      })
  }, [conversationId])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !conversationId || !content.trim()) return

      const optimisticId = `optimistic-${Date.now()}`

      // 1. Mensaje optimista del usuario
      const optimisticMsg: ChatMessage = {
        id: optimisticId,
        conversation_id: conversationId,
        role: 'user',
        content: content.trim(),
        metadata: null,
        created_at: new Date().toISOString(),
        pending: true,
      }
      setMessages((prev) => [...prev, optimisticMsg])
      setSending(true)
      setError(null)

      try {
        // 2. Enviar al backend y webhook
        setIsTyping(true)
        const { userMessage, assistantMessage } = await sendMessageFlow({
          conversationId,
          userId: user.id,
          content: content.trim(),
          profile: profile
            ? { full_name: profile.full_name, role: profile.role, email: profile.email }
            : undefined,
        })

        // 3. Reemplazar optimista con real + agregar respuesta
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== optimisticId),
          { ...userMessage, pending: false },
          assistantMessage,
        ])

        onMessageSent?.()
      } catch (err) {
        // Marcar como fallido
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticId ? { ...m, pending: false, failed: true } : m
          )
        )
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo enviar el mensaje. Intenta nuevamente.'
        )
      } finally {
        setSending(false)
        setIsTyping(false)
      }
    },
    [user, profile, conversationId, onMessageSent],
  )

  return {
    messages,
    loading,
    sending,
    isTyping,
    error,
    sendMessage,
    clearError: () => setError(null),
  }
}
