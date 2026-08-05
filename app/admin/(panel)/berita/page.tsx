'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Announcement } from '@/lib/supabase'
import { deleteImage } from '@/lib/supabase-storage'
import ImageUploader from '@/components/admin/ImageUploader'
import {
  Newspaper, Plus, Edit2, Trash2, Pin, Eye, EyeOff, Loader2, X, AlertCircle, ImagePlus,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

const emptyForm: {
  title: string
  slug: string
  content: string
  category: 'pengumuman' | 'berita' | 'agenda'
  is_pinned: boolean
  is_published: boolean
} = { title: '', slug: '', content: '', category: 'pengumuman', is_pinned: false, is_published: true }

export default function AdminBeritaPage() {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/admin/login')
    })
    fetchAnnouncements()
  }, [router])

  function fetchAnnouncements() {
    supabase
      .from('announcements')
      .select('*')
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        if (data) setAnnouncements(data as Announcement[])
        setLoading(false)
      })
  }

  function resetImage() {
    setImageUrl(null)
    setOriginalImage(null)
  }

  function openAdd() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
    setError(null)
    resetImage()
  }

  function openEdit(item: Announcement) {
    setForm({
      title: item.title,
      slug: item.slug,
      content: item.content,
      category: item.category,
      is_pinned: item.is_pinned,
      is_published: item.is_published,
    })
    setEditingId(item.id)
    setShowForm(true)
    setError(null)
    resetImage()
    setOriginalImage(item.image_url ?? null)
    setImageUrl(item.image_url ?? null)
  }

  async function handleSave() {
    if (!form.title || !form.content) {
      setError('Judul dan isi wajib diisi.')
      return
    }
    setSaving(true)
    setError(null)
    const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    try {
      const payload = { ...form, slug, image_url: imageUrl }
      if (editingId) {
        await supabase
          .from('announcements')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', editingId)
      } else {
        await supabase.from('announcements').insert({ ...payload, published_at: new Date().toISOString() })
      }
      // Gambar lama diganti/dihapus → bersihkan dari Storage agar tidak menumpuk
      if (originalImage && originalImage !== imageUrl) await deleteImage(originalImage)
      setShowForm(false)
      resetImage()
      fetchAnnouncements()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan. Pastikan Supabase sudah dikonfigurasi.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: Announcement) {
    if (!confirm(`Yakin ingin menghapus "${item.title}"?`)) return
    if (item.image_url) await deleteImage(item.image_url)
    await supabase.from('announcements').delete().eq('id', item.id)
    fetchAnnouncements()
  }

  async function togglePublish(item: Announcement) {
    await supabase.from('announcements').update({ is_published: !item.is_published }).eq('id', item.id)
    fetchAnnouncements()
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">Kelola berita, pengumuman, dan agenda sekolah.</p>
        <button id="add-announcement-btn" onClick={openAdd} className="btn-primary text-sm px-4 py-2">
          <Plus className="w-4 h-4" /> Tambah Baru
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {announcements.length === 0 ? (
            <div className="text-center py-16">
              <Newspaper className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Belum ada pengumuman. Klik &quot;+ Tambah Baru&quot; untuk mulai.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 font-600 uppercase tracking-wider">
                    <th className="text-left px-6 py-3">Judul</th>
                    <th className="text-left px-6 py-3">Kategori</th>
                    <th className="text-left px-6 py-3">Gambar</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-left px-6 py-3">Tanggal</th>
                    <th className="text-right px-6 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {announcements.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {item.is_pinned && <Pin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                          <span className="font-600 text-slate-800 line-clamp-1">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('badge', item.category === 'pengumuman' ? 'badge-blue' : item.category === 'berita' ? 'badge-green' : 'badge-purple')}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.image_url ? (
                          <span className="inline-flex items-center gap-1 text-xs font-600 text-brand-600">
                            <ImagePlus className="w-3.5 h-3.5" /> Ada
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('badge', item.is_published ? 'badge-green' : 'badge-red')}>
                          {item.is_published ? 'Publish' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{formatDate(item.published_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => togglePublish(item)} title={item.is_published ? 'Jadikan Draft' : 'Publish'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                            {item.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
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
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-700 text-slate-800">
                {editingId ? 'Edit Pengumuman' : 'Tambah Pengumuman'}
              </h2>
              <button id="close-form-btn" onClick={() => { setShowForm(false); resetImage() }} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
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
                <label htmlFor="form-title" className="label-field">Judul *</label>
                <input id="form-title" type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Judul pengumuman" className="input-field" />
              </div>
              <div>
                <label htmlFor="form-category" className="label-field">Kategori</label>
                <select id="form-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as typeof form.category })} className="input-field">
                  <option value="pengumuman">Pengumuman</option>
                  <option value="berita">Berita</option>
                  <option value="agenda">Agenda</option>
                </select>
              </div>

              {/* Upload Gambar */}
              <div>
                <ImageUploader
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url)}
                  folder="berita"
                  label="Gambar / Infografis (opsional)"
                />
              </div>

              <div>
                <label htmlFor="form-content" className="label-field">Isi / Konten *</label>
                <textarea id="form-content" rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Isi pengumuman..." className="input-field resize-none" />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" id="form-pinned" checked={form.is_pinned} onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })} className="w-4 h-4 accent-brand-600 rounded" />
                  <span className="text-sm font-500 text-slate-700">Sematkan (Pinned)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" id="form-published" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4 accent-brand-600 rounded" />
                  <span className="text-sm font-500 text-slate-700">Publish Sekarang</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowForm(false); resetImage() }} className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-600 text-slate-600 hover:bg-slate-50 transition-colors">
                  Batal
                </button>
                <button id="save-announcement-btn" onClick={handleSave} disabled={saving} className={cn('flex-1 btn-primary justify-center', saving && 'opacity-70 cursor-not-allowed')}>
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
