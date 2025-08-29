# Deployment Guide — University Application Tracker (Next.js + Supabase on Vercel)

**Target stack**
- **Frontend/Backend:** Single Next.js app (App Router) deployed to **Vercel**
- **Database & Auth:** **Supabase** (PostgreSQL + Auth + Storage)
- **Language/Styling:** TypeScript + Tailwind CSS

> This guide delivers a clean, production‑ready path: provision Supabase, run migrations & RLS, seed demo data, configure environment, deploy to Vercel, verify, and troubleshoot.

---

## 0) Prerequisites
- Node.js 18+ and pnpm/npm/yarn installed locally
- A GitHub repo for this project (`docs/` contains this file)
- **Supabase account** with a project created
- **Vercel account** connected to the GitHub repo

---

## 1) Environment Variables

Create a **.env.local** (for local dev) and **Vercel Project → Settings → Environment Variables** (for cloud) with:

```bash
# Public (safe to expose to the browser)
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Server-only (NEVER expose to the browser or commit to git)
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

**Important**
- `NEXT_PUBLIC_*` variables are embedded into the client bundle. Only put **public** keys there (the Supabase **anon** key is designed for client use).
- `SUPABASE_SERVICE_ROLE_KEY` is **sensitive**. Use it **only** in server components, API routes, or server actions. Do **not** log it, and never reference it in client bundles.

> In your repo, provide a `.env.example` with placeholders — never commit real values.

---

## 2) Supabase Project Setup

### 2.1 Get project credentials
In the Supabase dashboard → Project Settings → **API**:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (server-only)

### 2.2 Run Database Migrations
Use the SQL from `docs/database-schema.md` (enums → tables → indexes → RLS). Options:

**Option A — SQL editor (fast)**
1. Dashboard → **SQL** → paste the **Enums** section; run.
2. Paste the **Tables** section in order; run.
3. Paste **Indexes/Constraints**; run.
4. Paste **RLS policies** and **ENABLE RLS** statements; run.

**Option B — Supabase CLI (repeatable)**
```bash
supabase login
supabase link --project-ref <project-ref>
# put your SQL into supabase/migrations/NNN_init.sql
supabase db push
```

### 2.3 Seed Demo Data (optional)
Run the **Seed Data** block from `docs/database-schema.md` to create a few universities and a sample student/application. Adjust IDs as needed.

### 2.4 Verify RLS & Access Paths
- Ensure tables have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
- Confirm a **student** can only see/update their own rows.
- Confirm a **parent** can read linked student applications and create **parent_notes**.
- Keep an **admin** role with `BYPASSRLS` for maintenance scripts (not used by the app runtime).

---

## 3) Next.js App Configuration

### 3.1 Install deps (example)
```bash
pnpm install
# or: npm install / yarn
```

### 3.2 Local dev
```bash
cp .env.example .env.local
# fill in your Supabase URL and keys

pnpm dev
# visit http://localhost:3000
```

Ensure the app can:
- Load public pages
- Sign in (Supabase Auth UI or custom flow)
- Read/write data as per RLS policies

### 3.3 Build (locally)
```bash
pnpm build
pnpm start
```

If the build passes locally, cloud should be good too.

---

## 4) Deploy to Vercel

### 4.1 Connect GitHub repo
- Import the repo in Vercel → **New Project** → pick the repo
- Framework preset: **Next.js** (auto-detected)

### 4.2 Set Environment Variables (Vercel → Settings → Environment Variables)
Create the three vars for **Production**, and optionally **Preview** & **Development**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)

**Build command**: (auto) `next build`  
**Output directory**: (auto) `.vercel/output` (Next 13+), or leave default  
**Install command**: (auto) depends on your lockfile (`pnpm i`/`npm i`/`yarn`)

Click **Deploy**.

### 4.3 Post-deploy checks
- Open the Vercel domain → Can you sign up/log in via Supabase Auth?
- Create a test application → Does it persist and respect RLS?
- Check **Vercel → Logs** for server errors.
- Check **Supabase → Auth → Users** and **Table editor** for records.

---

## 5) Production Checklist

- **RLS** enabled on all tables and policies tested
- **Service role key** only referenced in server-side code paths
- **Database backups** enabled in Supabase
- **Custom domain** configured in Vercel (optional)
- **Error monitoring** (Vercel logs, or Sentry if added)
- **Rate limiting** (if you expose server actions/APIs publicly)
- **CORS** — if adding non-Next.js backends later
- **Migrations discipline** — never mutate data structures manually in prod; use SQL migrations

---

## 6) Troubleshooting

**Build fails on Vercel**
- Ensure node version compatibility (set `"engines": {"node": ">=18"}` in package.json if needed)
- Missing env vars: confirm Production env has all 3 variables set
- Trying to import `service_role` key in client code — remove those imports

**401/403 errors from Supabase**
- RLS blocking → check policies for the correct `auth.uid()` path
- Using anon key for server writes that require elevated privileges → move to a server route and use `service_role` there

**Auth redirect issues**
- Configure auth URLs: Supabase **Auth → URL Configuration** → add your Vercel domain(s)
- If using NextAuth or custom auth flow, ensure callback URLs match

**Time zone/date issues**
- Store with `TIMESTAMP WITH TIME ZONE` (as in schema)
- Normalize all date math on server side

---

## 7) Rollouts & Migrations (Zero‑Downtime Tips)

- Prefer **additive** changes (add columns/tables) → deploy code that writes both old+new → backfill → switch reads → drop legacy
- For heavy backfills, use **Supabase SQL cron** or run via **Supabase Functions**/CLI at off-peak times
- Keep schema migrations in repo under `supabase/migrations/` and tag releases

---

## 8) Security Notes

- Treat `SUPABASE_SERVICE_ROLE_KEY` like a password. Never send it to the browser.
- Review all API routes to ensure they call Supabase with the **right key** (anon on client, service role only on server).
- Avoid `*` CORS in future multi-origin scenarios.
- Keep dependencies updated; consider Dependabot/Renovate.

---

## 9) Appendix — Quick Copy Blocks

**Vercel env (Production):**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

**Local env scaffold:**
```bash
cp .env.example .env.local
# paste values, then:
pnpm dev
```

**Supabase CLI (optional):**
```bash
npm i -g supabase
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

---

## 10) What to Include in the Repo (for graders)

- `docs/database-schema.md` (schema + RLS)  
- `docs/deployment-guide.md` (this file)  
- `README.md` with quickstart + screenshots  
- `.env.example` with placeholders  
- Seed SQL and/or scripts to generate demo data  
- Live deployment link (Vercel) and project structure overview

---

**Done.** Deploy, verify, and ship confidently.
