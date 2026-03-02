import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { AuthContextType, Profile, RegisterData } from '@/types'

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Carga el perfil y sincroniza metadatos de OAuth (Google, etc.)
  const fetchProfile = useCallback(async (authUser: SupabaseUser) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (error || !data) return

    const profileData = data as Profile

    // Google envía el nombre en 'name' o 'full_name' dentro de user_metadata.
    // Si el perfil quedó con full_name vacío (trigger usó la clave incorrecta),
    // lo actualizamos ahora y lo persistimos en la tabla.
    const meta = authUser.user_metadata ?? {}
    const metaName: string = meta.full_name || meta.name || ''
    const metaAvatar: string = meta.avatar_url || meta.picture || ''

    if (!profileData.full_name && metaName) {
      const updates: Partial<Profile> = { full_name: metaName }
      if (!profileData.avatar_url && metaAvatar) updates.avatar_url = metaAvatar

      const { data: updated } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authUser.id)
        .select()
        .single()

      setProfile((updated ?? profileData) as Profile)
      return
    }

    setProfile(profileData)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user)
  }, [user, fetchProfile])

  // Inicializar sesión y suscribirse a cambios
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) await fetchProfile(session.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // ─── Operaciones de auth ────────────────────────────────────────────────

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) throw error
  }

  const signUp = async (data: RegisterData) => {
    const { email, password, full_name, dni, phone, birth_date, province, canton, district, address } = data

    const { error: signUpError, data: authData } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    })
    if (signUpError) throw signUpError

    // El trigger en Supabase crea el perfil base automáticamente.
    // Actualizamos los campos adicionales que el trigger no conoce.
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name, dni, phone, birth_date, province, canton, district, address })
        .eq('id', authData.user.id)

      if (profileError) throw profileError
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setProfile(null)
  }

  // ─── Valor del contexto ─────────────────────────────────────────────────

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signIn,
      signInWithGoogle,
      signUp,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
