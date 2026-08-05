'use client'

import * as React from 'react'
import { ImagePlus, Loader2, Copy, Check, Trash2, RefreshCw } from 'lucide-react'
import { uploadImage, deleteImage } from '@/lib/supabase-storage'
import { cn } from '@/lib/utils'

interface ImageUploaderProps {
  /** URL gambar saat ini (dari DB atau hasil unggah) */
  value?: string | null
  /** Dipanggil dengan URL baru saat unggah sukses, atau null saat dihapus */
  onChange: (url: string | null) => void
  /** Sub-folder di bucket (mis. 'berita', 'kegiatan', 'galeri') */
  folder?: string
  /** Nama bucket storage (default 'school-media'; untuk ekskul pakai 'ekskul-media') */
  bucket?: string
  label?: string
  helpText?: string
  maxSizeMB?: number
}

export default function ImageUploader({
  value,
  onChange,
  folder = 'umum',
  bucket = 'school-media',
  label = 'Gambar',
  helpText = 'JPG, PNG, WebP — maks. 5MB',
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  async function handleFile(file: File | undefined | null) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('File yang dipilih harus berupa gambar (JPG, PNG, WebP, dst.).')
      return
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Ukuran file maksimal ${maxSizeMB}MB.`)
      return
    }
    setUploading(true)
    setError(null)
    try {
      const url = await uploadImage(file, folder, bucket)
      onChange(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengunggah gambar.')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    if (value) await deleteImage(value)
    onChange(null)
  }

  async function handleCopy() {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Abaikan jika clipboard tidak diizinkan
    }
  }

  // ===== Mode: sudah ada gambar (preview + aksi) =====
  if (value) {
    return (
      <div>
        {label && <span className="label-field">{label}</span>}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Pratinjau gambar"
              className="h-56 w-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/50 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <span className="text-sm font-600 text-white">Mengunggah gambar...</span>
                <div className="h-1.5 w-1/2 max-w-[200px] overflow-hidden rounded-full bg-white/30">
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-white" />
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-white p-3">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-600 text-slate-600 transition-colors hover:bg-slate-50"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'URL Tersalin!' : 'Salin URL Gambar'}
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-600 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Ganti Gambar
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-600 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Hapus Gambar
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>
    )
  }

  // ===== Mode: belum ada gambar (dropzone) =====
  return (
    <div>
      {label && <span className="label-field">{label}</span>}
      <div
        role="button"
        tabIndex={0}
        aria-label="Unggah gambar"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFile(e.dataTransfer.files?.[0])
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-slate-50 px-4 py-10 text-center transition-colors',
          dragOver ? 'border-brand-400 bg-brand-50' : 'border-slate-300 hover:border-brand-400 hover:bg-brand-50'
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
            <span className="text-sm font-600 text-slate-600">Mengunggah gambar...</span>
            <div className="h-1.5 w-1/2 max-w-[220px] overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-brand-500" />
            </div>
          </>
        ) : (
          <>
            <ImagePlus className="h-8 w-8 text-slate-400" />
            <span className="text-sm font-600 text-slate-600">
              Tarik &amp; lepas gambar di sini, atau klik untuk memilih
            </span>
            <span className="text-xs text-slate-400">{helpText}</span>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      {error && <p className="mt-2 text-xs font-500 text-red-600">{error}</p>}
    </div>
  )
}
