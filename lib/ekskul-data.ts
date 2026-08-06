import { supabase } from './supabase'

export interface LocalEkskul {
  slug: string
  name: string
  category: string
  description: string
  instructors: string
  image: string
}

/**
 * Sumber kebenaran (source of truth) ekstrakurikuler SMPN 1 Wanayasa.
 * Berisi 12 ekskul resmi sekolah. Dipakai untuk: fallback tampilan publik,
 * auto-sync ke Supabase, dan generateStaticParams pada halaman detail.
 */
export const LOCAL_EXTRACURRICULARS: LocalEkskul[] = [
  {
    slug: 'science-club',
    name: 'Science Club',
    category: 'Akademik & Sains',
    description: 'Wadah pengembangan minat dan bakat siswa di bidang sains melalui praktikum, percobaan, riset sederhana, dan persiapan lomba akademik (KSM, OSN).',
    instructors: 'Tenten Mudrika, S.Pd',
    image: '/kegiatan/praktikum-lab.svg',
  },
  {
    slug: 'drum-band',
    name: 'Drum Band',
    category: 'Seni & Musik',
    description: 'Latihan musik dan barisan drum band untuk melatih kekompakan, kedisiplinan, dan apresiasi seni musik yang tampil pada upacara dan event sekolah.',
    instructors: 'Hj. Lilis Juwariyah, S.Pd',
    image: '/kegiatan/upacara-bendera.svg',
  },
  {
    slug: 'hortikultura',
    name: 'Hortikultura',
    category: 'Lingkungan & Kewirausahaan',
    description: 'Berkebun, bercocok tanam, dan mengolah hasil panen untuk mendukung program adiwiyata serta melatih jiwa kewirausahaan siswa.',
    instructors: 'Cucu Susilawati, S.Pd',
    image: '/kegiatan/belajar-mengajar.svg',
  },
  {
    slug: 'paskibra',
    name: 'Paskibra',
    category: 'Kebangsaan & Keorganisasian',
    description: 'Pasukan Pengibar Bendera yang melatih baris-berbaris, kedisiplinan, wawasan kebangsaan, dan keorganisasian serta pengibaran bendera pada upacara hari besar.',
    instructors: 'Abyana Hendra',
    image: '/ekskul/paskibra.svg',
  },
  {
    slug: 'pramuka',
    name: 'Pramuka',
    category: 'Wajib & Kepanduan',
    description: 'Gerakan Pramuka sebagai ekstrakurikuler wajib untuk membentuk karakter, kedisiplinan, kemandirian, kepemimpinan, dan kepedulian sosial serta lingkungan.',
    instructors: 'Ageng Maulana, S.Pd (Putra) & Nuraisyah Andalani Ibrahim, S.Pd (Putri)',
    image: '/kegiatan/ekskul-pramuka.svg',
  },
  {
    slug: 'seni',
    name: 'Seni',
    category: 'Seni & Budaya',
    description: 'Pengembangan bakat dan kreativitas seni tari, musik, dan pertunjukan untuk mengapresiasi serta melestarikan kebudayaan daerah.',
    instructors: 'Erlin Kristiani, S.Sn',
    image: '/ekskul/tari.svg',
  },
  {
    slug: 'jurnalis',
    name: 'Jurnalis',
    category: 'Literasi & Media',
    description: 'Kegiatan jurnalistik sekolah: menulis berita, membuat majalah dinding, dan mengelola media informasi sekolah.',
    instructors: 'Iis Widayanti, S.Pd',
    image: '/kegiatan/belajar-mengajar.svg',
  },
  {
    slug: 'voli',
    name: 'Voli',
    category: 'Olahraga & Prestasi',
    description: 'Latihan bola voli untuk meningkatkan kebugaran jasmani, kerja sama tim, sportivitas, dan raihan prestasi pada ajang antar sekolah.',
    instructors: 'Saepul Bayu, S.Pd',
    image: '/kegiatan/olahraga.svg',
  },
  {
    slug: 'futsal',
    name: 'Futsal',
    category: 'Olahraga & Prestasi',
    description: 'Latihan futsal untuk mengasah teknik, strategi, kerja sama tim, dan prestasi pada kompetisi futsal pelajar.',
    instructors: 'Tris Septiana Hendrawan, S.Pd',
    image: '/ekskul/futsal.svg',
  },
  {
    slug: 'pks',
    name: 'Patroli Keamanan Sekolah (PKS)',
    category: 'Kedisiplinan & Keamanan',
    description: 'Patroli Keamanan Sekolah: membantu ketertiban, keamanan, dan kelancaran lalu lintas di lingkungan sekolah serta menumbuhkan kedisiplinan siswa.',
    instructors: 'Dude Suganda, S.Pd',
    image: '/kegiatan/upacara-bendera.svg',
  },
  {
    slug: 'tahfidz',
    name: 'Tahfidz',
    category: 'Keagamaan & Kerohanian',
    description: 'Program menghafal Al-Qur\u2019an dan pembinaan keagamaan untuk membentuk generasi berakhlak mulia.',
    instructors: 'Yopi Ahmad Faisal',
    image: '/kegiatan/belajar-mengajar.svg',
  },
  {
    slug: 'pmr',
    name: 'Palang Merah Remaja (PMR)',
    category: 'Kemanusiaan & Kesehatan',
    description: 'Wadah pembinaan dan pengembangan anggota remaja PMR dalam bidang kemanusiaan, kesehatan, kesiapsiagaan bencana, dan pertolongan pertama di lingkungan sekolah maupun masyarakat.',
    instructors: 'Dani Ahmad Fauzi, S.Pd & Ela Nurlaelasari, S.Pd',
    image: '/ekskul/pmr.svg',
  },
]

export function getLocalEkskul(slug: string): LocalEkskul | null {
  return LOCAL_EXTRACURRICULARS.find((e) => e.slug === slug) || null
}

/**
 * Sinkronkan data ekskul dari source code (LOCAL_EXTRACURRICULARS)
 * ke tabel Supabase `extracurriculars` (upsert idempotent by slug).
 * Wajib dipanggil dari sesi authenticated (RLS).
 */
export async function syncExtracurricularsToSupabase(): Promise<number> {
  const payload = LOCAL_EXTRACURRICULARS.map((e) => ({
    slug: e.slug,
    name: e.name,
    category: e.category,
    description: e.description,
    instructors: e.instructors,
    logo_url: e.image,
    is_active: true,
  }))

  const { error } = await supabase
    .from('extracurriculars')
    .upsert(payload, { onConflict: 'slug' })

  if (error) throw error
  return payload.length
}
