/**
 * Supabase client — Server Components (App Router)
 *
 * ⚠️ This file uses `next/headers` — it can ONLY be imported from
 * Server Components, Route Handlers, or Server Actions.
 * Import it directly: `import { createServerSupabaseClient } from "@/lib/supabase/server"`
 * NEVER re-export from a barrel that client code might touch.
 */
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — ignore
          }
        },
      },
    }
  )
}