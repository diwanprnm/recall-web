"use client"

/**
 * ShareToRecallButton — uses the Web Share API to "share" a URL into Recall.
 * Works on:
 *   - Mobile browsers (iOS Safari, Android Chrome) directly via system share sheet
 *   - Desktop browsers (Firefox) with `navigator.share` polyfilled
 *
 * If Web Share API isn't available, falls back to opening the Save modal
 * pre-filled with the URL.
 */
import { useEffect, useState } from "react"
import { Share2, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

interface ShareToRecallButtonProps {
  fallbackUrl?: string
}

export function ShareToRecallButton({ fallbackUrl }: ShareToRecallButtonProps) {
  const router = useRouter()
  const [supported, setSupported] = useState(false)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && "share" in navigator)
  }, [])

  async function shareOrFallback() {
    const url = fallbackUrl || window.location.href
    const title = "Recall this"
    const text = "Save to your Recall library"

    if (supported) {
      try {
        await navigator.share({
          title,
          text,
          url,
        })
        return
      } catch (err) {
        if ((err as DOMException).name === "AbortError") return
      }
    }

    // Fallback: open Save modal with the URL pre-filled
    // We use a query string param so the dashboard knows to open the modal
    const target = new URL("/dashboard", window.location.origin)
    target.searchParams.set("add_url", url)
    router.push(target.toString())
  }

  return (
    <button
      onClick={shareOrFallback}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-500/30"
      title={supported ? "Share to Recall" : "Add URL to Recall"}
    >
      {supported ? (
        <>
          <Share2 className="w-4 h-4" />
          Share to Recall
        </>
      ) : (
        <>
          <Zap className="w-4 h-4" />
          Save URL
        </>
      )}
    </button>
  )
}