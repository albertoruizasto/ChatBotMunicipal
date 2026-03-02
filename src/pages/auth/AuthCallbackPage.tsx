import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

/**
 * Página intermediaria del callback OAuth (Google).
 * Supabase redirige aquí después del login con el código de autorización.
 *
 * Usamos onAuthStateChange en lugar de getSession() porque en el flujo PKCE
 * el código aún no se ha intercambiado cuando la página carga, por lo que
 * getSession() podría retornar null prematuramente.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard', { replace: true })
      } else if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
        navigate('/login', { replace: true })
      }
    })

    // Timeout de seguridad: si en 10 segundos no resuelve, redirige al login
    const timeout = setTimeout(() => {
      navigate('/login', { replace: true })
    }, 10_000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <svg className="animate-spin h-8 w-8 text-blue-700" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm font-medium">Completando inicio de sesión…</span>
        <span className="text-xs text-gray-400">Serás redirigido en un momento</span>
      </div>
    </div>
  )
}
