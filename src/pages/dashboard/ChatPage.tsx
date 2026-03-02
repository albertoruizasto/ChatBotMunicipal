import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useConversations } from '@/hooks/useConversations'
import { useMessages } from '@/hooks/useMessages'
import ConversationList from '@/components/chat/ConversationList'
import MessageBubble from '@/components/chat/MessageBubble'
import MessageInput from '@/components/chat/MessageInput'
import TypingIndicator from '@/components/chat/TypingIndicator'
import type { Conversation } from '@/types'

export default function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeConv, setActiveConv]     = useState<Conversation | null>(null)
  const [showList, setShowList]         = useState(true) // mobile: alterna panel
  const messagesEndRef                  = useRef<HTMLDivElement>(null)

  const {
    conversations,
    loading: convLoading,
    error: convError,
    createConversation,
    archiveConversation,
    renameConversation,
    // @ts-expect-error internal
    _bump: bumpConversation,
  } = useConversations()

  const {
    messages,
    loading: msgLoading,
    sending,
    isTyping,
    error: msgError,
    sendMessage,
    clearError,
  } = useMessages(activeConv?.id ?? null, () => {
    bumpConversation?.(activeConv?.id)
  })

  // Sincronizar con query param ?conv=<id>
  useEffect(() => {
    const convId = searchParams.get('conv')
    if (convId && conversations.length > 0) {
      const found = conversations.find((c) => c.id === convId)
      if (found) {
        setActiveConv(found)
        setShowList(false)
      }
    }
  }, [searchParams, conversations])

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSelectConv = useCallback((conv: Conversation) => {
    setActiveConv(conv)
    setShowList(false)
    setSearchParams({ conv: conv.id })
  }, [setSearchParams])

  const handleNewConv = useCallback(async () => {
    try {
      const conv = await createConversation()
      setActiveConv(conv)
      setShowList(false)
      setSearchParams({ conv: conv.id })
    } catch {
      // El error queda en convError y se muestra en la UI
    }
  }, [createConversation, setSearchParams])

  const handleArchive = useCallback(async (id: string) => {
    await archiveConversation(id)
    if (activeConv?.id === id) {
      setActiveConv(null)
      setSearchParams({})
    }
  }, [archiveConversation, activeConv, setSearchParams])

  const handleSend = useCallback(async (content: string) => {
    if (!activeConv) return
    await sendMessage(content)
  }, [activeConv, sendMessage])

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Panel de conversaciones ─────────────────────────────────── */}
      <div className={`
        w-full md:w-72 lg:w-80 shrink-0 bg-white border-r border-gray-200 flex flex-col
        ${showList ? 'flex' : 'hidden md:flex'}
      `}>
        {convError && (
          <div className="mx-3 mt-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">
            <span className="shrink-0">⚠️</span>
            <span>{convError}</span>
          </div>
        )}
        <ConversationList
          conversations={conversations}
          activeId={activeConv?.id ?? null}
          loading={convLoading}
          onSelect={handleSelectConv}
          onNew={handleNewConv}
          onArchive={handleArchive}
          onRename={renameConversation}
        />
      </div>

      {/* ── Panel de mensajes ───────────────────────────────────────── */}
      <div className={`
        flex-1 flex flex-col bg-gray-50 min-w-0
        ${!showList ? 'flex' : 'hidden md:flex'}
      `}>
        {activeConv ? (
          <>
            {/* Header del chat activo */}
            <div className="bg-white border-b border-gray-200 px-4 h-14 flex items-center gap-3 shrink-0">
              {/* Botón volver (móvil) */}
              <button
                onClick={() => setShowList(true)}
                className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                aria-label="Volver a conversaciones"
              >
                <BackIcon />
              </button>

              <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white text-xs shrink-0">
                🏛️
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {activeConv.title ?? 'Asistente Municipal'}
                </p>
                <p className="text-xs text-green-500">En línea</p>
              </div>
            </div>

            {/* Área de mensajes */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {/* Estado de carga */}
              {msgLoading && (
                <div className="flex justify-center py-6">
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Spinner /> Cargando mensajes…
                  </div>
                </div>
              )}

              {/* Mensaje inicial si no hay mensajes */}
              {!msgLoading && messages.length === 0 && (
                <div className="flex justify-center pt-8">
                  <div className="text-center max-w-xs">
                    <div className="text-5xl mb-3">🏛️</div>
                    <p className="text-sm font-medium text-gray-600">Asistente Municipal</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Hola, soy el asistente del Municipio Digital. ¿En qué puedo ayudarte hoy?
                    </p>
                  </div>
                </div>
              )}

              {/* Mensajes */}
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {/* Indicador de escritura */}
              {isTyping && <TypingIndicator />}

              {/* Anchor para auto-scroll */}
              <div ref={messagesEndRef} />
            </div>

            {/* Error de envío */}
            {msgError && (
              <div className="mx-4 mb-2 flex items-center justify-between bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">
                <span>⚠️ {msgError}</span>
                <button onClick={clearError} className="ml-2 hover:underline">Cerrar</button>
              </div>
            )}

            {/* Input de mensaje */}
            <div className="px-4 pb-4 shrink-0">
              <MessageInput
                onSend={handleSend}
                disabled={sending || msgLoading}
                placeholder="Escribe tu consulta al municipio…"
              />
              <p className="text-center text-[10px] text-gray-400 mt-2">
                Las respuestas son orientativas. Para trámites oficiales visita las oficinas municipales.
              </p>
            </div>
          </>
        ) : (
          /* ── Estado vacío ── */
          <EmptyState onNew={handleNewConv} onShowList={() => setShowList(true)} />
        )}
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onNew, onShowList }: { onNew: () => void; onShowList: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-sm px-4">
        <div className="text-7xl mb-4">💬</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Bienvenido al Chat Municipal</h2>
        <p className="text-sm text-gray-500 mb-6">
          Selecciona una conversación o inicia una nueva para consultar con el asistente del municipio.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={onNew}
            className="bg-blue-800 hover:bg-blue-700 text-white text-sm px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            + Nueva conversación
          </button>
          <button
            onClick={onShowList}
            className="md:hidden bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            Ver conversaciones
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Micro-iconos ─────────────────────────────────────────────────────────────

function BackIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
