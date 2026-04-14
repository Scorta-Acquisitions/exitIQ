## What changed

<!-- One paragraph. What does this PR do? Link the GitHub Issue or ticket (e.g. closes #42, implements INF-003). -->

## Why

<!-- Why is this change needed? What problem does it solve or what spec does it implement? -->

## How verified

<!-- How did you test this? Check all that apply and describe what you ran. -->

- [ ] `pnpm lint` — passed
- [ ] `pnpm prettier` — passed
- [ ] `pnpm test` — passed
- [ ] `pnpm exec tsc --noEmit` — no new type errors
- [ ] Storybook smoke tests — passed (or N/A — no component changes)
- [ ] Manual test in browser / preview deployment — describe what you checked:

<!-- e.g. "Submitted Stage 1 form, verified session_id created, teaser card rendered" -->

## Risk level

<!-- Low / Medium / High — and one sentence on the main risk. -->

**Level:**

**Main risk:**

## Migrations

- [ ] **No** — this PR does not touch the database schema.
- [ ] **Yes** — migration file(s) committed to `lib/db/migrations/`. Schema change described below:

<!-- If yes: what tables/columns changed? Is this backward-compatible? -->

## RLS

<!-- Required if Migrations = Yes and the table stores user or session data. -->

- [ ] N/A — no new user-data tables.
- [ ] RLS policies are included in this PR (same commit as the migration).

## Env vars

- [ ] No new environment variables.
- [ ] New env vars added — `env.mjs` and `.env.local.example` updated:

<!-- List the new variable names here. -->

## Docs updated

- [ ] `CLAUDE.md` is still accurate after this change (or was updated).
- [ ] `Product.md` is still accurate after this change (or was updated).

## Rollout / notes for reviewer

<!-- Anything the reviewer should know: feature flags, order of operations, manual steps needed on staging/prod, etc. -->
