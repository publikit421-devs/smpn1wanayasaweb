'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Star,
  Ticket,
  FileText,
  BadgeCheck,
  Clock,
  Info,
  LayoutList,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import SKMModal from '@/components/skm/SKMModal'
import { services } from '@/lib/services'
import type { ServiceType } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const ticketStats = [
  { icon: LayoutList, label: 'Jenis Layanan', value: '6' },
  { icon: FileText, label: 'Tiket Terproses', value: '2.400+' },
  { icon: BadgeCheck, label: 'Gratis & Transparan', value: '100%' },
  { icon: Star, label: 'Rating Rata-rata', value: '4.8/5' },
]

interface SkmSelection {
  type: ServiceType
  title: string
}

export default function LayananPortalSection() {
  const [skm, setSkm] = React.useState<SkmSelection | null>(null)

  return (
    <section className="bg-white py-20" id="layanan" aria-label="Portal Layanan Publik Sistem Tiket">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-10 max-w-2xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5">
            <Ticket className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-semibold text-brand-700">Sistem Tiket</span>
          </div>
          <h2 className="section-title">
            Portal 6 <span className="text-brand-600">Layanan Publik</span>
          </h2>
          <p className="section-subtitle mx-auto mt-3">
            Ajukan permohonan secara online — setiap pengajuan mendapat nomor
            tiket <span className="font-mono font-semibold text-brand-700">SMPN1/YYYY/MM/XXXX</span>{' '}
            untuk memudahkan pelacakan status.
          </p>
        </motion.div>

        {/* Ticket stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-12 grid max-w-4xl grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {ticketStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center"
            >
              <stat.icon className="mx-auto mb-2 h-5 w-5 text-brand-600" />
              <p className="text-xl font-extrabold text-slate-800">{stat.value}</p>
              <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Services grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const ServiceIcon = service.icon
            return (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card
                  className={cn(
                    'group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl',
                    service.borderColor
                  )}
                >
                  {/* Ticket header strip */}
                  <div className={cn('h-1.5 bg-gradient-to-r', service.color)} />

                  <CardContent className="flex h-full flex-col px-6 py-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm transition-transform duration-200 group-hover:scale-110',
                          service.color
                        )}
                      >
                        <ServiceIcon className="h-6 w-6 text-white" />
                      </div>
                      <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-300">
                        <Ticket className="h-3 w-3" />
                        Tiket #{String(i + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-800">{service.title}</h3>
                    <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-500">
                      {service.description}
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                          service.lightBg,
                          service.lightText
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        Est. {service.estimasi}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                      <Link
                        href={`/layanan/${service.slug}`}
                        className={cn(
                          buttonVariants({ size: 'sm' }),
                          'flex-1 justify-center gap-1.5'
                        )}
                      >
                        Ajukan Sekarang
                        <ArrowRight />
                      </Link>
                      <button
                        onClick={() =>
                          setSkm({ type: service.slug as ServiceType, title: service.title })
                        }
                        title={`Beri penilaian layanan ${service.title}`}
                        aria-label={`Beri penilaian layanan ${service.title}`}
                        className={cn(
                          buttonVariants({ size: 'icon-sm', variant: 'outline' }),
                          'text-amber-500 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600'
                        )}
                      >
                        <Star />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Ticket info + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-col items-center justify-between gap-5 rounded-2xl border border-blue-200 bg-blue-50 p-6 sm:flex-row"
        >
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-bold text-blue-800">Bagaimana sistem tiket bekerja?</p>
              <p className="mt-1 text-sm text-blue-600">
                Simpan nomor tiket setelah mengajukan permohonan. Tim kami akan memproses
                sesuai estimasi, lalu Anda dapat memberi penilaian melalui Survei Kepuasan Masyarakat (SKM).
              </p>
            </div>
          </div>
          <div className="flex flex-shrink-0 gap-3">
            <Link
              href="/layanan"
              className={cn(buttonVariants({ size: 'lg' }), 'h-11 px-5')}
            >
              Lihat Semua Layanan
              <ArrowRight />
            </Link>
            <button
              onClick={() => setSkm({ type: 'informasi-publik', title: 'Layanan Publik SMPN 1 Wanayasa' })}
              className={cn(
                buttonVariants({ size: 'lg', variant: 'outline' }),
                'h-11 gap-2 border-amber-300 bg-white px-5 text-amber-700 hover:bg-amber-50'
              )}
            >
              <Star />
              Beri Penilaian
            </button>
          </div>
        </motion.div>

        {/* SKM Modal */}
        <SKMModal
          isOpen={skm !== null}
          onClose={() => setSkm(null)}
          serviceType={skm?.type ?? 'informasi-publik'}
          serviceTitle={skm?.title ?? ''}
        />
      </div>
    </section>
  )
}
