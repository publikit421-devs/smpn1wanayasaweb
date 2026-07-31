'use client'

import * as React from 'react'
import { motion, useInView } from 'framer-motion'
import { Award, BookOpen, Users, GraduationCap, TrendingUp } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatItem {
  icon: React.ElementType
  value: number
  suffix: string
  label: string
  description: string
  accent: string
}

const stats: StatItem[] = [
  {
    icon: Users,
    value: 500,
    suffix: '+',
    label: 'Siswa Aktif',
    description: 'Siswa aktif dari kelas VII, VIII, dan IX',
    accent: 'text-blue-600 bg-blue-50',
  },
  {
    icon: GraduationCap,
    value: 30,
    suffix: '+',
    label: 'Guru & Staf',
    description: 'Pendidik dan tenaga kependidikan profesional',
    accent: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: Award,
    value: 96,
    suffix: '',
    label: 'Akreditasi A',
    description: 'Predikat akreditasi "A" (96 dari 100)',
    accent: 'text-amber-600 bg-amber-50',
  },
  {
    icon: BookOpen,
    value: 24,
    suffix: '',
    label: 'Rombongan Belajar',
    description: 'Rombel aktif untuk pembelajaran optimal',
    accent: 'text-purple-600 bg-purple-50',
  },
]

function CountUp({ target, inView }: { target: number; inView: boolean }) {
  const [value, setValue] = React.useState(0)

  React.useEffect(() => {
    if (!inView) return
    const duration = 1600
    const start = performance.now()
    let raf: number

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setValue(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target])

  return <>{value.toLocaleString('id-ID')}</>
}

export default function StatsSection() {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      className="relative overflow-hidden py-20"
      id="statistik"
      aria-label="Statistik Sekolah"
    >
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-secondary-100/60 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5">
            <TrendingUp className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-semibold text-brand-700">Angka &amp; Fakta</span>
          </div>
          <h2 className="section-title">
            Sekolah dalam <span className="text-brand-600">Angka</span>
          </h2>
          <p className="section-subtitle mx-auto mt-3">
            Data statistik yang menggambarkan komitmen SMP Negeri 1 Wanayasa
            dalam memberikan pendidikan berkualitas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <Card className="h-full transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:ring-brand-300">
                <CardContent className="flex h-full flex-col items-center gap-1 px-6 py-8 text-center">
                  <div className={cn('mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110', stat.accent)}>
                    <stat.icon className="h-7 w-7" />
                  </div>
                  <p className="text-4xl font-extrabold tracking-tight text-slate-900">
                    <CountUp target={stat.value} inView={inView} />
                    <span className="text-brand-600">{stat.suffix}</span>
                  </p>
                  <p className="text-sm font-bold text-slate-700">{stat.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
