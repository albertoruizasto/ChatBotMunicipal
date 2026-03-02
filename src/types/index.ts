import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = 'citizen' | 'officer' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string
  dni: string | null
  phone: string | null
  birth_date: string | null
  avatar_url: string | null
  role: UserRole
  province: string | null
  canton: string | null
  district: string | null
  address: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthContextType {
  user: SupabaseUser | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: (data: RegisterData) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
  dni: string
  phone: string
  birth_date: string
  province: string
  canton: string
  district: string
  address: string
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface Conversation {
  id: string
  user_id: string
  title: string | null
  status: 'active' | 'closed' | 'archived'
  category: string | null
  created_at: string
  updated_at: string
  /** Virtual field populated by the view */
  message_count?: number
  last_message_at?: string | null
  /** Last message preview (populated client-side) */
  last_message?: string | null
}

export interface ChatMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata: Record<string, unknown> | null
  created_at: string
  /** Optimistic flag — message not yet confirmed by server */
  pending?: boolean
  /** Error flag — failed to send */
  failed?: boolean
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  created_at: string
  link?: string
}

// ─── Trámites ─────────────────────────────────────────────────────────────────

export interface Tramite {
  id: string
  title: string
  description: string
  status: 'pendiente' | 'en_proceso' | 'completado' | 'rechazado'
  category: string
  created_at: string
  updated_at: string
  user_id: string
}

// ─── Webhook ──────────────────────────────────────────────────────────────────

export interface WebhookPayload {
  message: string
  conversationId: string
  userId: string
  sessionId: string
  profile?: {
    full_name: string
    role: string
    email: string
  }
}

export interface WebhookResponse {
  response?: string
  message?: string
  output?: string
  text?: string
}

// ─── Utilidades ───────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}
