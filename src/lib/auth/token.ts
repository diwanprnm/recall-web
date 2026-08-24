// Local JWT storage — replaces Supabase session cookies/localStorage.
// The backend issues an HS256 JWT (sub = user id); we store it and send it
// as `Authorization: Bearer <jwt>` on every API call (see lib/api/client.ts).

const TOKEN_KEY = "recall_jwt"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(TOKEN_KEY)
}
