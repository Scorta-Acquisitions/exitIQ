# exitIQ — Code Review Rules

This file is read by automated review tooling (e.g. Claude Code review) and is the
checklist for human reviewers. Rules here supplement `CLAUDE.md`; they are
review-specific and not repeated there.

---

## Non-negotiable flags (block or comment on every violation)

### Environment variables
- [ ] No `process.env.*` in application code — must go through `env.mjs`.
- [ ] No new env var used without a matching entry in both `env.mjs` and `.env.local.example`.
- [ ] `SUPABASE_SERVICE_SECRET_KEY` must never appear in any file under `app/` that could
  ship to the browser, or in any `"use client"` component.

### Database / Drizzle
- [ ] `db` (from `lib/db/index.ts`) is not imported in Client Components or browser-side code.
- [ ] `prepare: false` remains on the postgres.js client in `lib/db/index.ts`.
- [ ] Any schema change includes a generated migration file in `lib/db/migrations/`.
- [ ] No `db:push` evidence in CI or deployment scripts — migrations only.

### RLS
- [ ] Any new Supabase table that stores user or session data includes an RLS policy
  in the same PR. No "we'll add RLS later."

### API contracts
- [ ] New route handlers under `app/api/assessment/` must match the exact contract
  (method, path, body shape, response shape) defined in `Product.md`.
- [ ] `session_id` is always a UUID generated at Stage 1 and stored in `localStorage` —
  never regenerated mid-flow.

### Auth / Supabase client split
- [ ] Browser-facing auth uses `lib/supabase/client.ts` (publishable key).
- [ ] Server-side auth uses `lib/supabase/server.ts` (publishable key + cookie handling).
- [ ] Admin/service operations use `SUPABASE_SERVICE_SECRET_KEY` only in server-only code.
- [ ] No Supabase client is instantiated inline — always import from the correct `lib/supabase/*` file.

### Module layering
- [ ] Nothing in `lib/` imports from `app/`.
- [ ] UI components do not import from `lib/db/`.

---

## Flag and comment (don't block, but require acknowledgement)

### Types
- [ ] No `any` without a comment explaining why it is unavoidable.
- [ ] Shared types/interfaces for API request/response shapes (don't inline in route handlers).

### Testing
- [ ] New API routes should have at least a basic Vitest integration test or a note
  explaining why it is deferred.
- [ ] If a component was added or changed, a Storybook story should accompany it.

### Migrations
- [ ] Migration files are named descriptively (Drizzle auto-names with a timestamp prefix —
  do not rename, but ensure the PR title describes the schema change).
- [ ] Migrations are backward-compatible unless a breaking change is explicitly documented
  in the PR description.

### Report JSON
- [ ] Any code that generates or consumes `report_json` must conform to the exact shape
  defined in `Product.md`. No ad-hoc fields without updating the spec.

### AI prompts
- [ ] Prompts for Claude Haiku (teaser) and Claude Sonnet (full report) are kept in
  dedicated server-only files, not inlined into route handlers.
- [ ] The `distressed=true` flag triggers a materially different report tone — verify this
  is honoured in any prompt changes.

---

## CLAUDE.md hygiene

If this PR changes behaviour described in `CLAUDE.md` or `Product.md` (architecture,
API contracts, env vars, DB schema), flag it. The PR author must update those docs
before the PR merges — not after.
