"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"

export type ToastOptions = {
  title?: string
  description?: string
  variant?: "default" | "success" | "error" | "warning" | "info"
  duration?: number
}

interface Toast extends ToastOptions {
  id: string
}

const TOAST_LIMIT = 5
const ICON_MAP: Record<NonNullable<ToastOptions["variant"]>, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  error: <AlertCircle className="w-4 h-4 text-red-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  info: <Info className="w-4 h-4 text-blue-500" />,
  default: null,
}
const STYLE_MAP: Record<NonNullable<ToastOptions["variant"]>, string> = {
  success: "border-emerald-200 bg-emerald-50",
  error: "border-red-200 bg-red-50",
  warning: "border-amber-200 bg-amber-50",
  info: "border-blue-200 bg-blue-50",
  default: "border-slate-200 bg-white",
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<ToastOptions>
      const id = Math.random().toString(36).slice(2)
      const t: Toast = { id, ...ce.detail }
      setToasts((prev) => [...prev.slice(-(TOAST_LIMIT - 1)), t])
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id))
      }, t.duration ?? 4000)
    }
    window.addEventListener("toast", handler)
    return () => window.removeEventListener("toast", handler)
  }, [])

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => {
        const variant = t.variant ?? "default"
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm animate-fade-in ${STYLE_MAP[variant]}`}
          >
            {ICON_MAP[variant]}
            <div className="flex-1 min-w-0">
              {t.title && <p className="text-sm font-semibold text-slate-900">{t.title}</p>}
              {t.description && <p className="text-xs text-slate-600 mt-0.5">{t.description}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function toast(options: ToastOptions) {
  window.dispatchEvent(new CustomEvent("toast", { detail: options }))
}