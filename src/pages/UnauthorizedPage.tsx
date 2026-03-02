import { Link } from 'react-router-dom'

export default function UnauthorizedPage() {
  return (
    <div className="text-center py-20">
      <div className="text-7xl mb-4">🔒</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Acceso no autorizado</h1>
      <p className="text-gray-500 mb-8">No tienes permisos para acceder a esta página.</p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 bg-blue-800 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 transition-colors"
      >
        ← Ir al inicio
      </Link>
    </div>
  )
}
