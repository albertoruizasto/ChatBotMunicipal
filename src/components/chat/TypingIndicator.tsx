export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white text-xs shrink-0 mb-1">
        🏛️
      </div>

      {/* Burbuja con puntos animados */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
        <span
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '1s' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: '160ms', animationDuration: '1s' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: '320ms', animationDuration: '1s' }}
        />
      </div>
    </div>
  )
}
