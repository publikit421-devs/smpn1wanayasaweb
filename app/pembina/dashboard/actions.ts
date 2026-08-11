'use server'

import { revalidatePath } from 'next/cache'

/**
 * Invalidasi cache halaman publik ekstrakurikuler setelah pembina
 * menambah/menghapus foto galeri (atau data lain) di dasbor.
 */
export async function revalidateEkskul(slug: string) {
  revalidatePath('/ekstrakurikuler')
  revalidatePath(`/ekstrakurikuler/${slug}`)
}