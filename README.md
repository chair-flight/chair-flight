# Chair Flight

Chair Flight is a community driven aviation question bank built by students for
students.

Chair Flight is built with TanStack Start, React, Tailwind, Drizzle
and Supabase, and deployed to Vercel.

## Develop

```sh
pnpm install
cp .env.example .env

## Create and run local environment
pnpm supabase:start
pnpm supabase:migrate
pnpm supabase:push-content
pnpm dev

# Check your work
pnpm format
pnpm lint
pnpm check

# Scripts run against the local database (.env.local) by default.
# Add --prod to target the remote one (.env) instead.
pnpm dev --prod
pnpm supabase:migrate --prod
pnpm supabase:push-content --prod

# Build and preview target .env
pnpm build
pnpm run preview
```
