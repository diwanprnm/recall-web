"use client"

import { useEffect, useState, useCallback } from "react"
import { type User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  const getJwt = useCallback(async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  }, [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then((result: Awaited<ReturnType<typeof supabase.auth.getSession>>) => {
      const session = result.data.session
      setState({ user: session?.user ?? null, loading: false, error: null })
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // Re-fetch session on any auth change
      supabase.auth.getSession().then((result: Awaited<ReturnType<typeof supabase.auth.getSession>>) => {
        const session = result.data.session
        setState({ user: session?.user ?? null, loading: false, error: null })
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setState((s) => ({ ...s, loading: false, error: error.message }))
      return false
    }
    return true
  }

  const signUp = async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setState((s) => ({ ...s, loading: false, error: error.message }))
      return false
    }
    return true
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { ...state, signIn, signUp, signOut, getJwt }
}