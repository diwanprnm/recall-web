"use client"

import { useState, useEffect, Suspense } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useSearch } from "@/hooks/use-search"
import { Header } from "@/components/layout/header"
import { ItemCard } from "@/components/items/item-card"
import { EmptyState } from "@/components/ui/empty-state"
import { Search, Loader2, Zap } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, getJwt } = useAuth()
  const [jwt, setJwt] = useState<string | null>(null)
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [activePlatform, setActivePlatform] = useState<string | null>(null)

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
    router.push(`/dashboard/search?q=${encodeURIComponent(query.trim())}`)
    await search(query.trim(), { platform: activePlatform ?? undefined })
  }

  const exampleQueries = [
    "things about LLM fine-tuning",
    "startup advice for solo founders",
    "design system best practices",
    "rust vs go performance",
  ]

  return (
    <div className="flex-1 flex flex-col">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="sticky top-0 z-20 bg-white border-b px-6 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything — 'things about AI coding assistants' or 'marketing strategies for B2B SaaS'..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition search-input"
            />
            {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-500" />}
          </div>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Search
          </button>
        </div>

        {/* Example queries */}
        {query === "" && (
          <div className="max-w-3xl mx-auto mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-slate-400">Try:</span>
            {exampleQueries.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuery(q)
                  search(q)
                }}
                className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full transition"
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
            <p className="text-sm text-slate-500">
              Found <strong className="text-slate-800">{results.total}</strong> results for{" "}
              <em>&ldquo;{results.query}&rdquo;</em>
            </p>
            <span className="text-xs text-slate-400">{Math.round(results.took_ms)}ms</span>
            <button onClick={clear} className="text-xs text-blue-600 hover:underline ml-auto">
              Clear
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Search className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-slate-500">Searching your knowledge base...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 mb-4">
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
                  <span className="text-xs font-mono text-slate-400">
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
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}