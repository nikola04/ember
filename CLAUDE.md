# Ember Monorepo Rules

## Project Structure & Context

This is a monorepo. Each application has its own specific context and guidelines:

- **Web App:** Detailed instructions are in `./apps/web/CLAUDE.md`. Before working on anything inside `apps/web/`, you MUST read that file.
- **Gateway (Bun + Elysia):** Lives in `./apps/gateway/`. Modular monolith pattern — each module under `src/modules/<name>/` has its own `*.routes.ts`, `*.service.ts`, `*.mapper.ts`, and `repository/`.

## Shared Packages

- `@ember/protocol` — Zod schemas + DTOs shared between gateway and web. **All API contracts live here.** Re-exports `z` from zod so consumers don't depend on zod directly.
- `@ember/db` — Drizzle schema and client. Re-exports drizzle query operators (`eq`, `and`, etc.).

When adding a new endpoint: define the request/response schemas in `@ember/protocol` first, then implement on both sides.

## Global Commands

- Typecheck, Lint & Format check: `bun run check`
- Auto-fix formatting: `bun run format`
- Generate DB migration: `bun run db:generate`
- Apply migrations: `bun run db:migrate`
