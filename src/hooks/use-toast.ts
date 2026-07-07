"use client"

import { useEffect, useState, useCallback } from "react"
import type { ToastOptions } from "@/components/ui/toaster"

type ToastTrigger = ToastOptions

export function useToast() {
  const trigger = (options: ToastTrigger) => {
    window.dispatchEvent(new CustomEvent("toast", { detail: options }))
  }

  return {
    toast: trigger,
    success: (title: string, description?: string) =>
      trigger({ title, description, variant: "success" }),
    error: (title: string, description?: string) =>
      trigger({ title, description, variant: "error" }),
    warning: (title: string, description?: string) =>
      trigger({ title, description, variant: "warning" }),
    info: (title: string, description?: string) =>
      trigger({ title, description }),
  }
}