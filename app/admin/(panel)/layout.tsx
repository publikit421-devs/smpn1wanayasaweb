'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  GraduationCap, LayoutDashboard, Building2, Users, CalendarDays,
  Newspaper, Ticket, FileText, LogOut, Menu, X, Images,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navGroups = [
  {
    label: 'Menu Utama',
    items: [{ href: '/admin/dashboard', label: 'Dasbor', icon: LayoutDashboard }],
  },
  {
    label: 'Konten Sekolah',
    items: [
      { href: '/admin/profil', label: 'Profil & Kontak', icon: Building2 },
      { href: '/admin/guru-staff', label: 'Data Guru & Staf', icon: Users },
      { href: '/admin/kegiatan-spmb', label: 'Kegiatan & SPMB', icon: CalendarDays },
      { href: '/admin/berita', label: 'Berita & Pengumuman', icon: Newspaper },
      { href: '/admin/galeri', label: 'Galeri Foto', icon: Images },
    ],
  },
  {
    label: 'Layanan & Tiket',
    items: [
      { href: '/admin/tiket-skm', label: 'Tiket & Laporan SKM', icon: Ticket },
      { href: '/admin/permohonan', label: 'Permohonan', icon: FileText },
    ],
  },
]

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dasbor Admin',
  '/admin/profil': 'Profil Sekolah & Kontak',
  '/admin/guru-staff': 'Data Guru & Staf',
  '/admin/kegiatan-spmb': 'Kegiatan & SPMB',
  '/admin/berita': 'Berita & Pengumuman',
  '/admin/galeri': 'Galeri Foto',
  '/admin/tiket-skm': 'Tiket Layanan & Laporan SKM',
  '/admin/permohonan': 'Monitoring Permohonan',
}

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/admin/login')
    })
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const title = pageTitles[pathname] ?? 'Admin Panel'

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 flex flex-col transition-transform duration-300',
          'md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-700 text-white leading-tight">SMPN 1 Wanayasa</p>
              <p className="text-xs text-slate-400">Admin CMS</p>
            </div>
            <button
              className="md:hidden ml-auto p-1.5 rounded-lg text-slate-400 hover:bg-slate-700/60"
              onClick={() => setSidebarOpen(false)}
              aria-label="Tutup menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-5 overflow-y-auto" aria-label="Menu admin">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[11px] font-700 uppercase tracking-wider text-slate-500">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-500 transition-all',
                        active
                          ? 'bg-brand-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700/60">
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-500 text-slate-400 hover:text-white hover:bg-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              id="sidebar-toggle"
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-700 text-slate-800">{title}</h1>
              <p className="text-xs text-slate-500">Panel manajemen SMPN 1 Wanayasa</p>
            </div>
          </div>
          <Link href="/" className="text-xs text-brand-600 hover:text-brand-800 font-600">
            Lihat Portal →
          </Link>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
