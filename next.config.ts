import type { NextConfig } from "next"

// Backend target for the API proxy (same var the client used to read directly).
// Reused here so the browser stays same-origin and never triggers a CORS
// preflight (OPTIONS) — the previous 400 came from the backend rejecting it.
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  output: "standalone",
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
      { source: "/health", destination: `${BACKEND_URL}/health` },
    ]
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://recall-api:8000",
  },
}

export default nextConfig