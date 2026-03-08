# KeyDrop (1-2Clicks) — Deploy to Vercel

## 1. Vercel

- Connect the repo to Vercel. `vercel.json` already sets build to `npx prisma generate && next build`.
- Add **Environment Variables** from `.env.example`: `DATABASE_URL` (use Vercel Postgres or Neon), `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_KEY`, `LEMONSQUEEZY_*` (API key, store ID, variant IDs, webhook secret).

## 2. Database

- **Production:** Use Postgres. Set `provider = "postgresql"` in Prisma schema and `DATABASE_URL` to your Postgres URL. Run `prisma migrate deploy` in the build (or add to `vercel.json` buildCommand).

## 3. Webhook

- LemonSqueezy webhook URL: `https://your-domain.com/api/billing/webhook` (or the route you use). Set the same in LemonSqueezy dashboard and in `LEMONSQUEEZY_WEBHOOK_SECRET`.

## 4. Before release

- Run SecretSauce (or use `SECRET_SAUCE.md` checklist). Ensure rate-limit and plan limits stay server-side.
