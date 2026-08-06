'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SkipForward } from 'lucide-react'

const SESSION_KEY = 'has_seen_intro'

const INTRO_DURATION_MS = 2900 // ~2.5–3 detik
const FADE_MS = 500

export default function SmartIntroLoader() {
  const [mounted, setMounted] = React.useState(false)
  const [show, setShow] = React.useState(false)
  const [fading, setFading] = React.useState(false)

  const finish = React.useCallback(() => {
    setFading(true)
    window.setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, 'true')
      } catch {
        // Abaikan jika sessionStorage tidak tersedia
      }
      setShow(false)
    }, FADE_MS)
  }, [])

  // Mount guard: hindari hydration mismatch dengan membaca sessionStorage
  // hanya setelah komponen ter-mount di client.
  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return
    let hasSeen = false
    try {
      hasSeen = sessionStorage.getItem(SESSION_KEY) === 'true'
    } catch {
      hasSeen = false
    }

    if (!hasSeen) {
      setShow(true)
    }
  }, [mounted])

  React.useEffect(() => {
    if (!show) return
    const timer = window.setTimeout(() => finish(), INTRO_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [show, finish])

  if (!mounted) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="smart-intro"
          role="dialog"
          aria-label="Selamat datang di SMPN 1 Wanayasa"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_MS / 1000, ease: 'easeOut' }}
        >
          {/* Video intro */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: fading ? 0 : 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <video
              src="/videos/intro-logo.mp4"
              autoPlay
              muted
              playsInline
              preload="auto"
              className="h-full w-full object-contain p-6"
              aria-hidden="true"
            />
          </motion.div>

          {/* Subtle vignette overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.45))]" />

          {/* Brand line */}
          <motion.div
            className="pointer-events-none absolute bottom-10 left-0 right-0 text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: fading ? 0 : 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
              SMP Negeri 1 Wanayasa
            </p>
            <p className="mt-1 text-[11px] text-white/40">
              Membangun Generasi Berkarakter, Cerdas &amp; Berdaya Saing
            </p>
          </motion.div>

          {/* Skip button */}
          <button
            type="button"
            onClick={() => finish()}
            className="absolute right-5 top-5 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <SkipForward className="h-3.5 w-3.5" />
            Lewati
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
