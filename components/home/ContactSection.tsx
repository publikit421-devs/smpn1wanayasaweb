'use client'

import { motion } from 'framer-motion'
import { Mail, MapPin, Phone, ExternalLink, MessageSquare } from 'lucide-react'
import Link from 'next/link'

const contactItems = [
  {
    id: 'contact-email',
    icon: Mail,
    label: 'Email Resmi',
    value: 'smpn1wanayasa1965@gmail.com',
    href: 'mailto:smpn1wanayasa1965@gmail.com',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    id: 'contact-address',
    icon: MapPin,
    label: 'Alamat',
    value: 'Jalan Raya Timur No.164, Wanayasa, Kec. Wanayasa, Kabupaten Purwakarta, Jawa Barat 41174',
    href: 'https://maps.app.goo.gl/TZbkJJo3LbLyTGAJ6',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    id: 'contact-phone',
    icon: Phone,
    label: 'Telepon / Fax',
    value: 'Hubungi via email untuk informasi nomor telepon',
    href: 'mailto:smpn1wanayasa1965@gmail.com',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
]

export default function ContactSection() {
  return (
    <section
      className="py-20 bg-gradient-to-b from-white to-slate-50"
      id="kontak"
      aria-label="Informasi Kontak"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100">
            <MessageSquare className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-600 text-brand-700">Hubungi Kami</span>
          </div>
          <h2 className="section-title mb-3">
            Kami Siap{' '}
            <span className="text-brand-600">Membantu Anda</span>
          </h2>
          <p className="section-subtitle mx-auto">
            Jangan ragu untuk menghubungi kami melalui berbagai saluran komunikasi yang tersedia.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {contactItems.map((item, i) => (
            <motion.a
              key={item.id}
              id={item.id}
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className={`
                block p-6 rounded-2xl border-2 bg-white transition-all cursor-pointer
                hover:shadow-lg group ${item.border}
              `}
            >
              <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <p className="text-xs font-600 text-slate-500 uppercase tracking-widest mb-1">
                {item.label}
              </p>
              <p className="text-sm text-slate-700 leading-relaxed font-500">
                {item.value}
              </p>
              <div className={`flex items-center gap-1 mt-3 text-xs font-600 ${item.color}`}>
                <span>Hubungi Kami</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </motion.a>
          ))}
        </div>

        {/* Maps Embed Placeholder + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl overflow-hidden shadow-card border border-slate-200 bg-white"
        >
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-white text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-blue-200" />
            <h3 className="text-xl font-700 mb-2">Temukan Lokasi Kami</h3>
            <p className="text-blue-100 text-sm mb-6">
              SMP Negeri 1 Wanayasa — Jalan Raya Timur No.164, Wanayasa, Kec. Wanayasa, Kabupaten Purwakarta, Jawa Barat 41174
            </p>
            <a
              id="maps-link"
              href="https://maps.app.goo.gl/TZbkJJo3LbLyTGAJ6"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex"
            >
              <MapPin className="w-4 h-4" />
              Buka Google Maps
            </a>
          </div>
          <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 border-t border-slate-100">
            <div>
              <p className="text-sm font-600 text-slate-700">Ada pertanyaan atau kendala?</p>
              <p className="text-xs text-slate-500">Tim kami siap membantu via email</p>
            </div>
            <Link
              href="/layanan/pengaduan"
              id="contact-cta-pengaduan"
              className="btn-primary text-sm px-5 py-2.5"
            >
              Kirim Pengaduan
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
