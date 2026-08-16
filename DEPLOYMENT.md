# Deployment guide — flickbolt.com

Architecture (Option B):
- **Frontend** (Jekyll site) → GitHub Pages on `flickbolt.com`
- **Backend** (Hono API) → Cloudflare Workers
- Both deployed automatically from the `main` branch via GitHub Actions

---

## One-time setup (you do this once)

### 1. Push the repo to GitHub

```bash
git init -b main         # if not already
git remote add origin git@github.com:<your-user>/flickbolt.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 2. Enable GitHub Pages

In your GitHub repo → **Settings → Pages**:
- **Source:** "GitHub Actions"
- **Custom domain:** `flickbolt.com` (it will read the `CNAME` file)
- Tick **Enforce HTTPS**

### 3. Point flickbolt.com DNS at GitHub Pages

At your domain registrar, set:

| Type  | Name | Value                  |
|-------|------|------------------------|
| A     | @    | 185.199.108.153        |
| A     | @    | 185.199.109.153        |
| A     | @    | 185.199.110.153        |
| A     | @    | 185.199.111.153        |
| CNAME | www  | `<your-user>.github.io` |

DNS propagation takes 5–60 minutes.

### 4. Add Cloudflare credentials to GitHub

In your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**:

- `CLOUDFLARE_API_TOKEN` — create at https://dash.cloudflare.com/profile/api-tokens with the **"Edit Cloudflare Workers"** template
- `CLOUDFLARE_ACCOUNT_ID` — find at https://dash.cloudflare.com/ → right sidebar

### 5. (Optional) Custom API subdomain `api.flickbolt.com`

If you want the API at `api.flickbolt.com` instead of `flickbolt-api.guillaumelauzier.workers.dev`:

1. In Cloudflare, add `flickbolt.com` as a zone (free plan is fine).
2. Update your domain registrar's nameservers to Cloudflare's.
3. Edit `workers/api/wrangler.toml` and uncomment the `routes` block:
   ```toml
   routes = [
     { pattern = "api.flickbolt.com/*", zone_name = "flickbolt.com" }
   ]
   ```
4. Edit `site/_config.yml` and change `api_base` to `https://api.flickbolt.com`.
5. Push — both GitHub Actions will redeploy.

If you skip this step, the site will call the API at the existing `*.workers.dev` URL — that works fine, it's just less branded.

---

## How deploys work after setup

| You push changes to…           | GitHub Action triggers              | Result                                  |
|--------------------------------|-------------------------------------|-----------------------------------------|
| `site/**` or `CNAME`           | `.github/workflows/pages.yml`       | Rebuilds & redeploys flickbolt.com      |
| `workers/**`                   | `.github/workflows/workers-deploy.yml` | Applies D1 migrations + redeploys the Worker |

`pages.yml` runs on push to `main` and can also be triggered manually from the
Actions tab ("Deploy site to GitHub Pages" → Run workflow).

### What `pages.yml` does

1. `actions/configure-pages` with `enablement: true` — points Pages at the
   Actions build. **This is the step that stops flickbolt.com serving the
   README:** with no workflow present, Pages builds the repository root, finds
   no `index.html`, and falls back to rendering `README.md` with a default theme.
2. `npm ci && npm run build:css` — compiles Tailwind from `site/_css/app.css`
   into `site/assets/css/app.css`. The site no longer loads
   `cdn.tailwindcss.com` at runtime, which is explicitly not production-safe.
3. `bundle exec jekyll build` with `JEKYLL_ENV=production` → `_site/`.
4. `actions/deploy-pages` publishes `_site/`. `site/CNAME` rides along in the
   build output, so the custom domain survives every deploy.

### What `workers-deploy.yml` does

Two jobs. The `check` job runs on **every** push and pull request:

1. `npm ci` + `npm run typecheck` (`tsc --noEmit`).
2. `wrangler deploy --dry-run` — validates `wrangler.toml` and bundles the
   Worker **without credentials**, so a broken binding or build surfaces on the
   PR instead of halfway through a production deploy.
3. Resolves whether `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` exist
   (secrets cannot be read from a job-level `if`, so this is passed on as an
   output).

The `deploy` job runs only on `main`, and only when both secrets are present:

4. `wrangler d1 migrations apply flickbolt_db --remote` — **before** the deploy,
   so newly released code never meets an old schema. D1 records what it has
   already applied, so re-running is a no-op.
5. `wrangler deploy`.
6. Smoke test: polls `/health` until it returns `{"ok":true}`, up to 5 attempts.
   A deploy that does not answer is a failed deploy.

If the Cloudflare secrets are **not** set, the deploy job is *skipped*, not
failed — an unconfigured repo still gets typecheck and build signal rather than
a red X on every push.

> **Note on migrations:** step 4 applies pending migrations to the production
> database automatically. That is fine for additive changes, but a destructive
> migration will land the moment it reaches `main`. Review migration files with
> the same care as a production release.

---

## Verifying the API is live

```bash
curl https://flickbolt-api.guillaumelauzier.workers.dev/health
# → {"ok":true}
```

If you get a 404 or "deployment not found", the worker hasn't been redeployed since you set up the secrets — push a no-op change to `workers/` or click "Run workflow" on the Actions tab.

---

## Local development on Replit

The Replit preview keeps working independently:
- Tailwind is compiled first (`npm ci && npm run build:css`), then Jekyll is built
  with `_config.yml` + `_config.dev.yml` (the dev override sets `api_base` to empty)
- The Node API server in `server/` mirrors the Worker's auth routes for local testing
- This means signup/login work in the Replit preview without ever calling Cloudflare

In production (GitHub Pages build) the dev override is **not** applied, so the site calls the real Cloudflare Worker.

---

## Login / signup

Already implemented and working. The forms live at:
- `/signup/` → `POST /auth/signup` → returns access + refresh tokens, redirects to `/onboarding/capturer/`
- `/login/` → `POST /auth/login` → returns tokens, redirects to `/dashboard/customer/`

Tokens are stored in `localStorage` (`fb.access`, `fb.refresh`) and auto-attached to subsequent API calls. A 401 response triggers a one-shot refresh.
