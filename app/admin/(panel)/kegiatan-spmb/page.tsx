'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Kegiatan, KegiatanCategory, SpmbSetting } from '@/lib/supabase'
import ImageUploader from '@/components/admin/ImageUploader'
import {
  CalendarDays, Plus, Edit2, Trash2, Loader2, X, AlertCircle, CheckCircle,
  Eye, EyeOff, Save,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const categoryConfig: Record<KegiatanCategory, { label: string; badgeCls: string }> = {
  intrakurikuler: { label: 'Intrakurikuler', badgeCls: 'badge-blue' },
  ekstrakurikuler: { label: 'Ekstrakurikuler', badgeCls: 'badge-green' },
  kokurikuler: { label: 'Kokurikuler (P5)', badgeCls: 'badge-purple' },
}

const emptyKegiatan: Omit<Kegiatan, 'id' | 'created_at' | 'updated_at' | 'is_active'> = {
  title: '',
  description: '',
  category: 'ekstrakurikuler',
  image_url: '',
  pembina: '',
  urutan: undefined,
  tanggal: '',
}

export default function AdminKegiatanSpmbPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'kegiatan' | 'spmb'>('kegiatan')

  // Kegiatan state
  const [items, setItems] = useState<Kegiatan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyKegiatan)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // SPMB state
  const [spmb, setSpmb] = useState<{ id: string | null; form: Omit<SpmbSetting, 'id' | 'updated_at'> }>({
    id: null,
    form: {
      tahun_ajaran: '2026/2027',
      judul: 'Penerimaan Peserta Didik Baru',
      deskripsi: '',
      alur: [],
      syarat: [],
      status_buka: true,
      brosur_url: '',
      tanggal_buka: '',
      tanggal_tutup: '',
      kuota: undefined,
    },
  })
  const [spmbSaving, setSpmbSaving] = useState(false)
  const [spmbMessage, setSpmbMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchItems = useCallback(() => {
    supabase
      .from('kegiatan')
      .select('*')
      .order('tanggal', { ascending: false })
      .order('urutan', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setItems(data as Kegiatan[])
        setLoading(false)
      })
  }, [])

  const fetchSpmb = useCallback(() => {
    supabase.from('spmb_settings').select('*').limit(1).then(({ data }) => {
      if (data && data.length > 0) {
        const s = data[0] as SpmbSetting
        setSpmb({
          id: s.id,
          form: {
            tahun_ajaran: s.tahun_ajaran ?? '',
            judul: s.judul ?? '',
            deskripsi: s.deskripsi ?? '',
            alur: s.alur ?? [],
            syarat: s.syarat ?? [],
            status_buka: s.status_buka,
            brosur_url: s.brosur_url ?? '',
            tanggal_buka: s.tanggal_buka ?? '',
            tanggal_tutup: s.tanggal_tutup ?? '',
            kuota: s.kuota ?? undefined,
          },
        })
      }
    })
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/admin/login')
    })
    fetchItems()
    fetchSpmb()
  }, [router, fetchItems, fetchSpmb])

  // ===== Kegiatan CRUD =====
  function openAdd() {
    setForm(emptyKegiatan)
    setEditingId(null)
    setShowForm(true)
    setError(null)
    setMessage(null)
  }

  function openEdit(item: Kegiatan) {
    setForm({
      title: item.title,
      description: item.description ?? '',
      category: item.category,
      image_url: item.image_url ?? '',
      pembina: item.pembina ?? '',
      urutan: item.urutan,
      tanggal: item.tanggal ?? '',
    })
    setEditingId(item.id)
    setShowForm(true)
    setError(null)
    setMessage(null)
  }

  async function handleSaveKegiatan() {
    if (!form.title) {
      setError('Judul kegiatan wajib diisi.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (editingId) {
        await supabase.from('kegiatan').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editingId)
      } else {
        await supabase.from('kegiatan').insert({ ...form, is_active: true })
      }
      setShowForm(false)
      fetchItems()
      setMessage('Kegiatan berhasil disimpan.')
      setTimeout(() => setMessage(null), 3000)
    } catch {
      setError('Gagal menyimpan. Pastikan Supabase sudah dikonfigurasi.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteKegiatan(id: string) {
    if (!confirm('Yakin ingin menghapus kegiatan ini?')) return
    await supabase.from('kegiatan').delete().eq('id', id)
    fetchItems()
  }

  async function toggleActive(item: Kegiatan) {
    await supabase.from('kegiatan').update({ is_active: !item.is_active }).eq('id', item.id)
    fetchItems()
  }

  // ===== SPMB Save =====
  async function handleSaveSpmb() {
    setSpmbSaving(true)
    setSpmbMessage(null)
    const payload = { ...spmb.form, updated_at: new Date().toISOString() }
    try {
      if (spmb.id) {
        await supabase.from('spmb_settings').update(payload).eq('id', spmb.id)
      } else {
        await supabase.from('spmb_settings').insert(payload)
      }
      setSpmbMessage({ type: 'success', text: 'Pengaturan SPMB berhasil disimpan.' })
    } catch {
      setSpmbMessage({ type: 'error', text: 'Gagal menyimpan. Pastikan Supabase sudah dikonfigurasi.' })
    } finally {
      setSpmbSaving(false)
    }
  }

  const setSpmbField = (key: keyof typeof spmb.form, value: string | string[] | boolean | number | undefined) =>
    setSpmb({ ...spmb, form: { ...spmb.form, [key]: value } })

  const alurText = (spmb.form.alur ?? []).join('\n')
  const syaratText = (spmb.form.syarat ?? []).join('\n')

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('kegiatan')}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-600 transition-all',
            tab === 'kegiatan' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          )}
        >
          Kegiatan
        </button>
        <button
          onClick={() => setTab('spmb')}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-600 transition-all',
            tab === 'spmb' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          )}
        >
          Pengaturan SPMB
        </button>
      </div>

      {tab === 'kegiatan' ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500">Kelola kegiatan intrakurikuler, ekstrakurikuler, dan kokurikuler (P5).</p>
            <button id="add-kegiatan-btn" onClick={openAdd} className="btn-primary text-sm px-4 py-2">
              <Plus className="w-4 h-4" /> Tambah Kegiatan
            </button>
          </div>

          {message && (
            <div className="flex items-center gap-2 p-4 mb-6 rounded-xl border bg-green-50 border-green-200 text-sm text-green-700">
              <CheckCircle className="w-4 h-4 flex-shrink-0" /> {message}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16">
                <CalendarDays className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Belum ada kegiatan. Klik &quot;+ Tambah Kegiatan&quot; untuk mulai.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                      <thead>
                    <tr className="bg-slate-50 text-xs text-slate-500 font-600 uppercase tracking-wider">
                      <th className="text-left px-6 py-3">Kegiatan</th>
                      <th className="text-left px-6 py-3">Pembina</th>
                      <th className="text-left px-6 py-3">Kategori</th>
                      <th className="text-left px-6 py-3">Tanggal</th>
                      <th className="text-left px-6 py-3">Status</th>
                      <th className="text-right px-6 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => {
                      const cat = categoryConfig[item.category] ?? categoryConfig.ekstrakurikuler
                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-600 text-slate-800">{item.title}</p>
                            {item.description && <p className="text-xs text-slate-400 line-clamp-1">{item.description}</p>}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600">
                            {item.pembina || '—'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`badge ${cat.badgeCls}`}>{cat.label}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-xs">
                            {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn('badge', item.is_active ? 'badge-green' : 'badge-red')}>
                              {item.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => toggleActive(item)} title={item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                                {item.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              <button onClick={() => openEdit(item)} title="Edit"
                                className="p-1.5 rounded-lg text-brand-400 hover:text-brand-700 hover:bg-brand-50 transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteKegiatan(item.id)} title="Hapus"
                                className="p-1.5 rounded-lg text-red-400 hover:text-red-700 hover:bg-red-50 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Kegiatan Form Modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <h2 className="text-lg font-700 text-slate-800">
                    {editingId ? 'Edit Kegiatan' : 'Tambah Kegiatan'}
                  </h2>
                  <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                    </div>
                  )}
                  <div>
                    <label htmlFor="k-title" className="label-field">Judul Kegiatan *</label>
                    <input id="k-title" type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label htmlFor="k-category" className="label-field">Kategori</label>
                    <select id="k-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as KegiatanCategory })} className="input-field">
                      <option value="intrakurikuler">Intrakurikuler</option>
                      <option value="ekstrakurikuler">Ekstrakurikuler</option>
                      <option value="kokurikuler">Kokurikuler (P5)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="k-desc" className="label-field">Deskripsi</label>
                    <textarea id="k-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="k-pembina" className="label-field">Pembina</label>
                      <input id="k-pembina" type="text" value={form.pembina ?? ''} onChange={(e) => setForm({ ...form, pembina: e.target.value })} placeholder="Nama Pembina, S.Pd" className="input-field" />
                    </div>
                    <div>
                      <label htmlFor="k-urutan" className="label-field">Urutan</label>
                      <input id="k-urutan" type="number" value={form.urutan ?? ''} onChange={(e) => setForm({ ...form, urutan: e.target.value ? Number(e.target.value) : undefined })} placeholder="1" className="input-field" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="k-tanggal" className="label-field">Tanggal</label>
                      <input id="k-tanggal" type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="input-field" />
                    </div>
                  </div>
                  <ImageUploader
                    value={form.image_url || null}
                    onChange={(url) => setForm({ ...form, image_url: url ?? '' })}
                    folder="kegiatan"
                    label="Gambar (opsional)"
                  />
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-600 text-slate-600 hover:bg-slate-50 transition-colors">
                      Batal
                    </button>
                    <button onClick={handleSaveKegiatan} disabled={saving} className={cn('flex-1 btn-primary justify-center', saving && 'opacity-70 cursor-not-allowed')}>
                      {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : 'Simpan'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {spmbMessage && (
            <div className={cn(
              'flex items-center gap-2 p-4 mb-6 rounded-xl border text-sm',
              spmbMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
            )}>
              {spmbMessage.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {spmbMessage.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: basic info */}
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-700 text-slate-800">Informasi Umum</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="spmb-ta" className="label-field">Tahun Ajaran</label>
                    <input id="spmb-ta" type="text" value={spmb.form.tahun_ajaran} onChange={(e) => setSpmbField('tahun_ajaran', e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label htmlFor="spmb-judul" className="label-field">Judul</label>
                    <input id="spmb-judul" type="text" value={spmb.form.judul} onChange={(e) => setSpmbField('judul', e.target.value)} className="input-field" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="spmb-desc" className="label-field">Deskripsi</label>
                    <textarea id="spmb-desc" rows={3} value={spmb.form.deskripsi} onChange={(e) => setSpmbField('deskripsi', e.target.value)} className="input-field resize-none" />
                  </div>
                  <div>
                    <label htmlFor="spmb-buka" className="label-field">Tanggal Buka</label>
                    <input id="spmb-buka" type="date" value={spmb.form.tanggal_buka} onChange={(e) => setSpmbField('tanggal_buka', e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label htmlFor="spmb-tutup" className="label-field">Tanggal Tutup</label>
                    <input id="spmb-tutup" type="date" value={spmb.form.tanggal_tutup} onChange={(e) => setSpmbField('tanggal_tutup', e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label htmlFor="spmb-kuota" className="label-field">Kuota</label>
                    <input id="spmb-kuota" type="number" value={spmb.form.kuota ?? ''} onChange={(e) => setSpmbField('kuota', e.target.value ? Number(e.target.value) : undefined)} className="input-field" />
                  </div>
                  <div>
                    <label htmlFor="spmb-brosur" className="label-field">URL Brosur (PDF)</label>
                    <input id="spmb-brosur" type="text" value={spmb.form.brosur_url} onChange={(e) => setSpmbField('brosur_url', e.target.value)} placeholder="/brochures/brosur-spmb-2026.pdf" className="input-field" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer md:col-span-2 mt-2">
                    <input type="checkbox" id="spmb-status" checked={spmb.form.status_buka} onChange={(e) => setSpmbField('status_buka', e.target.checked)} className="w-4 h-4 accent-brand-600 rounded" />
                    <span className="text-sm font-500 text-slate-700">SPMB Dibuka</span>
                  </label>
                </div>
              </section>
            </div>

            {/* Right: alur & syarat */}
            <div className="space-y-6">
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-700 text-slate-800">Alur Pendaftaran</h2>
                </div>
                <div className="p-6">
                  <label htmlFor="spmb-alur" className="label-field">Satu langkah per baris</label>
                  <textarea
                    id="spmb-alur"
                    rows={8}
                    value={alurText}
                    onChange={(e) => setSpmbField('alur', e.target.value.split('\n').filter((l) => l.trim() !== ''))}
                    className="input-field resize-none font-mono text-xs"
                  />
                </div>
              </section>
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-700 text-slate-800">Syarat Pendaftaran</h2>
                </div>
                <div className="p-6">
                  <label htmlFor="spmb-syarat" className="label-field">Satu syarat per baris</label>
                  <textarea
                    id="spmb-syarat"
                    rows={8}
                    value={syaratText}
                    onChange={(e) => setSpmbField('syarat', e.target.value.split('\n').filter((l) => l.trim() !== ''))}
                    className="input-field resize-none font-mono text-xs"
                  />
                </div>
              </section>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              id="save-spmb-btn"
              onClick={handleSaveSpmb}
              disabled={spmbSaving}
              className={cn('btn-primary justify-center px-6', spmbSaving && 'opacity-70 cursor-not-allowed')}
            >
              {spmbSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Save className="w-4 h-4" /> Simpan Pengaturan</>}
            </button>
          </div>
        </>
      )}
    </>
  )
}
