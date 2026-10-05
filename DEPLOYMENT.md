Deployment Guide — DailyTracker

Recommended stack: Vercel (host) + Neon or Supabase (Postgres)

1) Prep managed Postgres
   - Create a Postgres DB at Neon / Supabase / PlanetScale or Render.
   - Copy the connection string into `DATABASE_URL`.

2) Generate NextAuth secret
   - Locally:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Put value in `NEXTAUTH_SECRET`.

3) Set env vars (Vercel dashboard or chosen host)
   - `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (https://yourdomain)
   - Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, SMTP vars.

4) Migrations & seed
   - Locally test migrations against the managed DB or a local Postgres.
     ```bash
     # set DATABASE_URL as env var
     npx prisma migrate dev --name init
     node prisma/seed.js
     ```
   - For production deploy use:
     ```bash
     npx prisma migrate deploy
     npx prisma db seed
     ```

5) Connect Git repo to Vercel
   - Import the repo in Vercel, set the environment variables in the Vercel dashboard.
   - Vercel auto-deploys on push. Ensure build command is the default `npm run build` and `npm run start` for preview.

6) Post-deploy checks
   - Verify `/api/auth` register/login/reset flows.
   - Verify timer endpoints (start/pause/resume/stop) and calendar/analytics data.
   - If recurring tasks should be expanded, create a cron worker (GitHub Actions / Render Cron / Vercel Cron) to run a server-side job.

Notes:
- Do NOT use SQLite in production for multi-user app.
- If you want, provide the following and I can finish setting environment config and an optional GitHub Action to run migrations on deploy:
  - Git provider (GitHub/GitLab)
  - Hosting choice (Vercel / Render / Fly)
  - Managed Postgres connection string (or provider account so I can guide step-by-step)
  - OAuth creds (if you want Google sign-in)
  - SMTP creds (if you want password reset email working)
