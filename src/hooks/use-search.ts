"use client"

import { useState, useCallback } from "react"
import { semanticSearch, findRelated, ApiError } from "@/lib/api"
import type { SearchQuery, SearchResponse } from "@/types"

export function useSearch(jwt: string | null) {
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(
    async (query: string, filters?: { platform?: string; tags?: string[]; limit?: number }) => {
      if (!jwt || !query.trim()) return
      setLoading(true)
      setError(null)
      try {
        const result = await semanticSearch(jwt, {
          query: query.trim(),
          platform: filters?.platform as SearchQuery["platform"],
          tags: filters?.tags,
          limit: filters?.limit ?? 20,
        })
        setResults(result)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Search failed")
      } finally {
        setLoading(false)
      }
    },
    [jwt]
  )

  const findSimilar = useCallback(
    async (itemId: string, limit = 5) => {
      if (!jwt) return
      try {
        const result = await findRelated(jwt, itemId, limit)
        return result
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Search failed")
      }
    },
    [jwt]
  )

  const clear = () => {
    setResults(null)
    setError(null)
  }

  return { results, loading, error, search, findSimilar, clear }
}