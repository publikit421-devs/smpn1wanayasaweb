'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, UserCog, GraduationCap, Filter, Crown, Loader2 } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { Staff } from '@/lib/supabase'

type JenisPtk = Staff['jenis_ptk']

const fallbackMembers: Staff[] = []

const palette = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-purple-500 to-violet-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-sky-600',
]

const ptkTabs: { value: 'Semua' | JenisPtk; label: string }[] = [
  { value: 'Semua', label: 'Semua' },
  { value: 'Kepala Sekolah', label: 'Kepala Sekolah' },
  { value: 'Guru', label: 'Guru' },
  { value: 'Tenaga Kependidikan', label: 'Tenaga Kependidikan' },
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
  const [members, setMembers] = React.useState<Staff[]>(fallbackMembers)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [filter, setFilter] = React.useState<'Semua' | JenisPtk>('Semua')

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .eq('is_active', true)
          .order('urutan', { ascending: true })
          .order('nama', { ascending: true })

        if (error) throw error
        if (!cancelled && data && data.length > 0) {
          setMembers(data as Staff[])
        }
      } catch {
        // Abaikan, pakai fallback (data kosong) jika Supabase tidak terhubung
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const counts = React.useMemo(() => {
    const map = new Map<'Semua' | JenisPtk, number>()
    map.set('Semua', members.length)
    ptkTabs.slice(1).forEach((t) => {
      const v = t.value as JenisPtk
      map.set(v, members.filter((m) => (m.jenis_ptk ?? 'Guru') === v).length)
    })
    return map
  }, [members])

  const visible = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return members.filter((m) => {
      const jenis = m.jenis_ptk ?? 'Guru'
      const matchJenis = filter === 'Semua' || jenis === filter
      const matchSearch =
        !q ||
        m.nama.toLowerCase().includes(q) ||
        (m.gelar ?? '').toLowerCase().includes(q) ||
        (m.jabatan ?? m.role ?? '').toLowerCase().includes(q) ||
        (m.nip ?? '').toLowerCase().includes(q)
      return matchJenis && matchSearch
    })
  }, [search, filter, members])

  return (
    <section className="bg-slate-50 py-20" id="guru-staff" aria-label="Direktori Guru dan Tenaga Kependidikan">
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
            Guru &amp; <span className="text-brand-600">Tenaga Kependidikan</span>
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
              placeholder="Cari nama, gelar, jabatan, atau NIP..."
              aria-label="Cari guru atau tenaga kependidikan"
              className="input-field pl-10"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 hidden items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 sm:flex">
              <Filter className="h-3.5 w-3.5" />
              Filter
            </span>
            {ptkTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all',
                  filter === tab.value
                    ? 'gradient-brand text-white shadow-md'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700'
                )}
              >
                {tab.label} ({counts.get(tab.value) ?? 0})
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {visible.map((m, i) => {
                const jenis = m.jenis_ptk ?? 'Guru'
                const grad = palette[i % palette.length]
                const isKepsek = jenis === 'Kepala Sekolah'
                const isStaf = jenis === 'Tenaga Kependidikan'
                const fullName = m.gelar ? `${m.nama}, ${m.gelar}` : m.nama
                const jabatan = m.jabatan ?? m.role ?? '—'
                return (
                  <motion.div
                    layout
                    key={m.id}
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
                                isKepsek ? 'from-amber-500 to-orange-600' : grad
                              )}
                            >
                              {initials(m.nama)}
                            </AvatarFallback>
                          </Avatar>
                          {isKepsek ? (
                            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white ring-2 ring-white">
                              <Crown className="h-3.5 w-3.5" />
                            </span>
                          ) : isStaf ? (
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
                          <h3 className="text-sm font-bold leading-snug text-slate-800">{fullName}</h3>
                          <p className="mt-1 text-xs font-semibold text-brand-700">{jabatan}</p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          <Badge variant="outline" className={cn(isKepsek ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-600')}>
                            {jenis}
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
        )}

        {/* Empty state */}
        {!loading && visible.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <Search className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-700">Tidak Ditemukan</h3>
            <p className="mt-1 text-sm text-slate-500">
              Tidak ada guru/Tenaga Kependidikan yang cocok dengan kata kunci &quot;{search}&quot;.
            </p>
          </motion.div>
        )}

        {!loading && (
          <p className="mt-10 text-center text-sm text-slate-400" aria-live="polite">
            Menampilkan <span className="font-semibold text-slate-600">{visible.length}</span> dari{' '}
            <span className="font-semibold text-slate-600">{members.length}</span> guru &amp; tenaga kependidikan
          </p>
        )}
      </div>
    </section>
  )
}
