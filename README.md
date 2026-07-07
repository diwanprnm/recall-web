# Recall Web — Frontend

Next.js 16 (App Router) frontend for **Recall** — the AI-Powered Social Media Knowledge Manager.

> *Your Second Brain for Social Media*

Connects to the FastAPI backend at `/root/recall-api` for the AI pipeline.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────┐
│ Browser (Recall Web — Next.js App)        │
│  ├─ Auth (Supabase Auth)                  │
│  ├─ Dashboard (item library)              │
│  ├─ Search (semantic, via FastAPI)        │
│  └─ Item CRUD (via FastAPI)               │
└──────────────┬───────────────────────────┘
               │ HTTPS / Supabase JWT
               ▼
┌──────────────────────────────────────────┐
│ FastAPI Backend (Recall API / Python)     │
│  • Supabase JWT verify                    │
│  • AI pipeline (instructor + 9router)     │
│  • Embeddings + semantic search           │
└──────────────────────────────────────────┘
```

---

## 🚀 Setup

### Prerequisites
- Node.js 20+
- A running [Recall API](../recall-api) backend
- A Supabase project (free tier)

### 1 — Install dependencies

```bash
cd /root/recall-web
npm install
```

### 2 — Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...

# FastAPI backend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3 — Run dev server

```bash
npm run dev
```

Visit http://localhost:3000

---

## 📁 Structure

```
recall-web/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (app)/                 # Authenticated routes
│   │   │   └── dashboard/
│   │   │       ├── page.tsx       # Library (grid + list)
│   │   │       └── search/        # Semantic search
│   │   ├── layout.tsx             # Root layout (fonts + Toaster)
│   │   ├── page.tsx               # Landing → redirect to /dashboard or AuthPage
│   │   └── globals.css
│   ├── components/
│   │   ├── auth/                  # AuthPage
│   │   ├── items/                 # ItemCard (grid + list)
│   │   ├── layout/                # Sidebar, Header
│   │   └── ui/                    # Toast, Button, EmptyState
│   ├── hooks/
│   │   ├── use-auth.ts            # Supabase auth + JWT
│   │   ├── use-items.ts           # CRUD items
│   │   ├── use-search.ts          # Semantic search
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── api/                   # FastAPI client
│   │   ├── supabase/              # Server + browser clients
│   │   └── utils.ts
│   └── types/
│       └── index.ts               # All TypeScript types (sync w/ Pydantic)
├── .env.local
└── package.json
```

---

## 🎯 Features (Phase 2 MVP)

- ✅ Email/password signup & login
- ✅ Dashboard with grid/list view toggle
- ✅ Item cards with AI badges, tags, quality score
- ✅ Platform filter pills (Twitter, YouTube, Reddit, etc.)
- ✅ Add item modal (URL + platform → full AI pipeline)
- ✅ Semantic search page with example queries
- ✅ Toast notifications
- ✅ Loading & empty states
- ✅ Responsive layout (sidebar + grid)

## 📅 Roadmap (Phase 3+)

- Browser Extension (Plasmo)
- Daily Digest (email)
- Knowledge Graph visualizer
- Light/dark mode toggle
- Tag management page

---

## 🛠️ Stack

- **Next.js 16** — App Router, React Server Components
- **TypeScript** — full type-safety
- **Tailwind CSS v4** — utility-first styling
- **Supabase Auth** — JWT auth + session management
- **Lucide React** — icons
- **date-fns** — relative dates
- **instructor** (via backend) — structured AI output

---

## 🧪 Build & Verify

```bash
npm run build      # production build
npm run lint       # eslint
npm run type-check # tsc --noEmit
```

## 🌐 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   NEXT_PUBLIC_API_URL (your FastAPI backend URL)
```