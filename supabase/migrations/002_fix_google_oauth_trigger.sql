-- ============================================================
--  002_fix_google_oauth_trigger.sql
--  Fix: Google OAuth envía el nombre en 'name', no en 'full_name'
--  Ejecutar en Supabase → SQL Editor
-- ============================================================

-- Actualiza el trigger para leer ambas claves posibles del nombre
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
    -- Google envía 'name'; el registro manual envía 'full_name'
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      ''
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  );
  return new;
end;
$$;

-- Corrige perfiles existentes con full_name vacío que
-- se crearon con Google antes de este fix
update public.profiles
set
  full_name = coalesce(
    nullif(au.raw_user_meta_data->>'full_name', ''),
    nullif(au.raw_user_meta_data->>'name', ''),
    profiles.full_name
  ),
  avatar_url = coalesce(
    profiles.avatar_url,
    au.raw_user_meta_data->>'avatar_url',
    au.raw_user_meta_data->>'picture'
  )
from auth.users au
where profiles.id = au.id
  and (profiles.full_name = '' or profiles.full_name is null)
  and (
    au.raw_user_meta_data->>'name' is not null
    or au.raw_user_meta_data->>'full_name' is not null
  );
