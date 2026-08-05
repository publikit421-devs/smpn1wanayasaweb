'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { GalleryItem } from '@/lib/supabase'

export default function GallerySection() {
  const [galleryItems, setGalleryItems] = React.useState<GalleryItem[]>([])

  const fetchGallery = React.useCallback(async () => {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('is_active', true)
      .order('urutan', { ascending: true })

    if (error) {
      console.error('Error fetching gallery:', error)
      setGalleryItems([])
      return
    }

    setGalleryItems(data || [])
  }, [])

  React.useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  if (galleryItems.length === 0) return null

  return (
    <section className="bg-white py-20" id="galeri" aria-label="Galeri Foto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-10 max-w-2xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5">
            <Camera className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-semibold text-brand-700">Dokumentasi</span>
          </div>
          <h2 className="section-title">
            Galeri <span className="text-brand-600">Kegiatan</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {(galleryItems || []).map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 4) * 0.06 }}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image_url}
                alt={item.caption || 'Foto kegiatan sekolah'}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {item.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="line-clamp-2 text-xs font-600 text-white">{item.caption}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
