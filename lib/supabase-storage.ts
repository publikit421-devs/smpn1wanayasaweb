import { supabase } from './supabase'

const DEFAULT_BUCKET = 'school-media'

function sanitizeFileName(name: string): string {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .toLowerCase()
    .slice(0, 40)
}

/**
 * Unggah file gambar ke Supabase Storage.
 * Nama file otomatis di-sanitasi + diberi timestamp & random suffix
 * agar tidak bentrok (contoh: `galeri/1722400000-ab12cd-kegiatan-ekstrakurikuler.png`).
 * Mengembalikan Public URL.
 *
 * @param bucket nama bucket storage (default `school-media`; untuk ekskul: `ekskul-media`)
 */
export async function uploadImage(file: File, folder = 'umum', bucket: string = DEFAULT_BUCKET): Promise<string> {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase()
  const base = sanitizeFileName(file.name)
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const path = `${folder}/${unique}-${base}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'image/png',
  })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Unggah gambar khusus modul ekstrakurikuler ke bucket `ekskul-media`.
 * Mengembalikan Public URL yang siap disimpan ke `ekskul_galleries.image_url`.
 */
export async function uploadEkskulImage(file: File, folder = 'galeri'): Promise<string> {
  return uploadImage(file, folder, 'ekskul-media')
}

/**
 * Hapus file dari Storage berdasarkan Public URL-nya.
 * Bucket & path diambil otomatis dari URL, sehingga aman untuk
 * file lama (bucket `berita-images`) maupun baru (`school-media`).
 */
export async function deleteImage(publicUrl: string): Promise<void> {
  try {
    const match = publicUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/)
    if (!match) return
    const [, bucket, path] = match
    await supabase.storage.from(bucket).remove([path])
  } catch {
    // Abaikan jika gagal dihapus
  }
}

// ====== Wrapper legacy (bucket `berita-images`) — kompatibilitas ======

export async function uploadImageToStorage(file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase()
  const base = sanitizeFileName(file.name)
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}.${ext}`

  const { error } = await supabase.storage.from('berita-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'image/png',
  })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('berita-images').getPublicUrl(path)
  return data.publicUrl
}

export async function deleteImageFromStorage(publicUrl: string): Promise<void> {
  return deleteImage(publicUrl)
}
