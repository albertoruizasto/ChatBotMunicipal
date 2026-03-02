import { Link } from 'react-router-dom'

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Cuenta creada!</h1>
        <p className="text-gray-500 mb-2">
          Revisa tu bandeja de entrada y confirma tu email para activar la cuenta.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Si no encuentras el correo, revisa la carpeta de spam.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-blue-800 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    </div>
  )
}
