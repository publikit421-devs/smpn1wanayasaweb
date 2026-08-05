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
 * Unggah file gambar ke Supabase Storage bucket `school-media`.
 * Nama file otomatis di-sanitasi + diberi timestamp & random suffix
 * agar tidak bentrok (contoh: `berita/1722400000-ab12cd-kegiatan-ekstrakurikuler.png`).
 * Mengembalikan Public URL.
 */
export async function uploadImage(file: File, folder = 'umum'): Promise<string> {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase()
  const base = sanitizeFileName(file.name)
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const path = `${folder}/${unique}-${base}.${ext}`

  const { error } = await supabase.storage.from(DEFAULT_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'image/png',
  })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(DEFAULT_BUCKET).getPublicUrl(path)
  return data.publicUrl
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
