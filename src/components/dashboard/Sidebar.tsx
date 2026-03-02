import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface NavItem {
  to: string
  end?: boolean
  icon: React.ReactNode
  label: string
  adminOnly?: boolean
}

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onClose: () => void
}

// ─── Navegación ───────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',       end: true,  icon: <HomeIcon />,     label: 'Inicio' },
  { to: '/dashboard/chat',              icon: <ChatIcon />,     label: 'Chat' },
  { to: '/dashboard/tramites',          icon: <DocIcon />,      label: 'Trámites' },
  { to: '/dashboard/perfil',            icon: <UserIcon />,     label: 'Mi Perfil' },
]

const ADMIN_ITEMS: NavItem[] = [
  { to: '/dashboard/usuarios',          icon: <UsersIcon />,    label: 'Usuarios',     adminOnly: true },
  { to: '/dashboard/estadisticas',      icon: <ChartIcon />,    label: 'Estadísticas', adminOnly: true },
]

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Sidebar({ collapsed, mobileOpen, onClose }: SidebarProps) {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'officer'

  const allItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS

  return (
    <>
      {/* Overlay móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-30 flex flex-col
          bg-gray-900 text-white transition-all duration-300 ease-in-out
          ${collapsed ? 'md:w-16' : 'md:w-60'}
          ${mobileOpen ? 'w-72 translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 h-16 border-b border-gray-800 shrink-0 ${collapsed ? 'md:justify-center' : ''}`}>
          <span className="text-2xl shrink-0">🏛️</span>
          {(!collapsed || mobileOpen) && (
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">Municipio Digital</p>
              <p className="text-[10px] text-gray-400 truncate">Portal ciudadano</p>
            </div>
          )}
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {(!collapsed || mobileOpen) && (
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
              Principal
            </p>
          )}

          {allItems.map((item) => {
            if (item.adminOnly) {
              return (
                <div key={item.to}>
                  {!collapsed && item.to === ADMIN_ITEMS[0].to && (
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 mt-4 mb-2">
                      Administración
                    </p>
                  )}
                  <SidebarLink item={item} collapsed={collapsed} mobileOpen={mobileOpen} onClose={onClose} />
                </div>
              )
            }
            return (
              <SidebarLink key={item.to} item={item} collapsed={collapsed} mobileOpen={mobileOpen} onClose={onClose} />
            )
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className={`px-3 py-4 border-t border-gray-800 ${collapsed && !mobileOpen ? 'flex justify-center' : ''}`}>
          {(!collapsed || mobileOpen) ? (
            <div className="flex items-center gap-2 px-2">
              <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                {(profile?.full_name || profile?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{profile?.full_name || profile?.email || 'Usuario'}</p>
                <p className="text-[10px] text-gray-400 truncate">{profile?.email}</p>
              </div>
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold">
              {(profile?.full_name || profile?.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

// ─── NavLink item ─────────────────────────────────────────────────────────────

function SidebarLink({
  item,
  collapsed,
  mobileOpen,
  onClose,
}: {
  item: NavItem
  collapsed: boolean
  mobileOpen: boolean
  onClose: () => void
}) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClose}
      title={collapsed && !mobileOpen ? item.label : undefined}
      className={({ isActive }) => `
        flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors
        ${isActive
          ? 'bg-blue-700 text-white'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }
        ${collapsed && !mobileOpen ? 'md:justify-center md:px-2' : ''}
      `}
    >
      <span className="shrink-0">{item.icon}</span>
      {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
    </NavLink>
  )
}

// ─── Íconos SVG ───────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}
