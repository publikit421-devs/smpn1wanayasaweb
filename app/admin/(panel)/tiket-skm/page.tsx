'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { PublicService, ServiceStatus, SKMFeedback } from '@/lib/supabase'
import {
  Ticket, Star, Loader2, Search, X, ChevronDown, AlertCircle, CheckCircle,
  Download, FileText, Clock, Inbox,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

const serviceLabels: Record<string, string> = {
  'informasi-publik': 'Informasi Publik',
  'pengaduan': 'Pengaduan',
  'legalisasi-ijazah': 'Legalisasi Ijazah',
  'izin-siswa': 'Izin Siswa',
  'penelitian': 'Penelitian',
  'mutasi-siswa': 'Mutasi Siswa',
}

const statusConfig: Record<ServiceStatus, { label: string; badgeCls: string }> = {
  masuk: { label: 'Masuk', badgeCls: 'badge-blue' },
  diproses: { label: 'Diproses', badgeCls: 'badge-yellow' },
  selesai: { label: 'Selesai', badgeCls: 'badge-green' },
  ditolak: { label: 'Ditolak', badgeCls: 'badge-red' },
}

const STATUS_OPTIONS: ServiceStatus[] = ['masuk', 'diproses', 'selesai', 'ditolak']

const ratingLabels = ['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Baik', 'Sangat Baik']

export default function AdminTiketSkmPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'tiket' | 'skm'>('tiket')

  // Tiket state
  const [tickets, setTickets] = useState<PublicService[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selected, setSelected] = useState<PublicService | null>(null)
  const [newStatus, setNewStatus] = useState<ServiceStatus>('masuk')
  const [catatanAdmin, setCatatanAdmin] = useState('')
  const [updating, setUpdating] = useState(false)

  // SKM state
  const [feedbacks, setFeedbacks] = useState<SKMFeedback[]>([])
  const [skmLoading, setSkmLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [exportMessage, setExportMessage] = useState<string | null>(null)

  const fetchTickets = useCallback(() => {
    let query = supabase.from('public_services').select('*').order('created_at', { ascending: false })
    if (filterStatus) query = query.eq('status', filterStatus)
    query.then(({ data }) => {
      if (data) setTickets(data as PublicService[])
      setLoading(false)
    })
  }, [filterStatus])

  const fetchFeedbacks = useCallback(() => {
    supabase
      .from('skm_feedbacks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data }) => {
        if (data) setFeedbacks(data as SKMFeedback[])
        setSkmLoading(false)
      })
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/admin/login')
    })
    fetchTickets()
    fetchFeedbacks()
  }, [router, fetchTickets, fetchFeedbacks])

  const filtered = tickets.filter((t) =>
    search
      ? t.nama_pemohon.toLowerCase().includes(search.toLowerCase()) ||
        (t.nomor_registrasi || '').toLowerCase().includes(search.toLowerCase())
      : true
  )

  async function handleUpdateStatus() {
    if (!selected) return
    setUpdating(true)
    await supabase
      .from('public_services')
      .update({
        status: newStatus,
        catatan_admin: catatanAdmin || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selected.id)
    setSelected(null)
    fetchTickets()
    setUpdating(false)
  }

  // ===== SKM stats & export =====
  const totalSkms = feedbacks.length
  const avgRating = totalSkms > 0
    ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalSkms
    : 0
  const ratingDist = [1, 2, 3, 4, 5].map((r) => ({
    rating: r,
    count: feedbacks.filter((f) => f.rating === r).length,
  }))

  async function handleExportCsv() {
    setExporting(true)
    setExportMessage(null)
    try {
      // Re-fetch fresh data for export (up to 5000)
      const { data } = await supabase
        .from('skm_feedbacks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5000)
      const rows = data ?? feedbacks
      const headers = ['Tanggal', 'Jenis Layanan', 'Rating (1-5)', 'Predikat', 'Komentar/Saran']
      const csv = [headers]
        .concat(
          (rows as SKMFeedback[]).map((f) => [
            new Date(f.created_at).toLocaleString('id-ID'),
            serviceLabels[f.service_type] || f.service_type,
            String(f.rating),
            ratingLabels[f.rating] || '',
            `"${(f.komentar || '').replace(/"/g, '""')}"`,
          ])
        )
        .map((r) => r.join(','))
        .join('\n')

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan-skm-smpn1-wanayasa-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setExportMessage(`Berhasil mengekspor ${rows.length} data SKM ke CSV.`)
      setTimeout(() => setExportMessage(null), 4000)
    } catch {
      setExportMessage('Gagal mengekspor laporan.')
      setTimeout(() => setExportMessage(null), 4000)
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('tiket')}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-600 transition-all',
            tab === 'tiket' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          )}
        >
          Tiket Layanan
        </button>
        <button
          onClick={() => setTab('skm')}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-600 transition-all',
            tab === 'skm' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          )}
        >
          Laporan SKM
        </button>
      </div>

      {tab === 'tiket' ? (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau no. registrasi..."
                className="input-field pl-10"
              />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field sm:w-44">
              <option value="">Semua Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{statusConfig[s].label}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Inbox className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Tidak ada tiket ditemukan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs text-slate-500 font-600 uppercase tracking-wider">
                      <th className="text-left px-6 py-3">No. Tiket</th>
                      <th className="text-left px-6 py-3">Pemohon</th>
                      <th className="text-left px-6 py-3">Layanan</th>
                      <th className="text-left px-6 py-3">Kontak</th>
                      <th className="text-left px-6 py-3">Status</th>
                      <th className="text-left px-6 py-3">Tanggal</th>
                      <th className="text-right px-6 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((t) => {
                      const st = statusConfig[t.status as ServiceStatus]
                      return (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs font-600 text-slate-600">
                            {t.nomor_registrasi || '—'}
                          </td>
                          <td className="px-6 py-4 font-600 text-slate-800">{t.nama_pemohon}</td>
                          <td className="px-6 py-4 text-slate-600">
                            {serviceLabels[t.service_type] || t.service_type}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">{t.no_telepon}</td>
                          <td className="px-6 py-4">
                            <span className={`badge ${st?.badgeCls || 'badge-blue'}`}>
                              {st?.label || t.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-xs">{formatDate(t.created_at)}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setSelected(t)
                                setNewStatus(t.status as ServiceStatus)
                                setCatatanAdmin(t.catatan_admin || '')
                              }}
                              className="inline-flex items-center gap-1 text-xs font-600 text-brand-600 hover:text-brand-800 transition-colors"
                            >
                              Kelola <ChevronDown className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detail / update modal */}
          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <h2 className="text-lg font-700 text-slate-800">Kelola Tiket</h2>
                  <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">Pemohon</p>
                      <p className="text-sm font-600 text-slate-800">{selected.nama_pemohon}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">No. Tiket</p>
                      <p className="text-sm font-600 text-slate-800 font-mono">{selected.nomor_registrasi || '—'}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">Layanan</p>
                      <p className="text-sm font-600 text-slate-800">{serviceLabels[selected.service_type] || selected.service_type}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">Kontak</p>
                      <p className="text-sm font-600 text-slate-800">{selected.no_telepon}</p>
                    </div>
                  </div>

                  {selected.alamat && (
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">Alamat</p>
                      <p className="text-sm text-slate-800">{selected.alamat}</p>
                    </div>
                  )}

                  {selected.email && (
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">Email</p>
                      <p className="text-sm text-slate-800">{selected.email}</p>
                    </div>
                  )}

                  {selected.payload && Object.keys(selected.payload).length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500 mb-2">Data Pengajuan</p>
                      <div className="space-y-1">
                        {Object.entries(selected.payload).map(([k, v]) => (
                          <p key={k} className="text-sm text-slate-700">
                            <span className="text-slate-400 capitalize">{k.replace(/_/g, ' ')}:</span>{' '}
                            {typeof v === 'string' ? v : JSON.stringify(v)}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="tk-status" className="label-field">Status</label>
                    <select id="tk-status" value={newStatus} onChange={(e) => setNewStatus(e.target.value as ServiceStatus)} className="input-field">
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{statusConfig[s].label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="tk-catatan" className="label-field">Catatan Admin</label>
                    <textarea id="tk-catatan" rows={3} value={catatanAdmin} onChange={(e) => setCatatanAdmin(e.target.value)} placeholder="Catatan untuk pemohon..." className="input-field resize-none" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setSelected(null)} className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-600 text-slate-600 hover:bg-slate-50 transition-colors">
                      Tutup
                    </button>
                    <button onClick={handleUpdateStatus} disabled={updating} className={cn('flex-1 btn-primary justify-center', updating && 'opacity-70 cursor-not-allowed')}>
                      {updating ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : 'Simpan Status'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border-2 border-blue-200 p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-800 text-slate-800">{totalSkms}</p>
              <p className="text-xs text-slate-500 mt-1">Total Respons SKM</p>
            </div>
            <div className="bg-white rounded-2xl border-2 border-purple-200 p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-800 text-slate-800">{avgRating ? avgRating.toFixed(1) : '—'}</p>
              <p className="text-xs text-slate-500 mt-1">Rating Rata-rata (dari 5)</p>
            </div>
            <div className="bg-white rounded-2xl border-2 border-green-200 p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-800 text-slate-800">
                {totalSkms > 0 ? `${Math.round((feedbacks.filter((f) => f.rating >= 4).length / totalSkms) * 100)}%` : '—'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Kepuasan (Rating ≥ 4)</p>
            </div>
          </div>

          {/* Rating distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h2 className="font-700 text-slate-800 mb-4">Distribusi Rating</h2>
            <div className="space-y-3">
              {ratingDist.map(({ rating, count }) => {
                const pct = totalSkms > 0 ? (count / totalSkms) * 100 : 0
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="w-24 text-xs font-600 text-slate-500 flex-shrink-0">
                      {rating} bintang · {ratingLabels[rating]}
                    </span>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          rating >= 4 ? 'bg-green-500' : rating === 3 ? 'bg-amber-500' : 'bg-red-500'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs font-600 text-slate-600">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Export */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <div>
              <p className="text-sm font-700 text-blue-800">Export Laporan SKM</p>
              <p className="text-xs text-blue-600 mt-0.5">Unduh seluruh respons Survei Kepuasan Masyarakat dalam format CSV (dapat dibuka di Excel).</p>
            </div>
            <button
              id="export-skm-btn"
              onClick={handleExportCsv}
              disabled={exporting}
              className={cn('btn-primary px-5 py-2.5 text-sm flex-shrink-0', exporting && 'opacity-70 cursor-not-allowed')}
            >
              {exporting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyiapkan...</> : <><Download className="w-4 h-4" /> Export CSV</>}
            </button>
          </div>

          {exportMessage && (
            <div className={cn(
              'flex items-center gap-2 p-4 mb-6 rounded-xl border text-sm',
              exportMessage.startsWith('Berhasil')
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            )}>
              {exportMessage.startsWith('Berhasil') ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {exportMessage}
            </div>
          )}

          {/* SKM table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-700 text-slate-800">Respons Terbaru</h2>
            </div>
            {skmLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-16">
                <Ticket className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Belum ada respons SKM.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs text-slate-500 font-600 uppercase tracking-wider">
                      <th className="text-left px-6 py-3">Tanggal</th>
                      <th className="text-left px-6 py-3">Layanan</th>
                      <th className="text-left px-6 py-3">Rating</th>
                      <th className="text-left px-6 py-3">Komentar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {feedbacks.slice(0, 20).map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-400 text-xs">{formatDate(f.created_at)}</td>
                        <td className="px-6 py-4 text-slate-600">{serviceLabels[f.service_type] || f.service_type}</td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={cn('w-3.5 h-3.5', s <= f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200')} />
                            ))}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 max-w-xs">
                          <span className="line-clamp-2">{f.komentar || '—'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
