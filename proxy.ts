import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const ALLOWED_ROLES = new Set(['admin', 'operator_tu'])

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin/login/'

  // Baca + perbarui cookie sesi via @supabase/ssr
  const { supabase, supabaseResponse, user } = await updateSession(request)

  // Ambil role dari tabel public.profiles berdasarkan user.id
  let role: string | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    role = (data as { role?: string | null } | null)?.role ?? null
  }

  // User sudah login tapi membuka halaman login → alihkan
  if (isLoginPage) {
    if (user) {
      if (ALLOWED_ROLES.has(role ?? '')) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
    return supabaseResponse
  }

  // Rute /admin/*: wajib login
  if (!user) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Login tetapi role bukan admin/operator_tu → kembali ke homepage
  if (!ALLOWED_ROLES.has(role ?? '')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
