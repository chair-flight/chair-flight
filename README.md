# Chair Flight

Chair Flight is a community driven aviation question bank built by students for
students.

Chair Flight is built with TanStack Start, React, Tailwind, Drizzle
and Supabase, and deployed to Vercel.

| Path                  | Contents                                    |
| --------------------- | ------------------------------------------- |
| `content/`            | Question banks and blog posts               |
| `src/database/`       | Drizzle schema and migrations               |
| `src/libs/base/`      | Generic Framework and JS code               |
| `src/libs/core/`      | Business Logic modules                      |
| `src/libs/providers/` | External services                           |
| `src/libs/ui/`        | React Specific code to build the platform   |
| `src/routes/`         | Application code                            |
| `src/tools/`          | Scripts used outside of runtime             |
| `src/slop/`           | AI Agent slop code used for temporary tasks |

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
