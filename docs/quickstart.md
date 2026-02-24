# Quickstart: 15 minutes to first deployed app
1. Install Node 20+, pnpm 9.
2. `pnpm install`
3. `docker compose -f infra/docker/docker-compose.yml up -d`
4. Configure `apps/api/.env` and run `pnpm db:generate`
5. Run API: `pnpm --filter @neural/api dev`
6. Run Web: `pnpm --filter @neural/web dev`
7. Create project from Projects tab; open Builder tab.
8. Execute steps 0-8 and run verify action (`pnpm test`).
9. Deploy web to Vercel and API to Railway/Render/Fly.
10. Configure domain + HTTPS and Stripe webhook.

## Deploy steps
- **Vercel**: point to `apps/web`, set `NEXT_PUBLIC_API_URL`.
- **API (Railway)**: deploy `apps/api`, set database and Stripe env.
- **DB (Neon/Supabase)**: create Postgres and set `DATABASE_URL`.
- **Stripe**: webhook endpoint `/stripe/webhook`.
- **Mobile packaging**:
  - Android: `eas build -p android`, Play Console listing, privacy policy.
  - iOS: `eas build -p ios`, App Store Connect metadata + review notes.
