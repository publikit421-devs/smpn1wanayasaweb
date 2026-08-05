-- ============================================================
-- SMPN 1 Wanayasa - Tambah Ekstrakurikuler PMR
-- (disimpan di tabel public.kegiatan, category = 'ekstrakurikuler')
-- Idempotent: aman dijalankan berulang di SQL Editor.
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
