# SCOR-1 — ExitIQ assessment submissions are acknowledged before they are saved

> **Step 1 artifact.** Three fields, nothing more. `plan.md` is what gets carefully reviewed —
> not this. See [WORKFLOW.md](../../WORKFLOW.md).

**Outcome:** A completed ExitIQ assessment is durably committed before the client is told it
succeeded. A write that fails is visible to the seller, who can retry. Report generation that follows
a completion never fails because the row is not there yet.

**Who:** Every person who completes the public ExitIQ assessment — the entire top of the lead funnel.
Both the normal path and the path where the database is briefly unavailable.

**Risky:** **YES** — taxonomy item 4 (a write path whose failure is not visible to the user).
Touches the ExitIQ → report seam.

---

## Why this ticket is the dry run

Chosen deliberately as the first end-to-end pass of the workflow:

- **It is real.** This is the bug behind "ExitIQ wasn't saving information to the DB correctly."
  [`app/api/assessment/session/route.ts`](../../app/api/assessment/session/route.ts) returns `200` and
  *then* performs the upsert inside `after()`. If the upsert throws, the seller has already been told
  it worked. `.claude/CLAUDE.md` documents the downstream symptom — `/generate` returning
  `404 not_found` — as a deliberate latency tradeoff, which is what has kept it from being fixed.

- **It crosses both lanes by construction.** The route is Platform (Founder A); the submit call and
  its error state are Product (Founder B). So the very first ticket exercises cross-lane approval and
  the Shared-row rule, on something with a bounded blast radius.

- **It is risky, so it exercises the full path.** Locked acceptance test, dual review, the other
  founder gives the verdict and reads the diff. A trivial dry-run ticket would leave the expensive
  half of the process untested until it mattered.

- **The work is not thrown away with the repo.** ExitIQ is the one module being ported to the new
  codebase. Fixing the persistence design here means the port carries a correct write path instead of
  a known-broken one. The code is disposable; the design is the deliverable.

- **It is small.** One route handler, one client call site, one error state, one test file.

## Known starting facts (for step 3, not a substitute for it)

The research step must confirm these rather than trust them:

- `POST /api/assessment/session` responds `200` before the `after()` upsert runs — the trace event is
  literally named `api.session.http_200_sent_before_after`.
- The upsert is `onConflictDoUpdate` keyed on the `session_id` unique constraint, so it is already
  idempotent. The problem is acknowledgement ordering, not duplication.
- `POST /api/assessment/generate` returns `404 not_found` when the row has not landed yet.
- The client persists to `localStorage` first (`lib/assessment/session.ts`), so an in-flight session is
  recoverable — that changes what a good retry looks like.
- Scoring is computed in the route before the write and is pure; it is not implicated.

## Non-goals

- Do not rewrite the scoring, segmentation or SBA logic.
- Do not wire stages 2–4 into the live flow.
- Do not change the report generation prompt or model.
- Do not remove `after()` from the *email* send — only the DB write needs to move.

## Sketch of what section 6 will have to prove

The plan owns section 6; this is the bar it has to clear, so it is not negotiated after the fact:

> With the database reachable: submit a completion, then immediately `POST /generate` — repeat 100×,
> expect zero `404 not_found`. `SELECT count(*) FROM assessment_sessions WHERE session_id = $1` returns
> exactly `1` after a double-submit.
>
> With the database unreachable (point `DATABASE_URL` at a closed port): the completion returns a
> non-2xx, the seller sees an error state offering retry, and the flow does **not** advance to the
> report. Retry after restoring the database succeeds and the row exists.
>
> Screenshots of the error state and the recovered state, plus the two SQL results.

The second paragraph is the one that matters. The first only proves the happy path got faster.
