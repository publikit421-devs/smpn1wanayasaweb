import { notFound } from 'next/navigation'
import {
  getExtracurricularBySlug,
  getEkskulSchedules,
  getEkskulCommittees,
  getEkskulGalleries,
} from '@/lib/supabase'
import EkstrakurikulerDetailClient from '@/components/ekstrakurikuler/EkstrakurikulerDetailClient'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const { getExtracurriculars } = await import('@/lib/supabase')
  try {
    const ekskuls = await getExtracurriculars()
    return (ekskuls || []).map((e) => ({ slug: e.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const ekskul = await getExtracurricularBySlug(slug)
    if (!ekskul) return { title: 'Ekstrakurikuler tidak ditemukan' }
    return {
      title: `${ekskul.name} | SMPN 1 Wanayasa`,
      description: ekskul.description || `Detail ekstrakurikuler ${ekskul.name}`,
      openGraph: {
        title: `${ekskul.name} | SMPN 1 Wanayasa`,
        description: ekskul.description || `Detail ekstrakurikuler ${ekskul.name}`,
        images: ekskul.banner_url ? [ekskul.banner_url] : [],
      },
    }
  } catch {
    return { title: 'Ekstrakurikuler tidak ditemukan' }
  }
}

export default async function EkstrakurikulerDetailPage({ params }: PageProps) {
  const { slug } = await params

  let ekskul = null
  let schedules: Awaited<ReturnType<typeof getEkskulSchedules>> = []
  let committees: Awaited<ReturnType<typeof getEkskulCommittees>> = []
  let galleries: Awaited<ReturnType<typeof getEkskulGalleries>> = []

  try {
    ekskul = await getExtracurricularBySlug(slug)
  } catch {
    ekskul = null
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
