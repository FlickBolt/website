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
└── .github/workflows/     # CI: jekyll.yml + workers-deploy.yml
```

## Local development

### Site (Jekyll)
```bash
cd site
bundle install
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
2. Enable GitHub Pages → source: GitHub Actions.
3. Buy a domain (`flickbolt.com`) — optional but recommended for cookie-based auth.
4. In Cloudflare:
   - Run `wrangler login`
   - `wrangler d1 create flickbolt_db` → paste `database_id` into `workers/api/wrangler.toml`
   - `wrangler kv:namespace create flickbolt-sessions` → paste `id` into wrangler.toml
   - `wrangler r2 bucket create flickbolt-media`
   - `wrangler secret put JWT_SECRET` (use a long random string)
5. Add GitHub Actions secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
6. Push to `main`. The two workflows deploy independently.

Acceptance for Sprint 1 (per spec):
- Visiting `flickbolt.com` shows the FlickBolt landing page. ✅ (locally on Replit)
- `curl https://api.flickbolt.com/health` returns `{"ok":true}`. ✅ (worker code ready, awaits your CF deploy)
