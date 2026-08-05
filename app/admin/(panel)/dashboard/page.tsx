'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { LayananRequest } from '@/lib/supabase'
import {
  LayoutDashboard, FileText, Star, CheckCircle, Clock, ChevronRight,
} from 'lucide-react'

const navLinks = [
  { href: '/admin/profil', label: 'Profil & Kontak', icon: LayoutDashboard },
  { href: '/admin/guru-staff', label: 'Data Guru & Staf', icon: LayoutDashboard },
  { href: '/admin/kegiatan-spmb', label: 'Kegiatan & SPMB', icon: LayoutDashboard },
  { href: '/admin/permohonan', label: 'Monitoring Permohonan', icon: FileText },
]

const statusConfig: Record<string, { label: string; cls: string }> = {
  Pending: { label: 'Pending', cls: 'badge-blue' },
  Diproses: { label: 'Diproses', cls: 'badge-yellow' },
  Selesai: { label: 'Selesai', cls: 'badge-green' },
  Ditolak: { label: 'Ditolak', cls: 'badge-red' },
}

const nextStatus: Record<string, string | null> = {
  Pending: 'Diproses',
  Diproses: 'Selesai',
  Selesai: null,
  Ditolak: null,
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [recentRequests, setRecentRequests] = useState<LayananRequest[]>([])
  const [stats, setStats] = useState({ total: 0, diproses: 0, selesai: 0, rating: 0 })

  const fetchAll = useCallback(() => {
    supabase
      .from('layanan_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (!error && data) setRecentRequests(data as LayananRequest[])
      })

    supabase
      .from('layanan_requests')
      .select('status')
      .then(({ data, error }) => {
        if (!error && data) {
          setStats((prev) => ({
            ...prev,
            total: data.length,
            diproses: data.filter((r) => r.status === 'Pending' || r.status === 'Diproses').length,
            selesai: data.filter((r) => r.status === 'Selesai').length,
          }))
        }
      })
  }, [])

  useEffect(() => {
    // Check auth
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/admin/login')
    })

    fetchAll()

    // Realtime: refresh otomatis saat ada INSERT/UPDATE di layanan_requests
    const channel = supabase
      .channel('admin-dashboard-layanan')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'layanan_requests' }, () => fetchAll())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'layanan_requests' }, () => fetchAll())
      .subscribe()

    // Rating rata-rata SKM
    supabase
      .from('skm_feedbacks')
      .select('rating')
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const avg = data.reduce((s, f) => s + f.rating, 0) / data.length
          setStats((prev) => ({ ...prev, rating: Math.round(avg * 10) / 10 }))
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router, fetchAll])

  async function handleAdvanceStatus(req: LayananRequest) {
    const next = nextStatus[req.status]
    if (!next) return
    await supabase.from('layanan_requests').update({ status: next }).eq('id', req.id)
    fetchAll()
  }

  const statCards = [
    { label: 'Total Permohonan', value: String(stats.total), icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'Sedang Diproses', value: String(stats.diproses), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'Selesai', value: String(stats.selesai), icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { label: 'Rating Rata-rata', value: stats.rating ? String(stats.rating) : '—', icon: Star, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  ]

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
          <Link href="/admin/permohonan" className="text-xs text-brand-600 font-600 hover:text-brand-800">
            Lihat Semua →
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recentRequests.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 font-600 uppercase tracking-wider">
                  <th className="text-left px-6 py-3">No. Registrasi</th>
                  <th className="text-left px-6 py-3">Nama Pemohon</th>
                  <th className="text-left px-6 py-3">Informasi Diminta</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Tanggal</th>
                  <th className="text-right px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRequests.map((req) => {
                  const status = statusConfig[req.status] || { label: req.status, cls: 'badge-blue' }
                  const next = nextStatus[req.status]
                  return (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-600 text-slate-700 font-mono text-xs">
                        {req.nomor_registrasi || '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-800">{req.nama_lengkap}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs max-w-[240px]">
                        <p className="line-clamp-1">{req.informasi_diminta}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${status.cls}`}>{status.label}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {new Date(req.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {next ? (
                          <button
                            id={`advance-status-${req.id}`}
                            onClick={() => handleAdvanceStatus(req)}
                            className="inline-flex items-center gap-1 text-xs font-600 text-brand-600 hover:text-brand-800 transition-colors"
                          >
                            {next === 'Diproses' ? 'Proses' : 'Selesai'} <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300">Selesai</span>
                        )}
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
              <p className="text-slate-300 text-xs mt-1">Permohonan baru akan muncul di sini secara otomatis</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
