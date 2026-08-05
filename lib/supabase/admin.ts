import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEYS

/**
 * Klien Supabase dengan service role key — HANYA untuk Server.
 * Dipakai untuk Admin Auth API (membuat user tanpa me-logout admin aktif).
 * JANGAN pernah di-import dari kode client.
 */
export function createAdminClient() {
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY belum diatur di environment. Tambahkan ke .env.local dan Vercel.'
    )
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}