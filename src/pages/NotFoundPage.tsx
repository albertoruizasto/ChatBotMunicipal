import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <div className="text-8xl font-bold text-gray-200 mb-4">404</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Página no encontrada</h1>
      <p className="text-gray-500 mb-8">La página que buscas no existe o fue movida.</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-blue-800 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 transition-colors"
      >
        ← Volver al inicio
      </Link>
    </div>
  )
}
