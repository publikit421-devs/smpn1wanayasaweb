'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Staff } from '@/lib/supabase'
import {
  Users, Plus, Edit2, Trash2, Loader2, Search, X, AlertCircle, CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const emptyForm: Omit<Staff, 'id' | 'created_at' | 'updated_at' | 'is_active'> = {
  nama: '',
  nip: '',
  gelar: '',
  role: '',
  bidang: '',
  jenis: 'guru',
  email: '',
  telepon: '',
  urutan: 0,
}

export default function AdminGuruStaffPage() {
  const router = useRouter()
  const [items, setItems] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterJenis, setFilterJenis] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const fetchItems = useCallback(() => {
    supabase
      .from('staff')
      .select('*')
      .order('urutan', { ascending: true })
      .order('nama', { ascending: true })
      .then(({ data }) => {
        if (data) setItems(data as Staff[])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/admin/login')
    })
    fetchItems()
  }, [router, fetchItems])

  const filtered = items.filter((item) => {
    const matchSearch = search
      ? item.nama.toLowerCase().includes(search.toLowerCase()) ||
        (item.nip || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.bidang || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.role || '').toLowerCase().includes(search.toLowerCase())
      : true
    const matchJenis = filterJenis ? item.jenis === filterJenis : true
    return matchSearch && matchJenis
  })

  function openAdd() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
    setError(null)
    setMessage(null)
  }

  function openEdit(item: Staff) {
    setForm({
      nama: item.nama,
      nip: item.nip ?? '',
      gelar: item.gelar ?? '',
      role: item.role ?? '',
      bidang: item.bidang ?? '',
      jenis: item.jenis,
      email: item.email ?? '',
      telepon: item.telepon ?? '',
      urutan: item.urutan ?? 0,
    })
    setEditingId(item.id)
    setShowForm(true)
    setError(null)
    setMessage(null)
  }

  async function handleSave() {
    if (!form.nama || !form.role) {
      setError('Nama dan jabatan/role wajib diisi.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (editingId) {
        await supabase.from('staff').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editingId)
      } else {
        await supabase.from('staff').insert({ ...form, is_active: true })
      }
      setShowForm(false)
      fetchItems()
      setMessage('Data guru/staf berhasil disimpan.')
      setTimeout(() => setMessage(null), 3000)
    } catch {
      setError('Gagal menyimpan. Pastikan Supabase sudah dikonfigurasi.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: Staff) {
    if (!confirm(`Yakin ingin menghapus ${item.nama}?`)) return
    await supabase.from('staff').delete().eq('id', item.id)
    fetchItems()
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, NIP, bidang, atau jabatan..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-3">
          <select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)} className="input-field sm:w-44">
            <option value="">Semua Jenis</option>
            <option value="guru">Guru</option>
            <option value="staf">Staf</option>
          </select>
          <button id="add-staff-btn" onClick={openAdd} className="btn-primary text-sm px-4 py-2 flex-shrink-0">
            <Plus className="w-4 h-4" /> Tambah
          </button>
        </div>
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
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Tidak ada data guru/staf ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 font-600 uppercase tracking-wider">
                  <th className="text-left px-6 py-3">Nama</th>
                  <th className="text-left px-6 py-3">NIP</th>
                  <th className="text-left px-6 py-3">Jabatan / Role</th>
                  <th className="text-left px-6 py-3">Bidang</th>
                  <th className="text-left px-6 py-3">Jenis</th>
                  <th className="text-right px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-600 text-slate-800">{item.nama}</p>
                      {item.gelar && <p className="text-xs text-slate-400">{item.gelar}</p>}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{item.nip || '—'}</td>
                    <td className="px-6 py-4 text-slate-600">{item.role || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="badge badge-blue">{item.bidang || 'Umum'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('badge', item.jenis === 'guru' ? 'badge-green' : 'badge-purple')}>
                        {item.jenis === 'guru' ? 'Guru' : 'Staf'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(item)} title="Edit"
                          className="p-1.5 rounded-lg text-brand-400 hover:text-brand-700 hover:bg-brand-50 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item)} title="Hapus"
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-700 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-700 text-slate-800">
                {editingId ? 'Edit Data Guru/Staf' : 'Tambah Guru/Staf'}
              </h2>
              <button id="close-staff-form" onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
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
                <label htmlFor="s-nama" className="label-field">Nama Lengkap *</label>
                <input id="s-nama" type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Contoh: Drs. Ahmad Suryana, M.Pd." className="input-field" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="s-nip" className="label-field">NIP</label>
                  <input id="s-nip" type="text" value={form.nip} onChange={(e) => setForm({ ...form, nip: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label htmlFor="s-gelar" className="label-field">Gelar / Keterangan</label>
                  <input id="s-gelar" type="text" value={form.gelar} onChange={(e) => setForm({ ...form, gelar: e.target.value })} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="s-role" className="label-field">Jabatan / Role *</label>
                  <input id="s-role" type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Contoh: Guru Matematika" className="input-field" />
                </div>
                <div>
                  <label htmlFor="s-bidang" className="label-field">Bidang Studi / Unit</label>
                  <input id="s-bidang" type="text" value={form.bidang} onChange={(e) => setForm({ ...form, bidang: e.target.value })} placeholder="Contoh: Matematika / Tata Usaha" className="input-field" />
                </div>
              </div>
              <div>
                <label htmlFor="s-jenis" className="label-field">Jenis</label>
                <select id="s-jenis" value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value as 'guru' | 'staf' })} className="input-field">
                  <option value="guru">Guru</option>
                  <option value="staf">Staf TU / Kependidikan</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="s-email" className="label-field">Email</label>
                  <input id="s-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label htmlFor="s-telp" className="label-field">Telepon</label>
                  <input id="s-telp" type="text" value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label htmlFor="s-urutan" className="label-field">Urutan Tampil</label>
                <input id="s-urutan" type="number" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: Number(e.target.value) || 0 })} className="input-field" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-600 text-slate-600 hover:bg-slate-50 transition-colors">
                  Batal
                </button>
                <button id="save-staff-btn" onClick={handleSave} disabled={saving} className={cn('flex-1 btn-primary justify-center', saving && 'opacity-70 cursor-not-allowed')}>
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
