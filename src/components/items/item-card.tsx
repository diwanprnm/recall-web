"use client"

import { Heart, ExternalLink } from "lucide-react"
import type { Item } from "@/types"
import { PLATFORM_META } from "@/types"
import { formatDistanceToNow } from "date-fns"

interface ItemCardProps {
  item: Item
  viewMode: "grid" | "list"
  onFavorite?: (item: Item) => void
  onArchive?: (item: Item) => void
  onClick?: (item: Item) => void
}

// Platform icons as SVG paths
function PlatformIcon({ platform }: { platform: string }) {
  const icons: Record<string, React.ReactNode> = {
    twitter: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    youtube: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
        <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="white" />
      </svg>
    ),
    reddit: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
    instagram: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
        <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1" />
      </svg>
    ),
    linkedin: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
      </svg>
    ),
    tiktok: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
      </svg>
    ),
  }

  return (
    <span className="inline-flex items-center gap-1">
      {icons[platform] ?? null}
    </span>
  )
}

function QualityBadge({ score }: { score: number | null }) {
  if (!score) return null
  const colors: Record<number, string> = {
    5: "bg-emerald-100 text-emerald-700",
    4: "bg-green-100 text-green-700",
    3: "bg-slate-100 text-slate-600",
    2: "bg-amber-100 text-amber-700",
    1: "bg-red-100 text-red-700",
  }
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${colors[score] ?? colors[3]}`}>
      {score}/5
    </span>
  )
}

export function ItemCard({ item, viewMode, onFavorite, onClick }: ItemCardProps) {
  const meta = PLATFORM_META[item.platform]
  const timeAgo = item.saved_at
    ? formatDistanceToNow(new Date(item.saved_at), { addSuffix: true })
    : ""

  if (viewMode === "list") {
    return (
      <div
        onClick={() => onClick?.(item)}
        className="item-card group flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md cursor-pointer animate-fade-in"
      >
        {/* Platform icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.color}`}>
          <PlatformIcon platform={item.platform} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm text-slate-900 truncate">
              {item.title || "Untitled"}
            </h3>
            <QualityBadge score={item.quality_score} />
          </div>
          <p className="text-xs text-slate-500 line-clamp-1">{item.summary || item.text?.slice(0, 100) || ""}</p>
          <div className="flex items-center gap-3 mt-1.5">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[11px] text-slate-400">#{tag}</span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-[11px] text-slate-400">+{item.tags.length - 3}</span>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-slate-400 flex-shrink-0">
          <span>{timeAgo}</span>
          {item.is_favorite && <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-slate-100"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div
      onClick={() => onClick?.(item)}
      className="item-card bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-slate-200 hover:shadow-lg cursor-pointer animate-fade-in"
    >
      {/* Thumbnail / Platform header */}
      <div className={`h-36 relative ${meta.bg} flex items-center justify-center`}>
        {item.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/50">
            <PlatformIcon platform={item.platform} />
          </div>
        )}

        {/* Platform badge */}
        <span className={`absolute top-3 left-3 platform-badge text-[10px] ${meta.bg} ${meta.color} bg-white border border-white/50`}>
          <PlatformIcon platform={item.platform} />
          {meta.label}
        </span>

        {/* Favorite */}
        {item.is_favorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onFavorite?.(item) }}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-white"
          >
            <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
          </button>
        )}

        {/* AI badge if analysed */}
        {item.summary && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1.5 text-[10px] text-slate-600 flex items-center gap-1">
              <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI: {item.summary?.slice(0, 50)}...
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {item.author && (
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 flex-shrink-0">
              {item.author[0]}
            </div>
          )}
          <div className="min-w-0">
            {item.author && (
              <p className="text-[11px] text-slate-500 truncate">{item.author}</p>
            )}
          </div>
          <QualityBadge score={item.quality_score} />
        </div>

        <h3 className="font-semibold text-sm text-slate-900 mb-1.5 line-clamp-2 leading-snug">
          {item.title || "Untitled"}
        </h3>

        {item.summary && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.summary}</p>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag-pill bg-slate-100 text-slate-600">
                #{tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="tag-pill bg-slate-100 text-slate-400">+{item.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{timeAgo}</span>
          <div className="flex items-center gap-2">
            {item.platform === "twitter" && item.author_handle && (
              <span>{item.author_handle}</span>
            )}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}