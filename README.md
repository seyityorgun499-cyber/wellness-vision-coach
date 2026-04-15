# Myora

Supabase-backed wellness application.

## Local development

Required frontend environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Optional for Edge Functions and AI features:

- `OPENAI_API_KEY`

Start locally:

- `npm install`
- `npm run dev`

Build locally:

- `npm run build`

## Supabase deployment

This project is now prepared to run as a static frontend backed by Supabase.

Before production deploy:

1. Create a Supabase project.
2. Apply all SQL files under [supabase/migrations](supabase/migrations).
3. Deploy all Edge Functions under [supabase/functions](supabase/functions).
4. Set frontend env variables in your hosting provider.
5. Set `OPENAI_API_KEY` in Supabase Edge Function secrets if AI features will be enabled.

Detailed checklist:

- [docs/SUPABASE_DEPLOY_CHECKLIST.md](docs/SUPABASE_DEPLOY_CHECKLIST.md)
