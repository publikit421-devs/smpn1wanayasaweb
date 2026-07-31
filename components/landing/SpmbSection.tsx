'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  UserPlus,
  FileText,
  UploadCloud,
  BadgeCheck,
  Megaphone,
  ClipboardList,
  CheckCircle2,
  Download,
  GraduationCap,
  CalendarDays,
  Clock,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const alurSteps = [
  {
    icon: UserPlus,
    title: 'Registrasi Akun',
    desc: 'Buat akun pada portal SPMB menggunakan email/HP orang tua.',
  },
  {
    icon: FileText,
    title: 'Isi Formulir',
    desc: 'Lengkapi data calon murid dan pilih jalur pendaftaran.',
  },
  {
    icon: UploadCloud,
    title: 'Unggah Berkas',
    desc: 'Unggah seluruh dokumen persyaratan sesuai jalur.',
  },
  {
    icon: BadgeCheck,
    title: 'Verifikasi Berkas',
    desc: 'Panitia memverifikasi kelengkapan dan kebenaran data.',
  },
  {
    icon: Megaphone,
    title: 'Pengumuman',
    desc: 'Hasil seleksi diumumkan melalui portal dan papan sekolah.',
  },
  {
    icon: ClipboardList,
    title: 'Daftar Ulang',
    desc: 'Calon murid yang diterima melakukan daftar ulang.',
  },
]

const syaratList = [
  'Akta kelahiran calon murid (asli + fotokopi)',
  'Kartu Keluarga (KK) yang masih berlaku',
  'Ijazah atau Surat Keterangan Lulus (SKL) SD/MI',
  'Fotokopi KTP orang tua / wali',
  'Pas foto 3×4 sebanyak 2 lembar (background merah)',
  'Rapor kelas terakhir (fotokopi yang dilegalisir)',
]

const infoHighlights = [
  { icon: CalendarDays, text: 'Pendaftaran: 1 – 31 Juli 2026' },
  { icon: Clock, text: 'Jalur: Zonasi, Prestasi, & Perpindahan Orang Tua' },
]

export default function SpmbSection() {
  return (
    <section
      className="relative overflow-hidden py-20"
      id="spmb"
      aria-label="Sistem Penerimaan Murid Baru"
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-brand-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-amber-200/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5">
            <GraduationCap className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-semibold text-brand-700">SPMB 2026/2027</span>
          </div>
          <h2 className="section-title">
            Sistem Penerimaan{' '}
            <span className="text-brand-600">Murid Baru</span>
          </h2>
          <p className="section-subtitle mx-auto mt-3">
            Pendaftaran Peserta Didik Baru SMP Negeri 1 Wanayasa Tahun Ajaran
            2026/2027. Siapkan berkas, ikuti alurnya, dan bergabunglah bersama kami.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {infoHighlights.map((item) => (
              <span
                key={item.text}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm"
              >
                <item.icon className="h-3.5 w-3.5 text-brand-600" />
                {item.text}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* Alur Pendaftaran */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <Card className="h-full border-slate-200 bg-white">
              <CardContent className="px-6 py-8 sm:px-8">
                <div className="mb-8 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Alur Pendaftaran</h3>
                  <Badge variant="outline" className="border-brand-200 text-brand-700">
                    6 Langkah Mudah
                  </Badge>
                </div>

                <ol className="space-y-0">
                  {alurSteps.map((step, i) => (
                    <li key={step.title} className="relative flex gap-5 pb-8 last:pb-0">
                      {/* Connector line */}
                      {i < alurSteps.length - 1 && (
                        <span
                          className="absolute left-6 top-14 h-[calc(100%-3.5rem)] w-px bg-slate-200"
                          aria-hidden="true"
                        />
                      )}

                      <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl gradient-brand text-white shadow-md">
                        <step.icon className="h-5 w-5" />
                      </div>

                      <div className="pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-brand-600">Langkah {i + 1}</span>
                        </div>
                        <h4 className="mt-0.5 text-base font-bold text-slate-800">{step.title}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-slate-500">{step.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </motion.div>

          {/* Syarat + Brosur */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6 lg:col-span-2"
          >
            {/* Syarat */}
            <Card className="border-slate-200 bg-white">
              <CardContent className="px-6 py-8">
                <h3 className="mb-6 text-lg font-bold text-slate-800">Syarat Pendaftaran</h3>
                <ul className="space-y-3.5">
                  {syaratList.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                      <span className="text-sm leading-relaxed text-slate-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Brochure download */}
            <Card className="gradient-brand border-0 text-white">
              <CardContent className="px-6 py-8">
                <h3 className="text-lg font-bold">Unduh Brosur SPMB</h3>
                <p className="mt-2 text-sm leading-relaxed text-blue-100">
                  Dapatkan informasi lengkap mengenai jadwal, jalur pendaftaran,
                  dan daya tampung dalam brosur resmi SPMB 2026/2027.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="/brochures/brosur-spmb-2026.pdf"
                    download="Brosur-SPMB-SMPN-1-Wanayasa-2026.pdf"
                    className={cn(
                      buttonVariants({ size: 'lg' }),
                      'bg-white text-brand-800 hover:bg-blue-50 hover:text-brand-900'
                    )}
                  >
                    <Download />
                    Unduh Brosur (PDF)
                  </a>
                  <Link
                    href="/layanan/informasi-publik"
                    className={cn(
                      buttonVariants({ size: 'lg', variant: 'secondary' }),
                      'bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-sm hover:bg-white/25'
                    )}
                  >
                    Tanya Informasi
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
