import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    template: '%s | SMP Negeri 1 Wanayasa',
    default: 'SMP Negeri 1 Wanayasa — Portal Layanan Publik',
  },
  description:
    'Portal resmi Sistem Informasi dan Layanan Publik SMP Negeri 1 Wanayasa, Purwakarta, Jawa Barat. Akses pengumuman, berita, dan 6 layanan publik secara online.',
  keywords: ['SMPN 1 Wanayasa', 'SMP Negeri 1 Wanayasa', 'Portal Layanan', 'Purwakarta', 'Jawa Barat'],
  authors: [{ name: 'SMP Negeri 1 Wanayasa' }],
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'SMP Negeri 1 Wanayasa — Portal Layanan Publik',
    description: 'Portal resmi Sistem Informasi dan Layanan Publik SMP Negeri 1 Wanayasa.',
    type: 'website',
    locale: 'id_ID',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body className="font-sans antialiased bg-slate-50">
        {children}
      </body>
    </html>
  )
}
