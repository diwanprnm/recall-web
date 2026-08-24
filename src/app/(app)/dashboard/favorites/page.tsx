"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useItems } from "@/hooks/use-items";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ItemCard } from "@/components/items/item-card";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toaster";
import { type Item } from "@/types";
import { Loader2, Heart } from "lucide-react";

export default function FavoritesPage() {
  const { user, getJwt } = useAuth();
  const [jwt, setJwt] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Load JWT
  useEffect(() => {
    if (user && !jwt) getJwt().then(setJwt);
  }, [user, jwt, getJwt]);

  const { data, loading, error, update } = useItems({
    jwt,
    isFavorite: true,
    isArchived: false,
  });

  const handleItemClick = (item: Item) => {
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 lg:pl-64">
        <Header viewMode={viewMode} onViewModeChange={setViewMode} />
        <main className="p-4 sm:p-5 md:p-6 max-w-7xl mx-auto pt-16 sm:pt-6">
          {/* Page header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <Heart className="w-5 h-5 text-[#1F8932] fill-[#1F8932]" />
              <h1 className="text-xl font-bold text-slate-900">Favorites</h1>
            </div>
            <p className="text-sm text-slate-500">
              {data?.total ?? 0} saved items
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#5CC061]" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && (!data || data.data.length === 0) && (
            <EmptyState
              title="No favorites yet"
              description="Tap the heart icon on any item to add it here."
            />
          )}

          {/* Items */}
          {!loading && data && data.data.length > 0 && (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5"
                  : "flex flex-col gap-3"
              }
            >
              {data.data.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  viewMode={viewMode}
                  onFavorite={async (i) => {
                    await update(i.id, { is_favorite: !i.is_favorite })
                    toast({
                      title: "Removed from favorites",
                      variant: "success",
                    })
                  }}
                  onArchive={async (i) => {
                    await update(i.id, { is_archived: !i.is_archived })
                    toast({ title: "Archived", variant: "success" })
                  }}
                  onClick={handleItemClick}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
