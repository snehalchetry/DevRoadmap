# DevRoadmap

AI-driven developer career signal extraction. It analyzes public GitHub activity to build interactive learning roadmaps based on actual shipping patterns.

## Core Features

- **Signal Extraction**: Reads repo density, contribution consistency, and architecture tendencies via GitHub GraphQL/REST.
- **Trajectory Gap Analysis**: Uses Gemini 2.5 Flash to identify high-leverage skill gaps based on your public work.
- **Visual Learning Graph**: Dependency-aware roadmap layout using Dagre and Framer Motion.
- **Shareable Persistence**: Roadmaps are cached for 7 days in Supabase and served at `/username`.

## Built With

- **Next.js 14** (App Router)
- **Gemini 2.5 Flash** (Career Coaching Engine)
- **Supabase** (Caching & Rate Limiting)
- **Tailwind CSS** + **Framer Motion** (UI/UX)
- **Dagre** (Graph Layout Engine)

## Getting Started

### 1. Environment Variables

Create a `.env.local` with:

```env
GEMINI_API_KEY=your_key
GITHUB_TOKEN=your_pat (optional, increases limits)
NEXT_PUBLIC_SUPABASE_URL=url
NEXT_PUBLIC_SUPABASE_ANON_KEY=key
SUPABASE_SERVICE_ROLE_KEY=secret
```

### 2. Local Setup

```bash
npm install
npm run dev
```

## Internal Architecture

- `app/api/analyze`: Coordinates GitHub fetching, AI analysis, and Supabase upserts.
- `lib/gemini.ts`: Handles prompt engineering and JSON schema normalization.
- `lib/github.ts`: Polyfill between GraphQL and REST for user data extraction.
- `components/RoadmapGraph.tsx`: Custom SVG-based graph renderer with interactive panning/zooming.

---

Built by [Snehal Chetry](https://github.com/snehalchetry)
