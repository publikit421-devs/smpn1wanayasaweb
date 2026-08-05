-- ============================================================
-- SMPN 1 Wanayasa - Manajemen Akun Pembina Ekstrakurikuler
-- 1) Tambah role 'pembina' ke enum user_role
-- 2) Kolom ekskul_id pada profiles (menautkan pembina ke ekskul)
-- 3) RLS: pembina HANYA boleh kelola data ekskul miliknya
-- ============================================================

-- 1) Tambah nilai 'pembina' ke enum user_role (jika belum ada)
do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on e.enumtypid = t.oid
    where t.typname = 'user_role' and e.enumlabel = 'pembina'
  ) then
    alter type public.user_role add value 'pembina';
  end if;
end $$;

-- 2) Kolom ekskul_id pada profiles (nullable, menautkan pembina ke ekstrakurikuler)
alter table public.profiles
  add column if not exists ekskul_id uuid
  references public.extracurriculars(id) on delete set null;

create index if not exists profiles_ekskul_idx on public.profiles (ekskul_id);

-- 3) Helper: ekskul milik user yang sedang login (NULL jika bukan pembina)
create or replace function public.current_user_ekskul_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select p.ekskul_id
  from public.profiles p
  where p.id = auth.uid();
$$;

grant execute on function public.current_user_ekskul_id() to authenticated;

-- 4) Perbarui trigger pembuatan profil agar mendukung role 'pembina' + ekskul_id
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
begin
  v_role := case
    when new.raw_user_meta_data->>'role' in ('admin', 'operator_tu', 'public', 'pembina')
    then (new.raw_user_meta_data->>'role')::public.user_role
    else 'public'::public.user_role
  end;

  insert into public.profiles (id, full_name, nip, role, avatar_url, ekskul_id)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    nullif(new.raw_user_meta_data->>'nip', ''),
    v_role,
    nullif(new.raw_user_meta_data->>'avatar_url', ''),
    nullif(new.raw_user_meta_data->>'ekskul_id', '')::uuid
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = excluded.role,
    ekskul_id = coalesce(excluded.ekskul_id, public.profiles.ekskul_id),
    updated_at = now();
  return new;
end;
$$;

-- 5) Proteksi: hanya admin boleh mengubah role & ekskul_id lebih lanjut
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.role is distinct from old.role or new.ekskul_id is distinct from old.ekskul_id)
     and not public.is_admin() then
    raise exception 'Hanya admin yang dapat mengubah role/ekskul pengguna.';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_role_elevation on public.profiles;
create trigger prevent_role_elevation
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- ============================================================
-- 6) RLS: pembina HANYA bisa kelola data ekskul miliknya sendiri.
--    Admin tetap boleh mengelola SEMUA ekskul.
--    Ganti policy "Allow authenticated manage" (semua authenticated)
--    menjadi "authorized" (admin OR pembina dari ekskul tersebut).
-- ============================================================

-- ekskul_schedules
drop policy if exists "Allow authenticated manage ekskul_schedules" on public.ekskul_schedules;
drop policy if exists "Authorized manage ekskul_schedules" on public.ekskul_schedules;
create policy "Authorized manage ekskul_schedules"
  on public.ekskul_schedules
  for all
  to authenticated
  using (public.is_admin() or ekskul_id = public.current_user_ekskul_id())
  with check (public.is_admin() or ekskul_id = public.current_user_ekskul_id());

-- ekskul_committees
drop policy if exists "Allow authenticated manage ekskul_committees" on public.ekskul_committees;
drop policy if exists "Authorized manage ekskul_committees" on public.ekskul_committees;
create policy "Authorized manage ekskul_committees"
  on public.ekskul_committees
  for all
  to authenticated
  using (public.is_admin() or ekskul_id = public.current_user_ekskul_id())
  with check (public.is_admin() or ekskul_id = public.current_user_ekskul_id());

-- ekskul_galleries
drop policy if exists "Allow authenticated manage ekskul_galleries" on public.ekskul_galleries;
drop policy if exists "Authorized manage ekskul_galleries" on public.ekskul_galleries;
create policy "Authorized manage ekskul_galleries"
  on public.ekskul_galleries
  for all
  to authenticated
  using (public.is_admin() or ekskul_id = public.current_user_ekskul_id())
  with check (public.is_admin() or ekskul_id = public.current_user_ekskul_id());

-- ============================================================
-- 7) Pembina tidak perlu mengubah extracurriculars (nama/kategori).
--    Tetap batasi write di extracurriculars ke admin saja (optional hardening).
-- ============================================================
drop policy if exists "Allow authenticated manage extracurriculars" on public.extracurriculars;
drop policy if exists "Authorized manage extracurriculars" on public.extracurriculars;
create policy "Authorized manage extracurriculars"
  on public.extracurriculars
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());