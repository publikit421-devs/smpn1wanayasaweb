'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard, Newspaper, FileText, Star, CheckCircle, Clock,
} from 'lucide-react'

const statCards = [
  { label: 'Total Permohonan', value: '—', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { label: 'Sedang Diproses', value: '—', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { label: 'Selesai', value: '—', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  { label: 'Rating Rata-rata', value: '—', icon: Star, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
]

const navLinks = [
  { href: '/admin/profil', label: 'Profil & Kontak', icon: LayoutDashboard },
  { href: '/admin/guru-staff', label: 'Data Guru & Staf', icon: LayoutDashboard },
  { href: '/admin/kegiatan-spmb', label: 'Kegiatan & SPMB', icon: LayoutDashboard },
  { href: '/admin/tiket-skm', label: 'Tiket & Laporan SKM', icon: Newspaper },
]

export default function AdminDashboardPage() {
  const router = useRouter()
  const [recentServices, setRecentServices] = useState<Array<{
    id: string
    service_type: string
    nama_pemohon: string
    status: string
    created_at: string
    nomor_registrasi?: string
  }>>([])

  useEffect(() => {
    // Check auth
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/admin/login')
      }
    })
    // Fetch recent services
    supabase
      .from('public_services')
      .select('id, service_type, nama_pemohon, status, created_at, nomor_registrasi')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setRecentServices(data)
      })
  }, [router])

  const serviceLabels: Record<string, string> = {
    'informasi-publik': 'Informasi Publik',
    'pengaduan': 'Pengaduan',
    'legalisasi-ijazah': 'Legalisasi Ijazah',
    'izin-siswa': 'Izin Siswa',
    'penelitian': 'Penelitian',
    'mutasi-siswa': 'Mutasi Siswa',
  }

  const statusConfig: Record<string, { label: string; cls: string }> = {
    masuk: { label: 'Masuk', cls: 'badge-blue' },
    diproses: { label: 'Diproses', cls: 'badge-yellow' },
    selesai: { label: 'Selesai', cls: 'badge-green' },
    ditolak: { label: 'Ditolak', cls: 'badge-red' },
  }

  return (
    <>
      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {navLinks.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-sm hover:border-brand-400 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
              <card.icon className="w-5 h-5 text-brand-600" />
            </div>
            <p className="text-sm font-700 text-slate-800">{card.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">Kelola sekarang →</p>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded-2xl border-2 p-5 shadow-sm ${card.border}`}
          >
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-800 text-slate-800">{card.value}</p>
            <p className="text-xs text-slate-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-700 text-slate-800">Permohonan Terbaru</h2>
          <Link href="/admin/tiket-skm" className="text-xs text-brand-600 font-600 hover:text-brand-800">
            Lihat Semua →
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recentServices.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 font-600 uppercase tracking-wider">
                  <th className="text-left px-6 py-3">No. Registrasi</th>
                  <th className="text-left px-6 py-3">Nama</th>
                  <th className="text-left px-6 py-3">Layanan</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentServices.map((req) => {
                  const status = statusConfig[req.status] || { label: req.status, cls: 'badge-blue' }
                  return (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-600 text-slate-700 font-mono text-xs">
                        {req.nomor_registrasi || '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-800">{req.nama_pemohon}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {serviceLabels[req.service_type] || req.service_type}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${status.cls}`}>{status.label}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {new Date(req.created_at).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Belum ada permohonan masuk</p>
              <p className="text-slate-300 text-xs mt-1">Data akan muncul setelah Supabase dikonfigurasi</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
