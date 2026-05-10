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
| `site/**` or `CNAME`           | `.github/workflows/jekyll.yml`      | Rebuilds & redeploys flickbolt.com      |
| `workers/**`                   | `.github/workflows/workers-deploy.yml` | Applies D1 migrations + redeploys Worker |

Both run on push to `main` and can also be triggered manually from the Actions tab.

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
- Jekyll is built with `_config.yml` + `_config.dev.yml` (the dev override sets `api_base` to empty)
- The Node API server in `server/` mirrors the Worker's auth routes for local testing
- This means signup/login work in the Replit preview without ever calling Cloudflare

In production (GitHub Pages build) the dev override is **not** applied, so the site calls the real Cloudflare Worker.

---

## Login / signup

Already implemented and working. The forms live at:
- `/signup/` → `POST /auth/signup` → returns access + refresh tokens, redirects to `/onboarding/capturer/`
- `/login/` → `POST /auth/login` → returns tokens, redirects to `/dashboard/customer/`

Tokens are stored in `localStorage` (`fb.access`, `fb.refresh`) and auto-attached to subsequent API calls. A 401 response triggers a one-shot refresh.
