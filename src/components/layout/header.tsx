"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Bell, Plus, Grid2x2, List, Search as SearchIcon, X } from "lucide-react";

interface HeaderProps {
  viewMode: "grid" | "list";
  onViewModeChange: (v: "grid" | "list") => void;
  onAddClick?: () => void;
}

export function Header({
  viewMode,
  onViewModeChange,
  onAddClick,
}: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Focus the input when the mobile search expands
  useEffect(() => {
    if (mobileSearchOpen) {
      mobileInputRef.current?.focus();
    }
  }, [mobileSearchOpen]);

  // Close mobile search on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileSearchOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/dashboard/search?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
    setMobileSearchOpen(false);
  }

  return (
    <header className={`relative h-14 sm:h-16 w-full min-w-0 sticky top-0 bg-white/95 backdrop-blur-lg border-b border-slate-200 flex items-center gap-2 sm:gap-3 pl-14 sm:pl-6 pr-3 sm:pr-6 ${mobileSearchOpen ? "z-40" : "z-20"}`}>
      {/* ── Desktop search (full input, sm and up) ── */}
      <form onSubmit={handleSearch} className="hidden sm:block flex-1 max-w-xl relative">
        <div className="relative">
          <SearchIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-slate-100 border-2 border-transparent rounded-xl sm:rounded-2xl pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm focus:outline-none search-glow focus:border-[#5CC061] focus:bg-white transition"
          />
        </div>
      </form>

      {/* ── Actions Container ── */}
      <div className="flex items-center gap-1.5 sm:gap-5 ml-auto">
        {/* View Mode toggle (sm and up) */}
        <div className="hidden sm:flex bg-slate-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded-md transition ${
              viewMode === "grid"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
            title="Grid view"
          >
            <Grid2x2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`p-2 rounded-md transition ${
              viewMode === "list"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile search icon (sm and down) */}
        <button
          type="button"
          onClick={() => setMobileSearchOpen(true)}
          className="sm:hidden w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-500 transition flex items-center justify-center"
          aria-label="Search"
        >
          <SearchIcon className="w-5 h-5" />
        </button>

        {/* Save button — icon-only on mobile, with label on sm+ */}
        <button
          type="button"
          onClick={onAddClick}
          className="w-10 h-10 sm:w-auto sm:h-auto sm:px-4 py-2 rounded-xl bg-[#5CC061] hover:bg-[#1F8932] text-white text-sm font-medium transition shadow-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Notifications (sm and up) */}
        <button
          type="button"
          className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition hidden sm:flex"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
            2
          </span>
        </button>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5CC061] to-[#1F8932] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {user?.email?.[0]?.toUpperCase() ?? "?"}
        </div>
      </div>

      {/* ── Mobile search overlay (expands from the icon) ── */}
      {mobileSearchOpen && (
        <div className="sm:hidden absolute inset-0 bg-white/95 backdrop-blur-lg flex items-center px-3 gap-2">
          <SearchIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <form onSubmit={handleSearch} className="flex-1">
            <input
              ref={mobileInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your library..."
              className="w-full bg-transparent py-2 text-sm focus:outline-none"
            />
          </form>
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen(false);
              setQuery("");
            }}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition flex-shrink-0"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </header>
  );
}
