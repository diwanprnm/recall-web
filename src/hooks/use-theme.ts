"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "recall-theme";

function readStored(): "light" | "dark" | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

function isDarkNow(): boolean {
  return document.documentElement.classList.contains("dark");
}

export function useTheme() {
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "dark"
      : "light"
  );

  // While the user has no explicit choice, follow live device changes (FR-006).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange(e: MediaQueryListEvent) {
      if (readStored()) return;
      document.documentElement.classList.toggle("dark", e.matches);
      setResolvedTheme(e.matches ? "dark" : "light");
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = isDarkNow() ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable — theme still applies for this session
    }
    setResolvedTheme(next);
  }, []);

  return { resolvedTheme, toggleTheme };
}
