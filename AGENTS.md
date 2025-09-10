# Repository Guidelines

## Project Structure & Module Organization
- Source lives in `src/`:
  - `src/app/`: Next.js App Router pages and APIs (e.g., `api/task`, `api/webhook/freepik`, `admin/*`).
  - `src/lib/`: Infrastructure helpers (env, R2, Supabase, QStash, proxy auth).
  - `src/services/`: Business logic (Freepik dispatcher, finalize, storage).
  - `src/repo/`: Database access (Supabase queries, schedulers, tasks, keys).
- Data & migrations: `db/` (raw SQL), `drizzle/` (drizzle‑kit migrations).
- Static assets: `public/`.

Example paths:
```
src/app/api/task/route.ts
src/services/freepikDispatcher.ts
src/repo/supabaseRepo.ts
```

## Build, Test, and Development Commands
- `pnpm dev`: Start local dev server at http://localhost:3000.
- `pnpm build`: Create a production build.
- `pnpm start`: Serve the built app.
- `pnpm lint`: Run ESLint checks.
- `pnpm typecheck`: TypeScript type checks.
- `pnpm run db:migrate`: Apply migrations in `drizzle/`.
- `pnpm run db:init`: Apply `db/schema.sql` and seeds.

## Coding Style & Naming Conventions
- Language: TypeScript + React (Next.js 15, App Router).
- Indentation: 2 spaces; prefer named exports for shared modules.
- Components: PascalCase; hooks in `useX.ts` files.
- Routes follow App Router (`page.tsx`, `layout.tsx`, `route.ts`).
- Styling: Tailwind CSS v4 via `@tailwindcss/postcss`.
- Linting: ESLint extends `next/core-web-vitals` and `next/typescript`.

## Testing Guidelines
- No framework configured yet. If adding:
  - Unit: Vitest or Jest; name files `*.test.ts[x]` next to sources.
  - E2E: Playwright; place specs in `e2e/*.spec.ts`.
- Keep tests fast, deterministic, and network‑isolated. Add a `test` script and run with `pnpm test`.

## Commit & Pull Request Guidelines
- Commits: concise, imperative subject (≤72 chars).
  - Example: `feat(api): add Freepik dispatcher`.
- PRs: clear description, linked issue (e.g., `Closes #123`), and screenshots for UI changes.
- Ensure `pnpm build` and `pnpm lint` pass before review.

## Security & Configuration Tips
- Store secrets in env files; never commit real values.
- Server‑only secrets in `.env.local`; client‑safe via `NEXT_PUBLIC_...`.
- Prefer DB‑backed token rotation over plaintext tokens.

## Architecture Overview
- API endpoints in `src/app/api/*`; domain logic in `src/services/*`; DB access in `src/repo/*`.
- R2 uploads use streaming + multipart; polling may be driven by QStash (`/api/qstash/poll`).
- Database via drizzle‑kit migrations or raw SQL in `db/`.

