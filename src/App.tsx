import { Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import Layout          from '@/components/layout/Layout'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ProtectedRoute  from '@/components/auth/ProtectedRoute'

// Páginas públicas
import HomePage            from '@/pages/HomePage'
import LoginPage           from '@/pages/LoginPage'
import RegisterPage        from '@/pages/RegisterPage'
import RegisterSuccessPage from '@/pages/RegisterSuccessPage'
import NotFoundPage        from '@/pages/NotFoundPage'
import UnauthorizedPage    from '@/pages/UnauthorizedPage'

// Callback OAuth
import AuthCallbackPage from '@/pages/auth/AuthCallbackPage'

// Páginas del dashboard (rutas protegidas)
import OverviewPage from '@/pages/dashboard/OverviewPage'
import ChatPage     from '@/pages/dashboard/ChatPage'

function App() {
  return (
    <Routes>
      {/* ── Callback OAuth (sin layout) ── */}
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* ── Sitio público (con Navbar + Footer) ── */}
      <Route path="/" element={<Layout />}>
        <Route index          element={<HomePage />} />
        <Route path="login"   element={<LoginPage />} />
        <Route path="register"         element={<RegisterPage />} />
        <Route path="register/success" element={<RegisterSuccessPage />} />
        <Route path="unauthorized"     element={<UnauthorizedPage />} />
        <Route path="*"                element={<NotFoundPage />} />
      </Route>

      {/* ── Dashboard (sidebar + header, rutas protegidas) ── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Inicio del dashboard */}
          <Route index           element={<OverviewPage />} />

          {/* Chat con el asistente */}
          <Route path="chat"     element={<ChatPage />} />

          {/* Trámites — stub para implementar después */}
          <Route path="tramites" element={<ComingSoon title="Trámites municipales" icon="📋" />} />

          {/* Perfil — stub */}
          <Route path="perfil"   element={<ComingSoon title="Mi Perfil" icon="👤" />} />

          {/* Rutas solo para admin/officer */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'officer']} />}>
            <Route path="usuarios"      element={<ComingSoon title="Gestión de Usuarios" icon="👥" />} />
            <Route path="estadisticas"  element={<ComingSoon title="Estadísticas" icon="📊" />} />
          </Route>
        </Route>

        {/* Redirige /dashboard sin subruta al index */}
        <Route path="/dashboard/*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

// ─── Placeholder para páginas en construcción ─────────────────────────────────

function ComingSoon({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-sm text-gray-500">Esta sección está en construcción.</p>
      </div>
    </div>
  )
}

export default App
