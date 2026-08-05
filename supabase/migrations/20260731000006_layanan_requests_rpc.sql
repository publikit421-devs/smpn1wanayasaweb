-- ============================================================
-- SMPN 1 Wanayasa - Permohonan Layanan Publik (public_services)
-- Fix integrasi insert dari pengunjung (anon):
--   - RLS: anon boleh INSERT, admin (authenticated) SELECT/UPDATE/DELETE
--   - RPC SECURITY DEFINER: insert + return baris (termasuk nomor_registrasi
--     dari trigger) tanpa diblokir policy SELECT untuk anon.
-- Idempotent - aman dijalankan berulang di SQL Editor.
-- ============================================================

-- ============================================================
-- 1) Pastikan tabel ada + kolom lengkap
-- ============================================================
CREATE TABLE IF NOT EXISTS public.public_services (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_type      TEXT NOT NULL CHECK (service_type IN (
                      'informasi-publik',
                      'pengaduan',
                      'legalisasi-ijazah',
                      'izin-siswa',
                      'penelitian',
                      'mutasi-siswa'
                    )),
  nama_pemohon      TEXT NOT NULL,
  nik               TEXT,
  alamat            TEXT,
  no_telepon        TEXT NOT NULL,
  email             TEXT,
  payload           JSONB NOT NULL DEFAULT '{}'::jsonb,
  status            TEXT NOT NULL DEFAULT 'masuk' CHECK (status IN (
                      'masuk',
                      'diproses',
                      'selesai',
                      'ditolak'
                    )),
  catatan_admin     TEXT,
  nomor_registrasi  TEXT UNIQUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

CREATE INDEX IF NOT EXISTS idx_public_services_type ON public_services (service_type);
CREATE INDEX IF NOT EXISTS idx_public_services_status ON public_services (status);
CREATE INDEX IF NOT EXISTS idx_public_services_created_at ON public_services (created_at DESC);

-- ============================================================
-- 2) RLS
-- ============================================================
ALTER TABLE public_services ENABLE ROW LEVEL SECURITY;

-- Pengunjung umum (anon) DIIZINKAN memasukkan data baru
DROP POLICY IF EXISTS "Anyone can submit a service request" ON public_services;
CREATE POLICY "Anyone can submit a service request"
  ON public_services FOR INSERT
  WITH CHECK (TRUE);

-- Admin (authenticated) bisa membaca, mengubah, dan menghapus
DROP POLICY IF EXISTS "Admin can read and update service requests" ON public_services;
CREATE POLICY "Admin can read and update service requests"
  ON public_services FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================================
-- 3) RPC submit_service_request (SECURITY DEFINER)
--    Bypass RLS RETURNING agar anon tetap mendapat baris hasil
--    (termasuk nomor_registrasi yang di-generate trigger).
-- ============================================================
CREATE OR REPLACE FUNCTION public.submit_service_request(
  p_service_type text,
  p_nama_pemohon text,
  p_no_telepon text,
  p_nik text DEFAULT NULL,
  p_alamat text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public_services;
BEGIN
  INSERT INTO public_services (service_type, nama_pemohon, nik, alamat, no_telepon, email, payload)
  VALUES (p_service_type, p_nama_pemohon, p_nik, p_alamat, p_no_telepon, p_email, COALESCE(p_payload, '{}'::jsonb))
  RETURNING * INTO result;

  RETURN to_jsonb(result);
END;
$$;

-- Batasi eksekusi: hanya anon & authenticated (bukan seluruh public)
REVOKE EXECUTE ON FUNCTION public.submit_service_request(text, text, text, text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_service_request(text, text, text, text, text, text, jsonb) TO anon, authenticated;
