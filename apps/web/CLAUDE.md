# Web App Guidelines (Vite + TS)

## Important Documentation

- **Architecture & Design:** Before making architectural or visual changes, refer to `./docs/DESIGN.md`. It defines tokens, layout, and component-level intent.

## Local Commands

- Build application: `bun run build`
- Typecheck, Lint & Format: `bun run check` (from root)
- Auto-fix formatting: `bun run format` (from root)

## Code Style & Architecture Guidelines

### 1. Codebase Architecture (Strictly Modular, Feature-Driven)

- **Group by feature, not by technical type.**
    - Prefer: `src/features/auth/components/`, `src/features/auth/hooks/`, `src/features/auth/api/`, `src/features/auth/types.ts`
    - Avoid: feature-specific logic under global `src/components/`.
- **Global folders are for generic, reusable building blocks only:**
    - `src/components/` — generic UI (Button, Avatar, EmptyState, EmberLogo). NO feature logic.
    - `src/lib/` — singletons and infrastructure (axios instance, query client, env).
    - `src/hooks/` — cross-feature hooks (useDebounce, useMediaQuery).
- **Lift to shared only when there's a second consumer.** Don't preemptively generalize.
- **One component per file** unless tightly coupled subcomponents are private to the parent and used nowhere else. Use **named exports**.
- **Keep files small.** If a component file exceeds ~200 lines or holds more than 2–3 private subcomponents, extract them into siblings.

### 2. Strict TypeScript & Zod Validation Rules

- **No `any`. No `unknown` shortcuts.** If a type is hard, write an `interface` or `type`. If something truly is `unknown`, narrow it explicitly.
- **Type-only imports use `import type`** (verbatimModuleSyntax is on — the build fails otherwise).
- **Component props are always explicitly typed.** Use an `interface` for non-trivial prop shapes; inline destructuring types are fine for one or two props.
- **Shared protocol:** All DTOs and Zod schemas live in `@ember/protocol`. Import from there; do not redeclare. Derive local types with `z.infer<typeof schema>` when you need them.
- **Form validation:** Use the shared Zod schemas with `react-hook-form` + `@hookform/resolvers/zod`.

### 3. Icons — lucide-react ONLY

- Use **`lucide-react`** for every icon. Do not introduce Material Symbols, Heroicons, Font Awesome, raw SVGs, or icon fonts.
- Import icons by name as React components: `import { Hash, Send, Plus } from 'lucide-react'`. Lucide is tree-shaken — only used icons end up in the bundle.
- Standard usage: `<Hash size={18} strokeWidth={1.5} className="text-fg-muted" />`. Color via Tailwind `className`, not the `color` prop.
- **The Ember brand logo** is intentionally a custom SVG in `src/components/EmberLogo.tsx` — the only allowed non-lucide icon.

### 4. Tailwind CSS & Styling

- **Utility-first.** Inline `style={{}}` only for genuinely dynamic values (computed positions, animation delays, runtime colors that come from data). Static styling goes through Tailwind classes.
- **Design tokens live in `src/index.css` under `@theme`.** Add new colors / fonts / animations there so they generate utility classes. Do NOT hardcode hex values across components for things that should be tokens.
- **Class ordering:** layout → sizing → spacing → typography → colors → state. Keep it scannable.
- If a className string is hard to read, extract logical groups into a local const, or use `clsx` / `tailwind-merge` for conditional composition. Avoid `@apply` in CSS files.

### 5. State Management

- Default to local `useState`. Lift only when shared.
- **TanStack Query** for all server state (lists, details, mutations). Never put server data in React state directly.
- **Zustand** for cross-cutting client state (realtime presence, WS connection, voice room) — see DESIGN.md for the planned slices.
- Don't reach for Context unless the value is truly tree-wide (theme, auth user). Prefer prop passing for 2–3 levels deep.

### 6. Data Fetching (TanStack Query) & API Patterns

- **One shared axios instance** in `src/lib/axios.ts` with base URL, credentials, and interceptors. Never import raw `axios` in components or hooks.
- **API functions live in `features/<feature>/api/`.** Each file exports one or a few related functions (`getMe.ts`, `listServers.ts`). No raw HTTP calls in components or hooks.
- **TanStack Query is the only path for async data.** Wrap each query/mutation in a custom hook inside the feature's `hooks/` folder (`useMe`, `useServers`, `useCreateServer`). Components consume hooks, never raw API functions.
- Parse responses with the shared Zod schemas from `@ember/protocol` when validation matters (untrusted boundaries, forms).

### 7. Performance

- **React Compiler is enabled** (see `vite.config.ts`). Do NOT manually wrap things in `useMemo`, `useCallback`, or `React.memo` unless profiling proves a hot path. Premature memoization makes the code worse.
- **Code-split** route-level views with `React.lazy` once routing is introduced.
- **Virtualize long lists** (message list, large member lists) with TanStack Virtual.
- **Lazy-load heavy media** (image attachments, embeds). Don't ship every asset upfront.
- Keep re-render scope narrow: colocate state next to the component that needs it; don't hoist into a global store "just in case".

## Agent Behavior Checklist

Before stating a task is complete, you MUST:

1. Run `bun run check`. Zero TypeScript, ESLint, or Prettier errors. Auto-fix formatting with `bun run format`.
2. No feature-specific code leaking into global folders.
3. No raw `axios`, no Material Symbols / other icon libraries, no `any` casts.
4. Touched files stay under the size guideline; extract subcomponents when needed.
