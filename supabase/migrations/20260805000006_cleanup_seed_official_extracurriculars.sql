-- ============================================================
-- SMPN 1 Wanayasa - CLEANUP data dummy/duplikat + SEED 12 Ekskul Resmi
-- Strategi: hapus duplikat berdasarkan slug (pertahankan baris tertua),
-- non-aktifkan data dummy yang tidak terdaftar, lalu UPSERT by slug.
-- Idempotent & aman dijalankan berulang kali.
-- ============================================================

-- 1) Hapus DUPLIKAT: untuk slug yang sama, pertahankan baris dengan created_at
--    paling awal (yang pertama dibuat), sisanya dihapus (cascade ke child).
delete from public.extracurriculars
where id in (
  select id
  from (
    select
      id,
      slug,
      row_number() over (
        partition by slug
        order by created_at asc, id asc
      ) as rn
    from public.extracurriculars
  ) ranked
  where rn > 1
);

-- 2) NON-AKTIFKAN data dummy lama yang TIDAK termasuk 12 ekskul resmi
--    (mis. 'olahraga', 'keagamaan', 'english-club', 'keagamaan / irmas', dll)
update public.extracurriculars
set is_active = false, updated_at = now()
where slug not in (
  'science-club', 'drum-band', 'hortikultura', 'paskibra', 'pramuka',
  'seni', 'jurnalis', 'voli', 'futsal', 'pks', 'tahfidz', 'pmr'
);

-- 3) SEED 12 EKSTRAKURIKULER RESMI (UPSERT by slug — anti duplikasi)
insert into public.extracurriculars (slug, name, category, description, instructors, is_active)
values
  (
    'science-club',
    'Science Club',
    'Akademik & Sains',
    'Wadah pengembangan minat dan bakat siswa di bidang sains melalui praktikum, percobaan, riset sederhana, dan persiapan lomba akademik (KSM, OSN).',
    'Tenten Mudrika, S.Pd',
    true
  ),
  (
    'drum-band',
    'Drum Band',
    'Seni & Musik',
    'Latihan musik dan barisan drum band untuk melatih kekompakan, kedisiplinan, dan apresiasi seni musik yang tampil pada upacara dan event sekolah.',
    'Hj. Lilis Juwariyah, S.Pd',
    true
  ),
  (
    'hortikultura',
    'Hortikultura',
    'Lingkungan & Kewirausahaan',
    'Berkebun, bercocok tanam, dan mengolah hasil panen untuk mendukung program adiwiyata serta melatih jiwa kewirausahaan siswa.',
    'Cucu Susilawati, S.Pd',
    true
  ),
  (
    'paskibra',
    'Paskibra',
    'Kebangsaan & Keorganisasian',
    'Pasukan Pengibar Bendera yang melatih baris-berbaris, kedisiplinan, wawasan kebangsaan, dan keorganisasian serta pengibaran bendera pada upacara hari besar.',
    'Abyana Hendra',
    true
  ),
  (
    'pramuka',
    'Pramuka',
    'Wajib & Kepanduan',
    'Gerakan Pramuka sebagai ekstrakurikuler wajib untuk membentuk karakter, kedisiplinan, kemandirian, kepemimpinan, dan kepedulian sosial serta lingkungan.',
    'Ageng Maulana, S.Pd (Putra) & Nuraisyah Andalani Ibrahim, S.Pd (Putri)',
    true
  ),
  (
    'seni',
    'Seni',
    'Seni & Budaya',
    'Pengembangan bakat dan kreativitas seni tari, musik, dan pertunjukan untuk mengapresiasi serta melestarikan kebudayaan daerah.',
    'Erlin Kristiani, S.Sn',
    true
  ),
  (
    'jurnalis',
    'Jurnalis',
    'Literasi & Media',
    'Kegiatan jurnalistik sekolah: menulis berita, membuat majalah dinding, dan mengelola media informasi sekolah.',
    'Iis Widayanti, S.Pd',
    true
  ),
  (
    'voli',
    'Voli',
    'Olahraga & Prestasi',
    'Latihan bola voli untuk meningkatkan kebugaran jasmani, kerja sama tim, sportivitas, dan raihan prestasi pada ajang antar sekolah.',
    'Saepul Bayu, S.Pd',
    true
  ),
  (
    'futsal',
    'Futsal',
    'Olahraga & Prestasi',
    'Latihan futsal untuk mengasah teknik, strategi, kerja sama tim, dan prestasi pada kompetisi futsal pelajar.',
    'Tris Septiana Hendrawan, S.Pd',
    true
  ),
  (
    'pks',
    'Patroli Keamanan Sekolah (PKS)',
    'Kedisiplinan & Keamanan',
    'Patroli Keamanan Sekolah: membantu ketertiban, keamanan, dan kelancaran lalu lintas di lingkungan sekolah serta menumbuhkan kedisiplinan siswa.',
    'Dude Suganda, S.Pd',
    true
  ),
  (
    'tahfidz',
    'Tahfidz',
    'Keagamaan & Kerohanian',
    'Program menghafal Al-Qur\u2019an dan pembinaan keagamaan untuk membentuk generasi berakhlak mulia.',
    'Yopi Ahmad Faisal',
    true
  ),
  (
    'pmr',
    'Palang Merah Remaja (PMR)',
    'Kemanusiaan & Kesehatan',
    'Wadah pembinaan dan pengembangan anggota remaja PMR dalam bidang kemanusiaan, kesehatan, kesiapsiagaan bencana, dan pertolongan pertama di lingkungan sekolah maupun masyarakat.',
    'Dani Ahmad Fauzi, S.Pd & Ela Nurlaelasari, S.Pd',
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  instructors = excluded.instructors,
  is_active = true,
  updated_at = now();