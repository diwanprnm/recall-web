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
    <div className="bg-white border border-slate-100 rounded-2xl px-2.5 sm:px-3 py-2.5 sm:py-3 mb-6 flex items-center gap-2 overflow-x-auto scrollbar-hide shadow-sm">
      <span className="hidden sm:inline text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1 pr-1 flex-shrink-0">
        Filter
      </span>
      {/* Filter icon — visible on mobile where the label is hidden */}
      <span className="sm:hidden flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </span>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* All button */}
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
            !activePlatform
              ? "bg-[#5CC061] text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <span>All</span>
          {totalCount !== undefined && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                !activePlatform
                  ? "bg-[#005316] text-white"
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
              type="button"
              onClick={() => onChange(isActive ? null : p)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
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