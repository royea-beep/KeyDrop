# KeyDrop — Project memory / handoff

## SecretSauce & business-logic protection (must)

- **Sensitive logic**: Plan limits (requestsPerMonth, maxFields), pricing (Free/Pro $19/Team $49), LemonSqueezy variant IDs, API keys (env), credential handling, rate limits (login/register/submit/validate).
- **Current state**: API keys and variant IDs are server-only (env). Plan definitions in `src/lib/payments.ts` (server). Rate-limit points and durations are hardcoded in `src/lib/rate-limit.ts` (server-side). Credentials and validation live in API routes.
- **Before release**: Run SecretSauce once: `npx @royea/secret-sauce analyze ./src`. Apply recommended protection levels. Consider a small config server or env-only pattern for rate-limit constants and plan display so the client does not hardcode sensitive values.
- **Keep server-side only**: LEMONSQUEEZY_* env, credential storage/validation, rate-limit configuration (points, duration). Document in this memory: "Run SecretSauce before release; keep pricing, limits, and rate-limit params server-side."

### SecretSauce findings (report summary)

- **SERVER-FETCH (3)**: (a) `app/dashboard/page.tsx` — hours/days formula in `timeAgo()` (client-computed display); (b) `lib/rate-limit.ts` — `retryAfter` formula (server-only; used in 429 response).
- **CACHE+FETCH (11)**: (a) `app/billing/page.tsx` — `PLANS` with prices 0, 19, 49 and feature copy; (b) `lib/payments.ts` — plan prices and limits (server); (c) `lib/rate-limit.ts` — points 5, 3, 10, 30 and window durations (server-only; only imported by API routes).
- **DUAL (30)**: Mostly generated Prisma (e.g. RefreshToken) — ignore generated code.
- **Recommendation**: Before release: consider serving plan display and rate-limit config from API; enforcement is already server-side.
