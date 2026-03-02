import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { Notification } from '@/types'

// ─── Notificaciones de ejemplo ────────────────────────────────────────────────
// En producción, estas vendrían de Supabase

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'info',
    title: 'Bienvenido al portal',
    message: 'Tu cuenta ha sido activada correctamente.',
    read: false,
    created_at: new Date(Date.now() - 3_600_000).toISOString(),
  },
  {
    id: '2',
    type: 'success',
    title: 'Perfil actualizado',
    message: 'Tus datos personales han sido guardados.',
    read: false,
    created_at: new Date(Date.now() - 86_400_000).toISOString(),
  },
]

// ─── Route labels ─────────────────────────────────────────────────────────────

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard':             'Inicio',
  '/dashboard/chat':        'Chat',
  '/dashboard/tramites':    'Trámites',
  '/dashboard/perfil':      'Mi Perfil',
  '/dashboard/usuarios':    'Usuarios',
  '/dashboard/estadisticas':'Estadísticas',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DashboardHeaderProps {
  onMenuClick: () => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const [notifOpen, setNotifOpen]         = useState(false)
  const [avatarOpen, setAvatarOpen]       = useState(false)
  const [signingOut, setSigningOut]       = useState(false)

  const notifRef  = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length
  const pageTitle   = ROUTE_LABELS[pathname] ?? 'Dashboard'

  // Cierra dropdowns al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))  setNotifOpen(false)
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    setAvatarOpen(false)
    try {
      await signOut()
    } finally {
      setSigningOut(false)
      navigate('/')
    }
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center gap-3 px-4 shrink-0 z-10">
      {/* Botón de menú */}
      <button
        onClick={onMenuClick}
        aria-label="Abrir menú"
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
      >
        <MenuIcon />
      </button>

      {/* Título de la página */}
      <h1 className="text-sm font-semibold text-gray-800 hidden sm:block">{pageTitle}</h1>

      <div className="flex-1" />

      {/* ── Notificaciones ── */}
      <div ref={notifRef} className="relative">
        <button
          onClick={() => { setNotifOpen((o) => !o); setAvatarOpen(false) }}
          aria-label="Notificaciones"
          className="relative p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-11 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-800">Notificaciones</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>

            <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifications.length === 0 ? (
                <li className="py-8 text-center text-sm text-gray-400">Sin notificaciones</li>
              ) : (
                notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`px-4 py-3 hover:bg-gray-50 transition-colors ${n.read ? '' : 'bg-blue-50/50'}`}
                  >
                    <div className="flex items-start gap-2">
                      <NotifIcon type={n.type} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-800 truncate">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{formatAgo(n.created_at)}</p>
                      </div>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {/* ── Avatar con menú ── */}
      <div ref={avatarRef} className="relative">
        <button
          onClick={() => { setAvatarOpen((o) => !o); setNotifOpen(false) }}
          className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center text-sm font-bold">
            {(profile?.full_name || profile?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-gray-800 max-w-28 truncate">
              {profile?.full_name || profile?.email || 'Usuario'}
            </p>
            <p className="text-[10px] text-gray-400 capitalize">{profile?.role ?? 'citizen'}</p>
          </div>
          <ChevronIcon className={`w-3.5 h-3.5 text-gray-400 transition-transform ${avatarOpen ? 'rotate-180' : ''}`} />
        </button>

        {avatarOpen && (
          <div className="absolute right-0 top-11 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-800 truncate">{profile?.full_name}</p>
              <p className="text-[10px] text-gray-400 truncate">{profile?.email}</p>
            </div>
            <Link
              to="/dashboard/perfil"
              onClick={() => setAvatarOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5" /> Mi perfil
            </Link>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {signingOut
                ? <><SpinnerIcon className="w-3.5 h-3.5 animate-spin" /> Saliendo…</>
                : <><LogoutIcon className="w-3.5 h-3.5" /> Cerrar sesión</>
              }
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

// ─── Helpers y micro-íconos ───────────────────────────────────────────────────

function formatAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return 'Ahora mismo'
  if (mins < 60) return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `Hace ${hrs} h`
  return `Hace ${Math.floor(hrs / 24)} días`
}

function NotifIcon({ type }: { type: Notification['type'] }) {
  const colors = { info: 'text-blue-500', success: 'text-green-500', warning: 'text-yellow-500', error: 'text-red-500' }
  const emojis = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' }
  return <span className={`text-base shrink-0 ${colors[type]}`}>{emojis[type]}</span>
}

function MenuIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
