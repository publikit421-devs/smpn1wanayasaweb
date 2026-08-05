-- ============================================================
-- SMPN 1 Wanayasa - Seed SEMUA Ekstrakurikuler Utama
-- (tabel public.extracurriculars, idempotent via slug)
-- ============================================================

insert into public.extracurriculars (slug, name, category, description, instructors, is_active)
values
  (
    'pmr',
    'Palang Merah Remaja (PMR)',
    'Kemanusiaan & Kesehatan',
    'Wadah pembinaan dan pengembangan anggota remaja PMR dalam bidang kemanusiaan, kesehatan, kesiapsiagaan bencana, dan pertolongan pertama di lingkungan sekolah maupun masyarakat.',
    'Dani Ahmad Fauzi, S.Pd & Ela Nurlaelasari, S.Pd',
    true
  ),
  (
    'pramuka',
    'Pramuka',
    'Wajib & Keorganisasian',
    'Gerakan Pramuka sebagai ekstrakurikuler wajib untuk membentuk karakter, kedisiplinan, kemandirian, dan kepedulian sosial serta lingkungan.',
    'Ageng Maulana, S.Pd & Nuraisyah Andalani Ibrahim, S.Pd',
    true
  ),
  (
    'paskibra',
    'Paskibra',
    'Kebangsaan & Baris-Berbaris',
    'Pasukan Pengibar Bendera yang melatih baris-berbaris, kedisiplinan, wawasan kebangsaan, dan pengibaran bendera pada upacara hari besar.',
    'Abyana Hendra',
    true
  ),
  (
    'olahraga',
    'Voli & Futsal',
    'Olahraga & Prestasi',
    'Ekstrakurikuler olahraga prestasi meliputi bola voli dan futsal untuk meningkatkan kebugaran jasmani, kerja sama tim, dan raihan prestasi.',
    'Saepul Bayu, S.Pd & Tris Septiana Hendrawan, S.Pd',
    true
  ),
  (
    'seni',
    'Seni & Kebudayaan',
    'Seni & Kreasi',
    'Pengembangan bakat dan kreativitas seni tari, musik, dan pertunjukan untuk mengapresiasi serta melestarikan kebudayaan daerah.',
    'Erlin Kristiani, S.Sn',
    true
  ),
  (
    'keagamaan',
    'Keagamaan / IRMAS',
    'Kerohanian',
    'Pembinaan kerohanian, kerukunan beragama, kegiatan keislaman, dan program tahfidz bagi peserta didik.',
    'Yopi Ahmad Faisal',
    true
  ),
  (
    'english-club',
    'English Club',
    'Akademik & Bahasa',
    'Wadah peningkatan kemampuan berbahasa Inggris melalui conversation club, story telling, debat, dan persiapan lomba akademik.',
    'Tenten Mudrika, S.Pd',
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  instructors = excluded.instructors,
  is_active = excluded.is_active,
  updated_at = now();