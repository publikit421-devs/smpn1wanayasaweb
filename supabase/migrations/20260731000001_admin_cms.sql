-- ============================================================
-- SMPN 1 Wanayasa - Admin CMS tables
-- Tables baru untuk mengelola Profil, Guru/Staf, Kegiatan & SPMB
-- ============================================================

-- Profil Sekolah & Kontak (single row)
create table if not exists public.school_profiles (
  id uuid primary key default gen_random_uuid(),
  nama_sekolah text not null default 'SMP Negeri 1 Wanayasa',
  npsn text,
  akreditasi text,
  alamat text,
  kelurahan text,
  kecamatan text,
  kabupaten text,
  provinsi text,
  kodepos text,
  telepon text,
  email text,
  website text,
  logo_url text,
  visi text,
  misi text,
  jam_layanan text,
  updated_at timestamptz default now()
);

-- Data Guru & Staf
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  nip text,
  gelar text,
  role text,
  bidang text,
  jenis text not null default 'guru' check (jenis in ('guru', 'staf')),
  email text,
  telepon text,
  urutan int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Kegiatan (Intrakurikuler / Ekstrakurikuler / Kokurikuler-P5)
create table if not exists public.kegiatan (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null check (category in ('intrakurikuler', 'ekstrakurikuler', 'kokurikuler')),
  image_url text,
  tanggal date,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Pengaturan SPMB (single row)
create table if not exists public.spmb_settings (
  id uuid primary key default gen_random_uuid(),
  tahun_ajaran text,
  judul text,
  deskripsi text,
  alur jsonb default '[]'::jsonb,
  syarat jsonb default '[]'::jsonb,
  status_buka boolean default true,
  brosur_url text,
  tanggal_buka date,
  tanggal_tutup date,
  kuota int,
  updated_at timestamptz default now()
);

-- ============================================================
-- Row Level Security: izinkan akses untuk authenticated users
-- (sesuaikan jika menggunakan service role di sisi server)
-- ============================================================
alter table public.school_profiles enable row level security;
alter table public.staff enable row level security;
alter table public.kegiatan enable row level security;
alter table public.spmb_settings enable row level security;

create policy "Allow read school_profiles" on public.school_profiles
  for select using (true);
create policy "Allow manage school_profiles" on public.school_profiles
  for all using (auth.role() = 'authenticated');

create policy "Allow read staff" on public.staff
  for select using (true);
create policy "Allow manage staff" on public.staff
  for all using (auth.role() = 'authenticated');

create policy "Allow read kegiatan" on public.kegiatan
  for select using (true);
create policy "Allow manage kegiatan" on public.kegiatan
  for all using (auth.role() = 'authenticated');

create policy "Allow read spmb_settings" on public.spmb_settings
  for select using (true);
create policy "Allow manage spmb_settings" on public.spmb_settings
  for all using (auth.role() = 'authenticated');
