'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, UserCog, GraduationCap, Filter } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface StaffMember {
  name: string
  nip?: string
  role: string
  bidang: string
  isStaff?: boolean
}

const members: StaffMember[] = [
  { name: 'Drs. H. Ahmad Suryana, M.Pd.', nip: '196508121990031005', role: 'Kepala Sekolah', bidang: 'Manajemen' },
  { name: 'Dedi Kurniawan, S.E.', nip: '197312201998021002', role: 'Kepala Tata Usaha', bidang: 'Tata Usaha', isStaff: true },
  { name: 'Dra. Siti Nuraeni', nip: '196905071997032004', role: 'Guru Matematika', bidang: 'Matematika' },
  { name: 'Drs. Ahmad Sukendar', nip: '196708251994031006', role: 'Guru Bahasa Indonesia', bidang: 'Bahasa Indonesia' },
  { name: 'Hj. Eni Suryani, S.Pd.', nip: '197510202001122003', role: 'Guru IPA', bidang: 'IPA' },
  { name: 'Muhammad Rizki, S.Pd.', nip: '198704152011011008', role: 'Guru Bahasa Inggris', bidang: 'Bahasa Inggris' },
  { name: 'Nur Hasanah, S.Pd.', nip: '198206252008012004', role: 'Guru IPS', bidang: 'IPS' },
  { name: 'Bambang Prasetyo, S.Pd.', nip: '198901102015031006', role: 'Guru PJOK', bidang: 'PJOK' },
  { name: 'Rina Marlina, S.Pd.', nip: '199003122015042001', role: 'Guru Seni Budaya', bidang: 'Seni Budaya' },
  { name: 'Dewi Anggraeni, S.Pd.', nip: '198812082014112003', role: 'Guru PAI', bidang: 'PAI' },
  { name: 'Agus Setiawan, S.Pd.', nip: '198302112010011010', role: 'Guru PKn', bidang: 'PKn' },
  { name: 'Tuti Hartati, S.Pd.', nip: '197905142005012006', role: 'Guru Bimbingan Konseling', bidang: 'BK' },
  { name: 'Yusuf Firdaus, S.Pd.', nip: '199208052020121004', role: 'Guru Informatika', bidang: 'Informatika' },
  { name: 'Lilis Sulastri, S.Pd.', nip: '198611222009032005', role: 'Guru Bahasa Sunda', bidang: 'Bahasa Sunda' },
  { name: 'Hendra Gunawan, S.Pd.', nip: '198707192015031005', role: 'Guru Prakarya', bidang: 'Prakarya' },
  { name: 'Sri Wahyuni, S.Pd.', nip: '199003052015042003', role: 'Guru Matematika', bidang: 'Matematika' },
  { name: 'Wawan Hermawan, S.E.', nip: '198410122009011006', role: 'Staf Keuangan', bidang: 'Tata Usaha', isStaff: true },
  { name: 'Fitri Handayani, A.Md.', nip: '198905172011012002', role: 'Staf Administrasi', bidang: 'Tata Usaha', isStaff: true },
  { name: 'Ratna Sari, A.Md.', nip: '199106282014022001', role: 'Staf Kesiswaan', bidang: 'Tata Usaha', isStaff: true },
  { name: 'Eko Prasetyo', nip: '199307152016011005', role: 'Staf Sarana & Prasarana', bidang: 'Tata Usaha', isStaff: true },
  { name: 'Indra Setiawan, A.Md.', nip: '199510202017021004', role: 'Pustakawan', bidang: 'Tata Usaha', isStaff: true },
]

const palette = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-purple-500 to-violet-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-sky-600',
]

function initials(name: string) {
  return name
    .replace(/\b(Drs\.|Dra\.|H\.|Hj\.)\b\.?\s?/g, '')
    .replace(/,.*$/, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function GuruStaffDirectory() {
  const [search, setSearch] = React.useState('')
  const [filter, setFilter] = React.useState('Semua')

  const categories = React.useMemo(() => {
    const counts = new Map<string, number>()
    members.forEach((m) => counts.set(m.bidang, (counts.get(m.bidang) ?? 0) + 1))
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [])

  const visible = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return members.filter((m) => {
      const matchBidang = filter === 'Semua' || m.bidang === filter
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        (m.nip ?? '').toLowerCase().includes(q) ||
        m.bidang.toLowerCase().includes(q)
      return matchBidang && matchSearch
    })
  }, [search, filter])

  return (
    <section className="bg-slate-50 py-20" id="guru-staff" aria-label="Direktori Guru dan Staf">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-10 max-w-2xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5">
            <Users className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-semibold text-brand-700">Direktori Sekolah</span>
          </div>
          <h2 className="section-title">
            Guru &amp; Staf <span className="text-brand-600">Tata Usaha</span>
          </h2>
          <p className="section-subtitle mx-auto mt-3">
            Kenali para pendidik dan tenaga kependidikan yang berdedikasi
            mendampingi putra-putri Anda setiap hari.
          </p>
        </motion.div>

        {/* Search + Filter */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, mapel, jabatan, atau NIP..."
              aria-label="Cari guru atau staf"
              className="input-field pl-10"
            />
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 hidden items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 sm:flex">
              <Filter className="h-3.5 w-3.5" />
              Bidang
            </span>
            <button
              onClick={() => setFilter('Semua')}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all',
                filter === 'Semua'
                  ? 'gradient-brand text-white shadow-md'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700'
              )}
            >
              Semua ({members.length})
            </button>
            {categories.map(([bidang, count]) => (
              <button
                key={bidang}
                onClick={() => setFilter(bidang)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all',
                  filter === bidang
                    ? 'gradient-brand text-white shadow-md'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700'
                )}
              >
                {bidang} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {visible.map((m) => {
              const colorIdx = categories.findIndex(([b]) => b === m.bidang)
              const grad = palette[colorIdx % palette.length]
              return (
                <motion.div
                  layout
                  key={m.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <CardContent className="flex h-full flex-col items-center gap-3 px-6 py-7 text-center">
                      <div className="relative">
                        <Avatar size="lg" className="h-16 w-16 ring-4 ring-slate-100">
                          <AvatarFallback
                            className={cn(
                              'bg-gradient-to-br text-lg font-bold text-white',
                              grad
                            )}
                          >
                            {initials(m.name)}
                          </AvatarFallback>
                        </Avatar>
                        {m.isStaff ? (
                          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-white ring-2 ring-white">
                            <UserCog className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white ring-2 ring-white">
                            <GraduationCap className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-bold leading-snug text-slate-800">{m.name}</h3>
                        <p className="mt-1 text-xs font-semibold text-brand-700">{m.role}</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        <Badge variant="outline" className="border-slate-200 text-slate-600">
                          {m.bidang}
                        </Badge>
                        {m.nip && (
                          <Badge variant="outline" className="border-slate-200 font-mono text-[10px] text-slate-400">
                            NIP {m.nip}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {visible.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <Search className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-700">Tidak Ditemukan</h3>
            <p className="mt-1 text-sm text-slate-500">
              Tidak ada guru/staf yang cocok dengan kata kunci &quot;{search}&quot;.
            </p>
          </motion.div>
        )}

        <p className="mt-10 text-center text-sm text-slate-400" aria-live="polite">
          Menampilkan <span className="font-semibold text-slate-600">{visible.length}</span> dari{' '}
          <span className="font-semibold text-slate-600">{members.length}</span> guru &amp; staf
        </p>
      </div>
    </section>
  )
}
