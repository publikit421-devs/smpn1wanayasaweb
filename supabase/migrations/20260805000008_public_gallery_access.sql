-- ============================================================
-- SMPN 1 Wanayasa - Public access untuk galeri ekskul
-- 1) Pastikan bucket 'ekskul-media' PUBLIC
-- 2) RLS storage.objects: anon & authenticated boleh SELECT (baca)
-- 3) RLS ekskul_galleries: publik boleh membaca
-- Idempotent — aman dijalankan ulang.
-- ============================================================

-- 1) Bucket ekskul-media wajib public
insert into storage.buckets (id, name, public)
values ('ekskul-media', 'ekskul-media', true)
on conflict (id) do update set public = excluded.public;

-- 2) Policy storage: Public Read Access (anon & authenticated)
drop policy if exists "Public Read Access for Gallery Bucket" on storage.objects;
create policy "Public Read Access for Gallery Bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'ekskul-media');

-- Keep alias policy jika sudah ada dari migration 00001
drop policy if exists "ekskul_media_public_read" on storage.objects;

-- 3) RLS tabel galeri: publik boleh baca
drop policy if exists "Allow public read access to galleries" on public.ekskul_galleries;
create policy "Allow public read access to galleries"
  on public.ekskul_galleries for select
  to anon, authenticated
  using (true);

-- Jaga kompatibilitas policy lama jika ada
drop policy if exists "Allow public read ekskul_galleries" on public.ekskul_galleries;

-- 4) Grant tambahan agar REST (PostgREST) resmi mengizinkan akses
grant select on table public.ekskul_galleries to anon, authenticated;