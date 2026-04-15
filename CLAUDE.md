# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Vite dev server (HMR)
npm run build        # Production build → dist/public/
npx tsc --noEmit     # Type-check without emitting
npm run lint         # ESLint

# Capacitor (mobile)
npx cap sync android          # Copy web assets + update plugins for Android
npx cap sync ios               # Same for iOS
# Android/iOS builds require Android Studio / Xcode (no JDK on this machine)

# Supabase
npm run supabase:db:push               # Push migrations
npm run supabase:functions:deploy      # Deploy all 3 edge functions
npm run supabase:functions:serve       # Local edge function dev (needs .env)

# RAG pipeline
npm run rag:seed     # Seed RAG sources
npm run rag:ingest   # Ingest URLs into vector store
```

## Architecture Overview

**Myora** is a mobile-first health management app (Capacitor hybrid) with a Supabase backend.

### Frontend (client/)
- **React 18 SPA** with Vite + SWC, TypeScript strict mode
- **Routing**: React Router v6 nested routes inside `AppLayout`. Native platforms use `HashRouter`, web uses `BrowserRouter`
- **All pages/components are lazy-loaded** via `React.lazy()` in `App.tsx`
- **State**: TanStack React Query for server state; React Context for auth, language, health data, theme
- **UI**: shadcn/ui (Radix primitives) + Tailwind CSS. Custom components in `client/src/components/ui/`
- **Path aliases**: `@/` → `client/src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`

### Backend (Supabase)
- **Auth**: Supabase Auth (email/password)
- **Database**: PostgreSQL via Supabase. Migrations in `supabase/migrations/` (SQL files)
- **Edge Functions** (Deno runtime, in `supabase/functions/`):
  - `generate-chat-response` – RAG chatbot with citation support
  - `generate-health-profile` – AI health profile generation
  - `analyze-health-data` – Food/voice/medical photo analysis
- **AI**: OpenAI GPT-4o via OpenAI SDK
- The `server/` directory contains legacy Express code kept for reference only; it is NOT used

### API Layer
- `client/src/lib/api.ts` – Single API client module with namespaced exports: `healthAPI`, `chatAPI`, `supplementAPI`, `communityAPI`, `familyAPI`, `wearableAPI`, `notificationAPI`
- All API calls go through Supabase client (`client/src/lib/supabase.ts`) using RPC or REST

### Mobile (Capacitor)
- Android project in `android/`, iOS in (not yet added)
- `capacitor.config.ts`: appId=`com.myora.app`, webDir=`dist/public`
- `MainActivity.java` has custom WebView setup (camera/mic permissions, file chooser) in `onStart()`
- Build flow: `npm run build` → `npx cap sync android` → Android Studio Run

## Key Patterns

### i18n / Language System
- **All user-visible strings** must go through `useLanguage()` hook from `client/src/contexts/LanguageContext.tsx`
- Two languages: `en` and `tr`. Translation keys are typed — adding a key to `en` requires adding it to `tr`
- Brand names "Myora" and "My Score" stay in English in both languages
- Components with arrays of translatable content (tips, challenges, levels) use `language` directly with `{ en: [...], tr: [...] }` objects instead of individual keys
- Locale-sensitive APIs (toLocaleDateString, toLocaleTimeString, toLocaleString) must use the `locale` value from `useLanguage()`

### Query Keys & Caching
- Centralized query keys in `client/src/lib/queryKeys.ts`
- Stale times defined there too (`staleTime.static`, `staleTime.dynamic`)

### Form Validation
- Zod schemas in `client/src/lib/validations/` (auth.ts, forms.ts)
- react-hook-form + @hookform/resolvers/zod

### Component Conventions
- Page-level components are in `client/src/components/` (not `pages/`)—pages/ only has layout shells (AppLayout, Auth, Onboarding, NotFound, Index)
- Charts use lazy loading wrappers in `client/src/components/charts/`
- Reusable UI primitives in `client/src/components/ui/` (shadcn pattern)
- Custom hooks in `client/src/hooks/`

## Environment Variables
- `.env` at project root (not committed). Required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Edge functions need `OPENAI_API_KEY` set in Supabase dashboard or `.env` for local serve
