'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  BookMarked,
  HeartHandshake,
  Trophy,
  Layers,
  Leaf,
  Landmark,
  Users,
  Dumbbell,
  Vote,
  Store,
  Sparkles,
  Palette,
  type LucideIcon,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { Kegiatan } from '@/lib/supabase'

type TabId = 'intrakurikuler' | 'ekstrakurikuler' | 'kokurikuler'

const tabs: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: 'intrakurikuler', label: 'Intrakurikuler', icon: BookOpen },
  { id: 'ekstrakurikuler', label: 'Ekstrakurikuler', icon: Trophy },
  { id: 'kokurikuler', label: 'Kokurikuler', icon: Layers },
]

interface IntraItem {
  icon: LucideIcon
  title: string
  desc: string
  accent: string
}

const intraItems: IntraItem[] = [
  {
    icon: BookOpen,
    title: 'Kegiatan Belajar Mengajar',
    desc: 'Pembelajaran terjadwal untuk semua mata pelajaran sesuai Kurikulum Merdeka.',
    accent: 'bg-blue-50 text-blue-600',
  },
  {
    icon: ClipboardCheck,
    title: 'Penilaian & Ujian',
    desc: 'Asesmen harian, sumatif tengah semester, dan sumatif akhir yang transparan.',
    accent: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: GraduationCap,
    title: 'Remedial & Pengayaan',
    desc: 'Program perbaikan nilai dan pengayaan bagi siswa yang membutuhkan.',
    accent: 'bg-amber-50 text-amber-600',
  },
  {
    icon: BookMarked,
    title: 'Literasi & Numerasi',
    desc: 'Budaya literasi 15 menit sebelum KBM dan penguatan numerasi harian.',
    accent: 'bg-purple-50 text-purple-600',
  },
  {
    icon: HeartHandshake,
    title: 'Bimbingan Konseling',
    desc: 'Layanan konseling akademik, karir, dan pribadi bagi seluruh siswa.',
    accent: 'bg-rose-50 text-rose-600',
  },
]

interface EkskulItem {
  name: string
  image: string
  desc: string
  pembina: string
  slug?: string
}

const ekskulGradients = [
  'from-blue-600 to-cyan-600',
  'from-rose-500 to-red-600',
  'from-emerald-500 to-green-600',
  'from-orange-500 to-amber-600',
  'from-violet-500 to-purple-600',
  'from-pink-500 to-fuchsia-600',
  'from-cyan-500 to-sky-600',
  'from-amber-500 to-orange-600',
  'from-lime-500 to-green-600',
  'from-indigo-500 to-blue-600',
  'from-red-500 to-rose-600',
]

const fallbackEkskul: EkskulItem[] = [
  {
    name: 'Science Club',
    image: '/kegiatan/praktikum-lab.svg',
    desc: 'Eksplorasi sains melalui praktikum, percobaan, dan riset sederhana.',
    pembina: 'Tenten Mudrika, S.Pd',
  },
  {
    name: 'Drum Band',
    image: '/kegiatan/upacara-bendera.svg',
    desc: 'Latihan musik dan barisan drum band untuk melatih kekompakan dan disiplin.',
    pembina: 'Hj. Lilis Juwariyah, S.Pd',
  },
  {
    name: 'Hortikultura',
    image: '/kegiatan/belajar-mengajar.svg',
    desc: 'Berkebun, bercocok tanam, dan merawat lingkungan sekolah (adiwiyata).',
    pembina: 'Cucu Susilawati, S.Pd',
  },
  {
    name: 'Paskibra',
    image: '/ekskul/paskibra.svg',
    desc: 'Latihan baris-berbaris, keterampilan PBB, dan pengibaran bendera.',
    pembina: 'Abyana Hendra',
  },
  {
    name: 'Pramuka',
    image: '/kegiatan/ekskul-pramuka.svg',
    desc: 'Pembina Putra: Ageng Maulana, S.Pd • Pembina Putri: Nuraisyah Andalani Ibrahim, S.Pd',
    pembina: 'Ageng Maulana, S.Pd & Nuraisyah Andalani Ibrahim, S.Pd',
  },
  {
    name: 'Seni',
    image: '/ekskul/tari.svg',
    desc: 'Pengembangan bakat dan kreativitas seni tari, musik, dan pertunjukan.',
    pembina: 'Erlin Kristiani, S.Sn',
  },
  {
    name: 'Jurnalis',
    image: '/kegiatan/belajar-mengajar.svg',
    desc: 'Kegiatan menulis berita, majalah dinding, dan media informasi sekolah.',
    pembina: 'Iis Widayanti, S.Pd',
  },
  {
    name: 'Voli',
    image: '/kegiatan/olahraga.svg',
    desc: 'Latihan bola voli untuk meningkatkan kebugaran jasmani dan prestasi olahraga.',
    pembina: 'Saepul Bayu, S.Pd',
  },
  {
    name: 'Futsal',
    image: '/ekskul/futsal.svg',
    desc: 'Latihan futsal meliputi teknik dasar, dribbling, passing, dan pertandingan.',
    pembina: 'Tris Septiana Hendrawan, S.Pd',
  },
  {
    name: 'PKS',
    image: '/kegiatan/upacara-bendera.svg',
    desc: 'Patroli Keamanan Sekolah: membantu ketertiban lalu lintas dan keamanan sekolah.',
    pembina: 'Dude Suganda',
  },
  {
    name: 'Tahfidz',
    image: '/kegiatan/belajar-mengajar.svg',
    desc: 'Program menghafal Al-Qur\u2019an dan pembinaan keagamaan.',
    pembina: 'Yopi Ahmad Faisal',
  },
  {
    name: 'PMR',
    image: '/ekskul/pmr.svg',
    desc: 'Wadah pembinaan dan pengembangan anggota remaja PMR dalam bidang kemanusiaan, kesehatan, kesiapsiagaan bencana, dan pertolongan pertama di lingkungan sekolah maupun masyarakat.',
    pembina: 'Dani Ahmad Fauzi, S.Pd & Ela Nurlaelasari, S.Pd',
    slug: 'pmr',
  },
]

interface P5Item {
  icon: LucideIcon
  tema: string
  deskripsi: string
  accent: string
}

const p5Items: P5Item[] = [
  {
    icon: Leaf,
    tema: 'Gaya Hidup Berkelanjutan',
    deskripsi: 'Pengolahan sampah organik dan program adiwiyata sekolah.',
    accent: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Landmark,
    tema: 'Kearifan Lokal',
    deskripsi: 'Mengenal budaya, kuliner, dan tradisi khas daerah Wanayasa.',
    accent: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Users,
    tema: 'Bhinneka Tunggal Ika',
    deskripsi: 'Menumbuhkan toleransi dan semangat kebinekaan antarsiswa.',
    accent: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Dumbbell,
    tema: 'Bangunlah Jiwa dan Raganya',
    deskripsi: 'Kampanye anti perundungan dan gaya hidup sehat.',
    accent: 'bg-rose-50 text-rose-600',
  },
  {
    icon: Vote,
    tema: 'Suara Demokrasi',
    deskripsi: 'Simulasi pemilihan ketua OSIS yang demokratis dan jujur.',
    accent: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Store,
    tema: 'Kewirausahaan',
    deskripsi: 'Pembuatan dan pemasaran produk kreatif hasil karya siswa.',
    accent: 'bg-cyan-50 text-cyan-600',
  },
]

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function initials(name: string) {
  return name
    .replace(/\b(Kak\.|Bpk\.|Ibu)\b\.?\s?/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function KegiatanTabs() {
  const [active, setActive] = React.useState<TabId>('intrakurikuler')
  const [ekskul, setEkskul] = React.useState<EkskulItem[]>(fallbackEkskul)
  const [detailSlugs, setDetailSlugs] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    supabase
      .from('extracurriculars')
      .select('slug')
      .eq('is_active', true)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setDetailSlugs(new Set(data.map((d) => d.slug)))
        }
      })
  }, [])

  React.useEffect(() => {
    supabase
      .from('kegiatan')
      .select('*')
      .eq('category', 'ekstrakurikuler')
      .eq('is_active', true)
      .order('urutan', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setEkskul(
            (data as Kegiatan[]).map((k) => {
              const fb = fallbackEkskul.find((f) => f.name === k.title)
              return {
                name: k.title,
                image: k.image_url || fb?.image || '/kegiatan/ekskul-pramuka.svg',
                desc: k.description ?? fb?.desc ?? '',
                pembina: k.pembina ?? fb?.pembina ?? '',
                slug: k.slug ?? slugify(k.title ?? ''),
              }
            })
          )
        }
      })
  }, [])

  const activeTab = tabs.find((t) => t.id === active)!

  return (
    <section className="bg-slate-50 py-20" id="kegiatan" aria-label="Kegiatan Sekolah">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-10 max-w-2xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5">
            <Sparkles className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-semibold text-brand-700">Program Sekolah</span>
          </div>
          <h2 className="section-title">
            Kegiatan <span className="text-brand-600">Siswa</span>
          </h2>
          <p className="section-subtitle mx-auto mt-3">
            Ragam kegiatan yang mendukung tumbuh kembang siswa secara holistik —
            akademik, minat bakat, dan pembentukan karakter.
          </p>
        </motion.div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Kategori kegiatan sekolah"
          className="mx-auto mb-10 flex w-full max-w-2xl flex-wrap justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === active
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActive(tab.id)}
                className={cn(
                  'relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                  isActive ? 'text-white' : 'text-slate-600 hover:text-brand-700'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="kegiatan-tab-indicator"
                    className="absolute inset-0 rounded-xl gradient-brand shadow-md"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <tab.icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Panels */}
        <div
          role="tabpanel"
          id={`panel-${active}`}
          aria-labelledby={`tab-${active}`}
          className="relative min-h-[420px]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {active === 'intrakurikuler' && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {intraItems.map((item) => (
                    <Card
                      key={item.title}
                      className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <CardContent className="flex flex-col gap-3 px-6 py-6">
                        <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', item.accent)}>
                          <item.icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">{item.title}</h3>
                        <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
                        <Badge
                          variant="outline"
                          className="mt-auto w-fit border-slate-200 text-slate-500"
                        >
                          Intrakurikuler
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {active === 'ekstrakurikuler' && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {(ekskul || []).map((item, i) => {
                    const hasDetail = Boolean(item.slug && detailSlugs.has(item.slug))
                    const card = (
                      <div
                        className={cn(
                          'group overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm',
                          hasDetail
                            ? 'transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-brand-300'
                            : 'cursor-default',
                        )}
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden">
                          <Image
                            src={item.image}
                            alt={`Kegiatan ekstrakurikuler ${item.name}`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <Badge className="absolute left-3 top-3 bg-white/90 text-slate-800 backdrop-blur-sm">
                            <Trophy className="h-3 w-3" />
                            Ekstrakurikuler
                          </Badge>
                        </div>
                        <div className="px-5 py-4">
                          <h3 className="text-base font-bold text-slate-800">{item.name}</h3>
                          {item.desc && (
                            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">{item.desc}</p>
                          )}
                          {item.pembina && (
                            <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3">
                              <Avatar size="default" className="h-8 w-8">
                                <AvatarFallback
                                  className={cn(
                                    'bg-gradient-to-br text-[11px] font-bold text-white',
                                    ekskulGradients[i % ekskulGradients.length]
                                  )}
                                >
                                  {initials(item.pembina)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                  Pembina
                                </p>
                                <p className="truncate text-sm font-semibold text-slate-700">{item.pembina}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                    return hasDetail ? (
                      <Link
                        key={`${item.name}-${i}`}
                        href={`/ekstrakurikuler/${item.slug}`}
                        className="block"
                      >
                        {card}
                      </Link>
                    ) : (
                      <div key={`${item.name}-${i}`}>{card}</div>
                    )
                  })}
                </div>
              )}

              {active === 'kokurikuler' && (
                <div>
                  <div className="mb-8 flex items-start gap-4 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-white p-6">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-brand-500 text-white shadow-md">
                      <Palette className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">
                        Projek Penguatan Profil Pelajar Pancasila (P5)
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        Proyek kokurikuler berbasis projek yang menumbuhkan karakter sesuai 6 dimensi
                        profil pelajar Pancasila. Dilaksanakan dalam beberapa tema setiap tahun ajaran.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {p5Items.map((item, i) => (
                      <Card
                        key={item.tema}
                        className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                      >
                        <CardContent className="flex flex-col gap-3 px-6 py-6">
                          <div className="flex items-center justify-between">
                            <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', item.accent)}>
                              <item.icon className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-bold text-slate-300">Tema {i + 1}</span>
                          </div>
                          <h3 className="text-base font-bold text-slate-800">{item.tema}</h3>
                          <p className="text-sm leading-relaxed text-slate-500">{item.deskripsi}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Active tab caption */}
        <p className="mt-10 text-center text-sm text-slate-400" aria-live="polite">
          Sedang menampilkan: <span className="font-semibold text-slate-600">{activeTab.label}</span>
        </p>
      </div>
    </section>
  )
}
