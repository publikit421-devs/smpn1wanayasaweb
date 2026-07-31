'use client'

import * as React from 'react'
import Image from 'next/image'
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
  imageAlt: string
  pembina: string
  jadwal: string
  color: string
}

const ekskulItems: EkskulItem[] = [
  {
    name: 'Pramuka',
    image: '/kegiatan/ekskul-pramuka.svg',
    imageAlt: 'Kegiatan ekstrakurikuler pramuka',
    pembina: 'Kak. Budi Santoso, S.Pd.',
    jadwal: 'Sabtu',
    color: 'from-red-500 to-rose-600',
  },
  {
    name: 'Paskibra',
    image: '/ekskul/paskibra.svg',
    imageAlt: 'Kegiatan ekstrakurikuler paskibra',
    pembina: 'Bpk. Andi Wijaya',
    jadwal: 'Jumat',
    color: 'from-rose-600 to-red-700',
  },
  {
    name: 'Futsal',
    image: '/ekskul/futsal.svg',
    imageAlt: 'Kegiatan ekstrakurikuler futsal',
    pembina: 'Bpk. Dedi Kurniawan, S.Or.',
    jadwal: 'Senin & Kamis',
    color: 'from-green-600 to-emerald-700',
  },
  {
    name: 'PMR',
    image: '/ekskul/pmr.svg',
    imageAlt: 'Kegiatan ekstrakurikuler palang merah remaja',
    pembina: 'Ibu Siti Rahayu, S.Kep.',
    jadwal: 'Rabu',
    color: 'from-pink-600 to-rose-700',
  },
  {
    name: 'Robotik',
    image: '/ekskul/robotik.svg',
    imageAlt: 'Kegiatan ekstrakurikuler robotik',
    pembina: 'Bpk. Agus Salim, S.T.',
    jadwal: 'Kamis',
    color: 'from-cyan-600 to-sky-700',
  },
  {
    name: 'Basket',
    image: '/ekskul/basket.svg',
    imageAlt: 'Kegiatan ekstrakurikuler basket',
    pembina: 'Bpk. Rio Pratama',
    jadwal: 'Selasa & Kamis',
    color: 'from-orange-500 to-amber-700',
  },
  {
    name: 'Tari Tradisional',
    image: '/ekskul/tari.svg',
    imageAlt: 'Kegiatan ekstrakurikuler tari tradisional',
    pembina: 'Ibu Nurhayati, S.Sn.',
    jadwal: 'Jumat',
    color: 'from-pink-500 to-fuchsia-700',
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
                  {ekskulItems.map((item) => (
                    <Card
                      key={item.name}
                      className="group overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.imageAlt}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <Badge className="absolute left-3 top-3 bg-white/90 text-slate-800 backdrop-blur-sm">
                          <Trophy className="h-3 w-3" />
                          {item.jadwal}
                        </Badge>
                      </div>
                      <CardContent className="px-5 py-4">
                        <h3 className="mb-3 text-base font-bold text-slate-800">{item.name}</h3>
                        <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                          <Avatar size="default" className="h-8 w-8">
                            <AvatarFallback className={cn('bg-gradient-to-br text-[11px] font-bold text-white', item.color)}>
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
                      </CardContent>
                    </Card>
                  ))}
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
