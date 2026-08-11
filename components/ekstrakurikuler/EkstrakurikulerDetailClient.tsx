'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  Extracurricular,
  EkskulSchedule,
  EkskulCommittee,
  EkskulGallery,
} from '@/lib/supabase'

type TabId = 'jadwal' | 'kepengurusan' | 'galeri'

const tabConfig: Record<TabId, { label: string; icon: React.ElementType }> = {
  jadwal: { label: 'Jadwal Kegiatan', icon: Calendar },
  kepengurusan: { label: 'Kepengurusan', icon: Users },
  galeri: { label: 'Galeri Foto', icon: ImageIcon },
}

function DayBadge({ day }: { day: string }) {
  const colors: Record<string, string> = {
    Senin: 'bg-blue-100 text-blue-700',
    Selasa: 'bg-green-100 text-green-700',
    Rabu: 'bg-yellow-100 text-yellow-700',
    Kamis: 'bg-purple-100 text-purple-700',
    Jumat: 'bg-red-100 text-red-700',
    Sabtu: 'bg-indigo-100 text-indigo-700',
    Minggu: 'bg-pink-100 text-pink-700',
  }
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold', colors[day] || 'bg-slate-100 text-slate-700')}>
      {day}
    </span>
  )
}

function ScheduleCard({ schedule }: { schedule: EkskulSchedule }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-brand-200 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center">
          <Calendar className="h-7 w-7 text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <DayBadge day={schedule.day} />
            <span className="text-sm text-slate-500 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {schedule.time}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Sesi Kegiatan</h3>
          {schedule.location && (
            <p className="text-sm text-slate-500 flex items-center gap-1 mb-2">
              <MapPin className="h-3.5 w-3.5" />
              {schedule.location}
            </p>
          )}
          {schedule.notes && (
            <p className="text-sm text-slate-600 italic">{schedule.notes}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function CommitteeCard({ committee }: { committee: EkskulCommittee }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group text-center"
    >
      <div className="relative w-28 h-28 mx-auto mb-4 rounded-2xl overflow-hidden bg-slate-100">
        {committee.photo_url ? (
          <Image
            src={committee.photo_url}
            alt={committee.student_name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="112px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
            <Users className="h-10 w-10 text-brand-400" />
          </div>
        )}
      </div>
      <h3 className="font-bold text-slate-800">{committee.student_name}</h3>
      <p className="text-sm text-brand-600 font-semibold mb-1">{committee.position}</p>
      {committee.class_name && (
        <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
          <Award className="h-3 w-3" />
          {committee.class_name}
        </p>
      )}
    </motion.div>
  )
}

function GalleryModal({
  images,
  selectedIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: EkskulGallery[]
  selectedIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  if (images.length === 0) return null
  const current = images[selectedIndex]
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Galeri foto kegiatan"
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Tutup galeri"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors hidden sm:flex"
        aria-label="Foto sebelumnya"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors hidden sm:flex"
        aria-label="Foto selanjutnya"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      <div className="relative max-w-5xl w-full aspect-video">
        <Image
          src={current.image_url}
          alt={current.caption || current.title || `Foto kegiatan ${selectedIndex + 1}`}
          fill
          unoptimized
          className="object-contain"
          sizes="90vw"
          priority
        />
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 text-center">
        {(current.title || current.caption) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/50 backdrop-blur-sm rounded-xl px-6 py-4 text-white"
          >
            {current.title && <h3 className="text-lg font-bold mb-1">{current.title}</h3>}
            {current.caption && <p className="text-slate-200">{current.caption}</p>}
            {current.activity_date && (
              <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(current.activity_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </motion.div>
        )}
        <p className="mt-3 text-sm text-slate-300">{selectedIndex + 1} dari {images.length}</p>
      </div>
    </motion.div>
  )
}

function GalleryGrid({ galleries }: { galleries: EkskulGallery[] }) {
  const [modalOpen, setModalOpen] = React.useState(false)
  const [selectedIdx, setSelectedIdx] = React.useState(0)
  const count = (galleries || []).length

  const openModal = (idx: number) => {
    setSelectedIdx(idx)
    setModalOpen(true)
  }

  const closeModal = () => setModalOpen(false)
  const prevImage = () => setSelectedIdx((i) => (i === 0 ? count - 1 : i - 1))
  const nextImage = () => setSelectedIdx((i) => (i === count - 1 ? 0 : i + 1))

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!modalOpen) return
      if (e.key === 'Escape') closeModal()
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [modalOpen, count])

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {(galleries || []).map((gallery, i) => (
          <motion.div
            key={gallery.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 cursor-pointer"
            onClick={() => openModal(i)}
          >
            <Image
              src={gallery.image_url}
              alt={gallery.caption || gallery.title || `Foto kegiatan ${i + 1}`}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              {(gallery.title || gallery.caption) && (
                <div className="w-full text-white text-sm font-medium truncate">
                  {gallery.title || gallery.caption}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {modalOpen && count > 0 && (
          <GalleryModal
            images={galleries}
            selectedIndex={selectedIdx}
            onClose={closeModal}
            onPrev={prevImage}
            onNext={nextImage}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default function EkstrakurikulerDetailClient({
  ekskul,
  schedules,
  committees,
  galleries,
}: {
  ekskul: Extracurricular
  schedules: EkskulSchedule[]
  committees: EkskulCommittee[]
  galleries: EkskulGallery[]
}) {
  const [activeTab, setActiveTab] = React.useState<TabId>('jadwal')

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="relative overflow-hidden">
        {ekskul.banner_url && (
          <Image
            src={ekskul.banner_url}
            alt={`Banner ${ekskul.name}`}
            fill
            className="object-cover h-64 md:h-80"
            priority
            sizes="100vw"
          />
        )}
        {!ekskul.banner_url && <div className="h-64 md:h-80 gradient-brand" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Kembali ke Beranda
          </Link>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              {ekskul.logo_url && (
                <Image
                  src={ekskul.logo_url}
                  alt={`Logo ${ekskul.name}`}
                  width={80}
                  height={80}
                  className="mb-4 rounded-2xl bg-white/10 p-2 shadow-lg"
                  priority
                />
              )}
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{ekskul.name}</h1>
              <p className="mt-2 text-white/90 max-w-2xl">{ekskul.category}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
                  <Users className="h-4 w-4" />
                  Pembina: {ekskul.instructors || '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Tab detail ekstrakurikuler"
          className="mb-8 flex flex-wrap gap-2 border-b border-slate-200"
        >
          {(Object.keys(tabConfig) as TabId[]).map((tab) => {
            const isActive = tab === activeTab
            const { label, icon: Icon } = tabConfig[tab]
            const count =
              tab === 'jadwal'
                ? (schedules || []).length
                : tab === 'kepengurusan'
                  ? (committees || []).length
                  : (galleries || []).length
            return (
              <button
                key={tab}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab}`}
                id={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors',
                  isActive
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
                {count > 0 && (
                  <span className={cn('ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold', isActive ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600')}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Panels */}
        <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {activeTab === 'jadwal' && (
                <section aria-label="Jadwal Kegiatan" className="space-y-4">
                  {(schedules || []).length === 0 ? (
                    <div className="text-center py-16">
                      <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">Belum ada jadwal</h3>
                      <p className="text-slate-500">Jadwal kegiatan akan ditampilkan di sini setelah ditambahkan oleh pembina.</p>
                    </div>
                  ) : (
                    (schedules || []).map((schedule) => (
                      <ScheduleCard key={schedule.id} schedule={schedule} />
                    ))
                  )}
                </section>
              )}

              {activeTab === 'kepengurusan' && (
                <section aria-label="Kepengurusan">
                  {(committees || []).length === 0 ? (
                    <div className="text-center py-16">
                      <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">Belum ada data kepengurusan</h3>
                      <p className="text-slate-500">Struktur pengurus akan ditampilkan di sini setelah ditambahkan oleh pembina.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-8">
                      {(committees || []).map((committee) => (
                        <CommitteeCard key={committee.id} committee={committee} />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {activeTab === 'galeri' && (
                <section aria-label="Galeri Foto">
                  {(galleries || []).length === 0 ? (
                    <div className="text-center py-16">
                      <ImageIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">Belum ada foto kegiatan</h3>
                      <p className="text-slate-500">Galeri foto akan ditampilkan di sini setelah ditambahkan oleh pembina.</p>
                    </div>
                  ) : (
                    <GalleryGrid galleries={galleries} />
                  )}
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
