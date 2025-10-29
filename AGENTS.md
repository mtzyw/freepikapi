# Repository Guidelines

## Project Structure & Module Organization
Runtime code lives in `src/`: App Router entries sit in `src/app/`, orchestration belongs in `src/services/`, shared infra in `src/lib/`, and database access plus schedulers in `src/repo/`. Keep SQL out of routes by reusing repository helpers. Store drizzle migrations in `drizzle/`, SQL seeds in `db/`, ship static assets from `public/`, and leave temporary uploads untracked.

## Build, Test, and Development Commands
- `pnpm dev` — run the Next.js dev server at http://localhost:3000.
- `pnpm build` — compile the production bundle; run before tagging a release.
- `pnpm start` — serve the latest build for smoke testing.
- `pnpm lint` — enforce ESLint with the Next.js presets.
- `pnpm typecheck` — run the TypeScript compiler in `noEmit` mode to catch regressions.
- `pnpm run db:migrate` — apply drizzle-kit migrations from `drizzle/`.
- `pnpm run db:init` — rebuild schema from `db/schema.sql` and load seeds.

## Coding Style & Naming Conventions
Write TypeScript, React, and Tailwind with two-space indentation. Components use PascalCase, hooks live in `useX.ts`, and shared utilities export named functions. Favor descriptive domain terms (`freepikTask`, `dispatchJob`) and rely on ESLint (`next/core-web-vitals`, `next/typescript`) plus Prettier defaults to keep formatting consistent. Route handlers stay thin and delegate to services and repositories.

## Testing Guidelines
Add deterministic unit suites with Vitest or Jest (`*.test.ts[x]`) and reserve Playwright for e2e specs in `e2e/*.spec.ts`. Mock Freepik and Supabase clients to avoid flaky network calls. Provide a `pnpm test` script that chains the suites contributors must run before opening a PR.

## Commit & Pull Request Guidelines
Use imperative commit subjects under 72 characters, e.g. `feat(api): add Freepik dispatcher`. Pull requests must describe scope, link tracking issues (`Closes #123`), and attach screenshots for UI updates. Confirm `pnpm build`, `pnpm lint`, migrations, and required tests before requesting review.

## Security & Configuration Tips
Store secrets in `.env.local` and only expose public values with the `NEXT_PUBLIC_` prefix. Rotate Supabase and Freepik tokens routinely, and update `.gitignore` whenever new generated assets appear.

## Architecture Overview
API handlers in `src/app/api/*` should delegate to services, which coordinate repository calls, Supabase access, and storage providers. Stream R2 uploads to avoid memory spikes, and keep QStash pollers (`/api/qstash/poll`) idempotent for safe retries. Reuse repository modules for database work instead of re-creating queries.
