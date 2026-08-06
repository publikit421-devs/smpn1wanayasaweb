'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { HeroSlide } from '@/lib/supabase'
import { deleteImage } from '@/lib/supabase-storage'
import ImageUploader from '@/components/admin/ImageUploader'
import {
  MonitorPlay, Plus, Trash2, Loader2, X, AlertCircle, CheckCircle,
  Eye, EyeOff, ArrowUp, ArrowDown, Save,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminHeroPage() {
  const router = useRouter()
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/admin/login')
    })
    fetchSlides()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  async function fetchSlides() {
    setLoading(true)
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true })
    if (!error) setSlides((data as HeroSlide[]) || [])
    setLoading(false)
  }

  function openAdd() {
    setTitle('')
    setImageUrl(null)
    setShowForm(true)
    setError(null)
    setMessage(null)
  }

  function showMsg(msg: string) {
    setMessage(msg)
    setTimeout(() => setMessage(null), 3000)
  }

  async function handleSave() {
    if (!imageUrl) {
      setError('Silakan unggah gambar banner terlebih dahulu.')
      return
    }
    setSaving(true)
    setError(null)
    const { error } = await supabase.from('hero_slides').insert({
      title: title || 'Banner SMP Negeri 1 Wanayasa',
      image_url: imageUrl,
      order_index: slides.length + 1,
      is_active: true,
    })
    if (error) {
      setError('Gagal menyimpan banner: ' + error.message)
    } else {
      setShowForm(false)
      showMsg('Slider hero berhasil ditambahkan.')
      await fetchSlides()
    }
    setSaving(false)
  }

  async function handleToggle(slide: HeroSlide) {
    const { error } = await supabase
      .from('hero_slides')
      .update({ is_active: !slide.is_active })
      .eq('id', slide.id)
    if (!error) {
      setSlides((prev) =>
        prev.map((s) => (s.id === slide.id ? { ...s, is_active: !s.is_active } : s))
      )
    }
  }

  async function handleDelete(slide: HeroSlide) {
    if (!confirm('Hapus banner ini? Gambar juga akan dihapus dari penyimpanan.')) return
    if (slide.image_url) await deleteImage(slide.image_url)
    const { error } = await supabase.from('hero_slides').delete().eq('id', slide.id)
    if (!error) {
      showMsg('Banner berhasil dihapus.')
      await fetchSlides()
    }
  }

  async function handleMove(slide: HeroSlide, dir: -1 | 1) {
    const sorted = [...slides].sort((a, b) => a.order_index - b.order_index)
    const idx = sorted.findIndex((s) => s.id === slide.id)
    const target = sorted[idx + dir]
    if (!target) return
    const a = slide.order_index
    const b = target.order_index
    await Promise.all([
      supabase.from('hero_slides').update({ order_index: b }).eq('id', slide.id),
      supabase.from('hero_slides').update({ order_index: a }).eq('id', target.id),
    ])
    setSlides((prev) =>
      prev
        .map((s) => {
          if (s.id === slide.id) return { ...s, order_index: b }
          if (s.id === target.id) return { ...s, order_index: a }
          return s
        })
        .sort((x, y) => x.order_index - y.order_index)
    )
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle className="h-4 w-4 flex-shrink-0" /> {message}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <MonitorPlay className="h-5 w-5 text-brand-600" /> Kelola Banner / Slider Hero
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Kelola gambar slider di halaman utama. Banner aktif tampil di beranda sesuai urutan.
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus className="h-4 w-4" /> Tambah Banner
        </button>
      </div>

      {/* Form Tambah Banner */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Tambah Banner Baru</h3>
            <button onClick={() => setShowForm(false)} aria-label="Tutup form">
              <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label-field">Judul / Caption</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="contoh: Upacara Bendera Setiap Senin"
                className="input-field"
              />
            </div>
            <ImageUploader
              value={imageUrl}
              onChange={setImageUrl}
              folder="slides"
              bucket="hero-banners"
              label="Gambar Banner"
              helpText="Ukuran ideal 1920x1080. JPG, PNG, WebP — maks. 5MB."
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="btn-secondary px-4 py-2 text-sm">
                Batal
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Simpan Banner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daftar Slide */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-bold text-slate-800">Daftar Slider ({slides.length})</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          </div>
        ) : slides.length === 0 ? (
          <div className="p-12 text-center">
            <MonitorPlay className="mx-auto mb-3 h-12 w-12 text-slate-200" />
            <p className="text-sm text-slate-500">
              Belum ada banner. Klik &quot;Tambah Banner&quot; untuk menambahkan slider. Tanpa data,
              beranda memakai gambar bawaan (fallback).
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {slides.map((slide, i) => (
              <li key={slide.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5">
                <div className="relative h-24 w-full flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-16 sm:w-40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.image_url}
                    alt={slide.title || 'Banner'}
                    className="h-full w-full object-cover"
                  />
                  {!slide.is_active && (
                    <span className="absolute right-1 top-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] font-600 text-white">
                      Nonaktif
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-800">{slide.title || '—'}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Urutan {slide.order_index} · {slide.is_active ? 'Aktif' : 'Dinonaktifkan'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMove(slide, -1)}
                    disabled={i === 0}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                    aria-label="Naikkan urutan"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleMove(slide, 1)}
                    disabled={i === slides.length - 1}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                    aria-label="Turunkan urutan"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggle(slide)}
                    className={cn(
                      'rounded-lg border p-2 transition-colors',
                      slide.is_active
                        ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100'
                        : 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'
                    )}
                    aria-label={slide.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    {slide.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(slide)}
                    className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                    aria-label="Hapus banner"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
