# SecretSauce — KeyDrop (1-2Clicks)

Security audit checklist: **keep sensitive logic server-side**. See [ZProjectManager/docs/SECRET_SAUCE_CHECKLIST.md](../../ZProjectManager/docs/SECRET_SAUCE_CHECKLIST.md) for the full checklist.

## Server-only (never in client)

- **LEMONSQUEEZY_***, **JWT_***, **ENCRYPTION_KEY** → env only; never `NEXT_PUBLIC_*`.
- **Variant IDs** and **webhook secret** → env only; checkout and validation in API only.
- **Rate-limit** (points 5, 3, 10, 30; durations) in `src/lib/rate-limit.ts` → only imported by API routes.
- **Plan limits** (requestsPerMonth, maxFields) and **pricing** (0, 19, 49) in `src/lib/payments.ts` → server only.

## Current state

- API keys and variant IDs are server-only (env). Plan definitions and rate limits live in server files; credentials/validation in API routes.
- **CACHE+FETCH**: Billing page still has `PLANS` with prices/features (consider serving from **GET /api/billing/plans** like PostPilot for single source of truth).

## Before release

- Run `npx @royea/secret-sauce analyze ./src`. Apply recommended protection levels.
- Consider moving plan display to a server endpoint; keep all enforcement in API.
