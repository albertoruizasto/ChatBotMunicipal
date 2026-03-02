import { supabase } from '@/lib/supabase'
import type { Conversation, ChatMessage, WebhookPayload, WebhookResponse } from '@/types'

// ─── Conversations ────────────────────────────────────────────────────────────

export const conversationService = {
  /** Obtiene todas las conversaciones del usuario, ordenadas por la más reciente */
  async getAll(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'archived')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as Conversation[]
  },

  /** Crea una nueva conversación */
  async create(userId: string, title?: string): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title: title ?? 'Nueva conversación',
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error
    return data as Conversation
  },

  /** Actualiza el título de una conversación */
  async updateTitle(id: string, title: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', id)

    if (error) throw error
  },

  /** Archiva (oculta) una conversación */
  async archive(id: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({ status: 'archived' })
      .eq('id', id)

    if (error) throw error
  },

  /** Toca updated_at para reflejar actividad reciente */
  async touch(id: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messageService = {
  /** Carga todos los mensajes de una conversación */
  async getAll(conversationId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data ?? []) as ChatMessage[]
  },

  /** Guarda un mensaje en Supabase */
  async save(
    conversationId: string,
    role: ChatMessage['role'],
    content: string,
    metadata?: Record<string, unknown>,
  ): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, role, content, metadata: metadata ?? null })
      .select()
      .single()

    if (error) throw error
    return data as ChatMessage
  },
}

// ─── Webhook n8n ──────────────────────────────────────────────────────────────

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL

/** Envía el mensaje del usuario al webhook de n8n y retorna la respuesta del asistente */
export async function sendToWebhook(payload: WebhookPayload): Promise<string> {
  if (!WEBHOOK_URL) {
    throw new Error('VITE_N8N_WEBHOOK_URL no está configurada en las variables de entorno.')
  }

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Error del webhook: ${response.status} ${response.statusText}`)
  }

  // n8n puede responder con distintas formas según el workflow
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const json: WebhookResponse | WebhookResponse[] = await response.json()
    // Soporta array (n8n default) o objeto directo
    const item = Array.isArray(json) ? json[0] : json
    return item?.response ?? item?.message ?? item?.output ?? item?.text ?? 'Sin respuesta'
  }

  // Respuesta de texto plano
  return (await response.text()).trim() || 'Sin respuesta'
}

// ─── Flujo completo: enviar mensaje y guardar todo ────────────────────────────

export interface SendMessageOptions {
  conversationId: string
  userId: string
  content: string
  profile?: { full_name: string; role: string; email: string }
}

/**
 * Orquesta el flujo completo:
 * 1. Guarda el mensaje del usuario en Supabase
 * 2. Envía al webhook de n8n
 * 3. Guarda la respuesta del asistente en Supabase
 * Devuelve ambos mensajes guardados.
 */
export async function sendMessage(
  options: SendMessageOptions,
): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
  const { conversationId, userId, content, profile } = options

  // 1. Guardar mensaje del usuario
  const userMessage = await messageService.save(conversationId, 'user', content)

  // 2. Llamar al webhook
  const assistantContent = await sendToWebhook({
    message: content,
    conversationId,
    userId,
    sessionId: conversationId, // n8n usa sessionId para memoria
    profile,
  })

  // 3. Guardar respuesta del asistente
  const assistantMessage = await messageService.save(conversationId, 'assistant', assistantContent)

  // 4. Actualizar timestamp de la conversación
  await conversationService.touch(conversationId)

  return { userMessage, assistantMessage }
}
