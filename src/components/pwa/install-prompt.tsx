"use client"

/**
 * PWAInstallButton — surfaces an install prompt when the browser fires
 * the `beforeinstallprompt` event (Android/Chrome/Edge).
 * On iOS Safari we show a separate hint since iOS doesn't dispatch
 * the event.
 */
import { useEffect, useState } from "react"
import { Download, Share, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSHint, setShowIOSHint] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed (display-mode: standalone)
    const standalone = window.matchMedia("(display-mode: standalone)").matches
    setInstalled(standalone)
    if (standalone) return

    // Check iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    if (isIOS && !standalone) {
      setShowIOSHint(true)
    }

    // Listen for beforeinstallprompt (Android/Chrome/Edge/Desktop)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowButton(true)
    }
    window.addEventListener("beforeinstallprompt", handler as EventListener)

    // Detect successful install
    const onInstalled = () => setInstalled(true)
    window.addEventListener("appinstalled", onInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler as EventListener)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    try {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === "accepted") {
        console.log("User accepted PWA install")
        setInstalled(true)
      }
    } catch (err) {
      console.error("Install prompt failed", err)
    } finally {
      setDeferredPrompt(null)
      setShowButton(false)
    }
  }

  if (installed) return null

  if (showIOSHint) {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-40 animate-fade-in">
        <button
          onClick={() => setShowIOSHint(false)}
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900">Install Recall</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Tap{" "}
              <Share className="inline w-3.5 h-3.5 mb-0.5" />
              {" "}then{" "}
              <span className="font-semibold">"Add to Home Screen"</span> for quick access.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!showButton) return null

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 z-40 animate-fade-in"
    >
      <Download className="w-4 h-4" />
      Install App
    </button>
  )
}