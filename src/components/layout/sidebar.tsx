"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  FolderOpen,
  LogOut,
  TrendingUp,
  Archive,
  Menu,
} from "lucide-react";
import Image from "next/image";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Library" },
  { href: "/dashboard/favorites", icon: TrendingUp, label: "Favorites" },
  { href: "/dashboard/archive", icon: Archive, label: "Archive" },
];

const BOTTOM_ITEMS = [
  { href: "/dashboard/categories", icon: FolderOpen, label: "Categories" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <aside className="w-64 h-full bg-white border-r border-slate-100 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src={"/logo-recall.png"}
            alt="logo"
            width={60}
            height={60}
            className=""
          />

          <div>
            <span className="font-bold text-slate-900 text-lg">Recall</span>
            <p className="text-xs text-slate-400">Knowledge Manager</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="mb-4">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Library
          </p>
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive(href)
                  ? "bg-[#5CC061]/10 text-[#005316] font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </div>
        <div className="pt-3 border-t border-slate-100">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Organize
          </p>
          {BOTTOM_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive(href)
                  ? "bg-[#5CC061]/10 text-[#005316] font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5CC061] to-[#1F8932] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0 hidden sm:block">
            <p className="text-sm font-medium text-slate-800 truncate">
              {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
            </p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar (always visible) */}
      <div className="hidden lg:block fixed top-0 left-0 h-screen z-30">
        {sidebarContent}
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-2 left-4 z-40 w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center"
      >
        <Menu className="w-5 h-5 text-slate-700" />
      </button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 h-full shadow-2xl animate-slide-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
