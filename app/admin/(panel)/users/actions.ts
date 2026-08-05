'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type CreateUserResult =
  | { success: true; email: string; fullName: string }
  | { success: false; error: string }

export async function createPembinaUser(formData: FormData): Promise<CreateUserResult> {
  const email = (formData.get('email') as string)?.trim() ?? ''
  const fullName = (formData.get('full_name') as string)?.trim() ?? ''
  const password = (formData.get('password') as string) ?? ''
  const ekskulId = (formData.get('ekskul_id') as string)?.trim() ?? ''

  if (!email || !password || !ekskulId) {
    return { success: false, error: 'Email, kata sandi, dan ekstrakurikuler wajib diisi.' }
  }
  if (password.length < 8) {
    return { success: false, error: 'Kata sandi minimal 8 karakter.' }
  }

  // Verifikasi caller adalah admin (anon key — sesi terautentikasi)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Silakan login terlebih dahulu.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Hanya admin yang dapat membuat akun pembina.' }
  }

  // Admin Auth API dengan service role (tidak me-logout admin yang sedang aktif)
  let adminClient
  try {
    adminClient = createAdminClient()
  } catch (err) {
    return {
      success: false,
      error: (err as Error).message,
    }
  }

  const { error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: 'pembina',
      ekskul_id: ekskulId,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, email, fullName: fullName || email.split('@')[0] }
}

export async function listPembinaUsers(): Promise<
  { success: true; users: { id: string; email: string; full_name: string | null; ekskul_id: string | null }[] }
  | { success: false; error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Silakan login terlebih dahulu.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  if (profile?.role !== 'admin') return { success: false, error: 'Akses ditolak.' }

  let adminClient
  try {
    adminClient = createAdminClient()
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  // Profil (kolom role/full_name/ekskul_id) dari database
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, ekskul_id, role')
    .eq('role', 'pembina')
    .order('full_name', { ascending: true })

  if (error) return { success: false, error: error.message }

  const profiles = (data as { id: string; full_name: string | null; ekskul_id: string | null; role: string }[]) || []

  // Email dari auth.users via Admin API (profiles tidak menyimpan email)
  const { data: authData } = await adminClient.auth.admin.listUsers({ perPage: 1000 })
  const emailById = new Map((authData?.users || []).map((u) => [u.id, u.email]))

  return {
    success: true,
    users: profiles
      .filter((p) => emailById.has(p.id))
      .map((p) => ({
        id: p.id,
        email: emailById.get(p.id) ?? '',
        full_name: p.full_name,
        ekskul_id: p.ekskul_id,
      })),
  }
}

export async function deletePembinaUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Silakan login terlebih dahulu.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  if (profile?.role !== 'admin') return { success: false, error: 'Akses ditolak.' }

  let adminClient
  try {
    adminClient = createAdminClient()
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }

  const { error } = await adminClient.auth.admin.deleteUser(userId)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function updatePembinaEkskul(
  userId: string,
  ekskulId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Silakan login terlebih dahulu.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  if (profile?.role !== 'admin') return { success: false, error: 'Akses ditolak.' }

  const { error } = await supabase
    .from('profiles')
    .update({ ekskul_id: ekskulId || null })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}