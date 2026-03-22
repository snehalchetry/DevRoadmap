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

## Troubleshooting & Fixes

During the initial deployment and development, we hit a few common Next.js/TypeScript bottlenecks. Here’s the log:

### 1. TypeScript `string | undefined` errors
**Problem**: The strict Next.js build environment failed because `process.env` variables (Google Gemini API Key and Supabase connectivity) were typed as potentially `undefined`.
**Fix**: Implemented explicit type assertions (`as string`) and robust environment variable guards in `lib/gemini.ts` and `lib/supabase.ts` to ensure build-time safety.

### 2. ESLint Build Failures (Vercel)
**Problem**: A missing dependency for `status` in a `useEffect` hook within `LoadingState.tsx` caused Vercel to fail the production build.
**Fix**: Updated the `useEffect` dependency array and synced it with the internal component state.

### 3. Deployment Pivot
**Problem**: Initial attempts used **Firebase App Hosting**, but it required a more complex setup for a project already using **Supabase** as a primary database.
**Fix**: Pivoted to **Vercel** for the frontend/API layer and scrubbed all Firebase traces (`.firebaserc`, `firebase.json`, `apphosting.yaml`) to keep the repository clean and optimized for Vercel's framework-aware deployment.

---

Built by [Snehal Chetry](https://github.com/snehalchetry)
