"use client"

import { useState, useEffect, Suspense } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useSearch } from "@/hooks/use-search"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { ItemCard } from "@/components/items/item-card"
import { EmptyState } from "@/components/ui/empty-state"
import { SkeletonList } from "@/components/ui/skeleton-card"
import { Search, Loader2, Zap } from "lucide-react"
import { useSearchParams } from "next/navigation"

function SearchContent() {
  const searchParams = useSearchParams()
  const { user, getJwt } = useAuth()
  const [jwt, setJwt] = useState<string | null>(null)
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [activePlatform] = useState<string | null>(null)

  // Load JWT
  useEffect(() => {
    if (user && !jwt) {
      getJwt().then(setJwt)
    }
  }, [user, jwt, getJwt])

  const { results, loading, error, search, clear } = useSearch(jwt)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    await search(query.trim(), { platform: activePlatform ?? undefined })
  }

  const exampleQueries = [
    "things about LLM fine-tuning",
    "startup advice for solo founders",
    "design system best practices",
    "rust vs go performance",
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 lg:pl-64">
        <Header viewMode="grid" onViewModeChange={() => {}} />
      {/* Search bar */}
      <form onSubmit={handleSearch} className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything — 'things about AI coding assistants' or 'marketing strategies for B2B SaaS'..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5CC061] focus:bg-white dark:focus:bg-slate-900 transition search-input"
            />
            {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#5CC061]" />}
          </div>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="px-6 py-3 bg-[#5CC061] hover:bg-[#1F8932] text-white rounded-2xl text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Search
          </button>
        </div>

        {/* Example queries */}
        {query === "" && (
          <div className="max-w-3xl mx-auto mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-slate-400 dark:text-slate-500">Try:</span>
            {exampleQueries.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuery(q)
                  search(q)
                }}
                className="text-xs text-[#1F8932] dark:text-[#5CC061] bg-[#5CC061]/10 hover:bg-[#5CC061]/20 px-2.5 py-1 rounded-full transition"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Results */}
      <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
        {/* Meta */}
        {results && (
          <div className="mb-4 flex items-center gap-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Found <strong className="text-slate-800 dark:text-slate-200">{results.total}</strong> results for{" "}
              <em>&ldquo;{results.query}&rdquo;</em>
            </p>
            <span className="text-xs text-slate-400 dark:text-slate-500">{Math.round(results.took_ms)}ms</span>
            <button onClick={clear} className="text-xs text-[#1F8932] dark:text-[#5CC061] hover:underline ml-auto">
              Clear
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && <SkeletonList rows={6} viewMode="list" />}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400 mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results */}
        {results && results.results.length > 0 && (
          <div className="space-y-3">
            {results.results.map(({ item, similarity }) => (
              <div key={item.id} className="relative">
                <ItemCard
                  item={item}
                  viewMode="list"
                  onClick={(i) => window.open(i.url, "_blank", "noopener,noreferrer")}
                />
                {/* Similarity badge */}
                <div className="absolute top-4 right-4">
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                    {Math.round(similarity * 100)}% match
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty / prompt */}
        {!loading && !results && (
          <EmptyState
            title="Semantic search"
            description="Search by meaning, not just keywords. Try 'things I saved about X' and find results even with different words."
          />
        )}

        {/* No results */}
        {!loading && results && results.results.length === 0 && (
          <EmptyState
            title="No matches found"
            description={`Try different words — semantic search understands meaning, not just exact matches.`}
          />
        )}
      </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SkeletonList rows={6} viewMode="list" />}>
      <SearchContent />
    </Suspense>
  )
}