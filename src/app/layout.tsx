import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { PWAInstallButton } from "@/components/pwa/install-prompt"
import { ServiceWorkerRegister } from "@/components/pwa/sw-register"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "Recall — Your Second Brain for Social Media",
  description:
    "Save content from Twitter, Reddit, YouTube, Instagram, LinkedIn and more. AI auto-tags, summarises, and surfaces your knowledge when you need it.",
  applicationName: "Recall",
  keywords: [
    "knowledge management",
    "second brain",
    "save articles",
    "AI",
    "twitter",
    "youtube",
    "reddit",
    "linkedin",
  ],
  authors: [{ name: "theone" }],
  manifest: "/api/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Recall",
  },
  formatDetection: {
    telephone: false,

  },
  icons: {
    icon: [
      {
        url: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "Recall — Your Second Brain for Social Media",
    description:
      "Save content from social media. AI auto-tags, summarises, and surfaces your knowledge.",
    siteName: "Recall",
    type: "website",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#667eea",
  colorScheme: "light",
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster />
        <PWAInstallButton />
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}