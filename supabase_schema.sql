-- ============================================================
-- SMPN 1 Wanayasa — Supabase Database Schema
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
