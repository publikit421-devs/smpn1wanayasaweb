import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Megaphone, Newspaper, Calendar, ArrowLeft, Clock, User, Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Announcement } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import AnnouncementImage from '@/components/announcements/AnnouncementImage'

const categoryConfig = {
  pengumuman: { icon: Megaphone, label: 'Pengumuman', badgeClass: 'badge-blue', textClass: 'text-blue-700' },
  berita: { icon: Newspaper, label: 'Berita', badgeClass: 'badge-green', textClass: 'text-green-700' },
  agenda: { icon: Calendar, label: 'Agenda', badgeClass: 'badge-purple', textClass: 'text-purple-700' },
}

const sampleAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Penerimaan Peserta Didik Baru (PPDB) Tahun 2026',
    slug: 'ppdb-2026',
    content: 'SMP Negeri 1 Wanayasa membuka pendaftaran PPDB untuk tahun ajaran 2026/2027. Pendaftaran dibuka 1–31 Juli 2026. Calon siswa diharapkan menyiapkan berkas seperti Akta Kelahiran, Kartu Keluarga, dan Surat Keterangan Lulus SD.\n\nAlur Pendaftaran:\n1. Mengisi formulir pendaftaran online atau offline di sekretariat PPDB SMPN 1 Wanayasa.\n2. Menyerahkan berkas persyaratan administrasi.\n3. Mengikuti verifikasi data berkas.\n4. Pengumuman hasil seleksi pada tanggal 5 Agustus 2026.\n\nUntuk informasi lebih lanjut, silakan hubungi panitia melalui email resmi sekolah.',
    category: 'pengumuman',
    is_pinned: true,
    is_published: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Jadwal Ujian Tengah Semester Ganjil 2026',
    slug: 'jadwal-uts-2026',
    content: 'UTS Ganjil Tahun Pelajaran 2026/2027 akan dilaksanakan mulai 15 September 2026 secara tertulis. Seluruh siswa kelas VII, VIII, dan IX diimbau untuk menjaga kesehatan dan mempersiapkan materi ujian.\n\nHarap diperhatikan:\n- Siswa wajib mengenakan seragam sekolah lengkap.\n- Membawa alat tulis sendiri (pensil 2B, penghapus, dan pulpen).\n- Hadir 15 menit sebelum ujian dimulai.\n\nKartu ujian akan dibagikan oleh masing-masing wali kelas mulai tanggal 10 September 2026.',
    category: 'pengumuman',
    is_pinned: false,
    is_published: true,
    published_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Juara 1 Olimpiade Matematika Tingkat Kabupaten',
    slug: 'juara-olimpiade-2026',
    content: 'Selamat kepada perwakilan siswa kelas IX yang telah meraih Juara 1 Olimpiade Matematika Kabupaten Banjarnegara 2026! Prestasi ini membuktikan dedikasi siswa dan guru pembimbing dalam memajukan akademik sekolah.\n\nPerlombaan ini diikuti oleh lebih dari 50 SMP/MTs se-Kabupaten Banjarnegara. Kami berharap prestasi gemilang ini dapat menjadi inspirasi bagi siswa-siswi lainnya di SMP Negeri 1 Wanayasa untuk terus berprestasi, baik dalam bidang akademik maupun non-akademik.',
    category: 'berita',
    is_pinned: false,
    is_published: true,
    published_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export function generateStaticParams() {
  return sampleAnnouncements.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const item = sampleAnnouncements.find((a) => a.slug === slug)
  if (!item) return {}
  return {
    title: item.title,
    description: item.content.slice(0, 150),
  }
}

export default async function DetailPengumumanPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  let item: Announcement | undefined

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
    if (data) {
      item = data as Announcement
    }
  } catch {
    // ignore, fallback used below
  }

  if (!item) {
    item = sampleAnnouncements.find((a) => a.slug === slug)
  }

  if (!item) notFound()

  const config = categoryConfig[item.category]
  const Icon = config.icon

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Back */}
          <Link
            href="/pengumuman"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 text-sm mb-6 transition-colors font-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Pengumuman
          </Link>

          {/* Card */}
          <article className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="gradient-brand h-3" />
            
            <div className="p-6 sm:p-10">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-6">
                <span className={`badge ${config.badgeClass} flex items-center gap-1.5`}>
                  <Icon className="w-3.5 h-3.5" />
                  {config.label}
                </span>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(item.published_at)}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <User className="w-3.5 h-3.5" />
                  <span>Humas Sekolah</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-800 text-slate-800 leading-tight mb-8">
                {item.title}
              </h1>

              {/* Main Image (infografis / sampul) */}
              {item.image_url && (
                <div className="mb-8 -mx-6 sm:-mx-10">
                  <AnnouncementImage src={item.image_url} alt={item.title} priority />
                </div>
              )}

              {/* Content */}
              <div className="prose max-w-none text-slate-600 leading-relaxed space-y-6 text-base whitespace-pre-line">
                {item.content}
              </div>

              {/* Share Footer */}
              <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Terakhir diperbarui: {formatDate(item.updated_at)}
                </p>
                
                <button
                  id="share-announcement-btn"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-600 text-slate-500 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Bagikan
                </button>
              </div>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  )
}
