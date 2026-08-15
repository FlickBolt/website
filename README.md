# FlickBolt

On-demand video capture of physical locations. A two-sided marketplace where
**Customers** request video of a place and **Capturers** (mobile creators)
fulfill those requests, plus a Twitch-style **Live** mode where capturers
broadcast publicly and viewers tip / subscribe.

## Stack

| Layer       | Tech                                                                        |
| ----------- | --------------------------------------------------------------------------- |
| Frontend    | Jekyll → GitHub Pages (`site/`)                                             |
| API         | Cloudflare Workers (Hono router) (`workers/api/`)                           |
| Database    | Cloudflare D1 (SQLite)                                                      |
| Storage     | Cloudflare R2                                                               |
| Video       | Cloudflare Stream (live + VOD)                                              |
| Sessions    | Cloudflare KV                                                               |
| Real-time   | Durable Objects (`workers/matching-do/`, `workers/live-channel-do/`)        |
| Background  | Cloudflare Queues                                                           |
| Payments    | Stripe Connect (Express)                                                    |

GitHub Pages serves zero dynamic content. Every dynamic interaction is
`fetch()` from the static page to a Worker endpoint that returns JSON.

## Repository layout

```
flickbolt/
├── site/                  # Jekyll site → GitHub Pages
├── workers/
│   ├── api/               # main API worker (Hono)
│   ├── matching-do/       # Durable Object for matching (Phase 6)
│   ├── live-channel-do/   # Durable Object for live chat (Phase 9)
│   ├── shared/            # cross-worker helpers
│   └── migrations/        # D1 SQL migrations
└── .github/workflows/     # CI: pages.yml (site → GitHub Pages)
```

> **Note:** `flickbolt.com` is served by `.github/workflows/pages.yml`, which
> builds `site/` and publishes it. If that workflow is missing or Pages is set to
> "Deploy from a branch", GitHub builds the repository root instead and the
> domain serves this README rather than the platform UI.

## Local development

### Site (Jekyll + Tailwind)

Tailwind is compiled at build time — there is no CDN script at runtime. The
source lives in `site/_css/app.css`; the compiled output `site/assets/css/app.css`
is generated and gitignored, so the CSS step must run before Jekyll.

```bash
cd site
bundle install
npm install
npm run build:css        # or: npm run watch:css, in a second terminal
bundle exec jekyll serve --host 0.0.0.0 --port 5000 --livereload
```

### API (Workers)
```bash
cd workers/api
npm install
echo 'JWT_SECRET="dev-secret-change-me"' > .dev.vars
npx wrangler d1 migrations apply flickbolt_db --local
npx wrangler dev
```

## Phase status (this commit)

- ✅ **Phase 0** — Empty deployable skeleton.
- ✅ **Phase 1** — Jekyll routes, layouts, page-scoped JS, mobile nav.
- ✅ **Phase 2** — Workers API with Hono, D1 schema, health/version, CORS, error handler. Auth scaffolding too (signup/login/refresh/logout/me) so Sprint 2 can begin without rework.
- ⏳ Phase 3+ — see `attached_assets/Pasted--FlickBolt-Build-Specification-...txt`.

## Things you (the human) still have to do for Sprint 1

1. Create a GitHub repo named `flickbolt` and push.
2. Enable GitHub Pages → source: GitHub Actions. (`pages.yml` sets this itself via
   `actions/configure-pages` with `enablement: true`; check Settings → Pages if the
   first run reports it could not.)
3. Buy a domain (`flickbolt.com`) — optional but recommended for cookie-based auth.
4. In Cloudflare:
   - Run `wrangler login`
   - `wrangler d1 create flickbolt_db` → paste `database_id` into `workers/api/wrangler.toml`
   - `wrangler kv:namespace create flickbolt-sessions` → paste `id` into wrangler.toml
   - `wrangler r2 bucket create flickbolt-media`
   - `wrangler secret put JWT_SECRET` (use a long random string)
5. Push to `main`. `pages.yml` rebuilds and republishes flickbolt.com; the Worker
   is deployed separately with `npx wrangler deploy` from `workers/api/`.

Acceptance for Sprint 1 (per spec):
- Visiting `flickbolt.com` shows the FlickBolt landing page. ✅ (via `pages.yml`)
- `curl https://flickbolt-api.guillaumelauzier.workers.dev/health` returns `{"ok":true}`. ✅ (live)
  - Custom `api.flickbolt.com` is optional and waiting on DNS.
