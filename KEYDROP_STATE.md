# KeyDrop — Project State
> Last updated: 2026-03-17

## Version
- **App version:** 0.1.0
- **Live:** https://1-2clicks.vercel.app
- **Stack:** Next.js 16 + Prisma + LemonSqueezy

## Product
Encrypted one-time credential sharing. Users create a secure link containing an API key or password, share it, and the recipient retrieves it once before it self-destructs.

## Encryption
- **Algorithm:** AES-256-GCM
- **Model:** Client-side encryption, key in URL fragment (never sent to server)

## Billing
- **Provider:** LemonSqueezy
- **Free:** 5 requests/month
- **Pro:** $19/mo (100 requests/month)
- **Team:** $49/mo (unlimited)

## Admin
- **Dashboard:** /admin?key=keydrop-admin-2026

## Expiry Options
1h, 6h, 24h, 48h, 3d, 7d, 30d, Never

## Critical Bug Fixed
- maxViews was blocking retrieval — resolved

## SESSION LOG — March 17 2026

### What was built today:
1. **Admin Dashboard** — Admin panel at /admin?key=keydrop-admin-2026 with usage stats and management
2. **SEO Structured Data** — JSON-LD schema markup for search engine visibility

## Pending
- Create dedicated LemonSqueezy products in dashboard (currently using ftable placeholder variants)
