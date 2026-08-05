import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.error(
      '[Supabase Client] NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY tidak ditemukan. ' +
        'Pastikan variabel lingkungan sudah diatur di .env.local dan Vercel.',
    )
  }
}

export const supabase = createBrowserClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
)
