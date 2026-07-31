'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, GraduationCap, School, Users } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

interface Slide {
  src: string
  alt: string
  caption: string
}

const slides: Slide[] = [
  {
    src: '/kegiatan/upacara-bendera.svg',
    alt: 'Upacara bendera di halaman sekolah SMPN 1 Wanayasa',
    caption: 'Upacara Bendera Setiap Senin',
  },
  {
    src: '/kegiatan/belajar-mengajar.svg',
    alt: 'Kegiatan belajar mengajar di ruang kelas',
    caption: 'Kegiatan Belajar Mengajar',
  },
  {
    src: '/kegiatan/olahraga.svg',
    alt: 'Kegiatan olahraga dan pesta seni siswa',
    caption: 'Olahraga & Pesta Seni',
  },
  {
    src: '/kegiatan/praktikum-lab.svg',
    alt: 'Praktikum di laboratorium IPA',
    caption: 'Praktikum Laboratorium IPA',
  },
  {
    src: '/kegiatan/ekskul-pramuka.svg',
    alt: 'Kegiatan ekstrakurikuler pramuka',
    caption: 'Ekstrakurikuler Pramuka',
  },
]

const heroStats = [
  { icon: Users, value: '500+', label: 'Siswa Aktif' },
  { icon: School, value: '24', label: 'Rombel' },
  { icon: GraduationCap, value: '30+', label: 'Guru & Staff' },
]

export default function HeroSlider() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [paused, setPaused] = React.useState(false)

  React.useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    api.on('select', onSelect)
    api.on('reInit', onSelect)
    return () => {
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api])

  // Autoplay
  React.useEffect(() => {
    if (!api || paused) return
    const timer = setInterval(() => {
      if (api.canScrollNext()) api.scrollNext()
      else api.scrollTo(0)
    }, 5000)
    return () => clearInterval(timer)
  }, [api, paused])

  return (
    <section
      className="relative flex min-h-screen items-center overflow-hidden bg-brand-900"
      aria-label="Selamat datang di SMPN 1 Wanayasa"
    >
      {/* Background Slider */}
      <div
        className="absolute inset-0"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <Carousel
          setApi={setApi}
          className="h-full w-full"
          opts={{ loop: true, align: 'start' }}
        >
          <CarouselContent className="-ml-0 h-full">
            {slides.map((slide) => (
              <CarouselItem key={slide.src} className="pl-0">
                <div className="relative h-full w-full">
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950/90 via-brand-900/70 to-brand-700/40" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-50/90 to-transparent" />

      {/* Foreground Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-28 md:py-36">
        <div className="max-w-3xl">
          <Badge
            variant="secondary"
            className="mb-6 h-auto gap-2 bg-white/15 px-4 py-2 text-sm text-white ring-1 ring-white/25"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            Portal Layanan Publik SMP Negeri 1 Wanayasa
          </Badge>

          <h1 className="mb-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
            Membangun Generasi{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
              Berkarakter, Cerdas,
            </span>{' '}
            &amp; Berdaya Saing
          </h1>

          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-blue-100 md:text-xl">
            Akses 6 jenis layanan publik sekolah secara online — permohonan
            informasi, pengaduan, legalisasi ijazah, izin siswa, penelitian,
            hingga mutasi siswa. Transparan, cepat, dan tanpa biaya.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/layanan"
              className={cn(buttonVariants({ size: 'lg' }), 'h-12 px-6 text-base')}
            >
              Akses Layanan
              <ArrowRight />
            </Link>
            <Link
              href="/#pengumuman"
              className={cn(
                buttonVariants({ size: 'lg', variant: 'secondary' }),
                'h-12 bg-white/15 px-6 text-base text-white ring-1 ring-white/30 backdrop-blur-sm hover:bg-white/25'
              )}
            >
              Lihat Pengumuman
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-14 grid max-w-3xl grid-cols-3 gap-4">
          {heroStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm"
            >
              <stat.icon className="mx-auto mb-2 h-6 w-6 text-blue-200" />
              <p className="text-2xl font-extrabold text-white">{stat.value}</p>
              <p className="mt-0.5 text-xs text-blue-200">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Slider Controls */}
      <div className="absolute bottom-6 left-0 right-0 z-10 mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Dots */}
        <div className="flex items-center gap-2" role="tablist" aria-label="Pilih foto kegiatan">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              role="tab"
              aria-selected={current === i}
              aria-label={`Tampilkan: ${slide.caption}`}
              onClick={() => api?.scrollTo(i)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                current === i
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/40 hover:bg-white/70'
              )}
            />
          ))}
        </div>

        {/* Caption + arrows */}
        <div className="flex items-center gap-3">
          <p className="hidden text-sm font-medium text-white/90 sm:block">
            {slides[current]?.caption}
          </p>
          <button
            onClick={() => api?.scrollPrev()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/25"
            aria-label="Foto sebelumnya"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => api?.scrollNext()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/25"
            aria-label="Foto berikutnya"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
