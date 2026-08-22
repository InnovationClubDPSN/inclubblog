# Setup & deployment

This app runs on two services:

- **[Supabase](https://supabase.com)** — the database and file storage
- **[Vercel](https://vercel.com)** — where the website itself is hosted

There's no login system in the traditional sense: the admin console is
unlocked with a PIN, and the member portal is unlocked with an admission
number + password. Neither uses Supabase Auth.

Follow the steps below in order. Each one only takes a few minutes.

---

## Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) account

---

## Step 1: Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account + a
   new project.
2. Once it's ready, click **SQL Editor** in the left sidebar → **New query**.
3. Paste in the entire contents of `supabase/schema.sql` and click **Run**.
   This creates every table the app needs, the security rules that protect
   them, all the database functions the app calls, and a public storage
   bucket for uploaded images.
4. Click **Project Settings** (gear icon) → **API**. You'll need two values
   from this page in the next step:
   - **Project URL**
   - **anon public** key

---

## Step 2: Connect the app to Supabase

In your terminal, inside the project folder:

```bash
cp .env.example .env.local
```

Open `.env.local` and paste in the two values from Step 1:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Then:

```bash
npm install
npm run dev
```

The site should now open at `http://localhost:5173`.

---

## Step 3: Set the admin PIN

There's no sign-up step for admin access — you set a PIN once, directly in
Supabase, and use it to unlock `/admin` from then on.

1. Pick a PIN.
2. In Supabase's **SQL Editor**, run this (with your PIN):
   ```sql
   insert into public.admin_credentials (singleton, pin_hash)
   values (true, crypt('YOUR-PIN-HERE', gen_salt('bf')))
   on conflict (singleton) do update set pin_hash = excluded.pin_hash, updated_date = now();
   ```
3. Go to `/admin` on your running site and enter the PIN. You now have
   access to the control panel.

To change the PIN later, just re-run that same query with a new value.

Once you're in, use the **Members** tab to add your club's roster (or import
a CSV — see the admin panel's built-in guide), and the **Domains** and
**Posts** tabs to start publishing.

---

## Step 4: Add the club's images

Four images are already wired up throughout the site (navbar logo, about
page, footer, homepage photo) — drop your own files into `public/images/`
using these exact names:

- `club-logo.png`
- `school-logo-nav.png`
- `school-logo-about.png`
- `school-photo.png`

Vite serves everything in `public/` from the site root, so once they're in
place, `/images/club-logo.png` etc. just works — no code changes needed.

---

## Step 5: Put it on the internet (Vercel)

1. Push this project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com), click **Add New Project**, and
   import that repo. Vercel will detect it's a Vite app automatically.
3. Before deploying, add your two Supabase values under **Environment
   Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**.

That's it — the site is live. `vercel.json` already includes the SPA
rewrite rule so client-side routes (`/about`, `/members`, etc.) work
correctly on refresh.

---

## Optional: Google sign-in for visitors

Lets people who are *not* club members sign in (e.g. to answer the Question
of the Day) without touching the member directory. Skip this section if you
don't need it — the rest of the site works fine without it.

1. In the Supabase Dashboard: **Authentication → Providers → Google**, turn
   it on and fill in a Google OAuth Client ID/Secret (create one in
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
   OAuth client type "Web application", authorized redirect URI = the one
   Supabase shows on that same settings page).
2. That's it — no new env vars for the frontend. A "sign in" button appears
   in the navbar top-right; signed-in visitors get a row in `public.users`
   only, never in the member directory.

---

## Optional: Question of the Day

A fresh daily question on the homepage, generated via OpenRouter, that both
members and Google-signed-in visitors can answer.

1. Get an API key from [OpenRouter](https://openrouter.ai/settings/keys).
2. Deploy the generator function: Supabase Dashboard → **Edge Functions** →
   **Deploy a new function** → **Via Editor**, name it `generate-qotd`,
   paste in the contents of `supabase/functions/generate-qotd/index.ts`,
   **Deploy** — or via the CLI:
   ```bash
   supabase functions deploy generate-qotd
   ```
3. Give it the API key as a *secret* (never a client-side env var — it must
   not end up in the browser bundle):
   ```
   OPENROUTER_API_KEY=your-openrouter-key-here
   ```
   Optionally also set `OPENROUTER_MODEL` (defaults to `openai/gpt-4o-mini`)
   to point at a different model on OpenRouter.
4. Schedule it to run once a day at 00:00 IST: Supabase Dashboard → **Edge
   Functions** → `generate-qotd` → add a **Cron** schedule of `30 18 * * *`
   (that's 18:30 UTC = 00:00 IST).

   Prefer managing the schedule from SQL instead? Run this in the SQL
   Editor (requires the `pg_cron` and `pg_net` extensions, enabled under
   **Database → Extensions**):

   ```sql
   create extension if not exists pg_cron;
   create extension if not exists pg_net;

   select cron.schedule(
       'generate-qotd-daily-ist',
       '30 18 * * *',
       $$
       select net.http_post(
           url := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/generate-qotd',
           headers := jsonb_build_object(
               'Content-Type', 'application/json',
               'Authorization', 'Bearer YOUR-SERVICE-ROLE-KEY'
           ),
           body := '{}'::jsonb
       );
       $$
   );
   ```

5. Optional: trigger it manually anytime to backfill/test, using the
   Dashboard's built-in function tester or
   `supabase functions invoke generate-qotd`.

The widget renders nothing on any day the function hasn't run yet, so it's
safe to ship before this section is set up.

---

## Good to know

- **The admin PIN is checked server-side, not just in the browser.** `/admin`
  only unlocks the console UI; the actual protection lives in Postgres (see
  `admin_write()` / `admin_delete_row()` in `supabase/schema.sql`) — the PIN
  is hashed, never sent to the client, and every admin write has to present
  a valid session token issued after a correct PIN.
- **Comments and likes stay open to everyone** — no login needed to comment
  or like a post. If you'd rather require login for that, it's one small
  change in `supabase/schema.sql`.
- **Attendance** is pulled live from an external Google Sheet (exposed as
  JSON via a Google Apps Script web app) — see `src/lib/attendance.js` if
  you need to point it at a different sheet.
