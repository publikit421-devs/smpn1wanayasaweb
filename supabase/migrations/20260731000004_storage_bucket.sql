-- ============================================================
-- SMPN 1 Wanayasa - Supabase Storage Bucket untuk Berita
-- Bucket public: berita-images
-- ============================================================

-- 0) Pastikan kolom image_url ada di tabel announcements
alter table public.announcements add column if not exists image_url text;

-- 1) Buat bucket (public agar Public URL bisa diakses tanpa token)
insert into storage.buckets (id, name, public)
values ('berita-images', 'berita-images', true)
on conflict (id) do nothing;

-- 2) Policy akses
-- Siapa pun (anon) bisa membaca file di bucket ini
drop policy if exists "berita_images_public_read" on storage.objects;
create policy "berita_images_public_read"
  on storage.objects for select
  using (bucket_id = 'berita-images');

-- User yang login (authenticated) bisa mengunggah file
drop policy if exists "berita_images_authenticated_upload" on storage.objects;
create policy "berita_images_authenticated_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'berita-images');

-- User yang login bisa memperbarui file
drop policy if exists "berita_images_authenticated_update" on storage.objects;
create policy "berita_images_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'berita-images')
  with check (bucket_id = 'berita-images');

-- User yang login bisa menghapus file
drop policy if exists "berita_images_authenticated_delete" on storage.objects;
create policy "berita_images_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'berita-images');
