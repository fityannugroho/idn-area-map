---
description: "Project-wide do/don't and testing guidance"
applyTo: "**"
---

- Keep suggestions concise (one focused change / PR-sized).
- Use existing UI primitives under `components/ui`.
- Funnel new async requests through `lib/data.ts`.
- Do not hardcode API endpoints, colors, or inline constants — use `lib/config.ts` or `featureConfig`.
- Use `debounce` from `lib/utils.ts` for panel/map resize behavior (100ms).
- Always lint and typecheck after making changes (`pnpm lint:fix && pnpm lint`).

If multiple instruction files apply, avoid conflicting guidance; VS Code will combine matching instructions.
