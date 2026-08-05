-- EKSTRAKURIKULER SMPN 1 Wanayasa
-- Idempotent: aman dijalankan berulang di Supabase SQL Editor.
-- Menambah kolom pembina + urutan, lalu mengisi 11 ekstrakurikuler resmi.

alter table public.kegiatan
  add column if not exists pembina text;

alter table public.kegiatan
  add column if not exists urutan integer;

-- Bersihkan data ekstrakurikuler lama (dummy) sebelum seed ulang
delete from public.kegiatan
where category = 'ekstrakurikuler';

insert into public.kegiatan (title, description, category, image_url, pembina, urutan, is_active) values
  ('Science Club', 'Eksplorasi sains melalui praktikum, percobaan, dan riset sederhana untuk menumbuhkan rasa ingin tahu dan kemampuan berpikir ilmiah.', 'ekstrakurikuler', '/kegiatan/praktikum-lab.svg', 'Tenten Mudrika, S.Pd', 1, true),
  ('Drum Band', 'Latihan musik dan barisan drum band yang melatih kekompakan, disiplin, dan kerja sama tim.', 'ekstrakurikuler', '/kegiatan/upacara-bendera.svg', 'Hj. Lilis Juwariyah, S.Pd', 2, true),
  ('Hortikultura', 'Berkebun, bercocok tanam, dan merawat tanaman di lingkungan sekolah untuk mendukung program adiwiyata.', 'ekstrakurikuler', '/kegiatan/belajar-mengajar.svg', 'Cucu Susilawati, S.Pd', 3, true),
  ('Paskibra', 'Latihan baris-berbaris, keterampilan PBB, dan pengibaran bendera untuk membentuk kedisiplinan dan jiwa kepemimpinan.', 'ekstrakurikuler', '/ekskul/paskibra.svg', 'Abyana Hendra', 4, true),
  ('Pramuka', 'Kepramukaan untuk membina karakter, kemandirian, dan kepedulian sosial. Pembina Putra: Ageng Maulana, S.Pd • Pembina Putri: Nuraisyah Andalani Ibrahim, S.Pd', 'ekstrakurikuler', '/kegiatan/ekskul-pramuka.svg', 'Ageng Maulana, S.Pd & Nuraisyah Andalani Ibrahim, S.Pd', 5, true),
  ('Seni', 'Pengembangan bakat dan kreativitas seni tari, musik, dan pertunjukan.', 'ekstrakurikuler', '/ekskul/tari.svg', 'Erlin Kristiani, S.Sn', 6, true),
  ('Jurnalis', 'Kegiatan menulis berita, pengelolaan majalah dinding, dan media informasi sekolah.', 'ekstrakurikuler', '/kegiatan/belajar-mengajar.svg', 'Iis Widayanti, S.Pd', 7, true),
  ('Voli', 'Latihan bola voli untuk meningkatkan kebugaran jasmani dan prestasi olahraga.', 'ekstrakurikuler', '/kegiatan/olahraga.svg', 'Saepul Bayu, S.Pd', 8, true),
  ('Futsal', 'Latihan futsal meliputi teknik dasar, dribbling, passing, dan pertandingan.', 'ekstrakurikuler', '/ekskul/futsal.svg', 'Tris Septiana Hendrawan, S.Pd', 9, true),
  ('PKS', 'Patroli Keamanan Sekolah: membantu ketertiban lalu lintas dan keamanan di lingkungan sekolah.', 'ekstrakurikuler', '/kegiatan/upacara-bendera.svg', 'Dude Suganda', 10, true),
  ('Tahfidz', 'Program menghafal Al-Qur''an dan pembinaan keagamaan untuk membentuk karakter religius siswa.', 'ekstrakurikuler', '/kegiatan/belajar-mengajar.svg', 'Yopi Ahmad Faisal', 11, true);
