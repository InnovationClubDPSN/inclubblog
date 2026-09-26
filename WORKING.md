# How this app works

A developer-facing tour of the codebase: how a request flows through the
app, how auth works (there are three separate, unrelated auth paths), and
where to look when something needs to change.

## High-level architecture

```
React (Vite SPA) ──► Supabase client (@supabase/supabase-js)
                          │
                          ├─► PostgREST reads   (direct table SELECTs, RLS-gated)
                          ├─► RPC calls         (SECURITY DEFINER Postgres functions)
                          ├─► Storage           ("uploads" bucket)
                          └─► Auth              (Google/GitHub OAuth only)
```

There's no separate backend server. The frontend is a static bundle (built
by Vite, hosted on Vercel); all state lives in Supabase Postgres, and all
authorization is enforced in Postgres — either through Row Level Security
policies or inside the `SECURITY DEFINER` functions defined in
`supabase/schema.sql`. The frontend never has to be trusted to enforce
permissions correctly, because it can't bypass the database's own rules.

## Routing & pages

`src/App.jsx` defines every route with React Router and lazy-loads each
page component (`React.lazy` + `Suspense`), so the initial bundle only
contains what the first page needs. Each file in `src/pages/` is one route;
`src/components/blog/` holds the building blocks those pages compose
(post cards, forms, the navbar, the admin tabs, etc.); `src/components/ui/`
holds small shared primitives (currently just the toast notification
system — add more with `npx shadcn add <component>` if a page needs one,
see `components.json`).

## The data layer: `src/api/dataClient.js`

Every page/component reads and writes data through `db.entities.<Name>`,
never through `supabase.from(...)` directly. This keeps table names, and
the decision about *which* writes need to go through an admin RPC, in one
place:

```js
import { db } from '@/api/dataClient';

const posts = await db.entities.Post.list('-created_date', 50);
await db.entities.Comment.create({ post_id, body });
```

Each entity exposes `list(sort, limit)`, `filter(query, sort, limit)`,
`get(id)`, `create(payload)`, `update(id, payload)`, `delete(id)`, and
`bulkCreate(records)`. `filter()` accepts plain equality (`{ slug }`) or
`{ $in: [...] }` / `{ $ne: value }` for the two extra operators the app
needs.

Reads always go straight to Postgres via PostgREST — fast, and gated by the
public `select` RLS policies in `supabase/schema.sql` (everything readable
on the site is a public `select`; there's no per-user read filtering).

Writes are table-dependent:
- **Admin-owned tables** (`posts`, `domains`, `galleries`, `profiles`,
  `announcements`) have *no* direct-write RLS policy at all. `create` /
  `update` / `delete` on these transparently call the `admin_write()` /
  `admin_delete_row()` Postgres RPCs instead, which check an admin session
  token themselves before touching the table.
- **Everything else** (comments, likes) writes straight to the table,
  governed by ordinary RLS policies (open insert, no login required).
- **Member-portal writes** (creating/editing a project, posting a project
  update, editing your own profile) don't go through `dataClient.js` at
  all — they call the `member_*` RPCs directly (see below), because they
  need member-specific authorization logic (ownership/collaborator checks)
  that a generic admin-style RPC can't express.

File uploads go through `db.integrations.Core.UploadFile({ file })`, which
uploads to the Supabase Storage `uploads` bucket and returns
`{ file_url }`.

## Three separate auth paths

This app deliberately has **three unrelated ways to be "signed in,"** each
solving a different problem. None of them share a session, a token format,
or a user table.

### 1. Admin — PIN (`src/lib/adminSession.js`)

`/admin` is unlocked with a PIN, not an account. `admin_login(pin)` checks
it against a bcrypt hash in `admin_credentials` and returns a random session
token, stored in `sessionStorage`. That token is sent back on every
subsequent admin write (`admin_write()` / `admin_delete_row()`), which
re-validate it against `admin_sessions` (12-hour expiry) before touching
any table. The PIN itself is never sent to the client and there's no way to
read it back out — only compare against it.

### 2. Members — admission number + password (`src/lib/memberSession.js`)

The member portal (`/member-login`, `/portal`) authenticates against
`admission_number` + a password stored (hashed) in `member_credentials` —
a separate table from `profiles`, so a plain `select * from profiles`
never risks exposing it. `member_login()`:
- Unknown admission number → raises an error.
- Known member, no password set yet → if no password was submitted, returns
  `needs_password: true` so the UI can prompt them to set one; if a
  password *was* submitted, that becomes their password (first-login flow —
  this is how CSV-imported members get an account without a separate
  sign-up step).
- Known member, password already set → normal password check.

A successful login returns a 30-day session token (`member_sessions`),
stored in `sessionStorage`. Every member-portal write — editing your
profile, saving a project, posting a project update, answering the Question
of the Day — goes through a `SECURITY DEFINER` RPC
(`member_update_profile`, `member_save_project`,
`member_create_project_update`, `member_submit_qotd_response`) that takes
this token as its first argument and resolves it back to a `profile_id`
via `member_resolve_token()`.

### 3. Google/GitHub sign-in for non-members (`src/lib/oauthSession.js`)

A third, optional path for site visitors who are *not* club members — e.g.
someone answering the Question of the Day who isn't in the roster. This is
the only path that uses real Supabase Auth (`auth.users`). It's kept
entirely separate from the member directory: a successful OAuth sign-in
only ever creates a row in `public.users` (via the `handle_new_oauth_user`
trigger), never in `public.profiles`. A person can be a member, an
OAuth-signed-in visitor, both, or neither — the two tables have no foreign
key between them.

## Row Level Security model

Every table has RLS enabled. The pattern is consistent throughout
`supabase/schema.sql`:

- **Public content** (`posts`, `domains`, `profiles`, `galleries`,
  `projects`, `project_updates`, `announcements`, `comments`, `likes`,
  `qotd`, `qotd_responses`) is readable by anyone (`using (true)`).
- **Anonymous-friendly writes** (`comments` insert, `likes` insert/delete)
  have an open `with check (true)` policy — no login needed, matching the
  site's "anyone can comment/like" design.
- **Everything else** has *no* insert/update/delete policy at all. Writes
  to those tables are only possible through a `SECURITY DEFINER` function,
  which runs with elevated privileges and does its own authorization check
  (a session token, an ownership check, or both) before writing. This is
  why `admin_credentials`, `admin_sessions`, `member_credentials`, and
  `member_sessions` have RLS enabled but zero policies — they're
  unreachable from the client except through the functions that own them.

`is_admin()` and `current_profile_id()` are small helper functions used by
the few RLS policies that *do* key off `auth.uid()` (the `projects`/
`project_updates` select policies, and the `users` policies for OAuth
visitors) — but since members and admins never hold a real Supabase Auth
session, those two helpers only ever resolve to something meaningful for
the separate OAuth path.

## Storage

One public bucket, `uploads`, holds everything: gallery images, post cover
images, member avatars, project-update photos. There's no per-row ownership
model for files, so the bucket-level storage policies are intentionally
open (`bucket_id = 'uploads'`) rather than gated on a Supabase Auth session
that most uploaders (admin PIN, member password) never have.

## Question of the Day

`supabase/functions/generate-qotd/index.ts` is a Supabase Edge Function
(Deno), triggered on a daily cron schedule (see `SETUP.md`). It:
1. Picks a random topic category and asks OpenRouter for a question + a
   short fun fact, requesting strict JSON back.
2. Computes "today" in IST (the function has no timezone awareness
   otherwise — everything server-side is UTC).
3. Inserts one row into `public.qotd` for that date — idempotent, so a
   duplicate cron trigger or a manual re-run on the same day is a no-op.

The frontend widget (`src/components/blog/QotdWidget.jsx`) reads today's
row (public, no auth needed) and lets a signed-in member or OAuth visitor
respond once each — enforced by a partial unique index
(`qotd_responses_unique_user` / `qotd_responses_unique_profile`) plus the
RLS/RPC checks described above. It renders nothing on a day the function
hasn't run yet.

## Attendance

`src/lib/attendance.js` fetches a Google Sheet published as JSON through a
Google Apps Script web app (a flat array of
`{ name, admissionNumber, attendance }` rows), caches it in memory for the
session, and matches a member by admission number (falling back to a
case-insensitive name match). It fails soft — if the sheet is unreachable,
member profiles just don't show an attendance figure rather than breaking
the page. This lives outside Supabase entirely; there's no attendance table
in the schema.

## Project collaborators

A project's `member_id` is its original creator. `collaborator_ids` (a
`uuid[]` column) holds anyone else with equal edit rights. Both
`member_save_project()` and `member_create_project_update()` treat "owner
OR in `collaborator_ids`" as sufficient authorization to edit the project or
post an update on it — and only the owner or an existing collaborator can
change the collaborator list itself, so a non-collaborator can't add
themselves.

## Gallery: merging posts and dedicated entries

`posts.images` (a `text[]`, alongside the existing single `cover_image`) lets
a post carry a small picture gallery, uploaded the same way as everywhere
else — `db.integrations.Core.UploadFile({ file })` into the `uploads`
bucket, one URL per picture. `PostForm` has a second, multi-file picker for
it (same pattern as `AdminGallery`'s picker, capped at 10 images), and
`ArticleDetail` renders them as a grid under the cover image.

`src/pages/Gallery.jsx` doesn't just read `db.entities.Gallery` — it also
fetches `db.entities.Post`, turns every post that has a `cover_image` and/or
`images` into a tile (`postToTile()`), and merges those with the dedicated
gallery entries (`galleryToTile()`) into one array, sorted by
`created_date`. A post-derived tile carries an `href` back to
`/article/:slug` (rendered as a link on its caption title only, not the
whole tile) and a small "From the blog" label; a dedicated gallery entry has
neither. If you add another entity that should also surface on `/gallery`,
write a `<thing>ToTile()` function with the same shape (`id`, `title`,
`description`, `images`, `created_date`, `href`, `sourceLabel`) and fold it
into the same merge.

`src/components/blog/Lightbox.jsx` is the full-screen image viewer used by
both `Gallery` and `ArticleDetail`'s picture grid: pass it a flat array of
`{ src, alt, caption }` plus the open index, and it handles the overlay,
Escape-to-close, and arrow-key/button navigation. `Gallery` flattens every
tile's images into one array (`flatImages`) so the viewer can step
continuously from one tile's last picture into the next tile's first;
`ArticleDetail` just passes that one post's `images` array. To reuse it
elsewhere, build a similar flat list and keep an `index` state variable —
the component itself has no other dependency on where the images came from.

## Blog Writers page

`src/pages/BlogWriters.jsx` (`/writers`) doesn't read from a `writers`
table — there isn't one. It fetches every post and every member, then
`buildWriters()` aggregates by name: each post's `author` field and each
entry in its `contributors` jsonb array becomes (or adds to) one writer,
counted separately as "authored" vs. "contributed" so a name can be both.
Each aggregated writer is matched against the member directory by a
case-insensitive name lookup — a match adds an avatar, a domain, and a link
through to `/member/:id`; no match just renders initials and a name. Because
matching is name-based, a writer's `author` string on a post needs to match
their member profile's `name` field exactly (case aside) for the two to
link up — free-text authors that aren't in the roster (e.g. `"Innovation
Club"`) show up fine, just without a member link. It's linked from the
"Browse the Archive" section on the homepage (`src/components/blog/
Archive.jsx`), not from the main navbar.

## Where to make common changes

- **Add a new public page** — add a component under `src/pages/`, add a
  lazy import + `<Route>` in `src/App.jsx`.
- **Add a field to an entity** — add the column in `supabase/schema.sql`
  (and re-run the relevant `create table` block, or an `alter table ...
  add column if not exists ...`), then read/write it like any other field
  through `db.entities.<Name>` — no `dataClient.js` changes needed unless
  the table itself is new.
- **Add a new admin-managed table** — create the table + RLS `select`
  policy in `supabase/schema.sql`, add it to the `TABLES` map in
  `src/api/dataClient.js`, and add it to the `allowed` whitelist inside
  `admin_write()` / `admin_delete_row()`.
- **Change what a member can self-edit** — extend the `coalesce(...)` list
  in `member_update_profile()`.
- **Add a shared UI primitive** — `npx shadcn add <component>` (config is
  in `components.json`); only the toast system ships by default.
