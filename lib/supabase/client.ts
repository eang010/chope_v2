import { createBrowserClient } from '@supabase/ssr'

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, '')
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  return { url, anonKey }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig()
  return Boolean(url && anonKey)
}

export function createClient() {
  const { url, anonKey } = getSupabaseConfig()
  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them in Netlify Site settings → Environment variables, then redeploy.'
    )
  }
  return createBrowserClient(url, anonKey)
}
