# KeyDrop — Secure Credential Collector

## Credits
- Roy (Creator & Product Visionary)
- Claude Opus (Co-Creator & Architecture)

## What This Is
A web app where freelance developers collect API keys from clients securely.
Developer creates a request, sends a link via WhatsApp/SMS, client submits credentials through a clean mobile-friendly form. Everything encrypted (AES-256-GCM).

## Tech Stack
- Next.js 14+ (App Router)
- PostgreSQL via Prisma 7 (adapter-pg)
- AES-256-GCM encryption (Node.js crypto)
- JWT auth (bcryptjs + jsonwebtoken)
- Tailwind CSS
- TypeScript
- Zod validation
- Lucide React icons

## Architecture
```
KeyDrop/
├── prisma/schema.prisma          # DB schema
├── prisma.config.ts              # Prisma 7 config
├── src/
│   ├── app/
│   │   ├── api/auth/             # register, login
│   │   ├── api/requests/         # CRUD + credentials retrieval + revoke
│   │   ├── api/validate/[token]/ # Public: check link validity
│   │   ├── api/submit/[token]/   # Public: client submits credentials
│   │   └── s/[token]/page.tsx    # Client-facing submission form
│   ├── lib/
│   │   ├── crypto.ts             # AES-256-GCM encrypt/decrypt
│   │   ├── auth.ts               # JWT + bcrypt
│   │   ├── auth-guard.ts         # withAuth middleware wrapper
│   │   ├── db.ts                 # Prisma client singleton
│   │   ├── validation.ts         # Zod schemas
│   │   ├── templates.ts          # Built-in service templates (Facebook, Google, Stripe, etc.)
│   │   └── constants.ts
│   └── generated/prisma/         # Prisma generated client
```

## Database Tables
- users — developer accounts
- credential_requests — the requests with tokens, status, expiry
- credential_fields — individual fields per request (encrypted values)
- oauth_connections — OAuth provider connections per request
- service_templates — built-in + learned service templates
- audit_logs — security audit trail

## Two Client Modes
1. **OAuth Connect** — client taps "Connect Facebook", logs in, done (1 click)
2. **Guided Manual** — step-by-step instructions with hints + validation per service

## Key Security
- AES-256-GCM encryption at rest (per-field, unique IV)
- ENCRYPTION_MASTER_KEY in env (64-char hex)
- JWT auth (15min access + 7d refresh)
- One-time-use links with expiry
- Audit logging on all actions
- Rate limiting on public endpoints

## Development
- `npm run dev` — start Next.js dev server
- `npx prisma generate` — regenerate Prisma client
- `npx prisma migrate dev` — run migrations
- Needs DATABASE_URL, ENCRYPTION_MASTER_KEY, JWT_SECRET in .env

## Current Status
Phase 1 scaffolding complete:
- All API routes built
- Client submission form built (mobile-first, Hebrew/English)
- 8 service templates (Facebook, Google, Instagram, Stripe, SendGrid, Cloudflare, TikTok, Mailchimp)
- Prisma schema with all tables
- Zero TypeScript errors

## TODO
- Dashboard UI (developer side)
- OAuth provider flows (Facebook, Google)
- AI-powered guide generation for unknown services
- Deploy to Vercel + Neon
