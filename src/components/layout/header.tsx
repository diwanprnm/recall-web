"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Bell, Plus, Grid2x2, List, X, Search as SearchIcon } from "lucide-react"
import { type Platform, PLATFORM_META } from "@/types"

const PLATFORMS: Platform[] = ["twitter", "youtube", "reddit", "instagram", "linkedin", "tiktok", "facebook", "web"]

interface HeaderProps {
  activePlatform?: string
  onPlatformChange?: (p: string | null) => void
  viewMode: "grid" | "list"
  onViewModeChange: (v: "grid" | "list") => void
  onAddClick?: () => void
}

export function Header({ activePlatform, onPlatformChange, viewMode, onViewModeChange, onAddClick }: HeaderProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/dashboard/search?q=${encodeURIComponent(query.trim())}`)
    setFocused(false)
    setQuery("")
  }

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center px-6 gap-4 sticky top-0 z-20">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Search by idea, not keyword..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent search-input transition"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Platform filter pills */}
      <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => onPlatformChange?.(null)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
            !activePlatform
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All
        </button>
        {PLATFORMS.map((p) => {
          const meta = PLATFORM_META[p]
          return (
            <button
              key={p}
              onClick={() => onPlatformChange?.(activePlatform === p ? null : p)}
              className={`platform-badge whitespace-nowrap ${
                activePlatform === p ? meta.bg + " " + meta.color : "bg-slate-100 text-slate-500"
              }`}
            >
              {meta.label}
            </button>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* View toggle */}
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded-md transition ${
              viewMode === "grid" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"
            }`}
            title="Grid view"
          >
            <Grid2x2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2 rounded-md transition ${
              viewMode === "list" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Add button */}
        <button
          onClick={onAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
            2
          </span>
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
          {user?.email?.[0]?.toUpperCase() ?? "?"}
        </div>
      </div>
    </header>
  )
}