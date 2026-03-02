import type { ChatMessage } from '@/types'

interface MessageBubbleProps {
  message: ChatMessage
  showAvatar?: boolean
}

export default function MessageBubble({ message, showAvatar = true }: MessageBubbleProps) {
  const isUser      = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const isPending   = message.pending
  const isFailed    = message.failed

  const time = new Intl.DateTimeFormat('es', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(message.created_at))

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar del asistente */}
      {isAssistant && showAvatar && (
        <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white text-xs font-bold shrink-0 mb-1">
          🏛️
        </div>
      )}
      {/* Spacer para alinear burbujas de usuario cuando no hay avatar del asistente */}
      {isUser && <div className="w-8 shrink-0" />}

      {/* Burbuja */}
      <div className={`max-w-[72%] md:max-w-[60%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`
            px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words
            ${isUser
              ? `bg-blue-700 text-white rounded-br-sm ${isPending ? 'opacity-70' : ''} ${isFailed ? 'bg-red-500' : ''}`
              : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-bl-sm'
            }
          `}
        >
          {message.content}
        </div>

        {/* Timestamp + estado */}
        <div className={`flex items-center gap-1 mt-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px] text-gray-400">{time}</span>
          {isUser && (
            <span className="text-[10px]">
              {isFailed   ? '⚠️' :
               isPending  ? '🕐' :
               '✓'}
            </span>
          )}
        </div>

        {/* Botón de reintentar si falló */}
        {isFailed && isUser && (
          <button className="text-[10px] text-red-500 hover:underline mt-0.5">
            Error al enviar — toca para reintentar
          </button>
        )}
      </div>

      {/* Spacer para alinear burbujas del asistente */}
      {isAssistant && <div className="w-8 shrink-0" />}
    </div>
  )
}
