-- ============================================================
-- SMPN 1 Wanayasa - Profil Pengguna & Integrasi Auth
-- Tabel public.profiles terhubung ke auth.users + trigger otomatis
-- ============================================================

-- 1) Enum role pengguna
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'operator_tu', 'public');
  end if;
end $$;

grant usage on type public.user_role to anon, authenticated, service_role;

-- 2) Tabel profil pengguna
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  nip text unique,
  role public.user_role not null default 'public',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Index tambahan untuk pencarian cepat
create index if not exists profiles_nip_idx on public.profiles (nip);
create index if not exists profiles_role_idx on public.profiles (role);

-- 4) Row Level Security
alter table public.profiles enable row level security;

-- Helper: apakah user yang sedang login adalah admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- Policy: user hanya bisa membaca/mengupdate profil miliknya; admin bisa semua
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin"
  on public.profiles for delete
  using (public.is_admin());

-- Insert hanya dilakukan oleh trigger (security definer) / service_role,
-- tidak ada policy insert agar user biasa tidak dapat membuat profil liar.

-- 5) Trigger: buat profil otomatis saat user baru dibuat lewat Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, nip, role, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    nullif(new.raw_user_meta_data->>'nip', ''),
    case
      when new.raw_user_meta_data->>'role' in ('admin', 'operator_tu', 'public')
      then (new.raw_user_meta_data->>'role')::public.user_role
      else 'public'::public.user_role
    end,
    nullif(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6) Auto-update kolom updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 7) Proteksi: user biasa tidak boleh mengubah role-nya sendiri
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Hanya admin yang dapat mengubah role pengguna.';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_role_elevation on public.profiles;
create trigger prevent_role_elevation
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- 8) Grant akses tabel ke role API (RLS tetap mengontrol baris)
grant select, insert, update, delete on table public.profiles to authenticated;
grant select on table public.profiles to anon;

-- ============================================================
-- Contoh pembuatan user dengan metadata (jalankan di Dashboard
-- Supabase Auth atau via signUp):
--   supabase.auth.signUp({
--     email: 'admin@smpn1wanayasa.sch.id',
--     password: '********',
--     options: { data: { full_name: 'Admin Sekolah', role: 'admin', nip: '196508121990031005' } }
--   })
-- ============================================================
