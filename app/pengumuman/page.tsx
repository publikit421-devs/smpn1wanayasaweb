'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Megaphone, Newspaper, Calendar, ArrowRight, Pin, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Announcement } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

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
    content: 'SMP Negeri 1 Wanayasa membuka pendaftaran PPDB untuk tahun ajaran 2026/2027. Pendaftaran dibuka 1–31 Juli 2026. Calon siswa diharapkan menyiapkan berkas seperti Akta Kelahiran, Kartu Keluarga, dan Surat Keterangan Lulus SD.',
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
    content: 'UTS Ganjil Tahun Pelajaran 2026/2027 akan dilaksanakan mulai 15 September 2026 secara tertulis. Seluruh siswa kelas VII, VIII, dan IX diimbau untuk menjaga kesehatan dan mempersiapkan materi ujian.',
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
    content: 'Selamat kepada perwakilan siswa kelas IX yang telah meraih Juara 1 Olimpiade Matematika Kabupaten Purwakarta 2026! Prestasi ini membuktikan dedikasi siswa dan guru pembimbing dalam memajukan akademik sekolah.',
    category: 'berita',
    is_pinned: false,
    is_published: true,
    published_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default function PengumumanPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'semua' | 'pengumuman' | 'berita' | 'agenda'>('semua')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_published', true)
          .order('is_pinned', { ascending: false })
          .order('published_at', { ascending: false })

        if (error) throw error
        if (data && data.length > 0) {
          setAnnouncements(data as Announcement[])
        } else {
          setAnnouncements(sampleAnnouncements)
        }
      } catch {
        setAnnouncements(sampleAnnouncements)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = announcements.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase())
    const matchTab = activeTab === 'semua' ? true : item.category === activeTab
    return matchSearch && matchTab
  })

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-slate-50">
        <div className="gradient-hero py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-800 text-white mb-4">
              Pengumuman & Berita Sekolah
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Dapatkan informasi terkini mengenai kegiatan, pengumuman resmi, dan prestasi SMP Negeri 1 Wanayasa.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Search & Filter Tabs */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {(['semua', 'pengumuman', 'berita', 'agenda'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-600 transition-all capitalize
                    ${activeTab === tab
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari pengumuman..."
                className="input-field pl-9 w-full"
              />
            </div>
          </div>

          {/* Listing */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
                  <div className="skeleton h-6 w-3/4" />
                  <div className="skeleton h-4 w-1/4" />
                  <div className="skeleton h-20 w-full" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-700 text-slate-700 mb-1">Tidak Ada Informasi</h3>
              <p className="text-slate-500 text-sm">Tidak ditemukan pengumuman yang sesuai dengan pencarian Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item, i) => {
                const config = categoryConfig[item.category]
                const Icon = config.icon
                return (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden card-hover shadow-sm flex flex-col justify-between"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`badge ${config.badgeClass} flex items-center gap-1.5`}>
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                        {item.is_pinned && (
                          <span className="flex items-center gap-1 text-xs text-amber-600 font-600">
                            <Pin className="w-3 h-3" />
                            Disematkan
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-700 text-slate-800 leading-snug mb-3 line-clamp-2">
                        {item.title}
                      </h2>
                      <p className="text-sm text-slate-500 leading-relaxed line-clamp-4 mb-4">
                        {item.content}
                      </p>
                    </div>

                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <time className="text-xs text-slate-400">
                        {formatDate(item.published_at)}
                      </time>
                      <Link
                        href={`/pengumuman/${item.slug}`}
                        className="text-xs font-600 text-brand-600 hover:text-brand-800 flex items-center gap-1 group"
                      >
                        Baca Detail
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
