# Refugio agent onboarding

When the user asks to set up, transfer, bootstrap, or prepare Refugio for Daniela:

1. Read `DANIELA_SETUP.md` and `DANIELA_AGENT_PROMPT.md` completely.
2. Run `pnpm setup:doctor` before database migrations, user provisioning, or environment-variable sync. Never print secret values.
3. Use a new, dedicated Supabase project and a Vercel project owned by Daniela. Never reuse the old `DAN GPT` Supabase project or an existing production project unless Daniela explicitly names it.
4. Complete setup in this order: install dependencies → authenticate CLIs → link Vercel → populate `.env.local` → run the doctor → run `pnpm setup:daniela` → browser-check `/` and `/auth` → inspect fresh Vercel errors.
5. Stop only for genuinely human-only steps: account login, CAPTCHA, paid-project confirmation, or supplying secrets. Explain exactly what Daniela must click or paste, then continue after she responds.
6. Keep `.env.local`, `.env.credentials.json`, `.vercel/`, database passwords, and secret/service-role keys out of Git and chat output.
7. Before editing Next.js code, follow the generated Next.js instructions below and read the relevant local guide in `node_modules/next/dist/docs/`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
