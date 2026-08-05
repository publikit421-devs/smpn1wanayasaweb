'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { PublicService, ServiceStatus, LayananRequest } from '@/lib/supabase'
import {
  FileText, Loader2, ChevronDown, Search, RefreshCw, X,
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

export default function AdminPermohonanPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'layanan' | 'informasi'>('layanan')
  const [services, setServices] = useState<PublicService[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedItem, setSelectedItem] = useState<PublicService | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState<ServiceStatus>('masuk')
  const [catatanAdmin, setCatatanAdmin] = useState('')

  const [layananRequests, setLayananRequests] = useState<LayananRequest[]>([])
  const [loadingLayanan, setLoadingLayanan] = useState(true)
  const [searchLayanan, setSearchLayanan] = useState('')

  const fetchLayananRequests = useCallback(() => {
    supabase
      .from('layanan_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setLayananRequests(data as LayananRequest[])
        setLoadingLayanan(false)
      })
  }, [])

  const fetchServices = useCallback(() => {
    let query = supabase
      .from('public_services')
      .select('*')
      .order('created_at', { ascending: false })

    if (filterType) query = query.eq('service_type', filterType)
    if (filterStatus) query = query.eq('status', filterStatus)

    query.then(({ data }) => {
      if (data) setServices(data as PublicService[])
      setLoading(false)
    })
  }, [filterType, filterStatus])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/admin/login')
    })
    fetchServices()
    fetchLayananRequests()
  }, [router, fetchServices, fetchLayananRequests])

  const filtered = services.filter((s) =>
    search
      ? s.nama_pemohon.toLowerCase().includes(search.toLowerCase()) ||
        (s.nomor_registrasi || '').toLowerCase().includes(search.toLowerCase())
      : true
  )

  async function handleUpdateStatus() {
    if (!selectedItem) return
    setUpdatingStatus(true)
    await supabase
      .from('public_services')
      .update({
        status: newStatus,
        catatan_admin: catatanAdmin || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedItem.id)
    setSelectedItem(null)
    fetchServices()
    setUpdatingStatus(false)
  }

  async function handleUpdateLayananStatus(id: string, status: string) {
    await supabase.from('layanan_requests').update({ status }).eq('id', id)
    fetchLayananRequests()
  }

  const filteredLayanan = layananRequests.filter((r) =>
    searchLayanan
      ? r.nama_lengkap.toLowerCase().includes(searchLayanan.toLowerCase()) ||
        (r.nomor_registrasi || '').toLowerCase().includes(searchLayanan.toLowerCase())
      : true
  )

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('layanan')}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-600 transition-all',
            tab === 'layanan' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          )}
        >
          Permohonan Layanan
        </button>
        <button
          onClick={() => setTab('informasi')}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-600 transition-all',
            tab === 'informasi' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          )}
        >
          Informasi Publik
        </button>
      </div>

      {tab === 'layanan' ? (
        <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="search-permohonan"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau no. registrasi..."
            className="input-field pl-10"
          />
        </div>
        <select id="filter-type" value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field sm:w-48">
          <option value="">Semua Layanan</option>
          {Object.entries(serviceLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select id="filter-status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field sm:w-40">
          <option value="">Semua Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{statusConfig[s].label}</option>
          ))}
        </select>
        <button id="refresh-btn" onClick={() => fetchServices()} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Tidak ada permohonan ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 font-600 uppercase tracking-wider">
                  <th className="text-left px-6 py-3">No. Registrasi</th>
                  <th className="text-left px-6 py-3">Nama Pemohon</th>
                  <th className="text-left px-6 py-3">Layanan</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Tanggal</th>
                  <th className="text-right px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const status = statusConfig[item.status as ServiceStatus]
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-600 font-mono text-xs text-slate-600">
                        {item.nomor_registrasi || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-600 text-slate-800">{item.nama_pemohon}</p>
                        <p className="text-xs text-slate-400">{item.no_telepon}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {serviceLabels[item.service_type] || item.service_type}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${status?.badgeCls || 'badge-blue'}`}>
                          {status?.label || item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          id={`update-status-${item.id}`}
                          onClick={() => {
                            setSelectedItem(item)
                            setNewStatus(item.status as ServiceStatus)
                            setCatatanAdmin(item.catatan_admin || '')
                          }}
                          className="inline-flex items-center gap-1 text-xs font-600 text-brand-600 hover:text-brand-800 transition-colors"
                        >
                          Update Status <ChevronDown className="w-3 h-3" />
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

      {/* Update Status Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-700 text-slate-800">Update Status Permohonan</h2>
              <button id="close-status-modal" onClick={() => setSelectedItem(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Pemohon</p>
                <p className="text-sm font-600 text-slate-800">{selectedItem.nama_pemohon}</p>
                <p className="text-xs text-slate-500 mt-1">{selectedItem.nomor_registrasi}</p>
              </div>
              <div>
                <label htmlFor="new-status" className="label-field">Status Baru</label>
                <select id="new-status" value={newStatus} onChange={(e) => setNewStatus(e.target.value as ServiceStatus)} className="input-field">
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{statusConfig[s].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="catatan-admin" className="label-field">Catatan Admin (opsional)</label>
                <textarea id="catatan-admin" rows={3} value={catatanAdmin} onChange={(e) => setCatatanAdmin(e.target.value)} placeholder="Catatan untuk pemohon..." className="input-field resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setSelectedItem(null)} className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-600 text-slate-600 hover:bg-slate-50 transition-colors">
                  Batal
                </button>
                <button
                  id="confirm-status-btn"
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus}
                  className={cn('flex-1 btn-primary justify-center', updatingStatus && 'opacity-70 cursor-not-allowed')}
                >
                  {updatingStatus ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : 'Simpan Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      ) : (
        <>
          {/* Search */}
          <div className="relative flex-1 mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="search-informasi"
              type="text"
              value={searchLayanan}
              onChange={(e) => setSearchLayanan(e.target.value)}
              placeholder="Cari nama atau no. registrasi..."
              className="input-field pl-10"
            />
          </div>

          {/* Table Informasi Publik */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loadingLayanan ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              </div>
            ) : filteredLayanan.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Belum ada permohonan informasi publik.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs text-slate-500 font-600 uppercase tracking-wider">
                      <th className="text-left px-6 py-3">No. Registrasi</th>
                      <th className="text-left px-6 py-3">Nama Lengkap</th>
                      <th className="text-left px-6 py-3">No. Telepon</th>
                      <th className="text-left px-6 py-3">Informasi Diminta</th>
                      <th className="text-left px-6 py-3">Status</th>
                      <th className="text-left px-6 py-3">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLayanan.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-600 font-mono text-xs text-slate-600">
                          {item.nomor_registrasi || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-600 text-slate-800">{item.nama_lengkap}</p>
                          <p className="text-xs text-slate-400">{item.email || '—'}</p>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">{item.no_telepon}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 max-w-[240px]">
                          <p className="line-clamp-2">{item.informasi_diminta}</p>
                          {item.tujuan_penggunaan && (
                            <p className="text-[11px] text-slate-400 mt-1">Tujuan: {item.tujuan_penggunaan}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={item.status}
                            onChange={(e) => handleUpdateLayananStatus(item.id, e.target.value)}
                            className="input-field !py-1.5 !px-2 text-xs"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Diproses">Diproses</option>
                            <option value="Selesai">Selesai</option>
                            <option value="Ditolak">Ditolak</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {formatDate(item.created_at)}
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
