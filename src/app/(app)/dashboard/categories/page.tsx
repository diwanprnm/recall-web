"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useItems } from "@/hooks/use-items";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toaster";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api";
import { Plus, Pencil, Trash2, X, Loader2, FolderOpen } from "lucide-react";
import Link from "next/link";

const COLOR_PRESETS = [
  "#3B82F6",
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
];

interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
}

function CategoryModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Category;
  onClose: () => void;
  onSave: (name: string, color: string) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? COLOR_PRESETS[0]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSave(name.trim(), color);
      onClose();
    } catch {
      toast({ title: "Failed to save category", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold text-slate-900">
            {initial ? "Edit category" : "New category"}
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
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tech, Design, Finance"
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#5CC061] focus:bg-white transition text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition ${
                    color === c
                      ? "border-slate-900 scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-2.5 bg-[#5CC061] hover:bg-[#1F8932] text-white rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {initial ? "Save changes" : "Create category"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ConfirmDelete({
  name,
  onClose,
  onConfirm,
}: {
  name: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      toast({ title: "Failed to delete category", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          Delete category?
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          &quot;{name}&quot; will be removed. Items in this category won&apos;t
          be deleted.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const { user, getJwt } = useAuth();
  const [jwt, setJwt] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // modal state
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  // get item counts per category
  const { data: itemsData } = useItems({ jwt, isArchived: false });

  const fetchCategories = useCallback(async () => {
    if (!jwt) return;
    setLoading(true);
    setError(null);
    try {
      const cats = await listCategories(jwt);
      setCategories(cats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  }, [jwt]);

  useEffect(() => {
    if (user && !jwt) getJwt().then(setJwt);
  }, [user, jwt, getJwt]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, [fetchCategories]);

  const countsById = (() => {
    const m: Record<string, number> = {};
    itemsData?.data.forEach((i) => {
      if (i.category_id) m[i.category_id] = (m[i.category_id] || 0) + 1;
    });
    return m;
  })();

  const handleCreate = async (name: string, color: string) => {
    if (!jwt) return;
    const cat = await createCategory(jwt, { name, color });
    setCategories((prev) => [...prev, cat]);
    toast({ title: "Category created", variant: "success" });
  };

  const handleUpdate = async (name: string, color: string) => {
    if (!jwt || !editing) return;
    const updated = await updateCategory(jwt, editing.id, { name, color });
    setCategories((prev) =>
      prev.map((c) => (c.id === editing.id ? updated : c))
    );
    toast({ title: "Category updated", variant: "success" });
  };

  const handleDelete = async () => {
    if (!jwt || !deleting) return;
    await deleteCategory(jwt, deleting.id);
    setCategories((prev) => prev.filter((c) => c.id !== deleting.id));
    toast({ title: "Category deleted", variant: "success" });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 lg:pl-64">
        <Header viewMode={viewMode} onViewModeChange={setViewMode} />
        <main className="p-4 sm:p-5 md:p-6 max-w-7xl mx-auto pt-16 sm:pt-6">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Categories</h1>
              <p className="text-sm text-slate-500 mt-1">
                {categories.length} categories
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#5CC061] hover:bg-[#1F8932] text-white rounded-xl text-sm font-medium shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              New category
            </button>
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
          {!loading && !error && categories.length === 0 && (
            <EmptyState
              title="No categories yet"
              description="Create categories to organize your saved content."
              action={{
                label: "Create your first category",
                onClick: () => setShowCreate(true),
              }}
            />
          )}

          {/* Grid */}
          {!loading && categories.length > 0 && (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                  : "flex flex-col gap-3"
              }
            >
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition group"
                >
                  <Link
                    href={`/dashboard?category=${cat.id}`}
                    className="block"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: cat.color + "20" }}
                      >
                        <FolderOpen
                          className="w-5 h-5"
                          style={{ color: cat.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {countsById[cat.id] ?? 0} items
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setEditing(cat)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleting(cat)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create modal */}
      {showCreate && (
        <CategoryModal
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <CategoryModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={handleUpdate}
        />
      )}

      {/* Delete confirm */}
      {deleting && (
        <ConfirmDelete
          name={deleting.name}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
