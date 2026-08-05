'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn } from 'lucide-react'

interface Props {
  src: string
  alt: string
  priority?: boolean
}

export default function AnnouncementImage({ src, alt, priority }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <figure className="group relative overflow-hidden rounded-2xl bg-slate-100">
        <button
          type="button"
          id="announcement-image-open"
          onClick={() => setOpen(true)}
          className="block w-full cursor-zoom-in"
          aria-label={`Perbesar gambar: ${alt}`}
        >
          <Image
            src={src}
            alt={alt}
            width={1600}
            height={900}
            priority={priority}
            className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </button>
        <span className="pointer-events-none absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-600 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <ZoomIn className="h-3.5 w-3.5" />
          Perbesar
        </span>
      </figure>

      {/* Lightbox */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="announcement-lightbox"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Pratinjau gambar besar"
          >
            <button
              id="announcement-image-close"
              type="button"
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              onClick={() => setOpen(false)}
              aria-label="Tutup gambar"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.img
              src={src}
              alt={alt}
              className="max-h-[92vh] max-w-[95vw] rounded-xl object-contain shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
