import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Geist } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | SMP Negeri 1 Wanayasa',
    default: 'SMP Negeri 1 Wanayasa — Portal Layanan Publik',
  },
  description:
    'Portal resmi Sistem Informasi dan Layanan Publik SMP Negeri 1 Wanayasa, Banjarnegara. Akses pengumuman, berita, dan 6 layanan publik secara online.',
  keywords: ['SMPN 1 Wanayasa', 'SMP Negeri 1 Wanayasa', 'Portal Layanan', 'Banjarnegara'],
  authors: [{ name: 'SMP Negeri 1 Wanayasa' }],
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
