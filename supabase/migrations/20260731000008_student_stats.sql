-- ============================================================
-- SMPN 1 Wanayasa - Tabel student_stats (Statistik Peserta Didik)
-- Menyimpan ringkasan & demografi siswa per tahun ajaran.
-- RLS: anon SELECT (publik bisa lihat), authenticated ALL (admin kelola).
-- Idempotent - aman dijalankan berulang.
-- ============================================================

create table if not exists public.student_stats (
  id            uuid primary key default gen_random_uuid(),
  tahun_ajaran  text not null,
  total         integer not null default 0,
  laki          integer not null default 0,
  perempuan     integer not null default 0,
  usia          jsonb not null default '[]'::jsonb,
  agama         jsonb not null default '[]'::jsonb,
  updated_at    timestamptz not null default now()
);

create unique index if not exists student_stats_tahun_ajaran_uq
  on public.student_stats (tahun_ajaran);

-- ============================================================
-- RLS
-- ============================================================
alter table public.student_stats enable row level security;

drop policy if exists "Allow read student_stats" on public.student_stats;
create policy "Allow read student_stats"
  on public.student_stats for select
  using (true);

drop policy if exists "Allow manage student_stats" on public.student_stats;
create policy "Allow manage student_stats"
  on public.student_stats for all
  using (auth.role() = 'authenticated');

-- ============================================================
-- Seed data peserta didik (2026/2027)
-- ============================================================
insert into public.student_stats (tahun_ajaran, total, laki, perempuan, usia, agama)
values (
  '2026/2027',
  804,
  400,
  404,
  '[
    {"label": "< 6 tahun",   "total": 0,   "laki": 0,   "perempuan": 0},
    {"label": "6 - 12 tahun", "total": 47,  "laki": 18,  "perempuan": 29},
    {"label": "13 - 15 tahun", "total": 735, "laki": 367, "perempuan": 368},
    {"label": "16 - 20 tahun", "total": 22,  "laki": 15,  "perempuan": 7},
    {"label": "> 20 tahun",    "total": 0,   "laki": 0,   "perempuan": 0}
  ]'::jsonb,
  '[
    {"label": "Islam",   "total": 804, "laki": 400, "perempuan": 404},
    {"label": "Lainnya", "total": 0,   "laki": 0,   "perempuan": 0}
  ]'::jsonb
)
on conflict (tahun_ajaran) do update set
  total = excluded.total,
  laki = excluded.laki,
  perempuan = excluded.perempuan,
  usia = excluded.usia,
  agama = excluded.agama,
  updated_at = now();
