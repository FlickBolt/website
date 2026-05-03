# FlickBolt Workers

Cloudflare Workers monorepo for the FlickBolt API.

## Layout

- `api/` — main HTTP API worker (Hono). Phases 0–5 + 7–11 endpoints live here.
- `matching-do/` — Durable Object for real-time geo-matching (Phase 6).
- `live-channel-do/` — Durable Object for live broadcast chat + overlays (Phase 9).
- `shared/` — cross-worker types and helpers.
- `migrations/` — D1 SQL migrations applied via `wrangler d1 migrations apply`.

## Local development

```bash
cd api
npm install
# create local D1 + apply migrations
npx wrangler d1 migrations apply flickbolt_db --local
# set local secrets (or use a .dev.vars file)
echo 'JWT_SECRET="dev-secret-change-me"' > .dev.vars
npx wrangler dev
```

The dev server runs at http://localhost:8787.

## First-time Cloudflare setup

```bash
# 1. Authenticate
npx wrangler login

# 2. Create the D1 database — copy database_id into wrangler.toml
npx wrangler d1 create flickbolt_db

# 3. Create the KV namespace — copy id into wrangler.toml
npx wrangler kv:namespace create flickbolt-sessions

# 4. Create the R2 bucket
npx wrangler r2 bucket create flickbolt-media

# 5. Set production secrets
npx wrangler secret put JWT_SECRET
npx wrangler secret put STRIPE_SECRET
npx wrangler secret put STREAM_API_TOKEN
npx wrangler secret put CF_ACCOUNT_ID

# 6. Apply migrations to remote D1
npx wrangler d1 migrations apply flickbolt_db --remote

# 7. Deploy
npx wrangler deploy
```

## Endpoints (Phase 2)

| Method | Path           | Purpose                          |
| ------ | -------------- | -------------------------------- |
| GET    | /health        | Liveness check                   |
| GET    | /version       | Build info                       |
| POST   | /auth/signup   | Create account, issue tokens     |
| POST   | /auth/login    | Verify credentials, issue tokens |
| POST   | /auth/refresh  | Rotate refresh token             |
| POST   | /auth/logout   | Invalidate refresh token         |
| GET    | /me            | Current user (Bearer required)   |
