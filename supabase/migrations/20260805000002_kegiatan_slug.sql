-- ============================================================
-- SMPN 1 Wanayasa - Tambah kolom slug pada public.kegiatan
-- untuk link kartu ekstrakurikuler ke halaman detail
-- (/ekstrakurikuler/[slug]).
-- ============================================================

alter table public.kegiatan add column if not exists slug text;

update public.kegiatan
set slug = lower(
  regexp_replace(
    regexp_replace(trim(title), '\s+', '-', 'g'),
    '[^a-z0-9-]', '', 'g'
  )
)
where slug is null;
