-- ============================================================
-- SMPN 1 Wanayasa - FULL DATABASE SETUP (idempotent, jalankan sekali)
-- Berisi: schema dasar + tabel admin CMS + auth profiles + seed 46 PTK
-- ============================================================



-- ============================================================

-- ============================================================
-- SMPN 1 Wanayasa â€” Supabase Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Table: announcements (Pengumuman & Berita)
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  content     TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'pengumuman' CHECK (category IN ('pengumuman', 'berita', 'agenda')),
  image_url   TEXT,
  is_pinned   BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for listing
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON announcements (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements (category);

-- ============================================================
-- Table: public_services (Permohonan Layanan Publik)
-- ============================================================
CREATE TABLE IF NOT EXISTS public_services (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_type    TEXT NOT NULL CHECK (service_type IN (
                    'informasi-publik',
                    'pengaduan',
                    'legalisasi-ijazah',
                    'izin-siswa',
                    'penelitian',
                    'mutasi-siswa'
                  )),
  -- Pemohon / Applicant info
  nama_pemohon    TEXT NOT NULL,
  nik             TEXT,
  alamat          TEXT,
  no_telepon      TEXT NOT NULL,
  email           TEXT,
  -- Payload (flexible JSON for each service type)
  payload         JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Status tracking
  status          TEXT NOT NULL DEFAULT 'masuk' CHECK (status IN (
                    'masuk',
                    'diproses',
                    'selesai',
                    'ditolak'
                  )),
  catatan_admin   TEXT,
  nomor_registrasi TEXT UNIQUE,
  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-generate nomor_registrasi
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.nomor_registrasi := 'SMPN1/' ||
    TO_CHAR(NOW(), 'YYYY/MM') || '/' ||
    LPAD(NEXTVAL('registration_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS registration_seq START 1;

DROP TRIGGER IF EXISTS trg_registration_number ON public_services;
CREATE TRIGGER trg_registration_number
  BEFORE INSERT ON public_services
  FOR EACH ROW
  WHEN (NEW.nomor_registrasi IS NULL)
  EXECUTE FUNCTION generate_registration_number();

-- Index
CREATE INDEX IF NOT EXISTS idx_public_services_type ON public_services (service_type);
CREATE INDEX IF NOT EXISTS idx_public_services_status ON public_services (status);
CREATE INDEX IF NOT EXISTS idx_public_services_created_at ON public_services (created_at DESC);

-- ============================================================
-- Table: skm_feedbacks (Survei Kepuasan Masyarakat)
-- ============================================================
CREATE TABLE IF NOT EXISTS skm_feedbacks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id      UUID REFERENCES public_services(id) ON DELETE SET NULL,
  service_type    TEXT NOT NULL,
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  komentar        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_skm_service_type ON skm_feedbacks (service_type);
CREATE INDEX IF NOT EXISTS idx_skm_rating ON skm_feedbacks (rating);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Announcements: public read, admin write
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read published announcements" ON announcements;
CREATE POLICY "Public can read published announcements"
  ON announcements FOR SELECT
  USING (is_published = TRUE);
DROP POLICY IF EXISTS "Admin can manage announcements" ON announcements;
CREATE POLICY "Admin can manage announcements"
  ON announcements FOR ALL
  USING (auth.role() = 'authenticated');

-- Public services: public insert, admin read+update
ALTER TABLE public_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit a service request" ON public_services;
CREATE POLICY "Anyone can submit a service request"
  ON public_services FOR INSERT
  WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Admin can read and update service requests" ON public_services;
CREATE POLICY "Admin can read and update service requests"
  ON public_services FOR ALL
  USING (auth.role() = 'authenticated');

-- SKM: public insert, admin read
ALTER TABLE skm_feedbacks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit SKM feedback" ON skm_feedbacks;
CREATE POLICY "Anyone can submit SKM feedback"
  ON skm_feedbacks FOR INSERT
  WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Admin can read SKM feedbacks" ON skm_feedbacks;
CREATE POLICY "Admin can read SKM feedbacks"
  ON skm_feedbacks FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- Sample Data: Pengumuman
-- ============================================================
INSERT INTO announcements (title, slug, content, category, is_pinned) VALUES
  (
    'Penerimaan Peserta Didik Baru (PPDB) Tahun 2026',
    'ppdb-2026',
    'SMP Negeri 1 Wanayasa membuka pendaftaran Peserta Didik Baru untuk tahun ajaran 2026/2027. Pendaftaran dibuka mulai 1 Juli hingga 31 Juli 2026. Silakan datang langsung ke sekolah atau hubungi nomor yang tertera untuk informasi lebih lanjut.',
    'pengumuman',
    TRUE
  ),
  (
    'Jadwal Ujian Tengah Semester Ganjil 2026',
    'jadwal-uts-ganjil-2026',
    'Ujian Tengah Semester (UTS) Ganjil Tahun Pelajaran 2026/2027 akan dilaksanakan mulai tanggal 15 September 2026. Siswa diharapkan mempersiapkan diri dengan baik.',
    'pengumuman',
    FALSE
  ),
  (
    'Prestasi Siswa: Juara 1 Olimpiade Matematika Tingkat Kabupaten',
    'juara-olimpiade-matematika-2026',
    'Selamat kepada siswa kelas IX atas pencapaian luar biasa meraih Juara 1 dalam Olimpiade Matematika Tingkat Kabupaten Banjarnegara 2026. Membanggakan!',
    'berita',
    FALSE
  )
ON CONFLICT (slug) DO NOTHING;


-- ============================================================

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

drop policy if exists "Allow read school_profiles" on public.school_profiles;
create policy "Allow read school_profiles" on public.school_profiles
  for select using (true);
drop policy if exists "Allow manage school_profiles" on public.school_profiles;
create policy "Allow manage school_profiles" on public.school_profiles
  for all using (auth.role() = 'authenticated');

drop policy if exists "Allow read staff" on public.staff;
create policy "Allow read staff" on public.staff
  for select using (true);
drop policy if exists "Allow manage staff" on public.staff;
create policy "Allow manage staff" on public.staff
  for all using (auth.role() = 'authenticated');

drop policy if exists "Allow read kegiatan" on public.kegiatan;
create policy "Allow read kegiatan" on public.kegiatan
  for select using (true);
drop policy if exists "Allow manage kegiatan" on public.kegiatan;
create policy "Allow manage kegiatan" on public.kegiatan
  for all using (auth.role() = 'authenticated');

drop policy if exists "Allow read spmb_settings" on public.spmb_settings;
create policy "Allow read spmb_settings" on public.spmb_settings
  for select using (true);
drop policy if exists "Allow manage spmb_settings" on public.spmb_settings;
create policy "Allow manage spmb_settings" on public.spmb_settings
  for all using (auth.role() = 'authenticated');


-- ============================================================

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


-- ============================================================

-- ============================================================
-- SMPN 1 Wanayasa - Seed Data Asli PTK (46 Orang)
-- Tambah kolom jenis_ptk & jabatan, bersihkan data dummy, lalu seed
-- ============================================================

-- 1. Tambah kolom baru (idempotent)
alter table public.staff add column if not exists jenis_ptk text not null default 'Guru'
  check (jenis_ptk in ('Guru', 'Tenaga Kependidikan', 'Kepala Sekolah'));
alter table public.staff add column if not exists jabatan text;

-- 2. Bersihkan semua data lama (dummy)
truncate table public.staff;

-- 3. Seed 46 data asli PTK
insert into public.staff (nama, nip, gelar, role, bidang, jenis, jenis_ptk, jabatan, urutan, is_active)
values
  ('Ajid Mustopa', '196707061998020992', 'S.Pd, M.Pd', 'Kepala Sekolah', 'Manajemen', 'guru', 'Kepala Sekolah', 'Kepala Sekolah', 1, true),
  ('Abdul Muis Riyadjudin', '199108012025211040', 'S.Pd', 'Guru Bimbingan Konseling', 'Bimbingan Konseling', 'guru', 'Guru', 'Guru Bimbingan Konseling', 2, true),
  ('Abibudin', '198906242025211072', 'S.E.', 'Tenaga Administrasi Sekolah', 'Tata Usaha', 'staf', 'Tenaga Kependidikan', 'Tenaga Administrasi Sekolah', 3, true),
  ('Abyana Hendra', '198005162025211040', NULL, 'Penjaga Sekolah', 'Umum', 'staf', 'Tenaga Kependidikan', 'Penjaga Sekolah', 4, true),
  ('Ade Syarip Hidayat', '198206042025211072', NULL, 'Penjaga Sekolah', 'Umum', 'staf', 'Tenaga Kependidikan', 'Penjaga Sekolah', 5, true),
  ('Adhis Rakhman Kherdhiantho', NULL, 'S.Ag', 'Guru IPA', 'IPA', 'guru', 'Guru', 'Guru IPA', 6, true),
  ('Adityaningsih', NULL, 'S.Pd', 'Guru Bahasa Inggris', 'Bahasa Inggris', 'guru', 'Guru', 'Guru Bahasa Inggris', 7, true),
  ('Ageng Maulana', NULL, 'A.Ma.Pd, S.Pd', 'Guru Bahasa Indonesia', 'Bahasa Indonesia', 'guru', 'Guru', 'Guru Bahasa Indonesia', 8, true),
  ('Ahmad Dani Akbar Wijaya', '199211072020120992', 'S.Pd, M.Pd', 'Guru Bahasa Indonesia', 'Bahasa Indonesia', 'guru', 'Guru', 'Guru Bahasa Indonesia', 9, true),
  ('Ahmad Faturohman', '196904102007011008', NULL, 'Tenaga Administrasi Sekolah', 'Tata Usaha', 'staf', 'Tenaga Kependidikan', 'Tenaga Administrasi Sekolah', 10, true),
  ('Aneng Taryati', '198411112024212000', 'S.Pd', 'Guru Bahasa Inggris', 'Bahasa Inggris', 'guru', 'Guru', 'Guru Bahasa Inggris', 11, true),
  ('Asep Sulaeman', '198410222022211008', 'S.T', 'Guru TIK', 'TIK', 'guru', 'Guru', 'Guru TIK', 12, true),
  ('Cucu Susilawati', NULL, 'S.Pd', 'Guru IPS', 'IPS', 'guru', 'Guru', 'Guru IPS', 13, true),
  ('Dani Ahmad Fauzi', NULL, 'S.Pd', 'Guru Bahasa Indonesia', 'Bahasa Indonesia', 'guru', 'Guru', 'Guru Bahasa Indonesia', 14, true),
  ('Dewi Rahmatin', '196710131995032000', 'A.Ma.Pd, S.Pd', 'Guru IPA', 'IPA', 'guru', 'Guru', 'Guru IPA', 15, true),
  ('Dodoh', '197310082000121984', 'S.Ag', 'Guru Agama Islam', 'PAI', 'guru', 'Guru', 'Guru Agama Islam', 16, true),
  ('Dude Suganda', '197808082024211008', NULL, 'Guru Penjasorkes', 'Penjasorkes', 'guru', 'Guru', 'Guru Penjasorkes', 17, true),
  ('Ela Nurlaelasari', '198201192025212000', 'S.Pd', 'Guru IPS', 'IPS', 'guru', 'Guru', 'Guru IPS', 18, true),
  ('Enang Taryana', '197207091997020992', 'S.Pd', 'Guru Bahasa Inggris', 'Bahasa Inggris', 'guru', 'Guru', 'Guru Bahasa Inggris', 19, true),
  ('Eneng Yudit', '198112072025212032', NULL, 'Tenaga Administrasi Sekolah', 'Tata Usaha', 'staf', 'Tenaga Kependidikan', 'Tenaga Administrasi Sekolah', 20, true),
  ('Eny Puryanti', '197203032023212000', 'S.Pd', 'Guru PPKN', 'PPKN', 'guru', 'Guru', 'Guru PPKN', 21, true),
  ('Erlin Kristiani', '198408012022212000', 'S.Sn', 'Guru Seni Budaya', 'Seni Budaya', 'guru', 'Guru', 'Guru Seni Budaya', 22, true),
  ('Heni Karyawati', '197011061998022016', 'S.Pd', 'Guru PPKN', 'PPKN', 'guru', 'Guru', 'Guru PPKN', 23, true),
  ('Iis Widayanti', '199401012025212160', 'S.Pd', 'Guru Bahasa Indonesia', 'Bahasa Indonesia', 'guru', 'Guru', 'Guru Bahasa Indonesia', 24, true),
  ('Jamilah', '197309172025212000', 'S.Pd.I', 'Guru Agama Islam', 'PAI', 'guru', 'Guru', 'Guru Agama Islam', 25, true),
  ('Lestari Indra Sumantri', '199406142020121984', 'S.Pd', 'Guru Bimbingan Konseling', 'Bimbingan Konseling', 'guru', 'Guru', 'Guru Bimbingan Konseling', 26, true),
  ('Lian Yustriatin', '199010302022212000', 'S.Pd', 'Guru Matematika', 'Matematika', 'guru', 'Guru', 'Guru Matematika', 27, true),
  ('Lilis Juwariah', '196707211989032000', 'S.Pd', 'Guru Bahasa Indonesia', 'Bahasa Indonesia', 'guru', 'Guru', 'Guru Bahasa Indonesia', 28, true),
  ('Lina Herlina', '198007152025212032', 'S.Pd', 'Guru Matematika', 'Matematika', 'guru', 'Guru', 'Guru Matematika', 29, true),
  ('Maryati', '196811121995032000', 'A.Ma.Pd, S.Pd', 'Guru Bahasa Inggris', 'Bahasa Inggris', 'guru', 'Guru', 'Guru Bahasa Inggris', 30, true),
  ('Moch. Jaenudin', '197308252000031008', 'S.E.', 'Tenaga Administrasi Sekolah', 'Tata Usaha', 'staf', 'Tenaga Kependidikan', 'Tenaga Administrasi Sekolah', 31, true),
  ('Muhamad Sidik Heryana', NULL, 'S.Pd', 'Guru TIK', 'TIK', 'guru', 'Guru', 'Guru TIK', 32, true),
  ('Neni Kania Dewi', '197509112009022016', 'S.Pd', 'Guru Bahasa Sunda', 'Bahasa Sunda', 'guru', 'Guru', 'Guru Bahasa Sunda', 33, true),
  ('Nesha Maulia Rahmatillah', '199508192024212032', 'S.Pd', 'Guru IPA', 'IPA', 'guru', 'Guru', 'Guru IPA', 34, true),
  ('Nina Susilana', '197211182000032000', NULL, 'Tenaga Administrasi Sekolah', 'Tata Usaha', 'staf', 'Tenaga Kependidikan', 'Tenaga Administrasi Sekolah', 35, true),
  ('Nuraisyah Andalani Ibrahim', '197809152008012000', 'S.Pd', 'Guru IPS', 'IPS', 'guru', 'Guru', 'Guru IPS', 36, true),
  ('Nurani Cipta Nur Ilham', '199812272025212000', 'S.I.Kom.', 'Guru Prakarya Dan Kewirausahaan', 'Prakarya', 'guru', 'Guru', 'Guru Prakarya Dan Kewirausahaan', 37, true),
  ('Peri Agustian Muharam', NULL, 'S.Pd', 'Guru Matematika', 'Matematika', 'guru', 'Guru', 'Guru Matematika', 38, true),
  ('RESTI YUNIARTI', '199301202024212032', 'S.Pd', 'Guru IPA', 'IPA', 'guru', 'Guru', 'Guru IPA', 39, true),
  ('Rina Gustian Nuraeni', '198708022025212096', 'A.Md', 'Pustakawan', 'Perpustakaan', 'staf', 'Tenaga Kependidikan', 'Pustakawan', 40, true),
  ('Saepul Bayu', '199101102025211008', 'S.Pd', 'Guru Penjasorkes', 'Penjasorkes', 'guru', 'Guru', 'Guru Penjasorkes', 41, true),
  ('Saepullah', '196710242008011008', 'S.Ag', 'Guru Agama Islam', 'PAI', 'guru', 'Guru', 'Guru Agama Islam', 42, true),
  ('Tenten Mudrika', '198303042009022016', NULL, 'Guru Matematika', 'Matematika', 'guru', 'Guru', 'Guru Matematika', 43, true),
  ('Tris Septiana Hendrawan', '199109182024211008', 'S.Pd', 'Guru Penjasorkes', 'Penjasorkes', 'guru', 'Guru', 'Guru Penjasorkes', 44, true),
  ('Yeni Supriyatni', '197005272007012000', 'A.Ma.Pd, S.Pd', 'Guru IPA', 'IPA', 'guru', 'Guru', 'Guru IPA', 45, true),
  ('Yuliyanti Indriani Rahayu', NULL, 'S.Pd', 'Guru Bimbingan Konseling', 'Bimbingan Konseling', 'guru', 'Guru', 'Guru Bimbingan Konseling', 46, true);

-- 4. Update timestamps
update public.staff set created_at = now(), updated_at = now();

-- ============================================================
-- STORAGE: Bucket publik "berita-images" untuk gambar berita/pengumuman
-- Idempotent - aman dijalankan berulang.
-- ============================================================

-- Pastikan kolom image_url ada di tabel announcements
alter table public.announcements add column if not exists image_url text;

-- Buat bucket (public=true agar Public URL bisa diakses tanpa token)
insert into storage.buckets (id, name, public)
values ('berita-images', 'berita-images', true)
on conflict (id) do nothing;

-- Siapa pun (anon) bisa membaca/melihat file di bucket ini
drop policy if exists "berita_images_public_read" on storage.objects;
create policy "berita_images_public_read"
  on storage.objects for select
  using (bucket_id = 'berita-images');

-- User yang terautentikasi (admin) bisa mengunggah file
drop policy if exists "berita_images_authenticated_upload" on storage.objects;
create policy "berita_images_authenticated_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'berita-images');

-- User yang terautentikasi bisa memperbarui file
drop policy if exists "berita_images_authenticated_update" on storage.objects;
create policy "berita_images_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'berita-images')
  with check (bucket_id = 'berita-images');

-- User yang terautentikasi bisa menghapus file
drop policy if exists "berita_images_authenticated_delete" on storage.objects;
create policy "berita_images_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'berita-images');

-- ============================================================
-- RPC submit_service_request (SECURITY DEFINER)
-- Insert permohonan layanan publik + return baris hasil (termasuk
-- nomor_registrasi dari trigger). Bypass RLS RETURNING agar anon
-- tetap mendapat data hasil insert tanpa policy SELECT publik.
-- ============================================================
create or replace function public.submit_service_request(
  p_service_type text,
  p_nama_pemohon text,
  p_no_telepon text,
  p_nik text default null,
  p_alamat text default null,
  p_email text default null,
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result public_services;
begin
  insert into public_services (service_type, nama_pemohon, nik, alamat, no_telepon, email, payload)
  values (p_service_type, p_nama_pemohon, p_nik, p_alamat, p_no_telepon, p_email, coalesce(p_payload, '{}'::jsonb))
  returning * into result;

  return to_jsonb(result);
end;
$$;

revoke execute on function public.submit_service_request(text, text, text, text, text, text, jsonb) from public;
grant execute on function public.submit_service_request(text, text, text, text, text, text, jsonb) to anon, authenticated;

-- ============================================================
-- Tabel layanan_requests (Form Layanan Informasi Publik)
-- RLS: anon INSERT, authenticated SELECT/UPDATE/DELETE
-- ============================================================
create table if not exists public.layanan_requests (
  id                 uuid primary key default gen_random_uuid(),
  nama_lengkap       text not null,
  nik                text,
  no_telepon         text not null,
  email              text,
  alamat             text,
  informasi_diminta  text not null,
  tujuan_penggunaan  text,
  cara_perolehan     text,
  nomor_registrasi   text unique,
  status             text not null default 'Pending',
  created_at         timestamptz not null default now()
);

create index if not exists idx_layanan_requests_created_at on public.layanan_requests (created_at desc);
create index if not exists idx_layanan_requests_status on public.layanan_requests (status);

create sequence if not exists layanan_req_seq start 1;

create or replace function generate_layanan_registration_number()
returns trigger as $$
begin
  if new.nomor_registrasi is null then
    new.nomor_registrasi := 'SMPN1/' ||
      to_char(now(), 'YYYY/MM') || '/' ||
      lpad(nextval('layanan_req_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_layanan_registration_number on public.layanan_requests;
create trigger trg_layanan_registration_number
  before insert on public.layanan_requests
  for each row
  execute function generate_layanan_registration_number();

alter table public.layanan_requests enable row level security;

drop policy if exists "Allow public insert" on public.layanan_requests;
create policy "Allow public insert"
  on public.layanan_requests for insert
  to anon
  with check (true);

drop policy if exists "Allow authenticated read" on public.layanan_requests;
create policy "Allow authenticated read"
  on public.layanan_requests for select
  to authenticated
  using (true);

drop policy if exists "Allow authenticated update" on public.layanan_requests;
create policy "Allow authenticated update"
  on public.layanan_requests for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Allow authenticated delete" on public.layanan_requests;
create policy "Allow authenticated delete"
  on public.layanan_requests for delete
  to authenticated
  using (true);

-- Realtime: aktifkan auto-refresh dasbor
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'layanan_requests'
  ) then
    alter publication supabase_realtime add table public.layanan_requests;
  end if;
end $$;

-- ============================================================
-- Tabel student_stats (Statistik Peserta Didik)
-- RLS: anon SELECT, authenticated ALL. Seed 2026/2027.
-- ============================================================
create table if not exists public.student_stats (
  id            uuid primary key default gen_random_uuid(),
  tahun_ajaran  text not null,
  total         integer not null default 0,
  laki          integer not null default 0,
  perempuan     integer not null default 0,
  usia          jsonb not null default '[]'::jsonb,
  agama         jsonb not null default '[]'::jsonb,
  updated_at    timestamptz not null default now()
);

create unique index if not exists student_stats_tahun_ajaran_uq
  on public.student_stats (tahun_ajaran);

alter table public.student_stats enable row level security;

drop policy if exists "Allow read student_stats" on public.student_stats;
create policy "Allow read student_stats"
  on public.student_stats for select
  using (true);

drop policy if exists "Allow manage student_stats" on public.student_stats;
create policy "Allow manage student_stats"
  on public.student_stats for all
  using (auth.role() = 'authenticated');

insert into public.student_stats (tahun_ajaran, total, laki, perempuan, usia, agama)
values (
  '2026/2027',
  804,
  400,
  404,
  '[
    {"label": "< 6 tahun",   "total": 0,   "laki": 0,   "perempuan": 0},
    {"label": "6 - 12 tahun", "total": 47,  "laki": 18,  "perempuan": 29},
    {"label": "13 - 15 tahun", "total": 735, "laki": 367, "perempuan": 368},
    {"label": "16 - 20 tahun", "total": 22,  "laki": 15,  "perempuan": 7},
    {"label": "> 20 tahun",    "total": 0,   "laki": 0,   "perempuan": 0}
  ]'::jsonb,
  '[
    {"label": "Islam",   "total": 804, "laki": 400, "perempuan": 404},
    {"label": "Lainnya", "total": 0,   "laki": 0,   "perempuan": 0}
  ]'::jsonb
)
on conflict (tahun_ajaran) do update set
  total = excluded.total,
  laki = excluded.laki,
  perempuan = excluded.perempuan,
  usia = excluded.usia,
  agama = excluded.agama,
  updated_at = now();

-- ============================================================
-- Bucket storage `school-media` (gambar admin)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('school-media', 'school-media', true)
on conflict (id) do nothing;

drop policy if exists "school_media_public_read" on storage.objects;
create policy "school_media_public_read"
  on storage.objects for select
  using (bucket_id = 'school-media');

drop policy if exists "school_media_authenticated_upload" on storage.objects;
create policy "school_media_authenticated_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'school-media');

drop policy if exists "school_media_authenticated_update" on storage.objects;
create policy "school_media_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'school-media')
  with check (bucket_id = 'school-media');

drop policy if exists "school_media_authenticated_delete" on storage.objects;
create policy "school_media_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'school-media');

-- ============================================================
-- Tabel gallery_items (Galeri Foto)
-- ============================================================
create table if not exists public.gallery_items (
  id         uuid primary key default gen_random_uuid(),
  image_url  text not null,
  caption    text,
  urutan     int not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_gallery_items_urutan on public.gallery_items (urutan asc);
create index if not exists idx_gallery_items_created_at on public.gallery_items (created_at desc);

alter table public.gallery_items enable row level security;

drop policy if exists "Allow read gallery_items" on public.gallery_items;
create policy "Allow read gallery_items"
  on public.gallery_items for select
  using (true);

drop policy if exists "Allow manage gallery_items" on public.gallery_items;
create policy "Allow manage gallery_items"
  on public.gallery_items for all
  using (auth.role() = 'authenticated');

-- ============================================================
-- Ekstrakurikuler PMR (tabel public.kegiatan, category ekstrakurikuler)
-- ============================================================
insert into public.kegiatan (title, description, category, image_url, pembina, urutan, is_active)
select
  'PMR',
  'Wadah pembinaan dan pengembangan anggota remaja PMR dalam bidang kemanusiaan, kesehatan, kesiapsiagaan bencana, dan pertolongan pertama di lingkungan sekolah maupun masyarakat.',
  'ekstrakurikuler',
  '/ekskul/pmr.svg',
  'Dani Ahmad Fauzi, S.Pd & Ela Nurlaelasari, S.Pd',
  12,
  true
where not exists (
  select 1 from public.kegiatan
  where category = 'ekstrakurikuler' and title = 'PMR'
);

-- Kolom slug pada public.kegiatan (untuk link detail ekstrakurikuler)
alter table public.kegiatan add column if not exists slug text;

update public.kegiatan
set slug = lower(
  regexp_replace(
    regexp_replace(trim(title), '\s+', '-', 'g'),
    '[^a-z0-9-]', '', 'g'
  )
)
where slug is null;

-- ============================================================
-- Ekstrakurikuler Full Schema (tabel terpisah: extracurriculars, schedules, committees, galleries)
-- ============================================================

-- 1. extracurriculars (utama)
create table if not exists public.extracurriculars (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  category    text not null,
  description text,
  instructors text,
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
  day         text not null,
  time        text not null,
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
  position    text not null,
  student_name text not null,
  class_name  text,
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
  activity_date date,
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

-- Storage bucket for ekskul media
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

-- Seed PMR
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

with pmr as (select id from public.extracurriculars where slug = 'pmr')
insert into public.ekskul_schedules (ekskul_id, day, time, location, notes, order_index)
select id, 'Rabu', '15:00-17:00', 'Ruang PMR / Lapangan', 'Latihan rutin PMR mingguan', 1 from pmr
on conflict do nothing;

with pmr as (select id from public.extracurriculars where slug = 'pmr')
insert into public.ekskul_schedules (ekskul_id, day, time, location, notes, order_index)
select id, 'Sabtu', '08:00-10:00', 'Lapangan Sekolah', 'Latihan fisik & simulasi P3K', 2 from pmr
on conflict do nothing;

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

-- ============================================================
-- Seed SEMUA Ekstrakurikuler Utama (tabel public.extracurriculars)
-- ============================================================
insert into public.extracurriculars (slug, name, category, description, instructors, is_active)
values
  (
    'pmr',
    'Palang Merah Remaja (PMR)',
    'Kemanusiaan & Kesehatan',
    'Wadah pembinaan dan pengembangan anggota remaja PMR dalam bidang kemanusiaan, kesehatan, kesiapsiagaan bencana, dan pertolongan pertama di lingkungan sekolah maupun masyarakat.',
    'Dani Ahmad Fauzi, S.Pd & Ela Nurlaelasari, S.Pd',
    true
  ),
  (
    'pramuka',
    'Pramuka',
    'Wajib & Keorganisasian',
    'Gerakan Pramuka sebagai ekstrakurikuler wajib untuk membentuk karakter, kedisiplinan, kemandirian, dan kepedulian sosial serta lingkungan.',
    'Ageng Maulana, S.Pd & Nuraisyah Andalani Ibrahim, S.Pd',
    true
  ),
  (
    'paskibra',
    'Paskibra',
    'Kebangsaan & Baris-Berbaris',
    'Pasukan Pengibar Bendera yang melatih baris-berbaris, kedisiplinan, wawasan kebangsaan, dan pengibaran bendera pada upacara hari besar.',
    'Abyana Hendra',
    true
  ),
  (
    'olahraga',
    'Voli & Futsal',
    'Olahraga & Prestasi',
    'Ekstrakurikuler olahraga prestasi meliputi bola voli dan futsal untuk meningkatkan kebugaran jasmani, kerja sama tim, dan raihan prestasi.',
    'Saepul Bayu, S.Pd & Tris Septiana Hendrawan, S.Pd',
    true
  ),
  (
    'seni',
    'Seni & Kebudayaan',
    'Seni & Kreasi',
    'Pengembangan bakat dan kreativitas seni tari, musik, dan pertunjukan untuk mengapresiasi serta melestarikan kebudayaan daerah.',
    'Erlin Kristiani, S.Sn',
    true
  ),
  (
    'keagamaan',
    'Keagamaan / IRMAS',
    'Kerohanian',
    'Pembinaan kerohanian, kerukunan beragama, kegiatan keislaman, dan program tahfidz bagi peserta didik.',
    'Yopi Ahmad Faisal',
    true
  ),
  (
    'english-club',
    'English Club',
    'Akademik & Bahasa',
    'Wadah peningkatan kemampuan berbahasa Inggris melalui conversation club, story telling, debat, dan persiapan lomba akademik.',
    'Tenten Mudrika, S.Pd',
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  instructors = excluded.instructors,
  is_active = excluded.is_active,
  updated_at = now();

