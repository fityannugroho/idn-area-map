## Project overview
Single-page Next.js (App Router) application for visualizing Indonesian administrative areas and islands. Primary featur es: interactive map dashboard, area boundaries, and island markers visualization page.

## Folder structure
```
idn-area-map/
├─ app/                      # Next.js App Router pages and app-level tests
│  ├─ __tests__/             # Vitest integration tests for pages
│  ├─ api/                   # app routes used for mocked APIs / og generation
│  └─ (main)/                # main layout + pages
│     ├─ layout.tsx
│     ├─ page.tsx
│     └─ ...                 # File-based routing
├─ components/               # Shared React components (library & custom)
│  ├─ ui/                    # Shadcn components (buttons, dialogs, etc.)
│  └─ ...
├─ modules/                  # Feature modules
│  ├─ MapDashboard/          # Map dashboard (layers, sidebar, providers)
│  └─ ...
├─ lib/
│  ├─ config.ts              # Configuration settings
│  ├─ const.ts               # Constants
│  ├─ data.ts                # Data fetching and manipulation
│  └─ utils.ts               # Utility functions
├─ hooks/                    # Reusable React hooks
├─ public/                   # Static assets
│  └─ map-styles/            # map style JSON
└─ ...
```

## Build & validate (how to run common tasks)
- Install: `pnpm install`
- Lint: `pnpm lint` (uses Biome)
- Typecheck: `pnpm build` (Next.js build step runs typecheck)
- Tests: `pnpm test` (Vitest)
- Dev: `pnpm dev` (Next.js)

Always run `pnpm install` after changing `package.json`. If a command fails, prefer running it locally and report exact  error output in PR description.

## Coding standards & conventions
- All code, comments, and documentation must in English.
- Prefer small, incremental PR-sized suggestions. When generating code, follow existing patterns in the repository.
- Use idiomatic TypeScript + React (function components, hooks, types). Keep changes minimal and well-scoped.
- Reuse existing helpers in `lib/` and hooks in `hooks/` rather than adding duplicates.
- For map/Leaflet components, dynamically import with `ssr: false` where DOM access is required.
- When adding or changing boundary layers, extend `featureConfig` in `lib/config.ts` and respect `order`/`simplification `.

## Preferences / Do — Don't
Do:
- Use path alias imports (`@/*`) when available.
- Add or update Vitest unit tests next to changed modules (`__tests__` or co-located `*.test.tsx`).
- Funnel async requests through `lib/data.ts` and use TanStack Query patterns where present.

Don't:
- Hardcode API endpoints, colors, or large inline constants; prefer `lib/config.ts` or centralized constants.
- Perform direct DOM manipulation in React components (except required Leaflet integrations).
- Introduce new global state managers if existing context/provider patterns suffice.

## If unsure
- Prefer an incremental utility or co-located hook and add tests. Keep PR descriptions explicit about verification steps .

## Reference additional instructions

- General coding guidelines: `.github/instructions/general.instructions.md`
- TypeScript specific guidelines: `.github/instructions/typescript.instructions.md`