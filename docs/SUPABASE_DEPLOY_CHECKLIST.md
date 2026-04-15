# Supabase Deploy Checklist

## 1. Frontend environment

Set these variables in your hosting provider:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Use [.env.example](../.env.example) as the template.

## 2. Database migrations

Apply every SQL file under [supabase/migrations](../supabase/migrations) in order.

Current migration set:

- `20260311_0001_profiles.sql`
- `20260311_0002_core_health.sql`
- `20260311_0003_streak_achievements.sql`
- `20260311_0004_goals_community.sql`
- `20260311_0005_family_supplements.sql`
- `20260311_0006_health_profiles.sql`
- `20260311_0007_chat.sql`
- `20260311_0008_analysis_assets.sql`
- `20260311_0009_wearables.sql`
- `20260311_0010_fasting.sql`

## 3. Storage

Confirm these storage resources exist after migrations:

- bucket: `health-uploads`

Also verify storage policies are active.

## 4. Edge Functions

Deploy these functions from [supabase/functions](../supabase/functions):

- `generate-health-profile`
- `generate-chat-response`
- `analyze-health-data`

## 5. Edge Function secrets

Set this secret in Supabase if AI features should work in production:

- `OPENAI_API_KEY`

Without it, fallback responses still work for some flows, but AI quality is reduced.

## 6. Hosting

Recommended deployment model:

- static frontend hosting
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Supabase Edge Functions

Any Vite-compatible static host works.

Preconfigured hosting files included in the repo:

- [vercel.json](../vercel.json)
- [netlify.toml](../netlify.toml)
- [public/_redirects](../public/_redirects)

Recommended host settings:

- Build command: `npm run build`
- Publish directory: `dist/public`

## 7. Production smoke test

After deploy, verify these flows:

- sign up / sign in
- profile update
- dashboard log reads/writes
- food logging
- voice logging
- document upload
- medical photo analysis
- blood test analysis
- chat conversation send/receive
- goals
- achievements / streak
- community post/comment/like
- family tracking
- supplement recommendations / orders
- wearable device connect / data view
- fasting start / end / history

## 8. No longer required for frontend deploy

These are not required for the deployed frontend runtime anymore:

- Express server startup
- `DATABASE_URL` for frontend hosting
- `SESSION_SECRET` for frontend hosting

They only matter if you still keep the old server code around for archival or fallback reasons.