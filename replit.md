# FlickBolt

## Overview
FlickBolt is a two-sided marketplace for on-demand video capture of physical locations.
**Customers** request a video of a place; **Capturers** (mobile creators) fulfill those
requests. A Twitch-style **Live** mode also lets capturers broadcast publicly while
viewers tip and subscribe.

The frontend is a static Jekyll site; the backend is Cloudflare Workers (Hono router)
with D1 for SQL, R2 for storage, KV for sessions, Stream for video, and Durable
Objects for real-time matching + live chat. Payments use Stripe Connect.

## Repository layout (monorepo)
```
flickbolt/
├── site/                  # Jekyll site → GitHub Pages
│   ├── _config.yml
│   ├── _layouts/
│   ├── _includes/
│   ├── _data/
│   ├── _css/app.css       # Tailwind source (compiled by npm run build:css)
│   ├── tailwind.config.js
│   ├── package.json
│   ├── assets/
│   │   ├── css/app.css    # GENERATED — gitignored, do not edit
│   │   └── js/            # api.js, auth.js, state.js, pages/*
│   ├── index.md           # landing page
│   ├── request.md         # customer request flow
│   ├── capture.md         # capturer dispatch
│   ├── live/              # live discovery + watch page
│   ├── dashboard/         # customer + capturer dashboards
│   ├── login.md, signup.md, onboarding/
│   └── legal/             # terms, privacy, capturer agreement, filming rules
├── workers/
│   ├── api/               # main API worker (Hono on Cloudflare Workers)
│   │   ├── src/
│   │   │   ├── index.ts          # router + CORS + error handler
│   │   │   ├── types.ts          # Env + JwtPayload typings
│   │   │   ├── routes/health.ts  # GET /health, GET /version
│   │   │   ├── routes/auth.ts    # signup / login / refresh / logout
│   │   │   ├── routes/me.ts      # GET /me
│   │   │   └── middleware/       # auth + error handler
│   │   ├── wrangler.toml
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── matching-do/       # Durable Object for geo-matching (Phase 6 stub)
│   ├── live-channel-do/   # Durable Object for live chat (Phase 9 stub)
│   ├── shared/            # cross-worker types/helpers
│   ├── migrations/0001_init.sql  # D1 schema
│   └── scripts/migrate.sh
└── .github/workflows/
    └── pages.yml          # builds site/ (Tailwind + Jekyll) → GitHub Pages
```

## Tech Stack
- **Frontend**: Jekyll 4.3, vanilla JS, Tailwind compiled at build time
- **API**: Cloudflare Workers + Hono router + bcryptjs + JWT (HS256)
- **Database**: Cloudflare D1 (SQLite), schema in `workers/migrations/0001_init.sql`
- **Sessions**: Cloudflare KV (refresh tokens)
- **Storage**: Cloudflare R2 (media assets)
- **Video**: Cloudflare Stream (live + VOD) — wired in Phase 7+
- **Real-time**: Durable Objects (Phases 6, 9)
- **Payments**: Stripe Connect Express — wired in Phase 5+

## Running on Replit
Workflow `Start application` runs:
```
cd site && bundle install --quiet && npm install --no-audit --no-fund \
  && npm run build:css && bundle exec jekyll build \
  --config _config.yml,_config.dev.yml --destination ../_site \
  && cd .. && node server/src/index.js
```
That compiles Tailwind (`site/_css/app.css` → `site/assets/css/app.css`), builds the
Jekyll site with the dev config override (which sets `api_base` to
empty so calls hit the same origin), then starts a Node/Express server on port 5000
that serves both the static site **and** a local clone of the Workers API
(signup / login / refresh / logout / me). This lets you exercise auth end-to-end in
the Replit preview without touching Cloudflare.

The Node server at `server/` uses SQLite (file: `data/flickbolt.db`) in place of D1
and an in-memory map in place of KV. The schema comes from
`workers/migrations/0001_init.sql`.

## Deploying to production (flickbolt.com)
See `DEPLOYMENT.md`. Architecture:
- Site → GitHub Pages on `flickbolt.com` via `.github/workflows/pages.yml`
- API → Cloudflare Workers (deployed manually; already live)

## Deployment
- **Site**: GitHub Pages via `.github/workflows/pages.yml` (path-filtered to `site/**`).
  Prior to this workflow existing, `.gitignore` excluded `.github/workflows/`, so no
  workflow was ever committed — Pages built the repo root and served `README.md` on
  flickbolt.com instead of the platform UI.
- **API**: Cloudflare Workers — deployed manually with `npx wrangler deploy` from
  `workers/api/`. Not yet automated in CI.
- **Replit publish**: configured as a static deployment that builds Jekyll from `site/`
  and serves `_site/` (so the landing page is reachable at the `*.replit.app` domain
  even before a real CF/Pages setup).

## Phase status
- ✅ Phase 0 — Empty deployable skeleton + GitHub Actions
- ✅ Phase 1 — Jekyll routes, layouts, mobile nav, page-scoped JS bundle
- ✅ Phase 2 — Workers API foundation: Hono router, D1 schema, health/version,
  CORS, error handler, JWT auth (signup/login/refresh/logout/me)
- ⏳ Phases 3–12 — see `attached_assets/Pasted--FlickBolt-Build-Specification-...txt`

## Cloudflare deployment (live)
Worker is **deployed and serving traffic**:
- API URL: `https://flickbolt-api.guillaumelauzier.workers.dev`
- D1 `flickbolt_db` uuid `a726d6ef-6705-40aa-bac3-a8b59ffc6eda` — schema `0001_init.sql` applied (10 tables)
- KV `flickbolt-sessions` id `8efadccda4eb485eb325abb211737d3f` (refresh tokens)
- R2 `flickbolt-media` (empty)
- `JWT_SECRET` set as worker secret (48 random bytes, base64url)

End-to-end smoke verified: `/health`, `/version`, `/auth/signup`, `/me`, `/auth/login`,
`/auth/refresh` (rotates), `/auth/logout`, plus negative cases (bad password → 401,
duplicate email → 409, missing bearer → 401).

### Known limitation
Refresh-token revocation relies on KV deletion. KV is **eventually consistent**
(up to ~60s global propagation), so a token rotated seconds ago may still be
accepted briefly at edges that haven't seen the delete. For Sprint 3+ swap
refresh-token storage to D1 (strongly consistent) if exact-instant revocation
is required.

## What still requires user action before Sprint 2
- Confirm Settings → Pages source is "GitHub Actions" (`pages.yml` tries to set it
  automatically via `actions/configure-pages`)
- (Optional) Add GitHub Actions secrets `CLOUDFLARE_API_TOKEN` /
  `CLOUDFLARE_ACCOUNT_ID` if worker deploys should move from manual `wrangler
  deploy` into CI
- (Optional) Point `api.flickbolt.com` DNS at Cloudflare and uncomment the
  `routes` block in `workers/api/wrangler.toml`
