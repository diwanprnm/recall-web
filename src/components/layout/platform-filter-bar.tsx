"use client"

import { type Platform, PLATFORM_META } from "@/types"

const PLATFORMS: Platform[] = [
  "twitter",
  "youtube",
  "reddit",
  "instagram",
  "linkedin",
  "tiktok",
  "facebook",
  "web",
]

interface PlatformFilterBarProps {
  activePlatform: string | null
  onChange: (p: string | null) => void
  countsByPlatform?: Record<string, number>
  totalCount?: number
}

export function PlatformFilterBar({
  activePlatform,
  onChange,
  countsByPlatform,
  totalCount,
}: PlatformFilterBarProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl px-3 py-3 sm:py-2.5 mb-6 flex items-center gap-2 overflow-x-auto scrollbar-hide">
      <span className="hidden sm:inline text-xs font-semibold text-slate-400 uppercase tracking-wider pr-1 flex-shrink-0">
        Filter
      </span>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* All button */}
        <button
          onClick={() => onChange(null)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
            !activePlatform
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <span>All</span>
          {totalCount !== undefined && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                !activePlatform
                  ? "bg-blue-700 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {totalCount}
            </span>
          )}
        </button>

        {/* Platform pills */}
        {PLATFORMS.map((p) => {
          const meta = PLATFORM_META[p]
          const count = countsByPlatform?.[p] || 0
          const isActive = activePlatform === p
          return (
            <button
              key={p}
              onClick={() => onChange(isActive ? null : p)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? `${meta.bg} ${meta.color} ring-2 ring-offset-1 ring-current`
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              disabled={count === 0}
            >
              <span className="capitalize">{meta.label}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-white/30" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}