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

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // ─── Carga/sincroniza perfil desde Supabase ───────────────────────────────
  const fetchProfile = useCallback(async (authUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error || !data) return

      const profileData = data as Profile

      // Sincronizar nombre desde metadatos de Google (envía 'name', no 'full_name')
      const meta         = authUser.user_metadata ?? {}
      const metaName     = (meta.full_name || meta.name || '') as string
      const metaAvatar   = (meta.avatar_url || meta.picture || '') as string

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
    } finally {
      // Garantiza que loading siempre se resuelve, incluso si hay error
      setLoading(false)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user)
  }, [user, fetchProfile])

  // ─── Paso 1: escuchar cambios de sesión (SOLO sincrónico, sin await) ───────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      // Al cerrar sesión, limpiar perfil y terminar loading
      if (event === 'SIGNED_OUT' || !session) {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ─── Paso 2: sesión inicial desde storage local ───────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (!session?.user) setLoading(false)
    })
  }, [])

  // ─── Paso 3: cargar perfil cuando cambia el usuario ───────────────────────
  // Usa user?.id como dep para no re-ejecutar si el objeto user cambia
  // pero el usuario es el mismo.
  useEffect(() => {
    if (user) {
      fetchProfile(user)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // ─── Operaciones de auth ──────────────────────────────────────────────────

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

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name, dni, phone, birth_date, province, canton, district, address })
        .eq('id', authData.user.id)

      if (profileError) throw profileError
    }
  }

  const signOut = async () => {
    // No lanzar error aunque falle — siempre limpiar estado local
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{
      user, profile, session, loading,
      signIn, signInWithGoogle, signUp, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
