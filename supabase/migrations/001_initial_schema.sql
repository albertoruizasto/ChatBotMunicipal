-- ============================================================
--  001_initial_schema.sql
--  ChatBot Municipal — Esquema inicial
--  Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- ────────────────────────────────────────────────────────────
--  EXTENSIONES
-- ────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────
--  ENUM: roles de usuario
-- ────────────────────────────────────────────────────────────
do $$ begin
  create type user_role as enum ('citizen', 'officer', 'admin');
exception when duplicate_object then null;
end $$;

-- ────────────────────────────────────────────────────────────
--  TABLA: profiles
--  Extiende auth.users con datos adicionales del ciudadano.
-- ────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid        primary key references auth.users(id) on delete cascade,
  email        text        not null,
  full_name    text,
  dni          text        unique,
  phone        text,
  birth_date   date,
  avatar_url   text,
  role         user_role   not null default 'citizen',
  province     text,
  canton       text,
  district     text,
  address      text,
  is_active    boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is 'Perfiles extendidos de usuarios, uno por cada auth.users.';

-- Índices de búsqueda frecuente
create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_role_idx  on public.profiles (role);
create index if not exists profiles_dni_idx   on public.profiles (dni);

-- ────────────────────────────────────────────────────────────
--  TABLA: conversations
--  Sesiones de conversación del chatbot.
-- ────────────────────────────────────────────────────────────
create table if not exists public.conversations (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  title        text,
  status       text        not null default 'active'
                           check (status in ('active', 'closed', 'archived')),
  category     text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.conversations is 'Conversaciones del chatbot agrupadas por sesión.';

create index if not exists conversations_user_id_idx  on public.conversations (user_id);
create index if not exists conversations_status_idx   on public.conversations (status);
create index if not exists conversations_created_idx  on public.conversations (created_at desc);

-- ────────────────────────────────────────────────────────────
--  TABLA: messages
--  Mensajes individuales dentro de una conversación.
-- ────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id                uuid        primary key default gen_random_uuid(),
  conversation_id   uuid        not null references public.conversations(id) on delete cascade,
  role              text        not null check (role in ('user', 'assistant', 'system')),
  content           text        not null,
  metadata          jsonb,
  created_at        timestamptz not null default now()
);

comment on table public.messages is 'Mensajes individuales de cada conversación del chatbot.';

create index if not exists messages_conversation_id_idx on public.messages (conversation_id);
create index if not exists messages_created_idx         on public.messages (created_at);

-- ────────────────────────────────────────────────────────────
--  FUNCIÓN: actualizar updated_at automáticamente
-- ────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger en profiles
create or replace trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Trigger en conversations
create or replace trigger conversations_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

-- ────────────────────────────────────────────────────────────
--  FUNCIÓN + TRIGGER: crear perfil automáticamente al registrarse
-- ────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ────────────────────────────────────────────────────────────
--  ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

-- Habilitar RLS en todas las tablas
alter table public.profiles      enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

-- ── profiles ─────────────────────────────────────────────────

-- Ciudadano puede leer y actualizar solo su propio perfil
create policy "profiles: leer propio"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: actualizar propio"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admin puede leer todos los perfiles
create policy "profiles: admin lee todos"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Admin puede actualizar cualquier perfil
create policy "profiles: admin actualiza todos"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ── conversations ─────────────────────────────────────────────

create policy "conversations: select propio"
  on public.conversations for select
  using (user_id = auth.uid());

create policy "conversations: insert propio"
  on public.conversations for insert
  with check (user_id = auth.uid());

create policy "conversations: update propio"
  on public.conversations for update
  using (user_id = auth.uid());

create policy "conversations: delete propio"
  on public.conversations for delete
  using (user_id = auth.uid());

-- Funcionarios y admin pueden ver todas las conversaciones
create policy "conversations: officer/admin lee todas"
  on public.conversations for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('officer', 'admin')
    )
  );

-- ── messages ─────────────────────────────────────────────────

-- Usuario puede operar mensajes de sus propias conversaciones
create policy "messages: select propios"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

create policy "messages: insert propios"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

create policy "messages: delete propios"
  on public.messages for delete
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

-- Funcionarios y admin pueden leer todos los mensajes
create policy "messages: officer/admin lee todos"
  on public.messages for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('officer', 'admin')
    )
  );

-- ────────────────────────────────────────────────────────────
--  VISTA PÚBLICA: conversaciones con conteo de mensajes
-- ────────────────────────────────────────────────────────────
create or replace view public.conversations_with_counts as
select
  c.*,
  count(m.id)::int as message_count,
  max(m.created_at)  as last_message_at
from public.conversations c
left join public.messages m on m.conversation_id = c.id
group by c.id;

-- ────────────────────────────────────────────────────────────
--  DATOS INICIALES: usuario admin de ejemplo
--  (Comentar o eliminar en producción)
-- ────────────────────────────────────────────────────────────
-- Para crear un admin, primero regístra el usuario normalmente
-- y luego ejecuta:
--
--   update public.profiles
--   set role = 'admin'
--   where email = 'admin@municipio.gob';
--
-- ────────────────────────────────────────────────────────────
