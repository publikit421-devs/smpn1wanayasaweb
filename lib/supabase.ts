import { supabase } from './supabase/client'

export { supabase }

// ====== Type Definitions ======

export interface Announcement {
  id: string
  title: string
  slug: string
  content: string
  category: 'pengumuman' | 'berita' | 'agenda'
  image_url?: string
  is_pinned: boolean
  is_published: boolean
  published_at: string
  created_at: string
  updated_at: string
}

export type ServiceType =
  | 'informasi-publik'
  | 'pengaduan'
  | 'legalisasi-ijazah'
  | 'izin-siswa'
  | 'penelitian'
  | 'mutasi-siswa'

export type ServiceStatus = 'masuk' | 'diproses' | 'selesai' | 'ditolak'

export interface PublicService {
  id: string
  service_type: ServiceType
  nama_pemohon: string
  nik?: string
  alamat?: string
  no_telepon: string
  email?: string
  payload: Record<string, unknown>
  status: ServiceStatus
  catatan_admin?: string
  nomor_registrasi?: string
  created_at: string
  updated_at: string
}

export interface SKMFeedback {
  id: string
  service_id?: string
  service_type: ServiceType
  rating: 1 | 2 | 3 | 4 | 5
  komentar?: string
  created_at: string
}

export interface SchoolProfile {
  id: string
  nama_sekolah: string
  npsn?: string
  akreditasi?: string
  alamat?: string
  kelurahan?: string
  kecamatan?: string
  kabupaten?: string
  provinsi?: string
  kodepos?: string
  telepon?: string
  email?: string
  website?: string
  logo_url?: string
  visi?: string
  misi?: string
  jam_layanan?: string
  updated_at: string
}

export interface Staff {
  id: string
  nama: string
  nip?: string
  gelar?: string
  role?: string
  bidang?: string
  jenis: 'guru' | 'staf'
  jenis_ptk?: 'Guru' | 'Tenaga Kependidikan' | 'Kepala Sekolah'
  jabatan?: string
  email?: string
  telepon?: string
  urutan?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type KegiatanCategory = 'intrakurikuler' | 'ekstrakurikuler' | 'kokurikuler'
export interface Kegiatan {
  id: string
  title: string
  description?: string
  category: KegiatanCategory
  image_url?: string
  pembina?: string
  urutan?: number
  slug?: string
  tanggal?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SpmbSetting {
  id: string
  tahun_ajaran?: string
  judul?: string
  deskripsi?: string
  alur?: string[]
  syarat?: string[]
  status_buka: boolean
  brosur_url?: string
  tanggal_buka?: string
  tanggal_tutup?: string
  kuota?: number
  updated_at: string
}

export interface StudentAgeGroup {
  label: string
  total: number
  laki: number
  perempuan: number
}

export interface StudentReligion {
  label: string
  total: number
  laki: number
  perempuan: number
}

export interface StudentStats {
  id: string
  tahun_ajaran: string
  total: number
  laki: number
  perempuan: number
  usia: StudentAgeGroup[]
  agama: StudentReligion[]
  updated_at: string
}

export interface GalleryItem {
  id: string
  image_url: string
  caption?: string
  urutan?: number
  is_active: boolean
  created_at: string
}

// ====== Ekstrakurikuler Types ======

export interface Extracurricular {
  id: string
  slug: string
  name: string
  category: string
  description?: string
  instructors?: string
  logo_url?: string
  banner_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EkskulSchedule {
  id: string
  ekskul_id: string
  day: string
  time: string
  location?: string
  notes?: string
  order_index: number
  created_at: string
}

export interface EkskulCommittee {
  id: string
  ekskul_id: string
  position: string
  student_name: string
  class_name?: string
  order_index: number
  photo_url?: string
  created_at: string
}

export interface EkskulGallery {
  id: string
  ekskul_id: string
  title?: string
  image_url: string
  activity_date?: string
  caption?: string
  order_index: number
  created_at: string
}

export type UserRole = 'admin' | 'operator_tu' | 'public'
export interface UserProfile {
  id: string
  full_name?: string | null
  nip?: string | null
  role: UserRole
  avatar_url?: string | null
  created_at: string
  updated_at: string
}

// ====== Query Helpers ======

export async function getPublishedAnnouncements(limit = 6) {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_published', true)
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Announcement[]
}

export async function getStudentStats(): Promise<StudentStats | null> {
  const { data, error } = await supabase
    .from('student_stats')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return null
  return data as StudentStats | null
}

export async function submitServiceRequest(
  payload: Omit<PublicService, 'id' | 'status' | 'nomor_registrasi' | 'created_at' | 'updated_at' | 'catatan_admin'>
) {
  const { data, error } = await supabase.rpc('submit_service_request', {
    p_service_type: payload.service_type,
    p_nama_pemohon: payload.nama_pemohon,
    p_no_telepon: payload.no_telepon,
    p_nik: payload.nik ?? null,
    p_alamat: payload.alamat ?? null,
    p_email: payload.email ?? null,
    p_payload: payload.payload ?? {},
  })

  if (error) throw error
  return data as PublicService
}

export interface LayananRequest {
  id: string
  nama_lengkap: string
  nik?: string
  no_telepon: string
  email?: string
  alamat?: string
  informasi_diminta: string
  tujuan_penggunaan?: string
  cara_perolehan?: string
  nomor_registrasi?: string
  status: string
  created_at: string
}

/**
 * Kirim permohonan layanan informasi publik ke tabel layanan_requests.
 * nomor_registrasi dibuat di frontend agar bisa langsung ditampilkan ke
 * pengunjung (anon tidak bisa SELECT, jadi tidak bisa membaca hasil insert).
 */
export async function submitLayananRequest(payload: {
  nama_lengkap: string
  nik?: string
  no_telepon: string
  email?: string
  alamat?: string
  informasi_diminta: string
  tujuan_penggunaan?: string
  cara_perolehan?: string
}) {
  const nomorRegistrasi = `SMPN1/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`

  const { error } = await supabase
    .from('layanan_requests')
    .insert({ ...payload, nomor_registrasi: nomorRegistrasi })

  if (error) {
    console.error('Supabase Submit Error:', error)
    throw error
  }

  return { nomor_registrasi: nomorRegistrasi }
}

export async function submitSKMFeedback(
  payload: Omit<SKMFeedback, 'id' | 'created_at'>
) {
  const { data, error } = await supabase
    .from('skm_feedbacks')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data as SKMFeedback
}

// ====== Profil Pengguna (Auth) ======

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data as UserProfile | null
}

export async function getCurrentProfile() {
  const { data } = await supabase.auth.getSession()
  const user = data.session?.user
  if (!user) return null
  return getProfile(user.id)
}

export async function updateProfile(
  userId: string,
  payload: Partial<Pick<UserProfile, 'full_name' | 'nip' | 'avatar_url'>>
) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as UserProfile
}

// ====== Ekstrakurikuler Helpers ======

export async function getExtracurriculars(): Promise<Extracurricular[]> {
  const { data, error } = await supabase
    .from('extracurriculars')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) throw error
  return data as Extracurricular[]
}

export async function getExtracurricularBySlug(slug: string): Promise<Extracurricular | null> {
  const { data, error } = await supabase
    .from('extracurriculars')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw error
  return data as Extracurricular | null
}

export async function getEkskulSchedules(ekskulId: string): Promise<EkskulSchedule[]> {
  const { data, error } = await supabase
    .from('ekskul_schedules')
    .select('*')
    .eq('ekskul_id', ekskulId)
    .order('order_index', { ascending: true })

  if (error) throw error
  return data as EkskulSchedule[]
}

export async function getEkskulCommittees(ekskulId: string): Promise<EkskulCommittee[]> {
  const { data, error } = await supabase
    .from('ekskul_committees')
    .select('*')
    .eq('ekskul_id', ekskulId)
    .order('order_index', { ascending: true })

  if (error) throw error
  return data as EkskulCommittee[]
}

export async function getEkskulGalleries(ekskulId: string): Promise<EkskulGallery[]> {
  const { data, error } = await supabase
    .from('ekskul_galleries')
    .select('*')
    .eq('ekskul_id', ekskulId)
    .order('order_index', { ascending: true })

  if (error) throw error
  return data as EkskulGallery[]
}
