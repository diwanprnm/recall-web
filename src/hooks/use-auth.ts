"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getToken, setToken, clearToken } from "@/lib/auth/token"

// Relative paths — next.config proxies /api/* to the backend (same-origin, no CORS).
const API_URL = ""

export interface AuthUser {
  id: string
  email: string | null
  user_metadata?: { full_name?: string }
}

interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

// ── Shared store ──────────────────────────────────────────────────────────────
// useAuth() is called from multiple components (the home page AND the auth page),
// each with its own React state. Without a shared store, signing in on the auth
// page would not update the home page's instance, so its redirect wouldn't fire.
// We keep one module-level state + a subscriber list that every useAuth() joins.

let _state: AuthState = { user: null, loading: true, error: null }
const _listeners = new Set<(s: AuthState) => void>()

function _setState(next: Partial<AuthState>) {
  _state = { ..._state, ...next }
  _listeners.forEach((l) => l(_state))
}

function _subscribe(l: (s: AuthState) => void) {
  _listeners.add(l)
  return () => _listeners.delete(l)
}

// Minimal base64url decode (no dependency) to read the JWT `sub` locally.
function decodeSub(token: string): string | null {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    const json = JSON.parse(atob(payload))
    return json.sub ?? null
  } catch {
    return null
  }
}

async function fetchProfile(token: string): Promise<AuthUser | null> {
  const sub = decodeSub(token)
  if (!sub) return null
  let email: string | null = null
  try {
    const res = await fetch(`${API_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) email = (await res.json()).email ?? null
  } catch {
    /* profile optional — keep going with id only */
  }
  return { id: sub, email, user_metadata: {} }
}

// Inactivity timeout — auto-logout after this long with no user interaction.
// The user asked for logout ONLY on inactivity (not on 401), so this timer is
// the single trigger for an automatic sign-out.
const INACTIVITY_MS = 30 * 60 * 1000 // 30 minutes

// Events that count as "activity". Debounced: any of these resets the timer.
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
] as const

export function useAuth() {
  const [state, setState] = useState<AuthState>(_state)
  const router = useRouter()

  useEffect(() => {
    // Join the shared store.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(_state)
    const unsub = _subscribe(setState)

    // Initial load: if a token exists but no user yet, resolve the profile once.
    if (_state.loading) {
      const token = getToken()
      if (!token) {
        _setState({ user: null, loading: false, error: null })
      } else {
        fetchProfile(token)
          .then((user) => _setState({ user, loading: false, error: null }))
          .catch(() => _setState({ user: null, loading: false, error: null }))
      }
    }

    // Auto-logout on inactivity. Only runs while there's a signed-in user.
    let timer: ReturnType<typeof setTimeout> | null = null

    const stopTimer = () => {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    }

    const schedule = () => {
      stopTimer()
      timer = setTimeout(() => {
        // Sign out + go to the login page.
        clearToken()
        _setState({ user: null, loading: false, error: null })
        router.replace("/")
      }, INACTIVITY_MS)
    }

    // Any activity resets the timer (but only while signed in).
    const onActivity = () => {
      if (_state.user) schedule()
    }

    const start = () => {
      // Stop first so re-invoking start() never stacks duplicate listeners.
      stop()
      schedule()
      ACTIVITY_EVENTS.forEach((e) =>
        window.addEventListener(e, onActivity, { passive: true })
      )
    }

    const stop = () => {
      stopTimer()
      ACTIVITY_EVENTS.forEach((e) =>
        window.removeEventListener(e, onActivity)
      )
    }

    // A single subscription drives start/stop on every store change. The initial
    // `_subscribe` call fires immediately with the current state, which covers
    // the "already signed in on mount" case; later changes (login/logout) are
    // handled here too.
    const unsub2 = _subscribe((s) => {
      if (s.user) start()
      else stop()
    })

    return () => {
      unsub()
      unsub2()
      stop()
    }
  }, [router])

  const getJwt = useCallback(async (): Promise<string | null> => {
    return getToken()
  }, [])

  const _authenticate = useCallback(
    async (endpoint: string, email: string, password: string) => {
      _setState({ loading: true, error: null })
      try {
        const res = await fetch(`${API_URL}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg = data.detail ?? "Authentication failed"
          _setState({ loading: false, error: msg })
          return false
        }
        setToken(data.access_token)
        const user = await fetchProfile(data.access_token)
        _setState({ user, loading: false, error: null })
        return true
      } catch {
        _setState({ loading: false, error: "Network error" })
        return false
      }
    },
    []
  )

  const signIn = useCallback(
    (email: string, password: string) => _authenticate("/api/auth/login", email, password),
    [_authenticate]
  )

  const signUp = useCallback(
    (email: string, password: string) =>
      _authenticate("/api/auth/register", email, password),
    [_authenticate]
  )

  const signOut = useCallback(async () => {
    clearToken()
    _setState({ user: null, loading: false, error: null })
    // Go back to the login screen explicitly — the sidebar's sign-out button
    // shouldn't leave the user on a now-unauthenticated dashboard.
    router.replace("/")
  }, [router])

  return { ...state, signIn, signUp, signOut, getJwt }
}
