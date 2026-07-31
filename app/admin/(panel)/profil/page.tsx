'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { SchoolProfile } from '@/lib/supabase'
import {
  Loader2, Save, Building2, CheckCircle, AlertCircle, RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const emptyForm: Omit<SchoolProfile, 'id' | 'updated_at'> = {
  nama_sekolah: 'SMP Negeri 1 Wanayasa',
  npsn: '',
  akreditasi: '',
  alamat: '',
  kelurahan: '',
  kecamatan: '',
  kabupaten: '',
  provinsi: '',
  kodepos: '',
  telepon: '',
  email: '',
  website: '',
  logo_url: '',
  visi: '',
  misi: '',
  jam_layanan: '',
}

export default function AdminProfilPage() {
  const router = useRouter()
  const [profileId, setProfileId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchProfile = useCallback(() => {
    supabase.from('school_profiles').select('*').limit(1).then(({ data }) => {
      if (data && data.length > 0) {
        const p = data[0] as SchoolProfile
        setProfileId(p.id)
        setForm({
          nama_sekolah: p.nama_sekolah,
          npsn: p.npsn ?? '',
          akreditasi: p.akreditasi ?? '',
          alamat: p.alamat ?? '',
          kelurahan: p.kelurahan ?? '',
          kecamatan: p.kecamatan ?? '',
          kabupaten: p.kabupaten ?? '',
          provinsi: p.provinsi ?? '',
          kodepos: p.kodepos ?? '',
          telepon: p.telepon ?? '',
          email: p.email ?? '',
          website: p.website ?? '',
          logo_url: p.logo_url ?? '',
          visi: p.visi ?? '',
          misi: p.misi ?? '',
          jam_layanan: p.jam_layanan ?? '',
        })
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/admin/login')
    })
    fetchProfile()
  }, [router, fetchProfile])

  const set = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value })

  async function handleSave() {
    if (!form.nama_sekolah) {
      setMessage({ type: 'error', text: 'Nama sekolah wajib diisi.' })
      return
    }
    setSaving(true)
    setMessage(null)
    const payload = { ...form, updated_at: new Date().toISOString() }
    try {
      if (profileId) {
        await supabase.from('school_profiles').update(payload).eq('id', profileId)
      } else {
        await supabase.from('school_profiles').insert(payload)
      }
      setMessage({ type: 'success', text: 'Profil sekolah berhasil disimpan.' })
    } catch {
      setMessage({ type: 'error', text: 'Gagal menyimpan. Pastikan Supabase sudah dikonfigurasi.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={cn(
          'flex items-center gap-2 p-4 rounded-xl border text-sm',
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        )}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Data ini ditampilkan pada halaman portal (footer &amp; kontak).
            </p>
            <button onClick={fetchProfile} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors" title="Muat ulang">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Identitas */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-600" />
              <h2 className="font-700 text-slate-800">Identitas Sekolah</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="p-nama" className="label-field">Nama Sekolah *</label>
                <input id="p-nama" type="text" value={form.nama_sekolah} onChange={set('nama_sekolah')} className="input-field" />
              </div>
              <div>
                <label htmlFor="p-npsn" className="label-field">NPSN</label>
                <input id="p-npsn" type="text" value={form.npsn} onChange={set('npsn')} className="input-field" />
              </div>
              <div>
                <label htmlFor="p-akreditasi" className="label-field">Akreditasi</label>
                <input id="p-akreditasi" type="text" value={form.akreditasi} onChange={set('akreditasi')} placeholder="Contoh: A" className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="p-alamat" className="label-field">Alamat</label>
                <input id="p-alamat" type="text" value={form.alamat} onChange={set('alamat')} className="input-field" />
              </div>
              <div>
                <label htmlFor="p-kelurahan" className="label-field">Kelurahan</label>
                <input id="p-kelurahan" type="text" value={form.kelurahan} onChange={set('kelurahan')} className="input-field" />
              </div>
              <div>
                <label htmlFor="p-kecamatan" className="label-field">Kecamatan</label>
                <input id="p-kecamatan" type="text" value={form.kecamatan} onChange={set('kecamatan')} className="input-field" />
              </div>
              <div>
                <label htmlFor="p-kabupaten" className="label-field">Kabupaten / Kota</label>
                <input id="p-kabupaten" type="text" value={form.kabupaten} onChange={set('kabupaten')} className="input-field" />
              </div>
              <div>
                <label htmlFor="p-provinsi" className="label-field">Provinsi</label>
                <input id="p-provinsi" type="text" value={form.provinsi} onChange={set('provinsi')} className="input-field" />
              </div>
              <div>
                <label htmlFor="p-kodepos" className="label-field">Kode Pos</label>
                <input id="p-kodepos" type="text" value={form.kodepos} onChange={set('kodepos')} className="input-field" />
              </div>
              <div>
                <label htmlFor="p-logo" className="label-field">URL Logo</label>
                <input id="p-logo" type="text" value={form.logo_url} onChange={set('logo_url')} placeholder="/logo.svg" className="input-field" />
              </div>
            </div>
          </section>

          {/* Kontak */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-700 text-slate-800">Kontak</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="p-telp" className="label-field">Telepon</label>
                <input id="p-telp" type="text" value={form.telepon} onChange={set('telepon')} className="input-field" />
              </div>
              <div>
                <label htmlFor="p-email" className="label-field">Email</label>
                <input id="p-email" type="email" value={form.email} onChange={set('email')} className="input-field" />
              </div>
              <div>
                <label htmlFor="p-website" className="label-field">Website</label>
                <input id="p-website" type="text" value={form.website} onChange={set('website')} className="input-field" />
              </div>
              <div>
                <label htmlFor="p-jam" className="label-field">Jam Layanan</label>
                <input id="p-jam" type="text" value={form.jam_layanan} onChange={set('jam_layanan')} placeholder="Senin–Jumat 07.00–16.00" className="input-field" />
              </div>
            </div>
          </section>

          {/* Visi Misi */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-700 text-slate-800">Visi &amp; Misi</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="p-visi" className="label-field">Visi</label>
                <textarea id="p-visi" rows={5} value={form.visi} onChange={set('visi')} className="input-field resize-none" />
              </div>
              <div>
                <label htmlFor="p-misi" className="label-field">Misi</label>
                <textarea id="p-misi" rows={5} value={form.misi} onChange={set('misi')} className="input-field resize-none" />
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              id="save-profile-btn"
              onClick={handleSave}
              disabled={saving}
              className={cn('btn-primary justify-center px-6', saving && 'opacity-70 cursor-not-allowed')}
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Save className="w-4 h-4" /> Simpan Profil</>}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
