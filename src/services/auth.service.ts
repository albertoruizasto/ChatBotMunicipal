import { supabase } from '@/lib/supabase'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  full_name: string
}

export const authService = {
  async login({ email, password }: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async register({ email, password, full_name }: RegisterCredentials) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    })
    if (error) throw error
    return data
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },
}
