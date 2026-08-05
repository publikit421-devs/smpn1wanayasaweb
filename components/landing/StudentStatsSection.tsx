'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  UserRound,
  BarChart3,
  HeartHandshake,
  CalendarDays,
  Venus,
  Mars,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { StudentStats, StudentAgeGroup } from '@/lib/supabase'

const FALLBACK: StudentStats = {
  id: 'fallback',
  tahun_ajaran: '2026/2027',
  total: 804,
  laki: 400,
  perempuan: 404,
  usia: [
    { label: '6 - 12 tahun', total: 47, laki: 18, perempuan: 29 },
    { label: '13 - 15 tahun', total: 735, laki: 367, perempuan: 368 },
    { label: '16 - 20 tahun', total: 22, laki: 15, perempuan: 7 },
  ],
  agama: [
    { label: 'Islam', total: 804, laki: 400, perempuan: 404 },
  ],
  updated_at: '',
}

function CountUp({ target, inView }: { target: number; inView: boolean }) {
  const [value, setValue] = React.useState(0)

  React.useEffect(() => {
    if (!inView) return
    const duration = 1400
    const start = performance.now()
    let raf: number

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setValue(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target])

  return <>{value.toLocaleString('id-ID')}</>
}

export default function StudentStatsSection() {
  const [stats, setStats] = React.useState<StudentStats | null>(null)
  const [inView, setInView] = React.useState(false)
  const sectionRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '-80px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await supabase
          .from('student_stats')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (data) {
          setStats({
            ...FALLBACK,
            ...data,
            total: data.total ?? FALLBACK.total,
            laki: data.laki ?? FALLBACK.laki,
            perempuan: data.perempuan ?? FALLBACK.perempuan,
            tahun_ajaran: data.tahun_ajaran ?? FALLBACK.tahun_ajaran,
            usia: Array.isArray(data.usia) && data.usia.length > 0 ? data.usia : FALLBACK.usia,
            agama: Array.isArray(data.agama) && data.agama.length > 0 ? data.agama : FALLBACK.agama,
          })
        }
      } catch {
        setStats(null)
      }
    }
    loadStats()
  }, [])

  const data = stats ?? FALLBACK
  const maxAge = Math.max(...(data.usia || []).map((g) => g.total), 1)
  const maxAgama = Math.max(...(data.agama || []).map((g) => g.total), 1)
  const lakiPct = data.total > 0 ? ((data.laki / data.total) * 100).toFixed(1) : '0.0'
  const perempuanPct = data.total > 0 ? ((data.perempuan / data.total) * 100).toFixed(1) : '0.0'

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-20"
      id="data-siswa"
      aria-label="Statistik Peserta Didik"
    >
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-24 h-72 w-72 rounded-full bg-pink-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5">
            <BarChart3 className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-semibold text-brand-700">Data Peserta Didik</span>
          </div>
          <h2 className="section-title">
            Statistik <span className="text-brand-600">Siswa</span>
          </h2>
          <p className="section-subtitle mx-auto mt-3">
            Rekap jumlah dan demografi peserta didik SMP Negeri 1 Wanayasa
            tahun ajaran {data.tahun_ajaran}.
          </p>
        </motion.div>

        {/* Stat cards */}
        <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0 }}
          >
            <Card className="h-full">
              <CardContent className="flex h-full flex-col items-center gap-1 px-6 py-7 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Users className="h-7 w-7" />
                </div>
                <p className="text-4xl font-extrabold tracking-tight text-slate-900">
                  <CountUp target={data.total} inView={inView} />
                </p>
                <p className="text-sm font-bold text-slate-700">Total Siswa</p>
                <p className="text-xs text-slate-400">Seluruh tingkatan</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
          >
            <Card className="h-full">
              <CardContent className="flex h-full flex-col items-center gap-1 px-6 py-7 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Mars className="h-7 w-7" />
                </div>
                <p className="text-4xl font-extrabold tracking-tight text-slate-900">
                  <CountUp target={data.laki} inView={inView} />
                </p>
                <p className="text-sm font-bold text-slate-700">Laki-laki</p>
                <p className="text-xs text-slate-400">{lakiPct}% dari total</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
          >
            <Card className="h-full">
              <CardContent className="flex h-full flex-col items-center gap-1 px-6 py-7 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
                  <Venus className="h-7 w-7" />
                </div>
                <p className="text-4xl font-extrabold tracking-tight text-slate-900">
                  <CountUp target={data.perempuan} inView={inView} />
                </p>
                <p className="text-sm font-bold text-slate-700">Perempuan</p>
                <p className="text-xs text-slate-400">{perempuanPct}% dari total</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.24 }}
          >
            <Card className="h-full">
              <CardContent className="flex h-full flex-col items-center gap-1 px-6 py-7 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CalendarDays className="h-7 w-7" />
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {data.tahun_ajaran}
                </p>
                <p className="text-sm font-bold text-slate-700">Tahun Ajaran</p>
                <p className="text-xs text-slate-400">Data terbaru</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Gender split + Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Gender split */}
          <Card className="h-full">
            <CardContent className="px-6 py-7">
              <div className="mb-5 flex items-center gap-2">
                <UserRound className="h-4 w-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-800">Perbandingan Jenis Kelamin</h3>
              </div>
              <div className="mb-3 flex h-5 w-full overflow-hidden rounded-full">
                <div className="bg-blue-500 transition-all" style={{ width: `${lakiPct}%` }} />
                <div className="bg-pink-500 transition-all" style={{ width: `${perempuanPct}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Laki-laki · {data.laki}
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-pink-500" /> Perempuan · {data.perempuan}
                </span>
              </div>
              <p className="mt-5 rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500">
                Total {data.total} siswa · {lakiPct}% laki-laki : {perempuanPct}% perempuan
              </p>
            </CardContent>
          </Card>

          {/* Usia */}
          <Card className="h-full lg:col-span-1">
            <CardContent className="px-6 py-7">
              <div className="mb-5 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-800">Demografi Berdasarkan Usia</h3>
              </div>
              <div className="space-y-4">
                {(data.usia || []).map((g: StudentAgeGroup) => {
                  const groupPct = maxAge > 0 ? Math.max((g.total / maxAge) * 100, g.total > 0 ? 4 : 0) : 0
                  const lakiW = g.total > 0 ? (g.laki / g.total) * groupPct : 0
                  const perempuanW = g.total > 0 ? (g.perempuan / g.total) * groupPct : 0
                  return (
                    <div key={g.label}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{g.label}</span>
                        <span className="text-slate-400">
                          {g.total.toLocaleString('id-ID')} siswa
                          <span className="ml-1.5 text-blue-500">{g.laki} L</span>
                          <span className="ml-1.5 text-pink-500">{g.perempuan} P</span>
                        </span>
                      </div>
                      <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="bg-blue-500" style={{ width: `${lakiW}%` }} />
                        <div className="bg-pink-500" style={{ width: `${perempuanW}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Agama */}
          <Card className="h-full">
            <CardContent className="px-6 py-7">
              <div className="mb-5 flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-800">Demografi Berdasarkan Agama</h3>
              </div>
              <div className="space-y-4">
                {(data.agama || []).map((g) => {
                  const pct = maxAgama > 0 ? (g.total / maxAgama) * 100 : 0
                  return (
                    <div key={g.label}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{g.label}</span>
                        <span className="text-slate-400">
                          {g.total.toLocaleString('id-ID')} siswa · {Math.round(pct)}%
                        </span>
                      </div>
                      <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn('h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500', g.total === 0 && 'bg-slate-200')}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="mt-6 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                Mayoritas siswa memeluk agama Islam sebagai wujud keberagaman dan toleransi beragama di lingkungan sekolah.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
