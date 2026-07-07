/**
 * Supabase client — Browser / Client Components
 *
 * Use this in Client Components (marked with 'use client').
 * For Server Components, use createServerSupabaseClient from @/lib/supabase/server
 */
"use client"

import { createBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (client) return client

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return client
}

export const supabase = getSupabaseClient()