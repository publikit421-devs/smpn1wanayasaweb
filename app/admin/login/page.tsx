'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle,
  ArrowLeft, ShieldCheck,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError('Email atau kata sandi salah. Silakan coba lagi.')
      } else {
        router.push('/admin')
        router.refresh()
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba beberapa saat lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="gradient-hero relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-brand-300/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <Card className="overflow-hidden rounded-3xl shadow-2xl [--card-spacing:--spacing(0)]">
          {/* Header */}
          <div className="gradient-brand relative p-8 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-sm">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-xl font-800 text-white">Panel Admin</h1>
            <p className="mt-1 text-sm text-blue-100">SMP Negeri 1 Wanayasa</p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-600 text-white/90">
              <ShieldCheck className="h-3.5 w-3.5" />
              Akses terbatas untuk admin &amp; operator
            </div>
          </div>

          <CardContent className="p-8">
            <h2 className="mb-6 text-center text-lg font-700 text-slate-800">
              Masuk ke Dasbor Admin
            </h2>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  role="alert"
                  className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                  <div>
                    <p className="text-sm font-600 text-red-700">Gagal Masuk</p>
                    <p className="mt-0.5 text-sm text-red-600">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-5" noValidate={false}>
              {/* Email */}
              <div>
                <label htmlFor="admin-email" className="label-field">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@smpn1wanayasa.sch.id"
                    className="input-field pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="admin-password" className="label-field">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    id="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                id="admin-login-btn"
                type="submit"
                size="lg"
                disabled={isLoading}
                className={cn('w-full justify-center py-3', isLoading && 'opacity-70')}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Masuk'
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              Hanya untuk staf dan administrator resmi sekolah.
            </p>
          </CardContent>
        </Card>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-600 text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Portal Utama
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
