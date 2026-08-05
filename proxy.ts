import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const ALLOWED_ROLES = new Set(['admin', 'operator_tu'])

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminArea = pathname === '/admin' || pathname.startsWith('/admin')
  const isPembinaArea = pathname === '/pembina' || pathname.startsWith('/pembina')
  const isAdminLogin = pathname === '/admin/login' || pathname === '/admin/login/'
  const isPembinaLogin = pathname === '/pembina/login' || pathname === '/pembina/login/'

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

  // Halaman login: arahkan pengguna yang sudah login sesuai role
  if (isAdminLogin || isPembinaLogin) {
    if (user) {
      if (isPembinaLogin) {
        if (role === 'pembina') return NextResponse.redirect(new URL('/pembina/dashboard', request.url))
        if (ALLOWED_ROLES.has(role ?? '')) return NextResponse.redirect(new URL('/admin', request.url))
      } else {
        if (ALLOWED_ROLES.has(role ?? '')) return NextResponse.redirect(new URL('/admin', request.url))
        if (role === 'pembina') return NextResponse.redirect(new URL('/pembina/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
    return supabaseResponse
  }

  // Belum login → arahkan ke halaman login yang sesuai
  if (!user) {
    if (isAdminArea) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (isPembinaArea) {
      const loginUrl = new URL('/pembina/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return supabaseResponse
  }

  // Rute /admin/*: wajib role admin/operator_tu
  if (isAdminArea && !ALLOWED_ROLES.has(role ?? '')) {
    if (role === 'pembina') return NextResponse.redirect(new URL('/pembina/dashboard', request.url))
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Rute /pembina/*: wajib role pembina
  if (isPembinaArea && role !== 'pembina') {
    if (ALLOWED_ROLES.has(role ?? '')) return NextResponse.redirect(new URL('/admin', request.url))
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/pembina/:path*'],
}