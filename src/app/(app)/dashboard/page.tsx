"use client"

import { useState, useEffect, Suspense } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useItems } from "@/hooks/use-items"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { PlatformFilterBar } from "@/components/layout/platform-filter-bar"
import { ItemCard } from "@/components/items/item-card"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "@/components/ui/toaster"
import { ShareToRecallButton } from "@/components/pwa/share-button"
import { type Item, type Platform } from "@/types"
import { formatDistanceToNow } from "date-fns"
import { useSearchParams } from "next/navigation"
import { X, Loader2, Link as LinkIcon, ChevronDown } from "lucide-react"
import { createItem, ApiError } from "@/lib/api"


function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        <div className={`w-10 h-10 rounded-xl ${color || "bg-blue-100"} flex items-center justify-center`}>
          <div className="w-5 h-5" />
        </div>
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}


function DashboardContent() {
  const { user, getJwt } = useAuth()
  const [jwt, setJwt] = useState<string | null>(null)
  const [platformFilter, setPlatformFilter] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showAddModal, setShowAddModal] = useState(false)
  const [addUrlPrefill, setAddUrlPrefill] = useState("")
  const searchParams = useSearchParams()

  // Handle ?add_url= from Web Share API / ShareToRecallButton
  useEffect(() => {
    const urlParam = searchParams.get("add_url")
    if (urlParam) {
      setAddUrlPrefill(urlParam)
      setShowAddModal(true)
    }
  }, [searchParams])

  // Load JWT once user is available
  useEffect(() => {
    if (user && !jwt) {
      getJwt().then(setJwt)
    }
  }, [user, jwt, getJwt])

  const { data, loading, error, refetch } = useItems({
    jwt,
    platform: platformFilter ?? undefined,
    isArchived: false,
  })

  const handleItemClick = (item: Item) => {
    window.open(item.url, "_blank", "noopener,noreferrer")
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Header
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddClick={() => setShowAddModal(true)}
        />
        <main className="p-4 sm:p-5 md:p-6 max-w-7xl mx-auto pt-16 sm:pt-6">

          {/* Hero */}
          <div className="mb-6 gradient-hero rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold mb-1">{greeting()}! 👋</h2>
                <p className="text-white/80 text-sm">
                  {data?.total ?? 0} items saved
                  {data && data.total > 0 && ` · last saved ${formatDistanceToNow(new Date(data.data[0]?.saved_at), { addSuffix: true })}`}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition flex-1 sm:flex-none justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="sm:inline">Add New</span>
                </button>
                <ShareToRecallButton />
              </div>
            </div>
          </div>

          {/* Stats grid — 2 col mobile, 4 col desktop */}
          {data && data.total > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 sm:mb-8">
              <StatCard label="Total Items" value={data.total} color="bg-blue-100" />
              <StatCard label="Auto Tags" value={new Set(data.data.flatMap((i) => i.tags)).size} sub="Unique tags" color="bg-purple-100" />
              <StatCard label="Favorites" value={data.data.filter((i) => i.is_favorite).length} color="bg-pink-100" />
              <StatCard label="This Week" value={data.data.filter((i) => {
                const d = new Date(i.saved_at)
                const now = new Date()
                return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) < 7
              }).length} sub="New saves" color="bg-amber-100" />
            </div>
          )}

          {/* Platform filter — horizontal scrollable row below stats */}
          {data && data.total > 0 && (
            <PlatformFilterBar
              activePlatform={platformFilter}
              onChange={setPlatformFilter}
              countsByPlatform={(() => {
                const counts: Record<string, number> = {}
                data.data.forEach((i) => { counts[i.platform] = (counts[i.platform] || 0) + 1 })
                return counts
              })()}
              totalCount={data.total}
            />
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Items grid/list — responsive: 1 col mobile, 2 tablet, 3 desktop */}
          {!loading && data && data.data.length > 0 && (
            <div className={viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 stagger-children"
              : "flex flex-col gap-3 stagger-children"
            }>
              {data.data.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  viewMode={viewMode}
                  onFavorite={(i) => toast({ title: i.is_favorite ? "Removed from favorites" : "Added to favorites", variant: "success" })}
                  onClick={handleItemClick}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && (!data || data.data.length === 0) && (
            <div className="px-4">
              <EmptyState
                title="Your library is empty"
                description="Start saving content from social media. Install the browser extension or paste a URL above."
                action={{ label: "Save your first item", onClick: () => setShowAddModal(true) }}
              />
            </div>
          )}

          {/* Load more */}
          {data?.has_more && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl text-sm font-medium text-slate-600 shadow-sm border hover:shadow-md transition"
              >
                Load more
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItemModal
          jwt={jwt}
          initialUrl={addUrlPrefill}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            refetch()
            setShowAddModal(false)
            toast({ title: "Item saved!", description: "AI is analysing your content...", variant: "success" })
          }}
        />
      )}
    </div>
  )
}


function AddItemModal({ jwt, initialUrl, onClose, onSuccess }: {
  jwt: string | null
  initialUrl: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [url, setUrl] = useState(initialUrl || "")
  const [platform, setPlatform] = useState<Platform>("web")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!jwt || !url.trim()) return
    setLoading(true)
    setError(null)
    try {
      await createItem(jwt, { url: url.trim(), platform })
      onSuccess()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save item")
    } finally {
      setLoading(false)
    }
  }

  const platforms: { value: Platform; label: string }[] = [
    { value: "twitter", label: "Twitter/X" },
    { value: "reddit", label: "Reddit" },
    { value: "youtube", label: "YouTube" },
    { value: "instagram", label: "Instagram" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "tiktok", label: "TikTok" },
    { value: "web", label: "Web Article" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold text-slate-900">Save new content</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">URL</label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://x.com/user/status/123"
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm"
            >
              {platforms.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading || !jwt || !url.trim()}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Saving & analysing..." : "Save item"}
          </button>
        </form>
      </div>
    </div>
  )
}


export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}