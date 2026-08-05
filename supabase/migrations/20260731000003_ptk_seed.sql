-- ============================================================
-- SMPN 1 Wanayasa - Seed Data Asli PTK (46 Orang)
-- Tambah kolom jenis_ptk & jabatan, bersihkan data dummy, lalu seed
-- ============================================================

-- 1. Tambah kolom baru (idempotent)
alter table public.staff add column if not exists jenis_ptk text not null default 'Guru'
  check (jenis_ptk in ('Guru', 'Tenaga Kependidikan', 'Kepala Sekolah'));
alter table public.staff add column if not exists jabatan text;

-- 2. Bersihkan semua data lama (dummy)
truncate table public.staff;

-- 3. Seed 46 data asli PTK
insert into public.staff (nama, nip, gelar, role, bidang, jenis, jenis_ptk, jabatan, urutan, is_active)
values
  ('Ajid Mustopa', '196707061998020992', 'S.Pd, M.Pd', 'Kepala Sekolah', 'Manajemen', 'guru', 'Kepala Sekolah', 'Kepala Sekolah', 1, true),
  ('Abdul Muis Riyadjudin', '199108012025211040', 'S.Pd', 'Guru Bimbingan Konseling', 'Bimbingan Konseling', 'guru', 'Guru', 'Guru Bimbingan Konseling', 2, true),
  ('Abibudin', '198906242025211072', 'S.E.', 'Tenaga Administrasi Sekolah', 'Tata Usaha', 'staf', 'Tenaga Kependidikan', 'Tenaga Administrasi Sekolah', 3, true),
  ('Abyana Hendra', '198005162025211040', NULL, 'Penjaga Sekolah', 'Umum', 'staf', 'Tenaga Kependidikan', 'Penjaga Sekolah', 4, true),
  ('Ade Syarip Hidayat', '198206042025211072', NULL, 'Penjaga Sekolah', 'Umum', 'staf', 'Tenaga Kependidikan', 'Penjaga Sekolah', 5, true),
  ('Adhis Rakhman Kherdhiantho', NULL, 'S.Ag', 'Guru IPA', 'IPA', 'guru', 'Guru', 'Guru IPA', 6, true),
  ('Adityaningsih', NULL, 'S.Pd', 'Guru Bahasa Inggris', 'Bahasa Inggris', 'guru', 'Guru', 'Guru Bahasa Inggris', 7, true),
  ('Ageng Maulana', NULL, 'A.Ma.Pd, S.Pd', 'Guru Bahasa Indonesia', 'Bahasa Indonesia', 'guru', 'Guru', 'Guru Bahasa Indonesia', 8, true),
  ('Ahmad Dani Akbar Wijaya', '199211072020120992', 'S.Pd, M.Pd', 'Guru Bahasa Indonesia', 'Bahasa Indonesia', 'guru', 'Guru', 'Guru Bahasa Indonesia', 9, true),
  ('Ahmad Faturohman', '196904102007011008', NULL, 'Tenaga Administrasi Sekolah', 'Tata Usaha', 'staf', 'Tenaga Kependidikan', 'Tenaga Administrasi Sekolah', 10, true),
  ('Aneng Taryati', '198411112024212000', 'S.Pd', 'Guru Bahasa Inggris', 'Bahasa Inggris', 'guru', 'Guru', 'Guru Bahasa Inggris', 11, true),
  ('Asep Sulaeman', '198410222022211008', 'S.T', 'Guru TIK', 'TIK', 'guru', 'Guru', 'Guru TIK', 12, true),
  ('Cucu Susilawati', NULL, 'S.Pd', 'Guru IPS', 'IPS', 'guru', 'Guru', 'Guru IPS', 13, true),
  ('Dani Ahmad Fauzi', NULL, 'S.Pd', 'Guru Bahasa Indonesia', 'Bahasa Indonesia', 'guru', 'Guru', 'Guru Bahasa Indonesia', 14, true),
  ('Dewi Rahmatin', '196710131995032000', 'A.Ma.Pd, S.Pd', 'Guru IPA', 'IPA', 'guru', 'Guru', 'Guru IPA', 15, true),
  ('Dodoh', '197310082000121984', 'S.Ag', 'Guru Agama Islam', 'PAI', 'guru', 'Guru', 'Guru Agama Islam', 16, true),
  ('Dude Suganda', '197808082024211008', NULL, 'Guru Penjasorkes', 'Penjasorkes', 'guru', 'Guru', 'Guru Penjasorkes', 17, true),
  ('Ela Nurlaelasari', '198201192025212000', 'S.Pd', 'Guru IPS', 'IPS', 'guru', 'Guru', 'Guru IPS', 18, true),
  ('Enang Taryana', '197207091997020992', 'S.Pd', 'Guru Bahasa Inggris', 'Bahasa Inggris', 'guru', 'Guru', 'Guru Bahasa Inggris', 19, true),
  ('Eneng Yudit', '198112072025212032', NULL, 'Tenaga Administrasi Sekolah', 'Tata Usaha', 'staf', 'Tenaga Kependidikan', 'Tenaga Administrasi Sekolah', 20, true),
  ('Eny Puryanti', '197203032023212000', 'S.Pd', 'Guru PPKN', 'PPKN', 'guru', 'Guru', 'Guru PPKN', 21, true),
  ('Erlin Kristiani', '198408012022212000', 'S.Sn', 'Guru Seni Budaya', 'Seni Budaya', 'guru', 'Guru', 'Guru Seni Budaya', 22, true),
  ('Heni Karyawati', '197011061998022016', 'S.Pd', 'Guru PPKN', 'PPKN', 'guru', 'Guru', 'Guru PPKN', 23, true),
  ('Iis Widayanti', '199401012025212160', 'S.Pd', 'Guru Bahasa Indonesia', 'Bahasa Indonesia', 'guru', 'Guru', 'Guru Bahasa Indonesia', 24, true),
  ('Jamilah', '197309172025212000', 'S.Pd.I', 'Guru Agama Islam', 'PAI', 'guru', 'Guru', 'Guru Agama Islam', 25, true),
  ('Lestari Indra Sumantri', '199406142020121984', 'S.Pd', 'Guru Bimbingan Konseling', 'Bimbingan Konseling', 'guru', 'Guru', 'Guru Bimbingan Konseling', 26, true),
  ('Lian Yustriatin', '199010302022212000', 'S.Pd', 'Guru Matematika', 'Matematika', 'guru', 'Guru', 'Guru Matematika', 27, true),
  ('Lilis Juwariah', '196707211989032000', 'S.Pd', 'Guru Bahasa Indonesia', 'Bahasa Indonesia', 'guru', 'Guru', 'Guru Bahasa Indonesia', 28, true),
  ('Lina Herlina', '198007152025212032', 'S.Pd', 'Guru Matematika', 'Matematika', 'guru', 'Guru', 'Guru Matematika', 29, true),
  ('Maryati', '196811121995032000', 'A.Ma.Pd, S.Pd', 'Guru Bahasa Inggris', 'Bahasa Inggris', 'guru', 'Guru', 'Guru Bahasa Inggris', 30, true),
  ('Moch. Jaenudin', '197308252000031008', 'S.E.', 'Tenaga Administrasi Sekolah', 'Tata Usaha', 'staf', 'Tenaga Kependidikan', 'Tenaga Administrasi Sekolah', 31, true),
  ('Muhamad Sidik Heryana', NULL, 'S.Pd', 'Guru TIK', 'TIK', 'guru', 'Guru', 'Guru TIK', 32, true),
  ('Neni Kania Dewi', '197509112009022016', 'S.Pd', 'Guru Bahasa Sunda', 'Bahasa Sunda', 'guru', 'Guru', 'Guru Bahasa Sunda', 33, true),
  ('Nesha Maulia Rahmatillah', '199508192024212032', 'S.Pd', 'Guru IPA', 'IPA', 'guru', 'Guru', 'Guru IPA', 34, true),
  ('Nina Susilana', '197211182000032000', NULL, 'Tenaga Administrasi Sekolah', 'Tata Usaha', 'staf', 'Tenaga Kependidikan', 'Tenaga Administrasi Sekolah', 35, true),
  ('Nuraisyah Andalani Ibrahim', '197809152008012000', 'S.Pd', 'Guru IPS', 'IPS', 'guru', 'Guru', 'Guru IPS', 36, true),
  ('Nurani Cipta Nur Ilham', '199812272025212000', 'S.I.Kom.', 'Guru Prakarya Dan Kewirausahaan', 'Prakarya', 'guru', 'Guru', 'Guru Prakarya Dan Kewirausahaan', 37, true),
  ('Peri Agustian Muharam', NULL, 'S.Pd', 'Guru Matematika', 'Matematika', 'guru', 'Guru', 'Guru Matematika', 38, true),
  ('RESTI YUNIARTI', '199301202024212032', 'S.Pd', 'Guru IPA', 'IPA', 'guru', 'Guru', 'Guru IPA', 39, true),
  ('Rina Gustian Nuraeni', '198708022025212096', 'A.Md', 'Pustakawan', 'Perpustakaan', 'staf', 'Tenaga Kependidikan', 'Pustakawan', 40, true),
  ('Saepul Bayu', '199101102025211008', 'S.Pd', 'Guru Penjasorkes', 'Penjasorkes', 'guru', 'Guru', 'Guru Penjasorkes', 41, true),
  ('Saepullah', '196710242008011008', 'S.Ag', 'Guru Agama Islam', 'PAI', 'guru', 'Guru', 'Guru Agama Islam', 42, true),
  ('Tenten Mudrika', '198303042009022016', NULL, 'Guru Matematika', 'Matematika', 'guru', 'Guru', 'Guru Matematika', 43, true),
  ('Tris Septiana Hendrawan', '199109182024211008', 'S.Pd', 'Guru Penjasorkes', 'Penjasorkes', 'guru', 'Guru', 'Guru Penjasorkes', 44, true),
  ('Yeni Supriyatni', '197005272007012000', 'A.Ma.Pd, S.Pd', 'Guru IPA', 'IPA', 'guru', 'Guru', 'Guru IPA', 45, true),
  ('Yuliyanti Indriani Rahayu', NULL, 'S.Pd', 'Guru Bimbingan Konseling', 'Bimbingan Konseling', 'guru', 'Guru', 'Guru Bimbingan Konseling', 46, true);

-- 4. Update timestamps
update public.staff set created_at = now(), updated_at = now();
