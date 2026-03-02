import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

/**
 * Página intermediaria que maneja el callback OAuth de Supabase/Google.
 * Supabase redirige aquí con los tokens en el hash de la URL.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase detecta automáticamente los tokens en el hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <svg className="animate-spin h-8 w-8 text-blue-700" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm">Completando inicio de sesión…</span>
      </div>
    </div>
  )
}
