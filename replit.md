# Myora - AI-Powered Health & Nutrition Tracker

## Overview
A React + Vite single-page application using Supabase as the backend (auth, database, edge functions). Migrated from Vercel to Replit.

## Architecture
- **Frontend**: React 18 + TypeScript + Vite, located in `client/`
- **Shared types**: `shared/` directory (e.g., `schema.ts` with Drizzle ORM schema)
- **Backend**: Supabase (hosted) — no local server; plus a Vite middleware API layer
- **AI Chat API**: `server/chatHandler.ts` — Vite middleware at `/api/chat`. Fetches user health data from Supabase (water, calories, activity, blood tests, etc.) and calls OpenAI GPT-4o to produce personalized responses. Registered via `chatApiPlugin()` in `vite.config.ts`.
- **Mobile**: Capacitor configured for Android/iOS builds (`android/`, `capacitor.config.ts`)
- **Styling**: Tailwind CSS + Radix UI components
- **State**: TanStack React Query

## Dev Server
- Runs on port 5000 via `npm run dev`
- Vite is configured with `host: "0.0.0.0"` and `allowedHosts: true` for Replit proxy compatibility

## Required Environment Variables
Set these as Replit Secrets:
- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — your Supabase anon/public key
- `OPENAI_API_KEY` — **gerekli** — AI chatbot'un kişiselleştirilmiş yanıtlar üretmesi için. Vite middleware (`server/chatHandler.ts`) tarafından kullanılır.

## Key Scripts
- `npm run dev` — start development server (port 5000)
- `npm run build` — build for production (outputs to `dist/public`)
- `npm run supabase:functions:deploy` — deploy Supabase edge functions
- `npm run db:push` — push Drizzle schema to database

## Supabase Edge Functions
Located in `supabase/functions/`. Deploy via Supabase CLI.

## Code Quality Improvements (completed)
1. **Shared date helpers** — `isToday()` and `isWithinLastNDays()` extracted to `client/src/lib/utils.ts`; used by Boost, DailyQuests, HealthDashboard.
2. **WearableDevices → React Query** — Migrated from manual `useState+useEffect` fetching to `useQuery + useMutation`; loading states on buttons.
3. **useHealthScore / useStreak hooks** — Score data fetching (10 state vars + `fetchScoreData`) and streak fetch extracted to `client/src/hooks/useHealthScore.ts` and `client/src/hooks/useStreak.ts`; HealthDashboard uses them.
4. **Onboarding uses API layer** — `supabase.from('profiles').update()` calls replaced with `authAPI.updateProfile({ onboardingCompleted: true, ... })`; `onboardingCompleted` added to `ProfileUpdateData`.
5. **ExpertChat typewriter effect** — AI responses are revealed character-by-character (3 chars/12 ms) with a blinking cursor during streaming; badges/follow-ups hidden until animation completes.
6. **Route-level ErrorBoundary** — `client/src/components/ErrorBoundary.tsx` (class component) wraps all routes in `App.tsx`; shows user-friendly error UI with "Try again" button.
7. **AnalysisHub real snapshot data** — Uses `useHealthScore` to display today's food count, activity count, calories and water % on the hub cards.
8. **WidgetCreator Camera bug** — `{ icon: "Camera" }` (string) replaced with `{ icon: Camera }` (component); special-case conditional rendering removed.
9. **Sign-up display name field** — `displayName` added to `signUpSchema`, `SignUpFormData`, and the sign-up form UI; passed to `signUp(email, password, displayName)`.
10. **Back navigation** — `navigate(-1)` already used correctly in AppLayout; no stray `window.history.back()` patterns found.

## Code Quality Round 2 (completed)
1. **MiniChallenges persist completions** — `challengeAPI` (getCompletions/saveCompletions) added to `api.ts`; uses Supabase user metadata keyed by week index; localStorage retained as fast offline cache; component uses `useQuery + useMutation`.
2. **UserProfile uses authAPI** — Raw `supabase.auth.updateUser` + `profiles.upsert` replaced with single `authAPI.updateProfile()` call via `useMutation`; `supabase` import removed.
3. **MiniChallenges self-sufficient** — Component now calls `useHealthScore()` and `useStreak()` internally; `MiniChallengesProps` interface removed; `<MiniChallenges />` in HealthDashboard takes no props.
4. **Shared React Query cache** — `useHealthScore` and `useStreak` both rewritten to use `useQuery` with the same query keys as DailyQuests (`queryKeys.health.*`); eliminates duplicate network fetches when both components mount.
5. **Analytics lean macro query** — Added `healthAPI.getMacroSummary(start, end)` that selects only `protein_grams,carbs_grams,fat_grams` for the date range; Analytics uses it instead of loading all food entries to the client.
6. **IntervalFasting timer drift fix** — Timer no longer uses `setTimeLeft(prev => prev - 1)` accumulation; instead stores `targetEndAt` in a `useRef` and computes `Math.round((endAt - Date.now()) / 1000)` each tick.
7. **File upload validation** — `MedicalPhotoAnalysis.handleFileSelect` and `FoodCapture.handleFileSelect` both now reject non-image MIME types and files over 10 MB with a user-visible error toast.
8. **Community likes optimistic update** — `likeMutation` uses `onMutate` to immediately toggle `likeCount/isLiked` in the query cache, `onError` to roll back to the snapshot, and `onSettled` to re-sync with the server.
9. **FamilyTracking medication upsert** — `familyAPI.logMedication` queries for an existing log on the same calendar day before inserting; if found it updates the existing row instead of creating a duplicate.
10. **Offline indicator** — New `OfflineBanner` component listens to `window online/offline` events and shows a fixed destructive banner when the device has no internet; mounted at the top of `App.tsx`.

## UX Improvements (13 items, all completed)

### ⚡ Faster Logging
1. **Quick Water Log** — Card on HealthDashboard with progress bar, glass indicator grid, "+1 glass (300 ml)" button; uses `useMutation` → `healthAPI.updateDailyLog({ waterMl: +300 })`; haptic feedback on tap.
2. **Recent Foods Shortcut** — "Log Again" section in AllLogger with last 5 unique food names; auto-detects meal type from hour; haptic feedback on re-log success.

### 🏠 Home Dashboard
3. **Personalised Greeting** — `contextHint` below the date shows time-aware, state-aware hints (breakfast/lunch/activity nudges, streak celebration, all-done message); fully bilingual.
4. **Score Delta Tooltip** — ScoreBreakdownModal now shows "Improve [category] → could reach [n]" potential score banner + "+X possible" per category row.
5. **Persistent Fasting Chip** — Live fasting timer chip in the dashboard header (refetches every 60s); taps through to the Fasting tab.
6. **Weekly Summary Card (Mondays)** — Shows avg kcal/day, active days, avg glasses/day for the prior 7 days; only visible on Mondays.

### 🏆 Engagement & Motivation
7. **Streak Rescue Alert** — Orange toast-style banner after 9 PM if streak is active but nothing logged; navigates to logger on tap.
8. **Post-Quest Celebration** — Full-screen blurred overlay with animated emojis triggered once when all daily quests complete; `haptic.success()` on trigger.
9. **Haptic Feedback** — `client/src/lib/haptic.ts` utility wrapping `@capacitor/haptics`; graceful web fallback via Vibration API; integrated on water log, re-log, quest celebration, and error states.
10. **Community Emoji Reactions** — Replaced single heart with ❤️🔥💪👏 reaction chips; selection persisted to `localStorage`; maps to existing toggle-like backend.

### 🤖 AI & Discoverability
11. **Expert Chat Starter Chips** — 5 horizontally scrollable prompt chips visible when chat history is empty; tap pre-fills the input field; bilingual.
12. **Smart Logging Nudges** — AllLogger shows a context-aware banner (🍳 breakfast / 🥗 lunch / 🍽️ dinner / 🏃 activity) based on current hour and today's logged count.
13. **Profile Completion Nudge** — Amber card on HealthDashboard if user has no height or weight set; taps through to Profile tab; bilingual.

## Notification System (improved)
- **Persistent settings**: Toggle states, quiet hours, and daily limit saved to localStorage (`myora_notification_prefs`); respected by all notification generation paths.
- **Daily limit**: Configurable max notifications per day (default 6); enforced via `myora_notif_sent_count` localStorage counter.
- **Quiet hours**: Configurable time range (default 22:00–07:00) during which no ad-hoc notifications are sent.
- **Bilingual**: All notification titles and messages support TR/EN based on `language` localStorage key.
- **Family medication reminders**: `scheduleFamilyMedicationReminders(memberId, meds)` uses deterministic IDs per member so switching members doesn't cancel others' reminders; called from `FamilyTracking.tsx` useEffect.
- **Interval lifecycle**: `setupPeriodicChecks` accepts a getter function and manages a single interval timer to prevent duplicates.
- **Professional UI**: NotificationSettings page uses Lucide icons, flat cards, no emojis; includes collapsible Advanced Settings for quiet hours and daily limit.
- **Files**: `client/src/services/NotificationService.ts`, `client/src/components/NotificationSettings.tsx`, `client/src/components/FamilyTracking.tsx`.
