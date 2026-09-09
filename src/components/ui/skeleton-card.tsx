"use client";

/**
 * Shared skeleton loading treatment — mirrors ItemCard's box model so the
 * swap from skeleton to real content causes no layout jump.
 * Used by library, favorites, archive, search, and digest loading states.
 */

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 ${className}`} />;
}

export function SkeletonCard({ viewMode = "grid" }: { viewMode?: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div className="item-card flex items-stretch gap-2.5 sm:gap-4 p-2.5 sm:p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
        <Skeleton className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="item-card p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
      {/* Thumbnail area */}
      <Skeleton className="aspect-video w-full rounded-lg mb-3" />
      {/* Platform badge + time row */}
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-3 w-12" />
      </div>
      {/* Title lines */}
      <Skeleton className="h-4 w-full mb-1.5" />
      <Skeleton className="h-4 w-2/3 mb-3" />
      {/* Author + actions row */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-6 rounded-lg" />
          <Skeleton className="h-6 w-6 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({
  rows = 6,
  viewMode = "grid",
}: {
  rows?: number;
  viewMode?: "grid" | "list";
}) {
  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading content">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonCard key={i} viewMode="list" />
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5"
      aria-busy="true"
      aria-label="Loading content"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonCard key={i} viewMode="grid" />
      ))}
    </div>
  );
}
