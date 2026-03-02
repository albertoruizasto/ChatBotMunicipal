import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  /** Roles permitidos. Si no se especifica, solo requiere estar autenticado. */
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  // Mientras carga la sesión, muestra un spinner centrado
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <svg className="animate-spin h-8 w-8 text-blue-700" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Verificando sesión…</span>
        </div>
      </div>
    )
  }

  // Sin sesión → redirige a login conservando la ruta original
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Con roles requeridos → verifica que el perfil tenga el rol adecuado
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
