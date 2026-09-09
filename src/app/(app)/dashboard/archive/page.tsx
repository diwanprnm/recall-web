"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useItems } from "@/hooks/use-items";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ItemCard } from "@/components/items/item-card";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toaster";
import { deleteItem } from "@/lib/api";
import { type Item } from "@/types";
import { Loader2, Archive, Trash2, AlertTriangle } from "lucide-react";

export default function ArchivePage() {
  const { user, getJwt } = useAuth();
  const [jwt, setJwt] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load JWT
  useEffect(() => {
    if (user && !jwt) getJwt().then(setJwt);
  }, [user, jwt, getJwt]);

  const { data, loading, error, update, refetch } = useItems({
    jwt,
    isArchived: true,
  });

  const handleItemClick = (item: Item) => {
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  const handleConfirmDelete = async () => {
    if (!jwt || !deletingItem) return;
    setDeleteLoading(true);
    try {
      await deleteItem(jwt, deletingItem.id, true);
      setDeletingItem(null);
      refetch();
      toast({ title: "Item permanently deleted", variant: "success" });
    } catch {
      toast({ title: "Failed to delete item", variant: "error" });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 lg:pl-64">
        <Header viewMode={viewMode} onViewModeChange={setViewMode} />
        <main className="p-4 sm:p-5 md:p-6 max-w-7xl mx-auto pt-16 sm:pt-6">
          {/* Page header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <Archive className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Archive</h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {data?.total ?? 0} archived items
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
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400 mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && (!data || data.data.length === 0) && (
            <EmptyState
              title="Archive is empty"
              description="Archive items to keep your library clean without losing anything."
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
                      title: i.is_favorite
                        ? "Removed from favorites"
                        : "Added to favorites",
                      variant: "success",
                    })
                  }}
                  onArchive={async (i) => {
                    await update(i.id, { is_archived: !i.is_archived })
                    toast({ title: "Unarchived", variant: "success" })
                  }}
                  onEdit={(i) => setDeletingItem(i)}
                  onClick={handleItemClick}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Permanent delete confirmation */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleteLoading && setDeletingItem(null)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100 dark:border-slate-800 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Permanently delete?
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  &quot;{deletingItem.title || deletingItem.url}&quot; will be
                  permanently deleted. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleteLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
