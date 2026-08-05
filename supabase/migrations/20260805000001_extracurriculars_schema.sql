-- ============================================================
-- SMPN 1 Wanayasa - Ekstrakurikuler Full Schema
-- Tabel terpisah dari `kegiatan` untuk detail lengkap
-- ============================================================

-- 1. extracurriculars (utama)
create table if not exists public.extracurriculars (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  category    text not null,
  description text,
  instructors text,           -- nama pembina (bisa multiple, pisah & atau koma)
  logo_url    text,
  banner_url  text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_extracurriculars_slug on public.extracurriculars (slug);
create index if not exists idx_extracurriculars_category on public.extracurriculars (category);
create index if not exists idx_extracurriculars_active on public.extracurriculars (is_active);

alter table public.extracurriculars enable row level security;

drop policy if exists "Allow public read extracurriculars" on public.extracurriculars;
create policy "Allow public read extracurriculars"
  on public.extracurriculars for select
  using (is_active = true);

drop policy if exists "Allow authenticated manage extracurriculars" on public.extracurriculars;
create policy "Allow authenticated manage extracurriculars"
  on public.extracurriculars for all
  using (auth.role() = 'authenticated');

-- 2. ekskul_schedules (jadwal kegiatan)
create table if not exists public.ekskul_schedules (
  id          uuid primary key default gen_random_uuid(),
  ekskul_id   uuid not null references public.extracurriculars(id) on delete cascade,
  day         text not null,      -- Senin, Selasa, dll
  time        text not null,      -- 15:00-17:00
  location    text,
  notes       text,
  order_index int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists idx_ekskul_schedules_ekskul on public.ekskul_schedules (ekskul_id);
create index if not exists idx_ekskul_schedules_order on public.ekskul_schedules (ekskul_id, order_index);

alter table public.ekskul_schedules enable row level security;

drop policy if exists "Allow public read ekskul_schedules" on public.ekskul_schedules;
create policy "Allow public read ekskul_schedules"
  on public.ekskul_schedules for select
  using (exists (select 1 from public.extracurriculars e where e.id = ekskul_id and e.is_active = true));

drop policy if exists "Allow authenticated manage ekskul_schedules" on public.ekskul_schedules;
create policy "Allow authenticated manage ekskul_schedules"
  on public.ekskul_schedules for all
  using (auth.role() = 'authenticated');

-- 3. ekskul_committees (kepengurusan)
create table if not exists public.ekskul_committees (
  id          uuid primary key default gen_random_uuid(),
  ekskul_id   uuid not null references public.extracurriculars(id) on delete cascade,
  position    text not null,      -- Ketua, Wakil, Sekretaris, Bendahara, Anggota
  student_name text not null,
  class_name  text,               -- VII-A, VIII-B, dll
  order_index int not null default 0,
  photo_url   text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_ekskul_committees_ekskul on public.ekskul_committees (ekskul_id);
create index if not exists idx_ekskul_committees_order on public.ekskul_committees (ekskul_id, order_index);

alter table public.ekskul_committees enable row level security;

drop policy if exists "Allow public read ekskul_committees" on public.ekskul_committees;
create policy "Allow public read ekskul_committees"
  on public.ekskul_committees for select
  using (exists (select 1 from public.extracurriculars e where e.id = ekskul_id and e.is_active = true));

drop policy if exists "Allow authenticated manage ekskul_committees" on public.ekskul_committees;
create policy "Allow authenticated manage ekskul_committees"
  on public.ekskul_committees for all
  using (auth.role() = 'authenticated');

-- 4. ekskul_galleries (galeri foto kegiatan)
create table if not exists public.ekskul_galleries (
  id           uuid primary key default gen_random_uuid(),
  ekskul_id    uuid not null references public.extracurriculars(id) on delete cascade,
  title        text,
  image_url    text not null,
  activity_date date not null default current_date,
  caption      text,
  order_index  int not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists idx_ekskul_galleries_ekskul on public.ekskul_galleries (ekskul_id);
create index if not exists idx_ekskul_galleries_order on public.ekskul_galleries (ekskul_id, order_index);

alter table public.ekskul_galleries enable row level security;

drop policy if exists "Allow public read ekskul_galleries" on public.ekskul_galleries;
create policy "Allow public read ekskul_galleries"
  on public.ekskul_galleries for select
  using (exists (select 1 from public.extracurriculars e where e.id = ekskul_id and e.is_active = true));

drop policy if exists "Allow authenticated manage ekskul_galleries" on public.ekskul_galleries;
create policy "Allow authenticated manage ekskul_galleries"
  on public.ekskul_galleries for all
  using (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE BUCKET untuk media ekskul
-- ============================================================
insert into storage.buckets (id, name, public)
values ('ekskul-media', 'ekskul-media', true)
on conflict (id) do nothing;

drop policy if exists "ekskul_media_public_read" on storage.objects;
create policy "ekskul_media_public_read"
  on storage.objects for select
  using (bucket_id = 'ekskul-media');

drop policy if exists "ekskul_media_authenticated_upload" on storage.objects;
create policy "ekskul_media_authenticated_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'ekskul-media');

drop policy if exists "ekskul_media_authenticated_update" on storage.objects;
create policy "ekskul_media_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'ekskul-media')
  with check (bucket_id = 'ekskul-media');

drop policy if exists "ekskul_media_authenticated_delete" on storage.objects;
create policy "ekskul_media_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'ekskul-media');

-- ============================================================
-- SEED DATA: PMR (Palang Merah Remaja)
-- ============================================================
insert into public.extracurriculars (slug, name, category, description, instructors, is_active)
values (
  'pmr',
  'Palang Merah Remaja (PMR)',
  'Kemanusiaan & Kesehatan',
  'Wadah pembinaan dan pengembangan anggota remaja PMR dalam bidang kemanusiaan, kesehatan, kesiapsiagaan bencana, dan pertolongan pertama di lingkungan sekolah maupun masyarakat.',
  'Dani Ahmad Fauzi, S.Pd & Ela Nurlaelasari, S.Pd',
  true
)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  instructors = excluded.instructors,
  is_active = excluded.is_active,
  updated_at = now();

-- Sample schedule for PMR
with pmr as (select id from public.extracurriculars where slug = 'pmr')
insert into public.ekskul_schedules (ekskul_id, day, time, location, notes, order_index)
select id, 'Rabu', '15:00-17:00', 'Ruang PMR / Lapangan', 'Latihan rutin PMR mingguan', 1 from pmr
on conflict do nothing;

with pmr as (select id from public.extracurriculars where slug = 'pmr')
insert into public.ekskul_schedules (ekskul_id, day, time, location, notes, order_index)
select id, 'Sabtu', '08:00-10:00', 'Lapangan Sekolah', 'Latihan fisik & simulasi P3K', 2 from pmr
on conflict do nothing;

-- Sample committees for PMR
with pmr as (select id from public.extracurriculars where slug = 'pmr')
insert into public.ekskul_committees (ekskul_id, position, student_name, class_name, order_index)
select id, 'Ketua', 'Budi Santoso', 'IX-A', 1 from pmr
on conflict do nothing;

with pmr as (select id from public.extracurriculars where slug = 'pmr')
insert into public.ekskul_committees (ekskul_id, position, student_name, class_name, order_index)
select id, 'Wakil Ketua', 'Siti Rahayu', 'IX-B', 2 from pmr
on conflict do nothing;

with pmr as (select id from public.extracurriculars where slug = 'pmr')
insert into public.ekskul_committees (ekskul_id, position, student_name, class_name, order_index)
select id, 'Sekretaris', 'Ahmad Fauzi', 'VIII-A', 3 from pmr
on conflict do nothing;

with pmr as (select id from public.extracurriculars where slug = 'pmr')
insert into public.ekskul_committees (ekskul_id, position, student_name, class_name, order_index)
select id, 'Bendahara', 'Dewi Lestari', 'VIII-B', 4 from pmr
on conflict do nothing;