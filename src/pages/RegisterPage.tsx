import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { RegisterData } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

// ─── Schemas por paso ─────────────────────────────────────────────────────────

const step1Schema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
    .regex(/[0-9]/, 'Debe incluir al menos un número'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

const step2Schema = z.object({
  full_name:  z.string().min(3, 'Ingresa tu nombre completo'),
  dni:        z.string().min(7, 'DNI/Cédula inválida').max(15),
  phone:      z.string().min(8, 'Teléfono inválido').max(15),
  birth_date: z.string().refine((d) => {
    const date = new Date(d)
    const age  = new Date().getFullYear() - date.getFullYear()
    return !isNaN(date.getTime()) && age >= 18
  }, 'Debes ser mayor de 18 años'),
})

const step3Schema = z.object({
  province: z.string().min(1, 'Selecciona una provincia'),
  canton:   z.string().min(1, 'Ingresa el cantón'),
  district: z.string().min(1, 'Ingresa el distrito'),
  address:  z.string().min(5, 'Ingresa tu dirección completa'),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>
type Step3Data = z.infer<typeof step3Schema>

// ─── Provincias ───────────────────────────────────────────────────────────────

const PROVINCES = [
  'San José', 'Alajuela', 'Cartago', 'Heredia',
  'Guanacaste', 'Puntarenas', 'Limón',
]

// ─── Componente ───────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate   = useNavigate()

  const [step, setStep]         = useState<1 | 2 | 3>(1)
  const [error, setError]       = useState<string | null>(null)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null)

  // ─── Formulario paso 1 ─────────────────────────────────────────────────
  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) })

  // ─── Formulario paso 2 ─────────────────────────────────────────────────
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) })

  // ─── Formulario paso 3 ─────────────────────────────────────────────────
  const form3 = useForm<Step3Data>({ resolver: zodResolver(step3Schema) })

  // ─── Handlers ──────────────────────────────────────────────────────────

  const onStep1 = (data: Step1Data) => {
    setStep1Data(data)
    setStep(2)
  }

  const onStep2 = (data: Step2Data) => {
    setStep2Data(data)
    setStep(3)
  }

  const onStep3 = async (data: Step3Data) => {
    if (!step1Data || !step2Data) return
    try {
      setError(null)
      const registerData: RegisterData = {
        email:      step1Data.email,
        password:   step1Data.password,
        full_name:  step2Data.full_name,
        dni:        step2Data.dni,
        phone:      step2Data.phone,
        birth_date: step2Data.birth_date,
        province:   data.province,
        canton:     data.canton,
        district:   data.district,
        address:    data.address,
      }
      await signUp(registerData)
      navigate('/register/success')
    } catch (err) {
      setError(
        err instanceof Error
          ? translateError(err.message)
          : 'Error al crear la cuenta. Intenta nuevamente.'
      )
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        {/* Indicador de pasos */}
        <StepIndicator currentStep={step} />

        {/* Card del formulario */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mt-6">
          {step === 1 && (
            <>
              <StepHeader
                title="Crea tu cuenta"
                subtitle="Paso 1 de 3 — Credenciales de acceso"
              />
              <form onSubmit={form1.handleSubmit(onStep1)} className="space-y-4 mt-6" noValidate>
                <Input
                  label="Correo electrónico"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  error={form1.formState.errors.email?.message}
                  {...form1.register('email')}
                />
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 número"
                  error={form1.formState.errors.password?.message}
                  {...form1.register('password')}
                />
                <Input
                  label="Confirmar contraseña"
                  type="password"
                  placeholder="Repite tu contraseña"
                  error={form1.formState.errors.confirmPassword?.message}
                  {...form1.register('confirmPassword')}
                />
                <PasswordStrength password={form1.watch('password')} />
                <Button type="submit" className="w-full mt-2">
                  Continuar →
                </Button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <StepHeader
                title="Datos personales"
                subtitle="Paso 2 de 3 — Información de identificación"
              />
              <form onSubmit={form2.handleSubmit(onStep2)} className="space-y-4 mt-6" noValidate>
                <Input
                  label="Nombre completo"
                  placeholder="Ej: Juan Pérez García"
                  error={form2.formState.errors.full_name?.message}
                  {...form2.register('full_name')}
                />
                <Input
                  label="DNI / Cédula"
                  placeholder="Ej: 1-0234-0567"
                  error={form2.formState.errors.dni?.message}
                  {...form2.register('dni')}
                />
                <Input
                  label="Teléfono"
                  type="tel"
                  placeholder="Ej: 8888-8888"
                  error={form2.formState.errors.phone?.message}
                  {...form2.register('phone')}
                />
                <Input
                  label="Fecha de nacimiento"
                  type="date"
                  error={form2.formState.errors.birth_date?.message}
                  {...form2.register('birth_date')}
                />
                <div className="flex gap-3 mt-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">
                    ← Atrás
                  </Button>
                  <Button type="submit" className="flex-1">
                    Continuar →
                  </Button>
                </div>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <StepHeader
                title="Dirección"
                subtitle="Paso 3 de 3 — Ubicación de residencia"
              />
              <form onSubmit={form3.handleSubmit(onStep3)} className="space-y-4 mt-6" noValidate>
                {/* Select de provincia */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Provincia</label>
                  <select
                    className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${form3.formState.errors.province ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}
                    {...form3.register('province')}
                  >
                    <option value="">Selecciona una provincia…</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {form3.formState.errors.province && (
                    <p className="text-xs text-red-600">{form3.formState.errors.province.message}</p>
                  )}
                </div>

                <Input
                  label="Cantón"
                  placeholder="Ej: Central"
                  error={form3.formState.errors.canton?.message}
                  {...form3.register('canton')}
                />
                <Input
                  label="Distrito"
                  placeholder="Ej: Merced"
                  error={form3.formState.errors.district?.message}
                  {...form3.register('district')}
                />
                <Input
                  label="Dirección exacta"
                  placeholder="Ej: 100 metros norte de la iglesia"
                  error={form3.formState.errors.address?.message}
                  {...form3.register('address')}
                />

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5">
                    <span className="mt-0.5">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-3 mt-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(2)} className="flex-1">
                    ← Atrás
                  </Button>
                  <Button
                    type="submit"
                    loading={form3.formState.isSubmitting}
                    className="flex-1"
                  >
                    Crear cuenta
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* Link a login */}
          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-blue-700 font-medium hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Cuenta' },
    { n: 2, label: 'Datos personales' },
    { n: 3, label: 'Dirección' },
  ]
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map(({ n, label }, i) => (
        <div key={n} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              n < currentStep
                ? 'bg-green-500 text-white'
                : n === currentStep
                ? 'bg-blue-800 text-white'
                : 'bg-gray-200 text-gray-400'
            }`}>
              {n < currentStep ? '✓' : n}
            </div>
            <span className={`text-xs hidden sm:block ${n === currentStep ? 'text-blue-800 font-medium' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mx-1 mb-5 transition-colors ${n < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  )
}

function PasswordStrength({ password = '' }: { password?: string }) {
  const checks = [
    { label: 'Al menos 8 caracteres', ok: password.length >= 8 },
    { label: 'Una mayúscula',          ok: /[A-Z]/.test(password) },
    { label: 'Un número',              ok: /[0-9]/.test(password) },
  ]
  if (!password) return null
  return (
    <ul className="space-y-1 mt-1">
      {checks.map(({ label, ok }) => (
        <li key={label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
          <span>{ok ? '✓' : '○'}</span>
          {label}
        </li>
      ))}
    </ul>
  )
}

// ─── Traductor de errores ─────────────────────────────────────────────────────

function translateError(msg: string): string {
  if (msg.includes('already registered') || msg.includes('already been registered'))
    return 'Este email ya está registrado. Intenta iniciar sesión.'
  if (msg.includes('Password should be'))
    return 'La contraseña no cumple los requisitos de seguridad.'
  return msg
}
