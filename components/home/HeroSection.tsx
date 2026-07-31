'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, FileText, Shield, Star, Users } from 'lucide-react'

const stats = [
  { icon: Users, value: '500+', label: 'Siswa Aktif' },
  { icon: Star, value: '4.8', label: 'Rating Layanan' },
  { icon: FileText, value: '6', label: 'Jenis Layanan' },
  { icon: Shield, value: '100%', label: 'Gratis & Transparan' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden gradient-hero"
      aria-label="Selamat datang di portal SMPN 1 Wanayasa"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-300/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-brand-800/20 blur-3xl" />
        {/* Grid pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white text-sm font-600">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Layanan Publik Online — Gratis & Mudah
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-800 text-white leading-tight mb-6"
          >
            Portal Layanan Publik{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
              SMPN 1 Wanayasa
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-blue-100 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl"
          >
            Akses 6 jenis layanan publik sekolah secara online — mulai dari
            permohonan informasi, pengaduan, legalisasi ijazah, hingga mutasi
            siswa. Transparan, cepat, dan tanpa biaya.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            <Link href="/layanan" id="hero-cta-layanan" className="btn-primary text-base px-6 py-3">
              Akses Layanan
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/#pengumuman" id="hero-cta-pengumuman" className="btn-secondary text-base px-6 py-3">
              Lihat Pengumuman
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="glass-card p-5 text-center"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <stat.icon className="w-6 h-6 text-blue-200 mx-auto mb-2" />
              <p className="text-2xl font-800 text-white">{stat.value}</p>
              <p className="text-xs text-blue-200 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 80L48 74.7C96 69.3 192 58.7 288 58.7C384 58.7 480 69.3 576 72C672 74.7 768 69.3 864 61.3C960 53.3 1056 42.7 1152 42.7C1248 42.7 1344 53.3 1392 58.7L1440 64V80H0Z" fill="#f8fafc"/>
        </svg>
      </div>
    </section>
  )
}
