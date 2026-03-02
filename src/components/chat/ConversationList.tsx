import { useState } from 'react'
import type { Conversation } from '@/types'

interface ConversationListProps {
  conversations: Conversation[]
  activeId: string | null
  loading: boolean
  onSelect: (conv: Conversation) => void
  onNew: () => void
  onArchive: (id: string) => void
  onRename: (id: string, title: string) => void
}

export default function ConversationList({
  conversations,
  activeId,
  loading,
  onSelect,
  onNew,
  onArchive,
  onRename,
}: ConversationListProps) {
  const [search, setSearch]         = useState('')
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const filtered = conversations.filter((c) =>
    (c.title ?? 'Sin título').toLowerCase().includes(search.toLowerCase())
  )

  const startRename = (conv: Conversation) => {
    setRenamingId(conv.id)
    setRenameValue(conv.title ?? '')
    setMenuOpenId(null)
  }

  const commitRename = (id: string) => {
    if (renameValue.trim()) onRename(id, renameValue.trim())
    setRenamingId(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header del panel */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Conversaciones</h2>
          <button
            onClick={onNew}
            title="Nueva conversación"
            className="w-7 h-7 rounded-lg bg-blue-700 hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
          >
            <PlusIcon />
          </button>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-gray-50 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 px-4">
            {search ? (
              <p className="text-xs text-gray-400">Sin resultados para "{search}"</p>
            ) : (
              <>
                <div className="text-4xl mb-2">💬</div>
                <p className="text-xs text-gray-500 font-medium">Sin conversaciones</p>
                <p className="text-xs text-gray-400 mt-1">Toca + para empezar una nueva</p>
              </>
            )}
          </div>
        ) : (
          <ul className="py-1">
            {filtered.map((conv) => {
              const isActive = conv.id === activeId

              return (
                <li key={conv.id} className="relative group">
                  {renamingId === conv.id ? (
                    /* ── Modo edición de nombre ── */
                    <div className="flex items-center gap-1 px-3 py-2 bg-blue-50">
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => commitRename(conv.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitRename(conv.id)
                          if (e.key === 'Escape') setRenamingId(null)
                        }}
                        className="flex-1 text-xs px-2 py-1 border border-blue-300 rounded focus:outline-none"
                      />
                    </div>
                  ) : (
                    /* ── Ítem normal ── */
                    <button
                      onClick={() => onSelect(conv)}
                      className={`w-full text-left px-4 py-3 transition-colors hover:bg-gray-50 ${isActive ? 'bg-blue-50 border-r-2 border-blue-700' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-medium truncate ${isActive ? 'text-blue-800' : 'text-gray-800'}`}>
                            {conv.title ?? 'Sin título'}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {formatDate(conv.updated_at)}
                          </p>
                        </div>

                        {/* Menú contextual */}
                        <div className="relative shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setMenuOpenId(menuOpenId === conv.id ? null : conv.id)
                            }}
                            className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <DotsIcon />
                          </button>

                          {menuOpenId === conv.id && (
                            <div className="absolute right-0 top-5 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36 text-xs">
                              <button
                                onClick={(e) => { e.stopPropagation(); startRename(conv) }}
                                className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <PencilIcon className="w-3 h-3" /> Renombrar
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setMenuOpenId(null)
                                  onArchive(conv.id)
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2"
                              >
                                <ArchiveIcon className="w-3 h-3" /> Archivar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Overlay para cerrar menú */}
      {menuOpenId && (
        <div className="fixed inset-0 z-[5]" onClick={() => setMenuOpenId(null)} />
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const date = new Date(iso)
  const now  = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86_400_000)

  if (days === 0) {
    return new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' }).format(date)
  }
  if (days === 1) return 'Ayer'
  if (days < 7)  return `Hace ${days} días`
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(date)
}

// ─── Micro-iconos SVG ─────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
    </svg>
  )
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function ArchiveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
