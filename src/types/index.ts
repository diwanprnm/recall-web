/**
 * Recall App — Shared TypeScript types
 * Must stay in sync with FastAPI Pydantic schemas (app/schemas/schemas.py)
 */

// ── Enums ──────────────────────────────────────────────────────────────────────

export type Platform =
  | "twitter"
  | "instagram"
  | "youtube"
  | "reddit"
  | "linkedin"
  | "tiktok"
  | "facebook"
  | "web"
  | "other"

export type ContentType =
  | "post"
  | "thread"
  | "video"
  | "article"
  | "image"
  | "comment"
  | "reel"
  | "story"
  | "unknown"

export type Sentiment = "positive" | "negative" | "neutral" | "mixed"

export type ViewMode = "grid" | "list"
export type DigestFrequency = "daily" | "weekly" | "biweekly"

// ── AI Analysis ────────────────────────────────────────────────────────────────

export interface ContentSummary {
  one_liner: string
  key_points: string[]
}

export interface ContentClassification {
  primary_topics: string[]
  content_type: ContentType
  sentiment: Sentiment
  relevance_score: number // 1-5
  actionability: "high" | "medium" | "low" | "none"
}

export interface ExtractedEntities {
  people: string[]
  organizations: string[]
  products: string[]
  technologies: string[]
  hashtags: string[]
}

export interface ContentAnalysis {
  summary: ContentSummary
  classification: ContentClassification
  entities: ExtractedEntities
  suggested_tags: string[]
  quality_score: number // 1-5
}

// ── Item ──────────────────────────────────────────────────────────────────────

export interface Item {
  id: string
  user_id: string
  url: string
  platform: Platform
  original_id: string | null
  title: string | null
  text: string | null
  author: string | null
  author_handle: string | null
  author_avatar: string | null
  thumbnail_url: string | null
  summary: string | null
  key_points: { point: string }[] | null
  sentiment: string | null
  quality_score: number | null
  // embedding: number[] | null  — not returned to client
  saved_at: string
  read_at: string | null
  is_favorite: boolean
  is_archived: boolean
  category_id: string | null
  category_name: string | null
  tags: string[]
}

// ── Item Creation ─────────────────────────────────────────────────────────────

export interface ItemCreate {
  url: string
  platform: Platform
  original_id?: string
  title?: string
  text?: string
  author?: string
  author_handle?: string
  author_avatar?: string
  thumbnail_url?: string
  override_tags?: string[]
  override_category?: string
}

export interface ItemUpdate {
  title?: string
  text?: string
  is_favorite?: boolean
  is_archived?: boolean
  read_at?: string
  override_tags?: string[]
  override_category?: string
}

// ── Search ─────────────────────────────────────────────────────────────────────

export interface SearchQuery {
  query: string
  platform?: Platform
  tags?: string[]
  limit?: number
}

export interface SearchResult {
  item: Item
  similarity: number
  highlight: string | null
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
  took_ms: number
}

// ── Paginated ─────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  has_more: boolean
}

// ── User ───────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  created_at: string
}

// ── Tag & Category ────────────────────────────────────────────────────────────

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
}

// ── Digest ────────────────────────────────────────────────────────────────────

export interface DigestSettings {
  id: string
  user_id: string
  enabled: boolean
  frequency: DigestFrequency
  last_sent_at: string | null
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_items: number
  total_favorites: number
  twitter_count: number
  youtube_count: number
  reddit_count: number
  instagram_count: number
  total_categories: number
  total_tags: number
  last_saved_at: string | null
}

// ── Platform Meta ─────────────────────────────────────────────────────────────

export const PLATFORM_META: Record<Platform, { label: string; color: string; bg: string }> = {
  twitter: { label: "Twitter/X", color: "text-[#1DA1F2]", bg: "bg-[#1DA1F2]/10" },
  instagram: { label: "Instagram", color: "text-pink-600", bg: "bg-pink-100" },
  youtube: { label: "YouTube", color: "text-red-500", bg: "bg-red-50" },
  reddit: { label: "Reddit", color: "text-orange-500", bg: "bg-orange-50" },
  linkedin: { label: "LinkedIn", color: "text-blue-700", bg: "bg-blue-50" },
  tiktok: { label: "TikTok", color: "text-pink-500", bg: "bg-pink-50" },
  facebook: { label: "Facebook", color: "text-blue-600", bg: "bg-blue-50" },
  web: { label: "Web", color: "text-slate-600", bg: "bg-slate-100" },
  other: { label: "Other", color: "text-slate-500", bg: "bg-slate-100" },
}