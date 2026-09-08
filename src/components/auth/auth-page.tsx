"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"
import { Eye, EyeOff, Loader2, Check } from "lucide-react"

export function AuthPage() {
  const { signIn, signUp, loading, error: authError } = useAuth()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (authError) setError(authError)
  }, [authError])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Client-side validation for signup
    if (mode === "signup") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.")
        return
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.")
        return
      }
    }

    const success = mode === "login"
      ? await signIn(email, password)
      : await signUp(email, password)
    if (!success) return
    // Custom auth logs the user in immediately — the root page (app/page.tsx)
    // redirects to the dashboard once `user` is set, so nothing else to do here.
  }

  function toggleMode() {
    setMode(mode === "login" ? "signup" : "login")
    setError(null)
    setConfirmPassword("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden px-4 py-8">
      {/* ── Decorative green gradient orbs ── */}
      <div className="absolute top-0 right-0 w-[16rem] sm:w-[28rem] h-[16rem] sm:h-[28rem] bg-gradient-to-bl from-[#C8FFC1] to-emerald-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-70" />
      <div className="absolute bottom-0 left-0 w-64 sm:w-80 h-64 sm:h-80 bg-gradient-to-tr from-emerald-100 to-[#C8FFC1] rounded-full translate-y-1/2 -translate-x-1/2 opacity-70" />
      <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-emerald-50 rounded-full blur-2xl opacity-60 hidden sm:block" />

      <div className="relative w-full max-w-md mx-auto">
        {/* ── Logo block ── */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mx-auto mb-4">
            <Image
              src="/logo-recall.png"
              alt="Recall logo"
              width={72}
              height={72}
              priority
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Recall</h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm">Your Second Brain for Social Media</p>
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 animate-fade-in">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1">
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

          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            <div>
              <label htmlFor="auth-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5CC061] focus:border-transparent focus:bg-white transition text-sm"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 sm:py-3 pr-10 rounded-xl border border-slate-200 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5CC061] focus:border-transparent focus:bg-white transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="animate-fade-in">
                <label htmlFor="auth-confirm" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm password
                </label>
                <input
                  id="auth-confirm"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5CC061] focus:border-transparent focus:bg-white transition text-sm"
                />
              </div>
            )}

            {mode === "signup" && !error && (
              <ul className="text-xs text-slate-500 space-y-1 pt-1">
                <li className={password.length >= 6 ? "text-green-600" : ""}>
                  <Check className="w-3 h-3 inline mr-1" />
                  At least 6 characters
                </li>
                <li className={confirmPassword && password === confirmPassword ? "text-green-600" : ""}>
                  <Check className="w-3 h-3 inline mr-1" />
                  Passwords match
                </li>
              </ul>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 bg-[#5CC061] hover:bg-[#1F8932] text-white rounded-xl font-medium text-sm sm:text-[15px] transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading
                ? mode === "login" ? "Signing in..." : "Creating account..."
                : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="mt-2 text-center">
            <p className="text-sm text-slate-600">
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-[#1F8932] font-semibold hover:text-[#005316] hover:underline"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] sm:text-xs text-slate-400 mt-6 px-2">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}