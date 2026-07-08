import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Recall — Your Second Brain for Social Media",
    short_name: "Recall",
    description:
      "Save content from Twitter, Reddit, YouTube, Instagram, LinkedIn and more. AI auto-tags, summarises, and surfaces your knowledge when you need it.",
    start_url: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    orientation: "portrait-primary",
    background_color: "#f8fafc",
    theme_color: "#667eea",
    scope: "/",
    id: "/",
    categories: ["productivity", "social", "knowledge-management"],
    lang: "en",
    dir: "auto",
    prefer_related_applications: false,
    shortcuts: [
      {
        name: "Library",
        short_name: "Library",
        description: "View your knowledge library",
        url: "/dashboard",
        icons: [
          {
            src: "/icons/shortcut-library-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Search",
        short_name: "Search",
        description: "Semantic search your saved content",
        url: "/dashboard/search",
        icons: [
          {
            src: "/icons/shortcut-search-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Save URL",
        short_name: "Save",
        description: "Quickly save a new URL",
        url: "/dashboard?add=1",
        icons: [
          {
            src: "/icons/shortcut-save-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-1024x1024.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/dashboard.png",
        sizes: "1920x1080",
        type: "image/png",
        form_factor: "wide",
        label: "Recall Dashboard",
      },
      {
        src: "/screenshots/mobile-library.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "Recall Mobile Library",
      },
    ],
  }
}