import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setSigningOut(true)
      await signOut()
      navigate('/')
    } finally {
      setSigningOut(false)
    }
  }

  const displayName = profile?.full_name ?? user?.email ?? ''
  const initials    = displayName.charAt(0).toUpperCase()

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold hover:opacity-90 transition-opacity">
            <span>🏛️</span>
            <span>Municipio Digital</span>
          </Link>

          {/* Acciones de usuario */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="hidden sm:flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>

                {/* Avatar + nombre */}
                <Link
                  to="/perfil"
                  className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-full bg-white text-blue-800 flex items-center justify-center text-sm font-bold">
                    {initials}
                  </div>
                  <span className="hidden sm:block text-sm text-blue-100 max-w-32 truncate">
                    {profile?.full_name ?? user.email}
                  </span>
                </Link>

                {/* Sign out */}
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="text-sm bg-blue-700 hover:bg-blue-600 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                >
                  {signingOut ? '…' : 'Salir'}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-blue-200 hover:text-white transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-white text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-md font-medium transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
