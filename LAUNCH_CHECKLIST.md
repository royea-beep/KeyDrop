# KeyDrop — Launch Checklist

Use this checklist when deploying to production and launching (e.g. Railway + Product Hunt).

---

## 1. Deploy to Railway with production Postgres

- [ ] Create a new Railway project (or use existing).
- [ ] Add **Postgres** plugin (or connect external Postgres). Copy the `DATABASE_URL`.
- [ ] Connect the KeyDrop repo (GitHub). Set **Root Directory** if needed.
- [ ] Configure build: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`.
- [ ] Set start command: `npm start` (or `npx next start`).
- [ ] Generate a domain (e.g. `keydrop.up.railway.app`) or attach a custom domain.

---

## 2. Environment variables on Railway

- [ ] **Secrets not in repo:** No `.env` or env values committed; no default/example values in production.
- [ ] **Critical secrets set (not default/example):** `ENCRYPTION_MASTER_KEY`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `LEMONSQUEEZY_WEBHOOK_SECRET` are set to strong, unique values (e.g. from `openssl rand -hex 32` or LemonSqueezy dashboard).

Set these in the Railway project **Variables** (no quotes in value unless required):

| Variable | Description | Example / note |
|----------|-------------|----------------|
| `DATABASE_URL` | Postgres connection string | From Railway Postgres or Neon/Supabase |
| `ENCRYPTION_MASTER_KEY` | 64-char hex (32 bytes) for AES-256 | `openssl rand -hex 32` |
| `JWT_SECRET` | JWT access token signing | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | JWT refresh token signing | `openssl rand -hex 32` |
| `LEMONSQUEEZY_API_KEY` | LemonSqueezy API key | From LemonSqueezy dashboard |
| `LEMONSQUEEZY_STORE_ID` | Store ID | e.g. `309460` |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Webhook signing secret | From LemonSqueezy webhook config |
| `LEMONSQUEEZY_PRO_VARIANT_ID` | Pro plan variant ID | e.g. `1377967` |
| `LEMONSQUEEZY_TEAM_VARIANT_ID` | Team plan variant ID | e.g. `1377974` |
| `NEXT_PUBLIC_APP_URL` | Public app URL (no trailing slash) | `https://your-domain.com` |
| `LEMONSQUEEZY_STORE_SLUG` | (Optional) Store slug for billing portal | e.g. `your-store` |

---

## 3. LemonSqueezy webhook URL

- [ ] In [LemonSqueezy Dashboard](https://app.lemonsqueezy.com) → Your Store → **Settings** → **Webhooks**, add a webhook.
- [ ] **Webhook URL:** `https://<your-railway-domain>/api/stripe/webhook`  
  Example: `https://keydrop.up.railway.app/api/stripe/webhook`
- [ ] Select events: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_expired`.
- [ ] Copy the **Signing secret** and set it as `LEMONSQUEEZY_WEBHOOK_SECRET` in Railway.

---

## 4. Test full flow (product)

- [ ] **Register** — Create an account on production.
- [ ] **Create request** — Dashboard → New request, pick a template or custom fields.
- [ ] **Share link** — Copy the one-time link.
- [ ] **Submit** — Open link in incognito/second browser, submit credentials.
- [ ] **Retrieve** — In dashboard, open the request and confirm values are visible (decrypted).

---

## 5. Test billing flow

- [ ] **Checkout** — Upgrade to Pro or Team from Billing page; complete LemonSqueezy checkout.
- [ ] **Webhook** — Confirm webhook is called (check Railway logs or LemonSqueezy webhook logs).
- [ ] **Plan upgrade** — After success redirect, confirm user plan is PRO or TEAM and limits apply (e.g. 100 requests for Pro).
- [ ] (Optional) **Portal** — Open “Manage billing” and confirm LemonSqueezy customer portal loads.

---

## 6. Push to GitHub

- [ ] All changes committed. No secrets in repo.
- [ ] Push to `main` (or your default branch). Railway will redeploy if connected.

---

## 6b. Post-deploy

- [ ] If the app exposes a health/status endpoint (e.g. `/api/health` or `/api/status`), hit it and confirm 200.
- [ ] Confirm landing page and login load over HTTPS (no mixed content, valid cert).

---

## 7. Submit to Product Hunt

- [ ] Use copy from **PRODUCT_HUNT.md** (tagline, description, first comment, features).
- [ ] Add production URL and optional media (screenshot/GIF/video).
- [ ] Submit and share with your audience (freelancers, agencies, DevOps).

---

## Quick reference

- **Webhook route:** `POST https://<domain>/api/stripe/webhook`
- **Plans:** FREE $0 (5 req/mo), PRO $19/mo (100 req), TEAM $49/mo (unlimited)
