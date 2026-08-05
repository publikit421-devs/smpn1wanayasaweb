'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { GalleryItem } from '@/lib/supabase'
import { deleteImage } from '@/lib/supabase-storage'
import ImageUploader from '@/components/admin/ImageUploader'
import {
  Images, Plus, Trash2, Loader2, X, AlertCircle, CheckCircle, Eye, EyeOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminGaleriPage() {
  const router = useRouter()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [urutan, setUrutan] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/admin/login')
    })
    fetchItems()
  }, [router])

  function fetchItems() {
    supabase
      .from('gallery_items')
      .select('*')
      .order('urutan', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setItems(data as GalleryItem[])
        setLoading(false)
      })
  }

  function openAdd() {
    setImageUrl(null)
    setCaption('')
    setUrutan(items.length + 1)
    setShowForm(true)
    setError(null)
    setMessage(null)
  }

  async function handleSave() {
    if (!imageUrl) {
      setError('Silakan unggah gambar terlebih dahulu.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await supabase.from('gallery_items').insert({
        image_url: imageUrl,
        caption: caption || null,
        urutan,
        is_active: true,
      })
      setShowForm(false)
      fetchItems()
      setMessage('Gambar galeri berhasil ditambahkan.')
      setTimeout(() => setMessage(null), 3000)
    } catch {
      setError('Gagal menyimpan. Pastikan Supabase sudah dikonfigurasi.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: GalleryItem) {
    if (!confirm('Yakin ingin menghapus gambar ini?')) return
    if (item.image_url) await deleteImage(item.image_url)
    await supabase.from('gallery_items').delete().eq('id', item.id)
    fetchItems()
  }

  async function toggleActive(item: GalleryItem) {
    await supabase.from('gallery_items').update({ is_active: !item.is_active }).eq('id', item.id)
    fetchItems()
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">Kelola galeri foto kegiatan sekolah.</p>
        <button id="add-gallery-btn" onClick={openAdd} className="btn-primary text-sm px-4 py-2">
          <Plus className="w-4 h-4" /> Tambah Foto
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
            <Images className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Belum ada foto galeri. Klik &quot;+ Tambah Foto&quot; untuk mulai.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
            {items.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-xl border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image_url}
                  alt={item.caption || 'Foto galeri'}
                  className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {item.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="line-clamp-2 text-xs font-600 text-white">{item.caption}</p>
                  </div>
                )}
                <div className="absolute right-2 top-2 flex gap-1.5">
                  <button
                    onClick={() => toggleActive(item)}
                    title={item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    className="rounded-lg bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                  >
                    {item.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    title="Hapus"
                    className="rounded-lg bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {!item.is_active && (
                  <span className="absolute left-2 top-2 rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] font-600 text-white">
                    Nonaktif
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-700 text-slate-800">Tambah Foto Galeri</h2>
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
              <ImageUploader
                value={imageUrl}
                onChange={setImageUrl}
                folder="galeri"
                label="Foto Galeri *"
              />
              <div>
                <label htmlFor="g-caption" className="label-field">Keterangan (opsional)</label>
                <input id="g-caption" type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Keterangan foto" className="input-field" />
              </div>
              <div>
                <label htmlFor="g-urutan" className="label-field">Urutan</label>
                <input id="g-urutan" type="number" value={urutan} onChange={(e) => setUrutan(e.target.value ? Number(e.target.value) : 0)} className="input-field" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-600 text-slate-600 hover:bg-slate-50 transition-colors">
                  Batal
                </button>
                <button onClick={handleSave} disabled={saving} className={cn('flex-1 btn-primary justify-center', saving && 'opacity-70 cursor-not-allowed')}>
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
