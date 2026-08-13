'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import StudentStatsSection from '@/components/landing/StudentStatsSection'
import { supabase } from '@/lib/supabase'
import type { SchoolProfile } from '@/lib/supabase'
import {
  Building2, School, MapPin, Phone, Mail, Award, Globe,
} from 'lucide-react'

const FALLBACK_PROFILE = {
  nama_sekolah: 'SMP Negeri 1 Wanayasa',
  npsn: '',
  akreditasi: '',
  alamat: '',
  kelurahan: '',
  kecamatan: 'Wanayasa',
  kabupaten: 'Purwakarta',
  provinsi: 'Jawa Barat',
  kodepos: '',
  telepon: '',
  email: 'smpn1wanayasa1965@gmail.com',
  website: '',
  visi: '',
  misi: '',
  jam_layanan: 'Senin–Jumat 07.00–16.00',
}

function addressLines(p: { [key: string]: string | undefined }) {
  const parts = [p.alamat, p.kelurahan, p.kecamatan, p.kabupaten, p.provinsi, p.kodepos].filter(Boolean)
  return parts
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<SchoolProfile | null>(null)

  useEffect(() => {
    supabase
      .from('school_profiles')
      .select('*')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProfile(data as SchoolProfile)
      })
  }, [])

  const p = { ...FALLBACK_PROFILE, ...(profile ?? {}) }

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-slate-50">
        {/* Hero */}
        <div className="bg-gradient-to-r from-brand-700 to-secondary-700 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <School className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-800 text-white">Profil Sekolah</h1>
                <p className="mt-1 text-sm text-white/80">
                  {p.nama_sekolah} · {p.npsn ? `NPSN ${p.npsn}` : `Kec. ${p.kecamatan}, ${p.kabupaten}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Identitas */}
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-brand-600" />
                <h2 className="font-700 text-slate-800 text-lg">Identitas Sekolah</h2>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-xs font-600 text-slate-400">Nama Sekolah</dt>
                  <dd className="text-sm font-600 text-slate-800">{p.nama_sekolah}</dd>
                </div>
                <div>
                  <dt className="text-xs font-600 text-slate-400">NPSN</dt>
                  <dd className="text-sm font-600 text-slate-800">{p.npsn || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-600 text-slate-400">Akreditasi</dt>
                  <dd className="text-sm font-600 text-slate-800">
                    {p.akreditasi ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-amber-700">
                        <Award className="h-3.5 w-3.5" /> {p.akreditasi}
                      </span>
                    ) : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-600 text-slate-400">Jam Layanan</dt>
                  <dd className="text-sm font-600 text-slate-800">{p.jam_layanan || '—'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="mb-1 flex items-center gap-1 text-xs font-600 text-slate-400">
                    <MapPin className="h-3.5 w-3.5" /> Alamat
                  </dt>
                  <dd className="text-sm text-slate-700">
                    {addressLines(p).join(', ') || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="mb-1 flex items-center gap-1 text-xs font-600 text-slate-400">
                    <Phone className="h-3.5 w-3.5" /> Telepon
                  </dt>
                  <dd className="text-sm font-600 text-slate-800">{p.telepon || '—'}</dd>
                </div>
                <div>
                  <dt className="mb-1 flex items-center gap-1 text-xs font-600 text-slate-400">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </dt>
                  <dd className="text-sm font-600 text-slate-800 break-all">{p.email || '—'}</dd>
                </div>
                {p.website && (
                  <div className="sm:col-span-2">
                    <dt className="mb-1 flex items-center gap-1 text-xs font-600 text-slate-400">
                      <Globe className="h-3.5 w-3.5" /> Website
                    </dt>
                    <dd className="text-sm font-600 text-brand-600">{p.website}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Visi Misi */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="mb-3 font-700 text-slate-800 text-lg">Visi</h2>
                <p className="text-sm leading-relaxed text-slate-600">
                  {p.visi || 'Unggul dalam prestasi, berkarakter, dan peduli lingkungan.'}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="mb-3 font-700 text-slate-800 text-lg">Misi</h2>
                {p.misi ? (
                  <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">{p.misi}</p>
                ) : (
                  <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-600">
                    <li>Menyelenggarakan pembelajaran yang efektif, kreatif, dan menyenangkan.</li>
                    <li>Menumbuhkan karakter religius, disiplin, dan gotong royong.</li>
                    <li>Melestarikan dan peduli terhadap lingkungan hidup.</li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Statistik siswa */}
          <StudentStatsSection />
        </div>
      </main>
      <Footer />
    </>
  )
}
