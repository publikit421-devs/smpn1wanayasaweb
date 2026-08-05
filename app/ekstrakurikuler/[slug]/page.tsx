import { notFound } from 'next/navigation'
import {
  getExtracurricularBySlug,
  getEkskulSchedules,
  getEkskulCommittees,
  getEkskulGalleries,
} from '@/lib/supabase'
import { LOCAL_EXTRACURRICULARS, getLocalEkskul } from '@/lib/ekskul-data'
import type { Extracurricular } from '@/lib/supabase'
import EkstrakurikulerDetailClient from '@/components/ekstrakurikuler/EkstrakurikulerDetailClient'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

function toExtracurricular(slug: string): Extracurricular | null {
  const local = getLocalEkskul(slug)
  if (!local) return null
  return {
    id: slug,
    slug: local.slug,
    name: local.name,
    category: local.category,
    description: local.description,
    instructors: local.instructors,
    logo_url: local.image,
    is_active: true,
    created_at: '',
    updated_at: '',
  }
}

export async function generateStaticParams() {
  const slugs = new Set(LOCAL_EXTRACURRICULARS.map((e) => e.slug))
  try {
    const { getExtracurriculars } = await import('@/lib/supabase')
    const ekskuls = await getExtracurriculars()
    ;(ekskuls || []).forEach((e) => slugs.add(e.slug))
  } catch {
    // abaikan, pakai slug lokal
  }
  return Array.from(slugs).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  let ekskul: Extracurricular | null = null
  try {
    ekskul = await getExtracurricularBySlug(slug)
  } catch {
    ekskul = null
  }
  if (!ekskul) ekskul = toExtracurricular(slug)
  if (!ekskul) return { title: 'Ekstrakurikuler tidak ditemukan' }
  return {
    title: `${ekskul.name} | SMPN 1 Wanayasa`,
    description: ekskul.description || `Detail ekstrakurikuler ${ekskul.name}`,
    openGraph: {
      title: `${ekskul.name} | SMPN 1 Wanayasa`,
      description: ekskul.description || `Detail ekstrakurikuler ${ekskul.name}`,
      images: ekskul.banner_url ? [ekskul.banner_url] : ekskul.logo_url ? [ekskul.logo_url] : [],
    },
  }
}

export default async function EkstrakurikulerDetailPage({ params }: PageProps) {
  const { slug } = await params

  let ekskul: Extracurricular | null = null
  let schedules: Awaited<ReturnType<typeof getEkskulSchedules>> = []
  let committees: Awaited<ReturnType<typeof getEkskulCommittees>> = []
  let galleries: Awaited<ReturnType<typeof getEkskulGalleries>> = []

  try {
    ekskul = await getExtracurricularBySlug(slug)
  } catch {
    ekskul = null
  }

  if (!ekskul) {
    ekskul = toExtracurricular(slug)
  }

  if (!ekskul) {
    notFound()
  }

  try {
    const [sched, comm, gall] = await Promise.all([
      getEkskulSchedules(ekskul.id),
      getEkskulCommittees(ekskul.id),
      getEkskulGalleries(ekskul.id),
    ])
    schedules = sched || []
    committees = comm || []
    galleries = gall || []
  } catch {
    schedules = []
    committees = []
    galleries = []
  }

  return (
    <EkstrakurikulerDetailClient
      ekskul={ekskul}
      schedules={schedules}
      committees={committees}
      galleries={galleries}
    />
  )
}
