/**
 * Recall API client — talks to FastAPI backend (recall-api)
 *
 * All calls send the backend-issued JWT in the Authorization header.
 * The JWT is obtained from /api/auth/login (or /register) and stored by
 * lib/auth/token.ts.
 */
import type {
  DigestFrequency,
  DigestSettings,
  Item,
  ItemCreate,
  ItemUpdate,
  PaginatedResponse,
  SearchQuery,
  SearchResponse,
  UserProfile,
} from "@/types"

// Requests go to relative paths — next.config rewrites /api/* and /health to the
// backend, so the browser stays same-origin and never sends a CORS preflight.
const API_PREFIX = ""

async function request<T>(
  path: string,
  options: RequestInit & { jwt?: string } = {}
): Promise<T> {
  const { jwt, ...fetchOptions } = options

  const res = await fetch(`${API_PREFIX}${path}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      ...fetchOptions.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new ApiError(res.status, error.detail ?? "Request failed")
  }

  return res.json()
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function getProfile(jwt: string): Promise<UserProfile> {
  return request<UserProfile>("/api/auth/profile", { jwt })
}

// ── Items ────────────────────────────────────────────────────────────────────

export async function listItems(
  jwt: string,
  params: {
    platform?: string
    tag?: string
    category?: string
    is_favorite?: boolean
    is_archived?: boolean
    page?: number
    per_page?: number
    search?: string
  } = {}
): Promise<PaginatedResponse<Item>> {
  const sp = new URLSearchParams()
  if (params.platform) sp.set("platform", params.platform)
  if (params.tag) sp.set("tag", params.tag)
  if (params.category) sp.set("category_id", params.category)
  if (params.is_favorite !== undefined)
    sp.set("is_favorite", String(params.is_favorite))
  if (params.is_archived !== undefined)
    sp.set("is_archived", String(params.is_archived))
  if (params.page) sp.set("page", String(params.page))
  if (params.per_page) sp.set("per_page", String(params.per_page))
  if (params.search) sp.set("search", params.search)

  const qs = sp.toString()
  return request<PaginatedResponse<Item>>(
    qs ? `/api/items?${qs}` : "/api/items",
    { jwt }
  )
}

export async function getItem(jwt: string, itemId: string): Promise<Item> {
  return request<Item>(`/api/items/${itemId}`, { jwt })
}

export async function createItem(
  jwt: string,
  payload: ItemCreate
): Promise<Item> {
  return request<Item>("/api/items/quick", {
    method: "POST",
    jwt,
    body: JSON.stringify(payload),
  })
}

export async function updateItem(
  jwt: string,
  itemId: string,
  payload: Partial<ItemUpdate>
): Promise<Item> {
  return request<Item>(`/api/items/${itemId}`, {
    method: "PATCH",
    jwt,
    body: JSON.stringify(payload),
  })
}

export async function deleteItem(
  jwt: string,
  itemId: string,
  hard = false
): Promise<{ success: boolean; message?: string }> {
  const qs = hard ? "?hard=true" : ""
  return request(`/api/items/${itemId}${qs}`, { method: "DELETE", jwt })
}

export async function reanalyseItem(
  jwt: string,
  itemId: string
): Promise<Item> {
  return request<Item>(`/api/items/${itemId}/reanalyse`, {
    method: "POST",
    jwt,
  })
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function semanticSearch(
  jwt: string,
  query: SearchQuery
): Promise<SearchResponse> {
  return request<SearchResponse>("/api/search", {
    method: "POST",
    jwt,
    body: JSON.stringify(query),
  })
}

export async function findRelated(
  jwt: string,
  itemId: string,
  limit = 5
): Promise<SearchResponse> {
  return request<SearchResponse>(
    `/api/search/related/${itemId}?limit=${limit}`,
    { jwt }
  )
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function listCategories(
  jwt: string
): Promise<{ id: string; user_id: string; name: string; color: string }[]> {
  return request("/api/categories", { jwt })
}

export async function createCategory(
  jwt: string,
  payload: { name: string; color: string }
): Promise<{ id: string; user_id: string; name: string; color: string }> {
  return request("/api/categories", {
    method: "POST",
    jwt,
    body: JSON.stringify(payload),
  })
}

export async function updateCategory(
  jwt: string,
  categoryId: string,
  payload: { name?: string; color?: string }
): Promise<{ id: string; user_id: string; name: string; color: string }> {
  return request(`/api/categories/${categoryId}`, {
    method: "PATCH",
    jwt,
    body: JSON.stringify(payload),
  })
}

export async function deleteCategory(
  jwt: string,
  categoryId: string
): Promise<{ success: boolean }> {
  return request(`/api/categories/${categoryId}`, { method: "DELETE", jwt })
}

// ── Counts ─────────────────────────────────────────────────────────────────────

export async function getItemCounts(
  jwt: string,
  params: { platform?: string; category_id?: string } = {}
): Promise<{
  total: number
  by_platform: Record<string, number>
  by_category: Record<string, number>
}> {
  const sp = new URLSearchParams()
  if (params.platform) sp.set("platform", params.platform)
  if (params.category_id) sp.set("category_id", params.category_id)
  const qs = sp.toString()
  const url = qs ? `/api/items/counts?${qs}` : "/api/items/counts"
  return request(url, { jwt })
}

// ── Digest ────────────────────────────────────────────────────────────────────

export async function getDigestSettings(jwt: string): Promise<DigestSettings> {
  return request<DigestSettings>("/api/digest/settings", { jwt })
}

export async function updateDigestSettings(
  jwt: string,
  payload: { enabled?: boolean; frequency?: DigestFrequency }
): Promise<DigestSettings> {
  return request<DigestSettings>("/api/digest/settings", {
    method: "PATCH",
    jwt,
    body: JSON.stringify(payload),
  })
}

export async function generateDigest(
  jwt: string
): Promise<{ items: Item[]; count: number }> {
  return request("/api/digest/generate", { method: "POST", jwt })
}

// ── Health ─────────────────────────────────────────────────────────────────────

export async function healthCheck(): Promise<{ status: string }> {
  return request<{ status: string }>("/health")
}