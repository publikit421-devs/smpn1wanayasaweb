-- ============================================================
-- SMPN 1 Wanayasa - Tabel hero_slides + Storage bucket hero-banners
-- Untuk mengelola gambar slider/banner hero utama secara dinamis.
-- ============================================================

-- 1) Tabel banner slider hero utama
create table if not exists public.hero_slides (
  id          uuid primary key default gen_random_uuid(),
  title       varchar not null default '',
  image_url   text not null,
  order_index int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists idx_hero_slides_order on public.hero_slides (order_index, created_at);
create index if not exists idx_hero_slides_active on public.hero_slides (is_active);

-- 2) Row Level Security
alter table public.hero_slides enable row level security;

-- Public Read: semua pengunjung boleh membaca slide aktif
drop policy if exists "Allow public read hero_slides" on public.hero_slides;
create policy "Allow public read hero_slides"
  on public.hero_slides for select
  using (is_active = true);

-- Authenticated manage (admin/operator) dapat mengelola
drop policy if exists "Allow authenticated manage hero_slides" on public.hero_slides;
create policy "Allow authenticated manage hero_slides"
  on public.hero_slides for all
  to authenticated
  using (true)
  with check (true);

-- 3) Storage bucket untuk gambar banner (public access)
insert into storage.buckets (id, name, public)
values ('hero-banners', 'hero-banners', true)
on conflict (id) do nothing;

-- Policy storage: public read + authenticated upload/update/delete
drop policy if exists "hero_banners_public_read" on storage.objects;
create policy "hero_banners_public_read"
  on storage.objects for select
  using (bucket_id = 'hero-banners');

drop policy if exists "hero_banners_authenticated_upload" on storage.objects;
create policy "hero_banners_authenticated_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'hero-banners');

drop policy if exists "hero_banners_authenticated_update" on storage.objects;
create policy "hero_banners_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'hero-banners')
  with check (bucket_id = 'hero-banners');

drop policy if exists "hero_banners_authenticated_delete" on storage.objects;
create policy "hero_banners_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'hero-banners');

-- 4) Grant akses tabel
grant select on table public.hero_slides to anon;
grant select, insert, update, delete on table public.hero_slides to authenticated;