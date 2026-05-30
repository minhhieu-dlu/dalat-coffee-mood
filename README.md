This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supabase Migration CLI

This repo now includes a `supabase/` folder with migrations and a minimal CLI config.

Typical workflow:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

To create a new migration file:

```bash
supabase migration new add_some_feature
```

Migration files live in `supabase/migrations/` and are applied in order.

## Seeding and Bulk User Creation

To seed demo coffee shops and create test users you can use the included scripts. These scripts require the Supabase service role key and URL in your environment variables. Do NOT commit the service role key.

1. Set environment variables (example on Windows PowerShell):

```powershell
$env:SUPABASE_URL = "https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"
```

2. Seed shops:

```bash
npm run seed:shops
```

3. Create N test users (example 20):

```bash
npm run seed:users -- 20
```

The `create_users.js` script uses the Supabase Admin API to create users and will mark their emails as confirmed.

## Docker Local Run

This project already uses `output: 'standalone'` in `next.config.ts` for non-Vercel builds, which is compatible with the Docker runner stage.

Run with Docker Compose:

```bash
docker compose --env-file .env.local up --build
```

The app will be available at `http://localhost:3000`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
