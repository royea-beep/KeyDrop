# KeyDrop

**Stop getting API keys over WhatsApp.**

KeyDrop lets you collect API keys, passwords, and credentials from clients through encrypted, one-time links. No more insecure WhatsApp messages, emails, or Slack DMs.

## How It Works

1. **Create a request** — Pick from 30+ templates (Stripe, AWS, Firebase, Google, etc.) or build a custom form
2. **Share the link** — Send a one-time encrypted link to your client
3. **Receive securely** — Credentials arrive in your dashboard, encrypted with AES-256-GCM

## Features

- **AES-256-GCM encryption** — Credentials are encrypted at rest, not just in transit
- **One-time links** — Links expire after use (configurable expiry + view limits)
- **30+ templates** — Pre-built forms for popular services
- **Audit trail** — Every action is logged with IP and timestamp
- **Usage-based billing** — Free tier (5 req/mo), Pro ($19/mo), Team ($49/mo)

## Tech Stack

- **Next.js 16** / React 19
- **Prisma** + SQLite (dev) / Postgres (production)
- **LemonSqueezy** for billing
- **TypeScript** throughout

## Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Fill in your values (see .env.example for documentation)

# Set up database
npx prisma migrate dev

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See `.env.example` for the full list. Key variables:

- `DATABASE_URL` — SQLite for dev, Postgres for production
- `ENCRYPTION_MASTER_KEY` — AES-256 key for credential encryption
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — Auth tokens
- `LEMONSQUEEZY_*` — Billing provider configuration

## Deployment

Deploy to Railway or any Node.js host with Postgres:

1. Provision a Postgres database (Neon, Supabase, Railway)
2. Set all env vars from `.env.example`
3. Run `npx prisma migrate deploy`
4. Deploy

## License

Proprietary. All rights reserved.
