'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Extracurricular } from '@/lib/supabase'
import {
  UserCog, UserPlus, Mail, Lock, Users, Loader2, X, AlertCircle,
  CheckCircle, Trash2, KeyRound,
} from 'lucide-react'
import { createPembinaUser, deletePembinaUser, listPembinaUsers, updatePembinaEkskul } from './actions'

interface PembinaUser {
  id: string
  email: string
  full_name: string | null
  ekskul_id: string | null
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [ekskuls, setEkskuls] = useState<Extracurricular[]>([])
  const [users, setUsers] = useState<PembinaUser[]>([])

  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [ekskulId, setEkskulId] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/admin/login')
    })
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  async function loadData() {
    setLoading(true)
    const [ekResult, userResult] = await Promise.all([
      supabase.from('extracurriculars').select('*').eq('is_active', true).order('name', { ascending: true }),
      listPembinaUsers(),
    ])
    setEkskuls((ekResult.data as Extracurricular[]) || [])

    if (userResult.success) {
      setUsers(userResult.users)
    } else {
      setError(userResult.error)
    }
    setLoading(false)
  }

  function openAdd() {
    setEmail('')
    setFullName('')
    setPassword('')
    setEkskulId(ekskuls[0]?.id ?? '')
    setShowForm(true)
    setError(null)
    setMessage(null)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)

    const fd = new FormData()
    fd.set('email', email)
    fd.set('full_name', fullName)
    fd.set('password', password)
    fd.set('ekskul_id', ekskulId)

    const result = await createPembinaUser(fd)
    if (result.success) {
      setMessage(`Akun pembina "${result.fullName} (${result.email})" berhasil dibuat.`)
      setShowForm(false)
      await loadData()
    } else {
      setError(result.error)
    }
    setSaving(false)
  }

  async function handleDelete(userId: string) {
    if (!confirm('Hapus akun pembina ini? Tindakan ini tidak dapat dibatalkan.')) return
    const result = await deletePembinaUser(userId)
    if (result.success) {
      setMessage('Akun pembina berhasil dihapus.')
      await loadData()
    } else {
      setError(result.error ?? 'Gagal menghapus akun.')
    }
  }

  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function handleEkskulChange(userId: string, newEkskulId: string) {
    setUpdatingId(userId)
    setError(null)
    setMessage(null)
    const result = await updatePembinaEkskul(userId, newEkskulId)
    if (result.success) {
      setMessage('Tautan ekskul pembina diperbarui.')
      await loadData()
    } else {
      setError(result.error ?? 'Gagal memperbarui tautan ekskul.')
    }
    setUpdatingId(null)
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
            <UserCog className="h-5 w-5 text-brand-600" /> Manajemen Akun Pembina
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Daftarkan akun pembina ekstrakurikuler dan tautkan ke ekskul yang dikelola.
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <UserPlus className="h-4 w-4" /> Tambah Pembina
        </button>
      </div>

      {/* Form Tambah Pembina */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Buat Akun Pembina Baru</h3>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Tutup form">
              <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Email Pembina</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pembina@contoh.sch.id"
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="label-field">Nama Lengkap</label>
              <div className="relative">
                <Users className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama pembina (opsional)"
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="label-field">Password Sementara</label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 karakter"
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="label-field">Ekstrakurikuler</label>
              <select
                required
                value={ekskulId}
                onChange={(e) => setEkskulId(e.target.value)}
                className="input-field"
              >
                <option value="" disabled>Pilih ekskul</option>
                {(ekskuls || []).map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
            <Lock className="h-4 w-4 flex-shrink-0" />
            Akun dibuat via Auth Admin API, tanpa me-logout admin yang sedang aktif. Pembina hanya bisa
            mengelola ekskul yang dipilih.
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-4 py-2 text-sm">
              Batal
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Buat Akun
            </button>
          </div>
        </form>
      )}

      {/* Tabel Pengguna */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-bold text-slate-800">Daftar Pembina Ekstrakurikuler</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Belum ada pengguna. Klik &quot;Tambah Pembina&quot; untuk mulai.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-semibold">Nama</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Ekskul</th>
                  <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{u.full_name || '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{u.email}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={u.ekskul_id ?? ''}
                          onChange={(e) => handleEkskulChange(u.id, e.target.value)}
                          disabled={updatingId === u.id}
                          className="input-field w-auto max-w-[220px] py-1.5 text-xs"
                        >
                          <option value="">— Tidak ditautkan —</option>
                          {(ekskuls || []).map((e) => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                          ))}
                        </select>
                        {updatingId === u.id && <Loader2 className="h-4 w-4 animate-spin text-brand-500" />}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                        aria-label="Hapus pengguna"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}