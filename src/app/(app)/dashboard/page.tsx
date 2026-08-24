"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useItems } from "@/hooks/use-items";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PlatformFilterBar } from "@/components/layout/platform-filter-bar";
import { ItemCard } from "@/components/items/item-card";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toaster";
import { ShareToRecallButton } from "@/components/pwa/share-button";
import { type Item, type Platform } from "@/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useSearchParams, useRouter } from "next/navigation";
import {
  X,
  Loader2,
  Link as LinkIcon,
  ChevronDown,
  Check,
  Plus,
  ChevronsUpDown,
  Archive,
  FolderOpen,
  Tag,
  Clock,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  createItem,
  listCategories,
  getItemCounts,
  deleteItem,
  ApiError,
} from "@/lib/api";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

function StatCard({
  label,
  value,
  sub,
  icon,
  tint,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  tint: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-2xl sm:text-3xl font-bold text-slate-900 leading-none">
          {value}
        </span>
        <div
          className={`w-10 h-10 rounded-xl ${tint} flex items-center justify-center flex-shrink-0`}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function DashboardContent() {
  const { user, getJwt } = useAuth();
  const [jwt, setJwt] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addUrlPrefill, setAddUrlPrefill] = useState("");
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryFilter = searchParams.get("category");

  const handleCategoryChange = (catId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (catId) {
      params.set("category", catId);
    } else {
      params.delete("category");
    }
    router.push(`?${params.toString()}`);
  };

  // Close "More" dropdown on outside click
  useEffect(() => {
    if (!showMoreCategories) return;
    const handler = () => setShowMoreCategories(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showMoreCategories]);

  // Handle ?add_url= from Web Share API / ShareToRecallButton.
  // We adjust state during render (React's recommended pattern) to avoid a
  // synchronous setState in an effect (which would trigger a cascading render).
  const pendingAddUrl = searchParams.get("add_url");
  if (pendingAddUrl && pendingAddUrl !== addUrlPrefill) {
    setAddUrlPrefill(pendingAddUrl);
    setShowAddModal(true);
  }

  // Load JWT once user is available
  useEffect(() => {
    if (user && !jwt) {
      getJwt().then(setJwt);
    }
  }, [user, jwt, getJwt]);

  // Fetch categories
  const [categories, setCategories] = useState<
    { id: string; name: string; color: string }[]
  >([]);
  useEffect(() => {
    if (jwt)
      listCategories(jwt)
        .then(setCategories)
        .catch(() => {});
  }, [jwt]);

  // Fetch global counts (for stats cards)
  const [globalCounts, setGlobalCounts] = useState<{
    total: number;
    by_platform: Record<string, number>;
    by_category: Record<string, number>;
  } | null>(null);
  // Fetch contextual counts (for filter UI) — split so changing one filter doesn't shift the other's counts
  const [platformCounts, setPlatformCounts] = useState<{
    total: number;
    by_platform: Record<string, number>;
  } | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<{
    total: number;
    by_category: Record<string, number>;
  } | null>(null);

  const fetchCounts = useCallback(() => {
    if (!jwt) return;
    // Global counts (no filter)
    getItemCounts(jwt)
      .then(setGlobalCounts)
      .catch(() => {});
    // Platform counts: filtered by category only (not platform)
    getItemCounts(jwt, { category_id: categoryFilter ?? undefined })
      .then(setPlatformCounts)
      .catch(() => {});
    // Category counts: filtered by platform only (not category)
    getItemCounts(jwt, { platform: platformFilter ?? undefined })
      .then(setCategoryCounts)
      .catch(() => {});
  }, [jwt, categoryFilter, platformFilter]);
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const { data, loading, error, refetch, update } = useItems({
    jwt,
    platform: platformFilter ?? undefined,
    category: categoryFilter ?? undefined,
    isArchived: false,
  });

  const handleItemClick = (item: Item) => {
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 lg:pl-64">
        <Header
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddClick={() => setShowAddModal(true)}
        />
        <main className="p-4 sm:p-5 md:p-6 max-w-7xl mx-auto pt-16 sm:pt-6">
          {/* Hero */}
          <div className="mb-6 bg-gradient-to-r from-[#5CC061] to-[#C8FFC1] rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold mb-1">
                  {greeting()}! 👋
                </h2>
                <p className="text-white/80 text-sm">
                  {data?.total ?? 0} items saved
                  {data &&
                    data.total > 0 &&
                    ` · last saved ${formatDistanceToNow(new Date(data.data[0]?.saved_at), { addSuffix: true })}`}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-[#005316] rounded-xl font-semibold text-sm shadow-lg hover:bg-[#006E20] hover:text-[#98FF98] hover:shadow-xl transition flex-1 sm:flex-none justify-center"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
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
              <StatCard
                label="Total Items"
                value={globalCounts?.total ?? data.total}
                sub="All saved content"
                icon={<Archive className="w-5 h-5 text-[#005316]" />}
                tint="bg-emerald-100"
              />
              <StatCard
                label="Categories"
                value={categories.length}
                sub="Active"
                icon={<FolderOpen className="w-5 h-5 text-[#1F8932]" />}
                tint="bg-green-100"
              />
              <StatCard
                label="Platforms"
                value={
                  globalCounts
                    ? Object.keys(globalCounts.by_platform).length
                    : 0
                }
                sub="Used"
                icon={<Tag className="w-5 h-5 text-[#005316]" />}
                tint="bg-emerald-100"
              />
              <StatCard
                label="This Week"
                value={
                  data.data.filter((i) => {
                    const d = new Date(i.saved_at);
                    const now = new Date();
                    return (
                      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) < 7
                    );
                  }).length
                }
                sub="New saves"
                icon={<Clock className="w-5 h-5 text-[#1F8932]" />}
                tint="bg-green-100"
              />
            </div>
          )}

          {/* Category tabs */}
          {data && data.total > 0 && categories.length > 0 && (
            <div className="mb-4 flex items-center gap-1 border-b border-slate-200 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => handleCategoryChange(null)}
                className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  !categoryFilter
                    ? "border-[#1F8932] text-[#1F8932]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                All
                {categoryCounts && (
                  <span className="ml-1.5 text-xs text-slate-400">
                    {categoryCounts.total}
                  </span>
                )}
              </button>
              {categories.slice(0, 3).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    categoryFilter === cat.id
                      ? "border-[#1F8932] text-[#1F8932]"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                  {categoryCounts && (
                    <span className="text-xs text-slate-400">
                      {categoryCounts.by_category[cat.name] ??
                        categoryCounts.by_category[cat.name.toLowerCase()] ??
                        0}
                    </span>
                  )}
                </button>
              ))}
              {categories.length > 3 && (
                <div className="relative flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMoreCategories(!showMoreCategories);
                    }}
                    className={`flex items-center gap-1 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                      categories.slice(3).some((c) => c.id === categoryFilter)
                        ? "border-[#1F8932] text-[#1F8932]"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    More
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {showMoreCategories && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 min-w-[160px]">
                      {categories.slice(3).map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            handleCategoryChange(cat.id);
                            setShowMoreCategories(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                            categoryFilter === cat.id
                              ? "bg-[#5CC061]/10 text-[#1F8932]"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                          {categoryCounts && (
                            <span className="ml-auto text-xs text-slate-400">
                              {categoryCounts.by_category[cat.name] ??
                                categoryCounts.by_category[
                                  cat.name.toLowerCase()
                                ] ??
                                0}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Platform filter */}
          {data && data.total > 0 && (
            <PlatformFilterBar
              activePlatform={platformFilter}
              onChange={setPlatformFilter}
              countsByPlatform={platformCounts?.by_platform}
              totalCount={platformCounts?.total ?? data.total}
            />
          )}

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

          {/* Items grid/list — responsive: 1 col mobile, 2 tablet, 3 desktop */}
          {!loading && data && data.data.length > 0 && (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 stagger-children"
                  : "flex flex-col gap-3 stagger-children"
              }
            >
              {data.data.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  viewMode={viewMode}
                  onFavorite={async (i) => {
                    await update(i.id, { is_favorite: !i.is_favorite });
                    toast({
                      title: i.is_favorite
                        ? "Removed from favorites"
                        : "Added to favorites",
                      variant: "success",
                    });
                  }}
                  onArchive={async (i) => {
                    await update(i.id, { is_archived: !i.is_archived });
                    toast({
                      title: i.is_archived ? "Unarchived" : "Archived",
                      variant: "success",
                    });
                  }}
                  onEdit={(i) => setEditingItem(i)}
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
                action={{
                  label: "Save your first item",
                  onClick: () => setShowAddModal(true),
                }}
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
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            refetch();
            fetchCounts();
            if (jwt)
              listCategories(jwt)
                .then(setCategories)
                .catch(() => {});
            setShowAddModal(false);
            toast({
              title: "Item saved!",
              description: "AI is analysing your content...",
              variant: "success",
            });
          }}
        />
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          categories={categories}
          jwt={jwt}
          onClose={() => setEditingItem(null)}
          onSave={async (itemId, catId) => {
            await update(itemId, { override_category: catId ?? undefined });
            refetch();
            fetchCounts();
            toast({ title: "Item updated", variant: "success" });
          }}
          onDelete={async (itemId) => {
            await deleteItem(jwt ?? "", itemId, true);
            setEditingItem(null);
            refetch();
            fetchCounts();
            toast({ title: "Item permanently deleted", variant: "success" });
          }}
        />
      )}
    </div>
  );
}

function AddItemModal({
  jwt,
  initialUrl,
  categories,
  onClose,
  onSuccess,
}: {
  jwt: string | null;
  initialUrl: string;
  categories: { id: string; name: string; color: string }[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [url, setUrl] = useState(initialUrl || "");
  const [platform, setPlatform] = useState<Platform>("web");
  const [categoryId, setCategoryId] = useState<string>("");
  const [catOpen, setCatOpen] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!jwt || !url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await createItem(jwt, {
        url: url.trim(),
        platform,
        override_category: categoryId || undefined,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save item");
    } finally {
      setLoading(false);
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
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold text-slate-900">
            Save new content
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              URL
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://x.com/user/status/123"
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#5CC061] focus:bg-white transition text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#5CC061] focus:bg-white transition text-sm"
            >
              {platforms.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Category{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <Popover
              open={catOpen}
              onOpenChange={(o) => {
                setCatOpen(o);
                if (!o) setCatSearch("");
              }}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  role="combobox"
                  aria-expanded={catOpen}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#5CC061] focus:bg-white transition text-sm text-left"
                >
                  <span
                    className={categoryId ? "text-slate-900" : "text-slate-400"}
                  >
                    {(() => {
                      if (!categoryId) return "No category";
                      const c = categories.find((x) => x.id === categoryId);
                      return c ? c.name : categoryId;
                    })()}
                  </span>
                  <ChevronsUpDown className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command
                  filter={(value, search) =>
                    value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
                  }
                >
                  <CommandInput
                    placeholder="Search or type new category…"
                    value={catSearch}
                    onValueChange={setCatSearch}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {catSearch.trim() ? (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            const v = catSearch.trim();
                            setCategoryId(v);
                            setCatSearch("");
                            setCatOpen(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setCategoryId(catSearch.trim());
                              setCatSearch("");
                              setCatOpen(false);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1F8932] hover:underline"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Create “{catSearch.trim()}”
                        </span>
                      ) : (
                        "No categories found."
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="__none"
                        onSelect={() => {
                          setCategoryId("");
                          setCatOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "w-4 h-4",
                            categoryId === "" ? "opacity-100" : "opacity-0",
                          )}
                        />
                        No category
                      </CommandItem>
                      {categories.map((c) => (
                        <CommandItem
                          key={c.id}
                          value={c.name}
                          onSelect={() => {
                            setCategoryId(c.id);
                            setCatOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "w-4 h-4",
                              categoryId === c.id ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {c.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !jwt || !url.trim()}
            className="w-full py-2.5 bg-[#5CC061] hover:bg-[#1F8932] text-white rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Saving & analysing..." : "Save item"}
          </button>
        </form>
      </div>
    </div>
  );
}

function EditItemModal({
  item,
  categories,
  jwt,
  onClose,
  onSave,
  onDelete,
}: {
  item: Item;
  categories: { id: string; name: string; color: string }[];
  jwt: string | null;
  onClose: () => void;
  onSave: (itemId: string, categoryId: string | null) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
}) {
  const [categoryId, setCategoryId] = useState(item.category_id ?? "");
  const [loading, setLoading] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!jwt) return;
    setLoading(true);
    try {
      await onSave(item.id, categoryId || null);
      onClose();
    } catch {
      // handled by parent
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!jwt) return;
    setDeleting(true);
    try {
      await onDelete(item.id);
      // onDelete in the parent closes the modal on success.
    } catch {
      toast({ title: "Failed to delete item", variant: "error" });
      setConfirmingDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border">
        {confirmingDelete ? (
          /* ── Destructive confirmation step ── */
          <div className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-slate-900">
                  Delete this item?
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  &quot;{item.title || item.url}&quot; will be permanently
                  deleted. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold text-slate-900">
                Edit item
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1 truncate">
                  {item.title || item.url}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#5CC061] focus:bg-white transition text-sm"
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#5CC061] hover:bg-[#1F8932] text-white rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save changes
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete permanently
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#5CC061]" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
