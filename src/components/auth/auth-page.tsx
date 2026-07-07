"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export function AuthPage() {
  const { signIn, signUp, loading, error: authError } = useAuth()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authError) setError(authError)
  }, [authError])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const success = mode === "login"
      ? await signIn(email, password)
      : await signUp(email, password)
    if (!success) return
    if (mode === "signup") setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border">
          <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h2>
          <p className="text-slate-500 mb-6">
            We sent a confirmation link to <strong className="text-slate-700">{email}</strong>.<br />
            Click the link to activate your account.
          </p>
          <button
            onClick={() => { setMode("login"); setSubmitted(false) }}
            className="text-sm text-blue-600 hover:underline"
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* ── Decorative gradient orbs (from mockup) ── */}
      <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-gradient-to-bl from-blue-100 to-purple-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-60" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full translate-y-1/2 -translate-x-1/2 opacity-60" />

      <div className="relative w-full max-w-md mx-4">
        {/* ── Logo block (from mockup) ── */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold gradient-text">Recall</h1>
          <p className="text-slate-500 mt-1 text-sm">Your Second Brain for Social Media</p>
        </div>

        {/* ── Card (matches mockup card styling) ── */}
        <div className="bg-white rounded-2xl shadow-xl border p-8 animate-fade-in">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {mode === "login"
              ? "Sign in to access your knowledge library"
              : "Start organising your saved content"}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login")
                setError(null)
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              {mode === "login"
                ? "Don&apos;t have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}