"use client"

import { useEffect, useState, useCallback } from "react"
import { listItems, createItem, updateItem, deleteItem, reanalyseItem, ApiError } from "@/lib/api"
import type { Item, ItemCreate, ItemUpdate, PaginatedResponse } from "@/types"

interface UseItemsOptions {
  jwt: string | null
  platform?: string
  tag?: string
  isFavorite?: boolean
  isArchived?: boolean
  search?: string
  page?: number
  perPage?: number
}

export function useItems(options: UseItemsOptions) {
  const { jwt, platform, tag, isFavorite, isArchived, search, page = 1, perPage = 20 } = options

  const [data, setData] = useState<PaginatedResponse<Item> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!jwt) return
    setLoading(true)
    setError(null)
    try {
      const result = await listItems(jwt, {
        platform,
        tag,
        is_favorite: isFavorite,
        is_archived: isArchived,
        search,
        page,
        per_page: perPage,
      })
      setData(result)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load items")
    } finally {
      setLoading(false)
    }
  }, [jwt, platform, tag, isFavorite, isArchived, search, page, perPage])

  useEffect(() => {
    fetch()
  }, [fetch])

  const create = async (payload: ItemCreate) => {
    if (!jwt) throw new Error("Not authenticated")
    const item = await createItem(jwt, payload)
    setData((prev) =>
      prev
        ? { ...prev, data: [item, ...prev.data], total: prev.total + 1 }
        : { data: [item], total: 1, page: 1, per_page: 20, has_more: false }
    )
    return item
  }

  const update = async (itemId: string, payload: Partial<ItemUpdate>) => {
    if (!jwt) throw new Error("Not authenticated")
    const updated = await updateItem(jwt, itemId, payload)
    setData((prev) =>
      prev
        ? {
            ...prev,
            data: prev.data.map((i) => (i.id === itemId ? updated : i)),
          }
        : prev
    )
    return updated
  }

  const remove = async (itemId: string, hard = false) => {
    if (!jwt) throw new Error("Not authenticated")
    await deleteItem(jwt, itemId, hard)
    setData((prev) =>
      prev
        ? { ...prev, data: prev.data.filter((i) => i.id !== itemId), total: prev.total - 1 }
        : prev
    )
  }

  const reanalyse = async (itemId: string) => {
    if (!jwt) throw new Error("Not authenticated")
    const updated = await reanalyseItem(jwt, itemId)
    setData((prev) =>
      prev
        ? { ...prev, data: prev.data.map((i) => (i.id === itemId ? updated : i)) }
        : prev
    )
    return updated
  }

  return { data, loading, error, refetch: fetch, create, update, remove, reanalyse }
}