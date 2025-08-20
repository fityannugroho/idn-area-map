---
description: "TypeScript & React coding guidelines"
applyTo: "**/*.ts,**/*.tsx"
---

Prefer minimal, idiomatic TypeScript and React code.

- Use path alias imports (`@/*`) instead of deep relative paths.
- Reuse existing helpers and types from `lib/*` and `hooks/*`.
- Add or update Vitest unit tests next to code changes (`*.test.ts`, `*.test.tsx`).
- Follow the project's Biome linting configuration; run `pnpm lint` before committing.
