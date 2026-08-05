'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/profil', label: 'Profil' },
  { href: '/layanan', label: 'Layanan' },
  { href: '/pengumuman', label: 'Pengumuman' },
  { href: '/#kontak', label: 'Kontak' },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close drawer on route change
  useEffect(() => {
    const id = setTimeout(() => setIsOpen(false), 0)
    return () => clearTimeout(id)
  }, [pathname])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href.startsWith('/#')) return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-100'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group" aria-label="Beranda SMPN 1 Wanayasa">
              <div className={cn(
                'flex items-center justify-center overflow-hidden rounded-xl transition-all duration-300',
                scrolled
                  ? 'h-11 w-11 shadow-md ring-2 ring-brand-200'
                  : 'h-11 w-11 ring-2 ring-white/40'
              )}>
                <Image
                  src="/logo.svg"
                  alt="Logo SMP Negeri 1 Wanayasa"
                  width={44}
                  height={44}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className={cn(
                  'text-sm font-800 tracking-tight transition-colors',
                  scrolled ? 'text-brand-800' : 'text-white'
                )}>
                  SMPN 1 Wanayasa
                </span>
                <span className={cn(
                  'text-[10px] font-500 transition-colors',
                  scrolled ? 'text-slate-500' : 'text-blue-100'
                )}>
                  Portal Layanan Publik
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Navigasi utama">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-4 py-2 rounded-lg text-sm font-600 transition-all duration-200',
                    isActive(link.href)
                      ? scrolled
                        ? 'text-brand-600 bg-brand-50'
                        : 'text-white bg-white/20'
                      : scrolled
                        ? 'text-slate-600 hover:text-brand-700 hover:bg-brand-50'
                        : 'text-blue-100 hover:text-white hover:bg-white/15'
                  )}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/admin/login"
                className={cn(
                  buttonVariants({ size: 'sm', variant: scrolled ? 'outline' : 'secondary' }),
                  'ml-2 px-4',
                  !scrolled && 'bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-sm hover:bg-white/25'
                )}
              >
                Admin
              </Link>
            </nav>

            {/* Mobile Hamburger */}
            <button
              id="mobile-menu-button"
              className={cn(
                'md:hidden p-2 rounded-lg transition-colors',
                scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/20'
              )}
              onClick={() => setIsOpen(true)}
              aria-label="Buka menu navigasi"
              aria-expanded={isOpen}
              aria-controls="mobile-drawer"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              id="mobile-drawer"
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Menu navigasi"
              className="fixed top-0 right-0 bottom-0 z-[70] w-[280px] bg-white shadow-2xl flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg ring-1 ring-brand-100">
                    <Image
                      src="/logo.svg"
                      alt="Logo SMP Negeri 1 Wanayasa"
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-700 text-slate-800">SMPN 1 Wanayasa</span>
                </div>
                <button
                  id="close-drawer-button"
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                  onClick={() => setIsOpen(false)}
                  aria-label="Tutup menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="flex-1 p-4 space-y-1" aria-label="Menu navigasi mobile">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        'flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-600 transition-all duration-200',
                        isActive(link.href)
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-brand-700'
                      )}
                    >
                      {link.label}
                      <ChevronRight className="w-4 h-4 opacity-40" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100">
                <Link
                  href="/admin/login"
                  id="drawer-admin-link"
                  className={cn(buttonVariants(), 'w-full justify-center')}
                >
                  Login Admin
                </Link>
                <p className="text-center text-xs text-slate-400 mt-3">
                  Jam Layanan: Sen–Kam 07.00–14.00 WIB
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
