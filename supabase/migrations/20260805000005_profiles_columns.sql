-- ============================================================
-- SMPN 1 Wanayasa - Normalisasi kolom public.profiles
-- Pastikan kolom created_at / updated_at ada (dipakai kode server).
-- Idempotent: aman dijalankan berulang kali.
-- ============================================================

alter table public.profiles
  add column if not exists created_at timestamptz not null default now();

alter table public.profiles
  add column if not exists updated_at timestamptz not null default now();