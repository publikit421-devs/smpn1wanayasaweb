-- ============================================================
-- SMPN 1 Wanayasa - Bucket storage `school-media` + tabel gallery_items
-- - Bucket public: semua pengunjung bisa melihat gambar
-- - Policy: authenticated (admin) bisa unggah/update/hapus
-- Idempotent - aman dijalankan berulang.
-- ============================================================

-- ============================================================
-- 1) Bucket `school-media`
-- ============================================================
insert into storage.buckets (id, name, public)
values ('school-media', 'school-media', true)
on conflict (id) do nothing;

-- Siapa pun (anon) bisa membaca file
drop policy if exists "school_media_public_read" on storage.objects;
create policy "school_media_public_read"
  on storage.objects for select
  using (bucket_id = 'school-media');

-- Admin (authenticated) bisa mengunggah
drop policy if exists "school_media_authenticated_upload" on storage.objects;
create policy "school_media_authenticated_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'school-media');

-- Admin bisa memperbarui file
drop policy if exists "school_media_authenticated_update" on storage.objects;
create policy "school_media_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'school-media')
  with check (bucket_id = 'school-media');

-- Admin bisa menghapus file
drop policy if exists "school_media_authenticated_delete" on storage.objects;
create policy "school_media_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'school-media');

-- ============================================================
-- 2) Tabel gallery_items (Galeri Foto)
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
