"use client"

import { useEffect, useId, useRef, useState, type ReactNode } from "react"
import { type Platform, PLATFORM_META } from "@/types"
import { cn } from "@/lib/utils"
import {
  SlidersHorizontal,
  FolderOpen,
  Globe,
  RotateCcw,
} from "lucide-react"

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

interface CategoryOption {
  id: string
  name: string
  color: string
}

interface FilterBarProps {
  activePlatform: string | null
  onPlatformChange: (p: string | null) => void
  platformCounts?: Record<string, number>
  categories: CategoryOption[]
  activeCategory: string | null
  onCategoryChange: (id: string | null) => void
  /** Counts keyed by category id */
  categoryCounts?: Record<string, number>
  platformTotal?: number
  categoryTotal?: number
}

/** Shared pill styles so both sections read as one system. */
const PILL =
  "flex-shrink-0 flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap border"
const PILL_INACTIVE = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
const PILL_DISABLED = "opacity-40 cursor-not-allowed hover:bg-white dark:hover:bg-slate-900"

/** Small count badge inside a pill. */
function CountBadge({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <span
      className={cn(
        "text-[10px] px-1.5 py-0.5 rounded-full",
        active ? "bg-white/25 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
      )}
    >
      {children}
    </span>
  )
}

/** Section label — icon + uppercase title, identical for both sections. */
function SectionLabel({
  icon,
  title,
  className,
}: {
  icon: ReactNode
  title: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-1.5 px-3 sm:px-4", className)}>
      {icon}
      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {title}
      </span>
    </div>
  )
}

/**
 * Horizontally-scrollable pill row. Puts a soft fade on the right edge when
 * there's more content off-screen — a scrollbar-free hint that it can be
 * swiped/scrolled further.
 */
function ScrollRow({
  children,
  className,
  deps,
}: {
  children: ReactNode
  className?: string
  /** Values whose change should re-measure whether scrolling is possible */
  deps: unknown[]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () =>
      setCanScrollRight(el.scrollWidth > el.clientWidth + el.scrollLeft + 4)
    update()
    el.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      el.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return (
    <div className={cn("relative px-3 sm:px-4", className)}>
      <div
        ref={ref}
        className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide"
      >
        {children}
      </div>
      {canScrollRight && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white dark:from-slate-900 to-transparent"
          aria-hidden
        />
      )}
    </div>
  )
}

/**
 * Unified category + platform filters.
 *
 * One card, two labeled pill rows (category + platform) with live counts.
 * Both rows scroll horizontally with a fade hint on the right edge; the same
 * layout works on mobile and desktop. "Reset" clears every active filter.
 */
export function FilterBar({
  activePlatform,
  onPlatformChange,
  platformCounts,
  categories,
  activeCategory,
  onCategoryChange,
  categoryCounts,
  platformTotal,
  categoryTotal,
}: FilterBarProps) {
  const labelId = useId()
  const hasFilter = activePlatform !== null || activeCategory !== null

  const reset = () => {
    if (activeCategory !== null) onCategoryChange(null)
    if (activePlatform !== null) onPlatformChange(null)
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm mb-6 overflow-hidden">
      {/* Header row — title + reset */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 pt-2.5 sm:pt-3 pb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden />
          <span id={labelId}>Browse &amp; filter</span>
        </div>
        {hasFilter && (
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg px-2 py-1 transition"
          >
            <RotateCcw className="w-3 h-3" aria-hidden />
            Reset
          </button>
        )}
      </div>

      {/* Category section */}
      <SectionLabel
        icon={<FolderOpen className="w-3.5 h-3.5 text-[#1F8932]" aria-hidden />}
        title="By category"
      />
      <ScrollRow className="pb-2.5 pt-1.5" deps={[categories.length, categoryCounts]}>
        <button
          type="button"
          aria-pressed={activeCategory === null}
          onClick={() => onCategoryChange(null)}
          className={cn(
            PILL,
            activeCategory === null
              ? "bg-[#1F8932] border-[#1F8932] text-white shadow-sm"
              : PILL_INACTIVE,
          )}
        >
          <span>All categories</span>
          {categoryTotal !== undefined && (
            <CountBadge active={activeCategory === null}>{categoryTotal}</CountBadge>
          )}
        </button>

        {categories.map((cat) => {
          const isActive = activeCategory === cat.id
          const count = categoryCounts?.[cat.id] ?? 0
          return (
            <button
              key={cat.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onCategoryChange(isActive ? null : cat.id)}
              disabled={count === 0}
              className={cn(
                PILL,
                isActive
                  ? "bg-[#1F8932] border-[#1F8932] text-white shadow-sm"
                  : PILL_INACTIVE,
                count === 0 && PILL_DISABLED,
              )}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: isActive ? "#ffffff" : cat.color }}
              />
              <span className="max-w-[8rem] truncate">{cat.name}</span>
              {count > 0 && <CountBadge active={isActive}>{count}</CountBadge>}
            </button>
          )
        })}
      </ScrollRow>

      {/* Platform section */}
      <SectionLabel
        icon={<Globe className="w-3.5 h-3.5 text-[#5CC061]" aria-hidden />}
        title="By platform"
        className="pt-2 border-t border-slate-100 dark:border-slate-800"
      />
      <ScrollRow className="pb-2.5 pt-1.5" deps={[PLATFORMS.length, platformCounts]}>
        <button
          type="button"
          aria-pressed={activePlatform === null}
          onClick={() => onPlatformChange(null)}
          className={cn(
            PILL,
            activePlatform === null
              ? "bg-[#5CC061] border-[#5CC061] text-white shadow-sm"
              : PILL_INACTIVE,
          )}
        >
          <span>All platforms</span>
          {platformTotal !== undefined && (
            <CountBadge active={activePlatform === null}>{platformTotal}</CountBadge>
          )}
        </button>

        {PLATFORMS.map((p) => {
          const meta = PLATFORM_META[p]
          const count = platformCounts?.[p] || 0
          const isActive = activePlatform === p
          return (
            <button
              key={p}
              type="button"
              aria-pressed={isActive}
              onClick={() => onPlatformChange(isActive ? null : p)}
              disabled={count === 0}
              className={cn(
                PILL,
                isActive
                  ? `${meta.bg} ${meta.color} border-transparent ring-2 ring-offset-1 ring-current`
                  : PILL_INACTIVE,
                count === 0 && PILL_DISABLED,
              )}
            >
              <span className="capitalize">{meta.label}</span>
              {count > 0 && <CountBadge active={isActive}>{count}</CountBadge>}
            </button>
          )
        })}
      </ScrollRow>
    </div>
  )
}
