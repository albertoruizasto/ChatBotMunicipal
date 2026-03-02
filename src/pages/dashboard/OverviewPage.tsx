import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useConversations } from '@/hooks/useConversations'

const roleLabel: Record<string, string> = { citizen: 'Ciudadano', officer: 'Funcionario', admin: 'Administrador' }

export default function OverviewPage() {
  const { profile } = useAuth()
  const { conversations, loading: convLoading } = useConversations()

  const role        = profile?.role ?? 'citizen'
  const displayName = profile?.full_name ?? profile?.email ?? 'Usuario'
  const recentConvs = conversations.slice(0, 4)

  const stats = [
    { label: 'Conversaciones',   value: convLoading ? '…' : String(conversations.length), icon: '💬', color: 'border-blue-200 bg-blue-50',   textColor: 'text-blue-700' },
    { label: 'Trámites activos', value: '0',                                                icon: '📋', color: 'border-green-200 bg-green-50', textColor: 'text-green-700' },
    { label: 'Notificaciones',   value: '2',                                                icon: '🔔', color: 'border-yellow-200 bg-yellow-50',textColor: 'text-yellow-700' },
    { label: 'Documentos',       value: '0',                                                icon: '📄', color: 'border-purple-200 bg-purple-50',textColor: 'text-purple-700' },
  ]

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-2xl p-6 text-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold backdrop-blur-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">Hola, {displayName.split(' ')[0]} 👋</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 text-white`}>
                {roleLabel[role]}
              </span>
              {profile?.dni && (
                <span className="text-xs text-blue-200">DNI: {profile.dni}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon, color, textColor }) => (
          <div key={label} className={`rounded-xl border p-4 ${color}`}>
            <div className="text-2xl mb-2">{icon}</div>
            <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
            <div className="text-xs text-gray-600 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: '💬', title: 'Ir al Chat',       desc: 'Consulta con el asistente virtual.', to: '/dashboard/chat',     cta: 'Abrir chat' },
            { icon: '📋', title: 'Nuevo Trámite',    desc: 'Inicia una gestión municipal.',       to: '/dashboard/tramites', cta: 'Ver trámites' },
            { icon: '👤', title: 'Mi Perfil',        desc: 'Actualiza tus datos personales.',     to: '/dashboard/perfil',   cta: 'Ver perfil' },
          ].map((a) => (
            <Link
              key={a.title}
              to={a.to}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all group block"
            >
              <div className="text-3xl mb-2">{a.icon}</div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">{a.title}</p>
              <p className="text-xs text-gray-500 mt-1">{a.desc}</p>
              <p className="text-xs text-blue-600 mt-2 font-medium">{a.cta} →</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Conversaciones recientes */}
      {!convLoading && conversations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Conversaciones recientes</h2>
            <Link to="/dashboard/chat" className="text-xs text-blue-600 hover:underline">Ver todas →</Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            {recentConvs.map((conv) => (
              <Link
                key={conv.id}
                to={`/dashboard/chat?conv=${conv.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                  💬
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{conv.title ?? 'Sin título'}</p>
                  <p className="text-xs text-gray-400">{formatDate(conv.updated_at)}</p>
                </div>
                <span className="text-gray-300 text-xs">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Info del perfil */}
      {profile?.province && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Información registrada</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
            {[
              { label: 'Correo',    value: profile.email },
              { label: 'Teléfono', value: profile.phone },
              { label: 'Provincia', value: profile.province },
              { label: 'Cantón',   value: profile.canton },
              { label: 'Distrito', value: profile.district },
            ].filter((r) => r.value).map(({ label, value }) => (
              <div key={label} className="flex gap-2">
                <dt className="font-medium text-gray-500 w-20 shrink-0">{label}:</dt>
                <dd className="text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}
