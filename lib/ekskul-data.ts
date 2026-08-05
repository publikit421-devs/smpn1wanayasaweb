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
 * Dipakai untuk: fallback tampilan publik, auto-sync ke Supabase,
 * dan generateStaticParams pada halaman detail.
 */
export const LOCAL_EXTRACURRICULARS: LocalEkskul[] = [
  {
    slug: 'pmr',
    name: 'Palang Merah Remaja (PMR)',
    category: 'Kemanusiaan & Kesehatan',
    description: 'Wadah pembinaan dan pengembangan anggota remaja PMR dalam bidang kemanusiaan, kesehatan, kesiapsiagaan bencana, dan pertolongan pertama di lingkungan sekolah maupun masyarakat.',
    instructors: 'Dani Ahmad Fauzi, S.Pd & Ela Nurlaelasari, S.Pd',
    image: '/ekskul/pmr.svg',
  },
  {
    slug: 'pramuka',
    name: 'Pramuka',
    category: 'Wajib & Keorganisasian',
    description: 'Gerakan Pramuka sebagai ekstrakurikuler wajib untuk membentuk karakter, kedisiplinan, kemandirian, dan kepedulian sosial serta lingkungan.',
    instructors: 'Ageng Maulana, S.Pd & Nuraisyah Andalani Ibrahim, S.Pd',
    image: '/kegiatan/ekskul-pramuka.svg',
  },
  {
    slug: 'paskibra',
    name: 'Paskibra',
    category: 'Kebangsaan & Baris-Berbaris',
    description: 'Pasukan Pengibar Bendera yang melatih baris-berbaris, kedisiplinan, wawasan kebangsaan, dan pengibaran bendera pada upacara hari besar.',
    instructors: 'Abyana Hendra',
    image: '/ekskul/paskibra.svg',
  },
  {
    slug: 'olahraga',
    name: 'Voli & Futsal',
    category: 'Olahraga & Prestasi',
    description: 'Ekstrakurikuler olahraga prestasi meliputi bola voli dan futsal untuk meningkatkan kebugaran jasmani, kerja sama tim, dan raihan prestasi.',
    instructors: 'Saepul Bayu, S.Pd & Tris Septiana Hendrawan, S.Pd',
    image: '/kegiatan/olahraga.svg',
  },
  {
    slug: 'seni',
    name: 'Seni & Kebudayaan',
    category: 'Seni & Kreasi',
    description: 'Pengembangan bakat dan kreativitas seni tari, musik, dan pertunjukan untuk mengapresiasi serta melestarikan kebudayaan daerah.',
    instructors: 'Erlin Kristiani, S.Sn',
    image: '/ekskul/tari.svg',
  },
  {
    slug: 'keagamaan',
    name: 'Keagamaan / IRMAS',
    category: 'Kerohanian',
    description: 'Pembinaan kerohanian, kerukunan beragama, kegiatan keislaman, dan program tahfidz bagi peserta didik.',
    instructors: 'Yopi Ahmad Faisal',
    image: '/kegiatan/belajar-mengajar.svg',
  },
  {
    slug: 'english-club',
    name: 'English Club',
    category: 'Akademik & Bahasa',
    description: 'Wadah peningkatan kemampuan berbahasa Inggris melalui conversation club, story telling, debat, dan persiapan lomba akademik.',
    instructors: 'Tenten Mudrika, S.Pd',
    image: '/kegiatan/praktikum-lab.svg',
  },
  {
    slug: 'science-club',
    name: 'Science Club',
    category: 'Akademik & Sains',
    description: 'Eksplorasi sains melalui praktikum, percobaan, dan riset sederhana.',
    instructors: 'Tenten Mudrika, S.Pd',
    image: '/kegiatan/praktikum-lab.svg',
  },
  {
    slug: 'drum-band',
    name: 'Drum Band',
    category: 'Seni & Kreasi',
    description: 'Latihan musik dan barisan drum band untuk melatih kekompakan dan disiplin.',
    instructors: 'Hj. Lilis Juwariyah, S.Pd',
    image: '/kegiatan/upacara-bendera.svg',
  },
  {
    slug: 'hortikultura',
    name: 'Hortikultura',
    category: 'Lingkungan & Kesehatan',
    description: 'Berkebun, bercocok tanam, dan merawat lingkungan sekolah (adiwiyata).',
    instructors: 'Cucu Susilawati, S.Pd',
    image: '/kegiatan/belajar-mengajar.svg',
  },
  {
    slug: 'jurnalis',
    name: 'Jurnalis',
    category: 'Komunikasi & Media',
    description: 'Kegiatan menulis berita, majalah dinding, dan media informasi sekolah.',
    instructors: 'Iis Widayanti, S.Pd',
    image: '/kegiatan/belajar-mengajar.svg',
  },
  {
    slug: 'pks',
    name: 'Patroli Keamanan Sekolah (PKS)',
    category: 'Kedisiplinan & Keamanan',
    description: 'Patroli Keamanan Sekolah: membantu ketertiban lalu lintas dan keamanan sekolah.',
    instructors: 'Dude Suganda',
    image: '/kegiatan/upacara-bendera.svg',
  },
  {
    slug: 'tahfidz',
    name: 'Tahfidz',
    category: 'Kerohanian',
    description: 'Program menghafal Al-Qur\u2019an dan pembinaan keagamaan.',
    instructors: 'Yopi Ahmad Faisal',
    image: '/kegiatan/belajar-mengajar.svg',
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
