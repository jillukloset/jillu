# Jillu Kloset

Pre-loved. Re-loved. A fashion-focused social resale marketplace (V1 — market only, no
payments/checkout/auctions; see the implementation plan for full scope).

## Stack

Next.js 15 (App Router) · TypeScript · PostgreSQL + Prisma · Auth.js (Credentials + Google) ·
Tailwind CSS · TanStack Query · Vitest

## Local development

Requires Docker Desktop and Node 20+.

```bash
cp .env.example .env          # defaults already match docker-compose.yml
docker compose up -d          # Postgres (5433), MinIO (9000/9001), Mailhog (1025/8025)
npm install
npx prisma migrate dev        # applies the schema
npm run dev                   # http://localhost:3000
```

- Sent emails (verification, password reset) land in Mailhog: http://localhost:8025
- Object storage console (MinIO): http://localhost:9001 (user/pass: `jillu_admin` / `jillu_admin_secret`)
- Postgres runs on `localhost:5433` (not 5432, to avoid clashing with a locally installed Postgres)

Google sign-in is disabled until `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are set in `.env`.

## Scripts

```bash
npm run dev         # dev server
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run test         # vitest
npm run db:migrate   # prisma migrate dev
npm run db:seed      # seed realistic dev data
npm run db:studio    # Prisma Studio
```
