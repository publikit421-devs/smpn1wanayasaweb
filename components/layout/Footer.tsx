import Image from 'next/image'
import Link from 'next/link'
import { Mail, MapPin, Phone, Clock, ChevronRight, ExternalLink } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const serviceLinks = [
  { href: '/layanan/informasi-publik', label: 'Informasi Publik' },
  { href: '/layanan/pengaduan', label: 'Pengaduan' },
  { href: '/layanan/legalisasi-ijazah', label: 'Legalisasi Ijazah' },
  { href: '/layanan/izin-siswa', label: 'Izin Siswa' },
  { href: '/layanan/penelitian', label: 'Penelitian / Observasi' },
  { href: '/layanan/mutasi-siswa', label: 'Mutasi Siswa' },
]

const quickLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/layanan', label: 'Layanan Publik' },
  { href: '/pengumuman', label: 'Pengumuman & Berita' },
  { href: '/#statistik', label: 'Statistik Sekolah' },
  { href: '/admin/login', label: 'Panel Admin' },
]

const socialLinks = [
  {
    name: 'Facebook',
    href: 'https://facebook.com/smpn1wanayasa',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/smpn1wanayasa',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com/@smpn1wanayasa',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: 'https://tiktok.com/@smpn1wanayasa',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    name: 'WhatsApp',
    href: 'https://wa.me/6281234567890',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-b from-slate-800 to-slate-900 text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl ring-2 ring-white/20">
                <Image
                  src="/logo.svg"
                  alt="Logo SMP Negeri 1 Wanayasa"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight text-white">SMP Negeri 1 Wanayasa</p>
                <p className="mt-0.5 text-xs text-slate-400">Est. 1965 — NPSN 20229728</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Lembaga pendidikan menengah pertama terkemuka di Kecamatan Wanayasa,
              berkomitmen membentuk generasi berkarakter, cerdas, dan berdaya saing.
            </p>

            {/* Social Media */}
            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Media Sosial
              </p>
              <div className="flex items-center gap-2.5">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Kunjungi ${social.name}`}
                    className={cn(
                      buttonVariants({ size: 'icon-sm', variant: 'outline' }),
                      'border-slate-600 bg-slate-700/40 text-slate-300 hover:border-brand-400 hover:bg-brand-600 hover:text-white'
                    )}
                  >
                    {social.icon}
                    <span className="sr-only">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Portal Layanan */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">
              Portal Layanan
            </h3>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    <ChevronRight className="h-3 w-3 text-brand-400 transition-transform group-hover:translate-x-1" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Jam Pelayanan + Tautan */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">
              Jam Pelayanan
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">Senin – Kamis</p>
                  <p className="text-sm text-slate-400">07.00 – 14.00 WIB</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">Jumat</p>
                  <p className="text-sm text-slate-400">06.30 – 11.00 WIB</p>
                </div>
              </div>
              <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2">
                <p className="text-xs text-amber-300">Sabtu &amp; Minggu: Layanan tutup</p>
              </div>
            </div>

            <h3 className="mb-3 mt-6 text-sm font-bold uppercase tracking-widest text-white">
              Tautan Cepat
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak + Maps */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">
              Kontak Kami
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-400" />
                <p className="text-sm leading-relaxed text-slate-300">
                  Jalan Raya Timur No.164, Wanayasa, Kec. Wanayasa, Kabupaten
                  Purwakarta, Jawa Barat 41174
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 flex-shrink-0 text-brand-400" />
                <a
                  href="mailto:smpn1wanayasa1965@gmail.com"
                  className="text-sm break-all text-slate-300 transition-colors hover:text-white"
                >
                  smpn1wanayasa1965@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 flex-shrink-0 text-brand-400" />
                <a href="mailto:smpn1wanayasa1965@gmail.com" className="text-sm text-slate-300 transition-colors hover:text-white">
                  (hubungi via email resmi)
                </a>
              </div>
            </div>

            {/* Google Maps */}
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-700/60">
              <iframe
                title="Lokasi SMP Negeri 1 Wanayasa di Google Maps"
                src="https://www.google.com/maps?q=SMP%20Negeri%201%20Wanayasa&output=embed"
                width="100%"
                height="160"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale transition-all duration-300 hover:grayscale-0"
              />
            </div>
            <a
              href="https://maps.app.goo.gl/TZbkJJo3LbLyTGAJ6"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: 'sm', variant: 'outline' }),
                'mt-3 w-full border-slate-600 bg-slate-700/40 text-slate-200 hover:bg-brand-600 hover:text-white'
              )}
            >
              Buka Google Maps
              <ExternalLink />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-center text-xs text-slate-500 sm:text-left">
            © {currentYear} SMP Negeri 1 Wanayasa. Hak cipta dilindungi undang-undang.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="text-xs text-slate-500 transition-colors hover:text-slate-300">
              Admin Panel
            </Link>
            <span className="text-slate-700">·</span>
            <span className="text-xs text-slate-500">NPSN: 20229728</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
