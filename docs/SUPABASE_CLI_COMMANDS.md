# Supabase CLI Commands

## First-time setup

Install or use the CLI through `npx`.

Link your local project to the remote Supabase project:

- `npx supabase login`
- `npx supabase link --project-ref <your-project-ref>`

## Local function development

- `npm run supabase:functions:serve`

This uses `.env` for local function secrets.

## Push database changes

- `npm run supabase:db:push`

## Deploy Edge Functions

- `npm run supabase:functions:deploy`

Functions included:

- `generate-health-profile`
- `generate-chat-response`
- `analyze-health-data`

## Full Supabase deploy

- `npm run supabase:deploy`

## Set production secrets

For AI-powered features:

- `npx supabase secrets set OPENAI_API_KEY=your-openai-api-key`

## Notes

- Frontend hosting still needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Supabase CLI deploy commands assume the project has already been linked.