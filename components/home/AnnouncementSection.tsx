'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Megaphone, Newspaper, Calendar, ArrowRight, Pin } from 'lucide-react'
import type { Announcement } from '@/lib/supabase'

const categoryConfig = {
  pengumuman: {
    icon: Megaphone,
    label: 'Pengumuman',
    badgeClass: 'badge-blue',
  },
  berita: {
    icon: Newspaper,
    label: 'Berita',
    badgeClass: 'badge-green',
  },
  agenda: {
    icon: Calendar,
    label: 'Agenda',
    badgeClass: 'badge-purple',
  },
}

// Sample data for fallback when Supabase is not yet configured
const sampleAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Penerimaan Peserta Didik Baru (PPDB) Tahun 2026',
    slug: 'ppdb-2026',
    content: 'SMP Negeri 1 Wanayasa membuka pendaftaran PPDB untuk tahun ajaran 2026/2027. Pendaftaran dibuka 1–31 Juli 2026.',
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
    content: 'UTS Ganjil Tahun Pelajaran 2026/2027 akan dilaksanakan mulai 15 September 2026.',
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
    content: 'Selamat kepada siswa kelas IX atas raihan Juara 1 Olimpiade Matematika Kab. Banjarnegara 2026!',
    category: 'berita',
    is_pinned: false,
    is_published: true,
    published_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

interface AnnouncementSectionProps {
  announcements?: Announcement[]
}

export default function AnnouncementSection({ announcements = sampleAnnouncements }: AnnouncementSectionProps) {
  return (
    <section
      className="py-20 bg-slate-50"
      id="pengumuman"
      aria-label="Pengumuman dan Berita"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
        >
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100">
              <Megaphone className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-600 text-brand-700">Informasi Terkini</span>
            </div>
            <h2 className="section-title">
              Pengumuman &{' '}
              <span className="text-brand-600">Berita Sekolah</span>
            </h2>
          </div>
          <Link
            href="/pengumuman"
            id="see-all-announcements"
            className="flex items-center gap-2 text-sm font-600 text-brand-600 hover:text-brand-800 transition-colors group"
          >
            Lihat Semua
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((item, i) => {
            const cat = categoryConfig[item.category]
            const CatIcon = cat.icon
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden card-hover shadow-sm"
                aria-label={item.title}
              >
                {/* Card Header */}
                <div className="h-2 gradient-brand" />

                <div className="p-6">
                  {/* Meta */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`badge ${cat.badgeClass} flex items-center gap-1.5`}>
                      <CatIcon className="w-3 h-3" />
                      {cat.label}
                    </span>
                    {item.is_pinned && (
                      <span className="flex items-center gap-1 text-xs text-amber-600 font-600">
                        <Pin className="w-3 h-3" />
                        Disematkan
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-700 text-slate-800 leading-snug mb-2 line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Content preview */}
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-4">
                    {item.content}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <time
                      dateTime={item.published_at}
                      className="text-xs text-slate-400"
                    >
                      {formatDate(item.published_at)}
                    </time>
                    <Link
                      href={`/pengumuman/${item.slug}`}
                      className="text-xs font-600 text-brand-600 hover:text-brand-800 flex items-center gap-1 group"
                    >
                      Selengkapnya
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
