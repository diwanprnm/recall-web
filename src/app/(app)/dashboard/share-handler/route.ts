import { redirect } from "next/navigation"
import { type NextRequest } from "next/server"

/**
 * Share Target route handler — receives URLs shared from social media apps.
 *
 * When a user shares a URL from Twitter/Reddit/etc and picks Recall,
 * the PWA manifest routes to this page via:
 *   GET /dashboard/share-handler?url=...&title=...&text=...
 *
 * We forward the URL to the dashboard with ?add_url= param so the
 * AddItemModal opens pre-filled.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const url = searchParams.get("url") || searchParams.get("text") || ""
  const title = searchParams.get("title") || ""

  // Build redirect URL to dashboard
  const dest = new URL("/dashboard", request.nextUrl.origin)
  if (url) dest.searchParams.set("add_url", url)
  if (title) dest.searchParams.set("add_title", title)

  redirect(dest.pathname + dest.search)
}