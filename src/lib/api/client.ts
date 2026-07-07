/**
 * Recall API client — talks to FastAPI backend (recall-api)
 *
 * All calls require Supabase JWT in Authorization header.
 * The JWT is obtained from Supabase Auth.
 */
import type {
  Item,
  ItemCreate,
  ItemUpdate,
  PaginatedResponse,
  SearchQuery,
  SearchResponse,
  UserProfile,
} from "@/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function request<T>(
  path: string,
  options: RequestInit & { jwt?: string } = {}
): Promise<T> {
  const { jwt, ...fetchOptions } = options

  const res = await fetch(`${API_URL}${path}`, {
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
  if (params.is_favorite !== undefined)
    sp.set("is_favorite", String(params.is_favorite))
  if (params.is_archived !== undefined)
    sp.set("is_archived", String(params.is_archived))
  if (params.page) sp.set("page", String(params.page))
  if (params.per_page) sp.set("per_page", String(params.per_page))
  if (params.search) sp.set("search", params.search)

  const qs = sp.toString()
  return request<PaginatedResponse<Item>>(
    `/api/items${qs ? `?${qs}` : ""}`,
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
  return request<Item>("/api/items", {
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

// ── Health ─────────────────────────────────────────────────────────────────────

export async function healthCheck(): Promise<{ status: string }> {
  return request<{ status: string }>("/health")
}