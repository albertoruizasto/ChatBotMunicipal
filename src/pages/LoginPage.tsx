import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type LoginFormData = z.infer<typeof loginSchema>

// ─── Componente ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location  = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'

  const [error, setError]           = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // ─── Handlers ──────────────────────────────────────────────────────────

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      await signIn(data.email, data.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(
        err instanceof Error
          ? translateError(err.message)
          : 'Error al iniciar sesión. Intenta nuevamente.'
      )
    }
  }

  const handleGoogle = async () => {
    try {
      setError(null)
      setGoogleLoading(true)
      await signInWithGoogle()
      // La navegación la maneja AuthCallbackPage tras el redirect
    } catch (err) {
      setGoogleLoading(false)
      setError(err instanceof Error ? err.message : 'Error al iniciar con Google.')
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-5xl">🏛️</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-3">Iniciar sesión</h1>
            <p className="text-gray-500 text-sm mt-1">Portal Municipal Digital</p>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || isSubmitting}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <svg className="animate-spin h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <GoogleIcon />
            )}
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">O continúa con email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Email/Password form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <Input
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="text-right mt-1">
                <Link to="/forgot-password" className="text-xs text-blue-700 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5">
                <span className="mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" loading={isSubmitting} disabled={googleLoading} className="w-full">
              Iniciar sesión
            </Button>
          </form>

          {/* Registro */}
          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-blue-700 font-medium hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Google Icon SVG ──────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

// ─── Traductor de errores de Supabase ─────────────────────────────────────────

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials'))
    return 'Email o contraseña incorrectos.'
  if (msg.includes('Email not confirmed'))
    return 'Confirma tu email antes de iniciar sesión.'
  if (msg.includes('Too many requests'))
    return 'Demasiados intentos. Espera unos minutos.'
  return msg
}
