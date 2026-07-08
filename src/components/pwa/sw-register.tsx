"use client"

/**
 * ServiceWorkerRegister — registers /sw.js on mount.
 *
 * Skips registration in development (Vite/webpack handle HMR via SW
 * registration that can break Next.js Fast Refresh). Only registers
 * in production builds.
 */
import { useEffect } from "react"

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (process.env.NODE_ENV !== "production") return

    if (!("serviceWorker" in navigator)) return

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })

        if (registration.waiting) {
          // New service worker waiting — prompt update
          console.info("SW update waiting")
        }

        // Check for updates every hour
        setInterval(() => {
          registration.update().catch(() => null)
        }, 60 * 60 * 1000)
      } catch (err) {
        console.warn("Service worker registration failed:", err)
      }
    }

    // Defer to next idle to not block initial render
    if ("requestIdleCallback" in window) {
      ;(window as any).requestIdleCallback(register, { timeout: 2000 })
    } else {
      setTimeout(register, 1500)
    }
  }, [])

  return null
}