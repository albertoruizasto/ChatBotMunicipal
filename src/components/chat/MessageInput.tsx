import { useRef, useState, type KeyboardEvent } from 'react'

interface MessageInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export default function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Escribe tu consulta…',
}: MessageInputProps) {
  const [value, setValue]   = useState('')
  const textareaRef         = useRef<HTMLTextAreaElement>(null)

  const canSend = value.trim().length > 0 && !disabled

  const handleSend = () => {
    if (!canSend) return
    onSend(value.trim())
    setValue('')
    // Resetea altura del textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    // Auto-expand height (max ≈ 5 líneas)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 130)}px`
    }
  }

  return (
    <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-sm focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200 transition-all">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        className="flex-1 resize-none text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent leading-5 py-1 max-h-[130px] disabled:opacity-50"
      />

      {/* Hint tecla */}
      {value.length > 0 && (
        <span className="text-[10px] text-gray-300 self-end pb-1 hidden sm:block">
          ⌨ Shift+Enter nueva línea
        </span>
      )}

      {/* Botón de enviar */}
      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        aria-label="Enviar mensaje"
        className={`
          shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all
          ${canSend
            ? 'bg-blue-700 hover:bg-blue-600 text-white shadow-sm active:scale-95'
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'}
        `}
      >
        <SendIcon />
      </button>
    </div>
  )
}

function SendIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}
