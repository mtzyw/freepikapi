# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains runtime code: `src/app/` for App Router pages and APIs (e.g. `src/app/api/task/route.ts`), `src/services/` for Freepik orchestration, `src/lib/` for infrastructure helpers, and `src/repo/` for Supabase data access and schedulers.
- Data artifacts live in `drizzle/` (drizzle-kit migrations) and `db/` (raw SQL plus seeds); static assets belong in `public/` and temporary uploads stay untracked.
- Favor reusable modules in services and repos; avoid inline SQL or business logic inside route handlers.

## Build, Test, and Development Commands
- `pnpm dev`: Run the Next.js dev server on http://localhost:3000.
- `pnpm build`: Create the production bundle; run before releasing changes.
- `pnpm start`: Serve the latest build for smoke testing.
- `pnpm lint`: Execute ESLint with the Next.js presets.
- `pnpm typecheck`: Run TypeScript in `noEmit` mode to catch typing regressions.
- `pnpm run db:migrate`: Apply pending migrations from `drizzle/`.
- `pnpm run db:init`: Recreate schema from `db/schema.sql` and load seeds.

## Coding Style & Naming Conventions
- Code in TypeScript, React, and Tailwind CSS; indent with two spaces and use named exports for shared utilities.
- Components use PascalCase, hooks live in `useX.ts`, and App Router files stay on the `page.tsx` / `layout.tsx` / `route.ts` pattern.
- Prefer descriptive domain terms (`freepikTask`, `dispatchJob`) and keep formatting aligned with ESLint (`next/core-web-vitals`, `next/typescript`).

## Testing Guidelines
- Test harness is not wired yet; add Vitest or Jest for unit suites (`*.test.ts[x]`) and Playwright for e2e specs (`e2e/*.spec.ts`).
- Make tests deterministic, avoid external API calls, and wire a `pnpm test` script that runs locally before PR submission.

## Commit & Pull Request Guidelines
- Use imperative subjects under 72 characters (`feat(api): add Freepik dispatcher`).
- PRs must describe scope, reference tracking issues (`Closes #123`), and include screenshots for visual work.
- Confirm `pnpm build`, `pnpm lint`, and relevant migrations before requesting review.

## Security & Configuration Tips
- Secrets live in `.env.local`; expose only public values with the `NEXT_PUBLIC_` prefix.
- Rotate access tokens through Supabase rather than committing static keys.
- Review `.gitignore` when adding assets to avoid leaking generated files or credentials.

## Architecture Overview
- API entry points under `src/app/api/*` call services, which orchestrate repository functions and storage providers.
- R2 uploads stream through handlers; QStash pollers live at `/api/qstash/poll` and must remain idempotent.
- Database logic lives in `src/repo/*`; keep queries composable and reuse them across services.
