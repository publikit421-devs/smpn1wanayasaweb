-- ============================================================
-- SMPN 1 Wanayasa - Tabel layanan_requests (Form Layanan Informasi Publik)
-- Struktur kolom sesuai permintaan + RLS:
--   - anon: INSERT (publik bisa mengirim)
--   - authenticated (admin): SELECT / UPDATE / DELETE
-- Idempotent - aman dijalankan berulang di SQL Editor.
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

-- Fallback auto-generate nomor_registrasi bila belum diisi dari frontend
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

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table public.layanan_requests enable row level security;

-- Publik (role anon) boleh mengirim data baru
drop policy if exists "Allow public insert" on public.layanan_requests;
create policy "Allow public insert"
  on public.layanan_requests for insert
  to anon
  with check (true);

-- Admin (authenticated) bisa melihat semua permohonan
drop policy if exists "Allow authenticated read" on public.layanan_requests;
create policy "Allow authenticated read"
  on public.layanan_requests for select
  to authenticated
  using (true);

-- Admin bisa mengubah status
drop policy if exists "Allow authenticated update" on public.layanan_requests;
create policy "Allow authenticated update"
  on public.layanan_requests for update
  to authenticated
  using (true)
  with check (true);

-- Admin bisa menghapus
drop policy if exists "Allow authenticated delete" on public.layanan_requests;
create policy "Allow authenticated delete"
  on public.layanan_requests for delete
  to authenticated
  using (true);

-- ============================================================
-- Realtime: masukkan tabel ke publikasi supabase_realtime
-- agar Dasbor Admin auto-refresh saat ada permohonan baru.
-- ============================================================
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
