'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Users,
  Image as ImageIcon,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Save,
  MapPin,
  Clock,
  X,
  School,
  LogOut,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { deleteImage } from '@/lib/supabase-storage'
import { syncExtracurricularsToSupabase } from '@/lib/ekskul-data'
import ImageUploader from '@/components/admin/ImageUploader'
import { revalidateEkskul } from './actions'
import type {
  Extracurricular,
  EkskulSchedule,
  EkskulCommittee,
  EkskulGallery,
} from '@/lib/supabase'

type TabId = 'jadwal' | 'kepengurusan' | 'galeri'

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

const tabConfig: Record<TabId, { label: string; icon: React.ElementType }> = {
  jadwal: { label: 'Jadwal Kegiatan', icon: Calendar },
  kepengurusan: { label: 'Kepengurusan', icon: Users },
  galeri: { label: 'Galeri Foto', icon: ImageIcon },
}

const emptySchedule: Omit<EkskulSchedule, 'id' | 'ekskul_id' | 'created_at'> = {
  day: 'Senin',
  time: '',
  location: '',
  notes: '',
  order_index: 0,
}

const emptyCommittee: Omit<EkskulCommittee, 'id' | 'ekskul_id' | 'created_at'> = {
  position: '',
  student_name: '',
  class_name: '',
  order_index: 0,
}

export default function PembinaDashboard() {
  const router = useRouter()
  const [ekskuls, setEkskuls] = React.useState<Extracurricular[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<TabId>('jadwal')

  const [schedules, setSchedules] = React.useState<EkskulSchedule[]>([])
  const [committees, setCommittees] = React.useState<EkskulCommittee[]>([])
  const [galleries, setGalleries] = React.useState<EkskulGallery[]>([])

  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  // Form Jadwal
  const [scheduleForm, setScheduleForm] = React.useState(emptySchedule)
  const [editingScheduleId, setEditingScheduleId] = React.useState<string | null>(null)
  const [showScheduleForm, setShowScheduleForm] = React.useState(false)

  // Form Kepengurusan
  const [committeeForm, setCommitteeForm] = React.useState(emptyCommittee)
  const [editingCommitteeId, setEditingCommitteeId] = React.useState<string | null>(null)
  const [showCommitteeForm, setShowCommitteeForm] = React.useState(false)

  // Form Galeri
  const [galleryImageUrl, setGalleryImageUrl] = React.useState<string | null>(null)
  const [galleryTitle, setGalleryTitle] = React.useState('')
  const [galleryCaption, setGalleryCaption] = React.useState('')
  const [galleryDate, setGalleryDate] = React.useState('')
  const [showGalleryForm, setShowGalleryForm] = React.useState(false)

  const selected = ekskuls.find((e) => e.id === selectedId) || null

  const [lockedEkskulId, setLockedEkskulId] = React.useState<string | null>(null)
  const [role, setRole] = React.useState<string | null>(null)

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(null), 3000)
  }
  const showError = (msg: string) => {
    setError(msg)
    setTimeout(() => setError(null), 3000)
  }

  // Auth guard
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/pembina/login')
    })
  }, [router])

  // Load daftar ekskul (auto-sync data lokal ke Supabase terlebih dahulu)
  React.useEffect(() => {
    let active = true

    const load = async () => {
      try {
        await syncExtracurricularsToSupabase()
      } catch {
        // abaikan jika gagal sync
      }

      // Ambil profil pengguna untuk mengetahui role & ekskul yang ditautkan
      const {
        data: { user },
      } = await supabase.auth.getUser()
      let userRole: string | null = null
      let userEkskul: string | null = null
      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('role, ekskul_id')
          .eq('id', user.id)
          .maybeSingle()
        userRole = prof?.role ?? null
        userEkskul = prof?.ekskul_id ?? null
      }

      const { data, error } = await supabase
        .from('extracurriculars')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (!active) return
      setLoading(false)
      if (error) {
        showError('Gagal memuat data ekskul: ' + error.message)
        return
      }
      let list = (data as Extracurricular[]) || []

      // Lock filter untuk pembina: hanya ekskul miliknya
      if (userRole === 'pembina') {
        setRole('pembina')
        setLockedEkskulId(userEkskul)
        list = userEkskul ? list.filter((e) => e.id === userEkskul) : []
      } else {
        setRole(userRole)
        setLockedEkskulId(null)
      }

      setEkskuls(list)
      if (list.length > 0) setSelectedId((prev) => prev ?? list[0].id)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  // Load data detail saat ekskul terpilih
  React.useEffect(() => {
    if (!selectedId) return
    let active = true

    Promise.all([
      supabase.from('ekskul_schedules').select('*').eq('ekskul_id', selectedId).order('order_index', { ascending: true }),
      supabase.from('ekskul_committees').select('*').eq('ekskul_id', selectedId).order('order_index', { ascending: true }),
      supabase.from('ekskul_galleries').select('*').eq('ekskul_id', selectedId).order('order_index', { ascending: true }),
    ]).then(([s, c, g]) => {
      if (!active) return
      setSchedules((s.data as EkskulSchedule[]) || [])
      setCommittees((c.data as EkskulCommittee[]) || [])
      setGalleries((g.data as EkskulGallery[]) || [])
    })

    return () => {
      active = false
    }
  }, [selectedId])

  function refreshAll() {
    if (!selectedId) return
    Promise.all([
      supabase.from('ekskul_schedules').select('*').eq('ekskul_id', selectedId).order('order_index', { ascending: true }),
      supabase.from('ekskul_committees').select('*').eq('ekskul_id', selectedId).order('order_index', { ascending: true }),
      supabase.from('ekskul_galleries').select('*').eq('ekskul_id', selectedId).order('order_index', { ascending: true }),
    ]).then(([s, c, g]) => {
      setSchedules((s.data as EkskulSchedule[]) || [])
      setCommittees((c.data as EkskulCommittee[]) || [])
      setGalleries((g.data as EkskulGallery[]) || [])
    })
  }

  // ===== Jadwal =====
  function openAddSchedule() {
    setScheduleForm({ ...emptySchedule, order_index: schedules.length + 1 })
    setEditingScheduleId(null)
    setShowScheduleForm(true)
    setError(null)
  }

  function openEditSchedule(s: EkskulSchedule) {
    setScheduleForm({ day: s.day, time: s.time, location: s.location || '', notes: s.notes || '', order_index: s.order_index })
    setEditingScheduleId(s.id)
    setShowScheduleForm(true)
    setError(null)
  }

  async function saveSchedule() {
    if (!selectedId) return
    if (!scheduleForm.time.trim()) {
      showError('Jam latihan wajib diisi.')
      return
    }
    setSaving(true)
    try {
      if (editingScheduleId) {
        await supabase
          .from('ekskul_schedules')
          .update(scheduleForm)
          .eq('id', editingScheduleId)
      } else {
        await supabase
          .from('ekskul_schedules')
          .insert({ ...scheduleForm, ekskul_id: selectedId })
      }
      setShowScheduleForm(false)
      refreshAll()
      showMessage(editingScheduleId ? 'Jadwal berhasil diperbarui.' : 'Jadwal berhasil ditambahkan.')
    } catch {
      showError('Gagal menyimpan jadwal.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteSchedule(id: string) {
    if (!confirm('Yakin ingin menghapus jadwal ini?')) return
    await supabase.from('ekskul_schedules').delete().eq('id', id)
    refreshAll()
  }

  // ===== Kepengurusan =====
  function openAddCommittee() {
    setCommitteeForm({ ...emptyCommittee, order_index: committees.length + 1 })
    setEditingCommitteeId(null)
    setShowCommitteeForm(true)
    setError(null)
  }

  function openEditCommittee(c: EkskulCommittee) {
    setCommitteeForm({ position: c.position, student_name: c.student_name, class_name: c.class_name || '', order_index: c.order_index })
    setEditingCommitteeId(c.id)
    setShowCommitteeForm(true)
    setError(null)
  }

  async function saveCommittee() {
    if (!selectedId) return
    if (!committeeForm.position.trim() || !committeeForm.student_name.trim()) {
      showError('Jabatan dan nama siswa wajib diisi.')
      return
    }
    setSaving(true)
    try {
      if (editingCommitteeId) {
        await supabase
          .from('ekskul_committees')
          .update(committeeForm)
          .eq('id', editingCommitteeId)
      } else {
        await supabase
          .from('ekskul_committees')
          .insert({ ...committeeForm, ekskul_id: selectedId })
      }
      setShowCommitteeForm(false)
      refreshAll()
      showMessage(editingCommitteeId ? 'Pengurus berhasil diperbarui.' : 'Pengurus berhasil ditambahkan.')
    } catch {
      showError('Gagal menyimpan pengurus.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteCommittee(id: string) {
    if (!confirm('Yakin ingin menghapus pengurus ini?')) return
    await supabase.from('ekskul_committees').delete().eq('id', id)
    refreshAll()
  }

  // ===== Galeri =====
  function openAddGallery() {
    setGalleryImageUrl(null)
    setGalleryTitle('')
    setGalleryCaption('')
    setGalleryDate('')
    setShowGalleryForm(true)
    setError(null)
  }

  async function saveGallery() {
    if (!selectedId) return
    if (!galleryImageUrl) {
      showError('Silakan unggah foto terlebih dahulu.')
      return
    }
    setSaving(true)
    try {
      await supabase.from('ekskul_galleries').insert({
        ekskul_id: selectedId,
        image_url: galleryImageUrl,
        title: galleryTitle || null,
        caption: galleryCaption || null,
        activity_date: galleryDate || new Date().toISOString().slice(0, 10),
        order_index: galleries.length + 1,
      })
      setShowGalleryForm(false)
      refreshAll()
      showMessage('Foto berhasil ditambahkan ke galeri.')
      if (selected?.slug) await revalidateEkskul(selected.slug)
    } catch {
      showError('Gagal menyimpan foto galeri.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteGallery(g: EkskulGallery) {
    if (!confirm('Yakin ingin menghapus foto ini?')) return
    if (g.image_url) await deleteImage(g.image_url)
    await supabase.from('ekskul_galleries').delete().eq('id', g.id)
    refreshAll()
    if (selected?.slug) await revalidateEkskul(selected.slug)
  }

  const selectedName = selected?.name || 'Ekstrakurikuler'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/pembina/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800">
                <School className="h-6 w-6 text-brand-600" />
                Dasbor Pembina Ekstrakurikuler
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Kelola jadwal, kepengurusan, dan galeri foto kegiatan secara mandiri.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Ekskul:</span>
              <select
                value={selectedId || ''}
                onChange={(e) => setSelectedId(e.target.value || null)}
                className="input-field w-auto"
                disabled={role === 'pembina'}
              >
                {(ekskuls || []).map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
              {role === 'pembina' && (
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                  Akses terbatas
                </span>
              )}
            </div>
            <button
              id="pembina-logout-btn"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle className="h-4 w-4 flex-shrink-0" /> {message}
          </div>
        )}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
          </div>
        )}

        {ekskuls.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <School className="mx-auto mb-3 h-12 w-12 text-slate-200" />
            {role === 'pembina' ? (
              <>
                <p className="font-semibold text-slate-700">Akun belum ditautkan ke ekskul</p>
                <p className="mt-1 text-sm text-slate-500">
                  Akun pembina ini belum memiliki ekstrakurikuler. Silakan hubungi admin untuk menautkan
                  ekskul di menu <code>Akun Pembina</code>.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-slate-700">Belum ada ekstrakurikuler aktif</p>
                <p className="mt-1 text-sm text-slate-500">
                  Tambahkan data ekstrakurikuler di tabel <code>extracurriculars</code> terlebih dahulu.
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="mb-8 flex flex-wrap gap-2 border-b border-slate-200">
              {(Object.keys(tabConfig) as TabId[]).map((tab) => {
                const isActive = tab === activeTab
                const { label, icon: Icon } = tabConfig[tab]
                const count =
                  tab === 'jadwal'
                    ? schedules.length
                    : tab === 'kepengurusan'
                      ? committees.length
                      : galleries.length
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors -mb-px',
                      isActive ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    {count > 0 && (
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', isActive ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600')}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* ===== TAB JADWAL ===== */}
            {activeTab === 'jadwal' && (
              <section aria-label="Manajemen Jadwal" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">Jadwal Latihan {selectedName}</h2>
                  <button onClick={openAddSchedule} className="btn-primary text-sm px-4 py-2">
                    <Plus className="h-4 w-4" /> Tambah Jadwal
                  </button>
                </div>

                {showScheduleForm && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-bold text-slate-800">{editingScheduleId ? 'Edit Jadwal' : 'Tambah Jadwal'}</h3>
                      <button onClick={() => setShowScheduleForm(false)} aria-label="Tutup form">
                        <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="label-field">Hari</label>
                        <select
                          value={scheduleForm.day}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                          className="input-field"
                        >
                          {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label-field">Jam</label>
                        <input
                          type="text"
                          placeholder="15:00-17:00"
                          value={scheduleForm.time}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label-field">Lokasi</label>
                        <input
                          type="text"
                          placeholder="Ruang PMR / Lapangan"
                          value={scheduleForm.location || ''}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label-field">Urutan</label>
                        <input
                          type="number"
                          value={scheduleForm.order_index}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, order_index: Number(e.target.value) || 0 })}
                          className="input-field"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="label-field">Catatan</label>
                        <textarea
                          placeholder="Catatan kegiatan (opsional)"
                          value={scheduleForm.notes || ''}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                          className="input-field"
                          rows={2}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button onClick={() => setShowScheduleForm(false)} className="btn-secondary text-sm px-4 py-2">
                        Batal
                      </button>
                      <button onClick={saveSchedule} disabled={saving} className="btn-primary text-sm px-4 py-2">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Simpan Jadwal
                      </button>
                    </div>
                  </div>
                )}

                {(schedules || []).length === 0 && !showScheduleForm ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                    <Calendar className="mx-auto mb-3 h-12 w-12 text-slate-200" />
                    <p className="text-slate-500 text-sm">Belum ada jadwal. Klik &quot;Tambah Jadwal&quot; untuk memulai.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(schedules || []).map((s) => (
                      <div key={s.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                            <Calendar className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">{s.day}</span>
                              <span className="flex items-center gap-1 text-sm text-slate-500"><Clock className="h-3.5 w-3.5" />{s.time}</span>
                            </div>
                            {s.location && (
                              <p className="mt-1 flex items-center gap-1 text-sm text-slate-600"><MapPin className="h-3.5 w-3.5" />{s.location}</p>
                            )}
                            {s.notes && <p className="mt-1 text-sm text-slate-500 italic">{s.notes}</p>}
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <button onClick={() => openEditSchedule(s)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="Edit jadwal">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => deleteSchedule(s.id)} className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100" aria-label="Hapus jadwal">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ===== TAB KEPENGURUSAN ===== */}
            {activeTab === 'kepengurusan' && (
              <section aria-label="Manajemen Kepengurusan" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">Struktur Pengurus {selectedName}</h2>
                  <button onClick={openAddCommittee} className="btn-primary text-sm px-4 py-2">
                    <Plus className="h-4 w-4" /> Tambah Pengurus
                  </button>
                </div>

                {showCommitteeForm && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-bold text-slate-800">{editingCommitteeId ? 'Edit Pengurus' : 'Tambah Pengurus'}</h3>
                      <button onClick={() => setShowCommitteeForm(false)} aria-label="Tutup form">
                        <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="label-field">Jabatan</label>
                        <input
                          type="text"
                          placeholder="Ketua / Wakil / Sekretaris / Bendahara / Anggota"
                          value={committeeForm.position}
                          onChange={(e) => setCommitteeForm({ ...committeeForm, position: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label-field">Nama Siswa</label>
                        <input
                          type="text"
                          placeholder="Nama lengkap siswa"
                          value={committeeForm.student_name}
                          onChange={(e) => setCommitteeForm({ ...committeeForm, student_name: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label-field">Kelas</label>
                        <input
                          type="text"
                          placeholder="IX-A"
                          value={committeeForm.class_name || ''}
                          onChange={(e) => setCommitteeForm({ ...committeeForm, class_name: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label-field">Urutan</label>
                        <input
                          type="number"
                          value={committeeForm.order_index}
                          onChange={(e) => setCommitteeForm({ ...committeeForm, order_index: Number(e.target.value) || 0 })}
                          className="input-field"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button onClick={() => setShowCommitteeForm(false)} className="btn-secondary text-sm px-4 py-2">
                        Batal
                      </button>
                      <button onClick={saveCommittee} disabled={saving} className="btn-primary text-sm px-4 py-2">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Simpan Pengurus
                      </button>
                    </div>
                  </div>
                )}

                {(committees || []).length === 0 && !showCommitteeForm ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                    <Users className="mx-auto mb-3 h-12 w-12 text-slate-200" />
                    <p className="text-slate-500 text-sm">Belum ada pengurus. Klik &quot;Tambah Pengurus&quot; untuk memulai.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(committees || []).map((c) => (
                      <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{c.position}</p>
                            <h3 className="mt-1 font-bold text-slate-800">{c.student_name}</h3>
                            {c.class_name && <p className="text-sm text-slate-500">{c.class_name}</p>}
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => openEditCommittee(c)} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50" aria-label="Edit pengurus">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => deleteCommittee(c.id)} className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100" aria-label="Hapus pengurus">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ===== TAB GALERI ===== */}
            {activeTab === 'galeri' && (
              <section aria-label="Manajemen Galeri" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">Galeri Foto {selectedName}</h2>
                  <button onClick={openAddGallery} className="btn-primary text-sm px-4 py-2">
                    <Plus className="h-4 w-4" /> Tambah Foto
                  </button>
                </div>

                {showGalleryForm && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-bold text-slate-800">Tambah Foto Kegiatan</h3>
                      <button onClick={() => setShowGalleryForm(false)} aria-label="Tutup form">
                        <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                      </button>
                    </div>
                    <ImageUploader
                      value={galleryImageUrl}
                      onChange={setGalleryImageUrl}
                      folder="galeri"
                      bucket="ekskul-media"
                      label="Foto Kegiatan"
                      helpText="JPG, PNG, WebP — maks. 5MB. Disimpan ke Supabase Storage (ekskul-media)."
                    />
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="label-field">Judul</label>
                        <input
                          type="text"
                          placeholder="Judul foto (opsional)"
                          value={galleryTitle}
                          onChange={(e) => setGalleryTitle(e.target.value)}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label-field">Tanggal Kegiatan</label>
                        <input
                          type="date"
                          value={galleryDate}
                          onChange={(e) => setGalleryDate(e.target.value)}
                          className="input-field"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="label-field">Keterangan</label>
                        <textarea
                          placeholder="Keterangan foto (opsional)"
                          value={galleryCaption}
                          onChange={(e) => setGalleryCaption(e.target.value)}
                          className="input-field"
                          rows={2}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button onClick={() => setShowGalleryForm(false)} className="btn-secondary text-sm px-4 py-2">
                        Batal
                      </button>
                      <button onClick={saveGallery} disabled={saving} className="btn-primary text-sm px-4 py-2">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Simpan Foto
                      </button>
                    </div>
                  </div>
                )}

                {(galleries || []).length === 0 && !showGalleryForm ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                    <ImageIcon className="mx-auto mb-3 h-12 w-12 text-slate-200" />
                    <p className="text-slate-500 text-sm">Belum ada foto. Klik &quot;Tambah Foto&quot; untuk mulai.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {(galleries || []).map((g) => (
                      <div key={g.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={g.image_url}
                          alt={g.title || g.caption || 'Foto kegiatan'}
                          className="h-40 w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <button onClick={() => deleteGallery(g)} className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700" aria-label="Hapus foto">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {(g.title || g.caption) && (
                          <div className="px-3 py-2">
                            <p className="truncate text-sm font-semibold text-slate-700">{g.title || g.caption}</p>
                            {g.activity_date && (
                              <p className="text-xs text-slate-400">
                                {new Date(g.activity_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
