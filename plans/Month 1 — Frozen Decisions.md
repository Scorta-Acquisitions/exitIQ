# Month 1 — Frozen Decisions

**Supersedes:** `Scorta_Month_1_Product_and_Engineering_Build_Plan.docx` (scope), `month-1-stack.md`
(vendors), `Scorta_Dev_Workflow_v2.md` (process). Those three remain as source material. This file
is the operative one. When they disagree with this, this wins.

**Anti-looping rule.** Every decision below has a state: **FROZEN**, **OPEN (owner, deadline)**, or
**PARKED**. You may not reopen a FROZEN decision in conversation. If new evidence arrives, write it
under §7 Parking Lot and keep going. Frozen decisions are reviewed once, at the Friday retro.

---

## 0. Why the three questions felt circular

They were being answered in the wrong order, and one of the three documents was written against a
repo state that no longer exists.

**The stale premise.** `Scorta_Dev_Workflow_v2.md` builds its entire worked example — Part 3, the
locked six-case acceptance test in §3.5, the Sunday dry-run that leads into it — around "the first
real ticket: DealIQ buyer sign-in and product-grant access control."

That ticket has shipped. In this repo, today:

| v2 acceptance case | Where it lives |
|---|---|
| 1, 6 — anonymous / signed-out → `/dealiq/signin?next=…` | `middleware.ts:23-28` |
| 2 — seller session, no DealIQ grant → signin, not workspace | `lib/dealiq/access.ts`, `lib/productAccess.ts` |
| 3 — buyer session renders | `app/(dealiq)/dealiq/(workspace)/layout.tsx` |
| 4 — deep link survives sign-in | `?next=` round-trip, `app/(dealiq)/dealiq/signin/page.tsx` |
| 5 — `?next=https://evil.com` refused | `lib/dealiq/nextPath.ts` + `nextPath.test.ts` |

So v2's Part 0 line "Repo: Fresh rebuild" was an **assumption inherited from a blank-slate framing**,
not a decision the document earned. Question 3 was being asked while Question 2's document already
presupposed the answer. That is the loop.

**The correct order is scope → repo → workflow**, one direction only:

- Scope decides which code must be *right* (touches real seller financials) versus which must only
  *look* right (synthetic demo).
- That trust boundary decides the repo answer.
- The repo answer decides how heavy the process is, because the two sides deserve different weights.

---

## 1. FROZEN — Repository: split by trust boundary, not by age

**Do not do a single fresh rebuild.** Two repos, divided by whether real seller data touches the code.

| | `exitIQ` (this repo — keep) | `scorta-app` (new) |
|---|---|---|
| Domain | `scorta.com` | `app.scorta.com` |
| Ships | Marketing site, ExitIQ v0, Offer Review intake, public synthetic demo, DealIQ waitlist | Seller workspace, Business Brain, document vault, real auth |
| Data | Synthetic + lead capture only | Real seller financials and documents |
| Secrets | Anon publishable key only — **never** a service key, never vault credentials | Full credential set |
| Process | Light lane (§3) | Full lane (§3) |
| Lifecycle | Feature-frozen once §5 checklist is green | Active build |

### Why keep exitIQ rather than rebuild

Measured, not assumed:

- **62,310 lines** of TS/TSX. **46,035** of it is `components/` — overwhelmingly station UI.
- **37 files** import `@/lib/persona`, the single locked mock persona.
- **6 files in the entire repo touch the database**, all in the assessment flow.
- `pnpm typecheck` exits **0**. The repo is not rotten; it is scoped for a demo.
- CI is literally `if: false` in `.github/workflows/check.yml`. There is **no gate infrastructure to
  inherit either way** — so "the new repo gets clean gates" is not an argument for a new repo. Gates
  are net-new work in both directions, and an afternoon here.

The decisive point: **the mock-persona coupling AGENTS.md calls "debt" is exactly what the Month 1
plan specifies.** §4.4 asks for one realistic fictional company appearing across ExitIQ result,
workspace overview, Financial Truth, DealBook, Buyer Market, Passport, diligence answer, Concern Map
and offer comparison — public and ungated, "not a collection of disconnected mockups." One locked
persona file feeding 37 coherent surfaces *is that artifact*. It is only debt if those screens were
meant to hold real seller data, and in Month 1 they explicitly are not.

The existing repo is roughly 80% of the showroom the plan says to build first. Rebuilding it costs
the two weeks the plan says you have before GTM.

### Why the new repo is still necessary

`exitIQ` is unfit for the canonical spine: evidence → claim → conflict → advisor reconciliation →
canonical fact → versioned downstream use, with per-engagement tenant isolation and an S3+KMS vault.
That code must be right, must carry real per-user data, and must not inherit a mock-coupled component
tree or grandfathered architecture rules. **A grandfathered rule is a rule agents learn to ignore** —
that is the real cost of building the spine here, and it is the one argument for a new repo that
survives scrutiny.

Note also that the Month 1 workspace IA (§10: Overview / Your Business / Buyer Market / Offers /
Documents & Access) is **five areas**. The demo has **eleven stations**. These are already different
products, so the split does not mean building the same UI twice.

### The seam already works

ExitIQ writes a lead; `scorta-app` reads it once the prospect signs. One Supabase project, and the
showroom holds insert-only anon rights — which is **already the RLS posture in this repo**
(`anon_insert_sessions`, `anon_insert_reports`, `anon_insert_waitlist`; anon SELECT/UPDATE dropped in
`0001_drop_anon_rw_policies.sql`). No new mechanism required.

### Costs, named

Two Vercel projects and two env surfaces; possible design drift between `scorta.com` and
`app.scorta.com`. Mitigation: copy `styles/tailwind.css` tokens once and freeze the showroom after §5.
Drift has a short window.

Against that, a real benefit the single-repo option cannot give you: **the repo with 46k lines of demo
code and the lightest process never holds a credential that can read a seller's tax return.** That is
§15 of the build plan enforced by topology instead of by discipline.

### Ported into `scorta-app` (a copy of ~20 files, not a rewrite)

`lib/assessment/` (2,258 lines, tested) · `lib/exitiq/` (1,222) · `env.mjs` · `lib/db/index.ts`
(keep `prepare: false`) · `lib/supabase/` (3 files) · `lib/logger.ts` · `styles/tailwind.css` tokens ·
the `lib/dealiq` import-boundary test pattern.

**Not ported:** `components/scorta/**` (stays in the showroom), `lib/persona.ts`, the eleven-station
rail, `lib/dealiq/**` (parked — see §2).

---

## 2. FROZEN — Scope corrections to the Month 1 build plan

Keep the spine, the three-layer standard, the "don't build commodity infrastructure" rule, the AI
autonomy ladder, and the no-soft-beta launch checklist. Six corrections:

**2.1 The vendor list is replaced by `month-1-stack.md`.** That review is the strongest of the three
documents and it stands: Supabase Auth over Clerk, Anthropic over OpenAI-only, Resend over Postmark,
~12 named vendors instead of ~27. Defer Front, Twilio, WhatsApp API, Apple Messages, Sourcescrub,
Axial, Persona/Middesk/Plaid, BizEquity.

**2.2 The vault moves into Days 1–14.** The plan's 30-day sequence never places S3 + KMS + CloudTrail
in any column, yet §15 promises "one isolated workspace per seller engagement; database-level tenant
isolation," and GTM goes live hard on Day 14. If Seller #1 signs on Day 15 you are handling their tax
returns. `month-1-stack.md` already flagged this as the one infrastructure item not to defer past the
first real tax return; the sequence must reflect it. **The vault ships before GTM, not after.**

**2.3 Days 15–30 become event-driven, not date-driven.** Their exit criteria assume a signed seller
exists on Day 15. Retrigger them on `engagement_status = signed`, whenever that lands.

**2.4 Business Brain gets more than three days.** §6 lists ~13 canonical object families with
provenance, versioning, conflict state and RLS. Days 1–3 currently asks for that *alongside* brand,
site, three seller paths, pricing, ExitIQ skeleton, synthetic company and four sample surfaces. It is
the highest-value item in the plan and has the least time. It is the Week 1 item in `scorta-app` and
it gets the week.

**2.5 DealIQ stays parked**, per build plan §20 and `month-1-stack.md`. The existing
`lib/dealiq/` + `components/dealiq/` (6,315 lines, 15 test files, all green) stays in the showroom
repo as the demo/waitlist surface. **No new buy-side engineering in Month 1.** This is the correction
that removes v2's stale worked example.

**2.6 The Day 22–30 column is re-scoped to team size.** See §6 — this is the one open question.

---

## 3. FROZEN — Workflow, sized to the split

### 3.1 No GStack in Month 1

`Scorta_Dev_Workflow_v2.md` Step 0 documents the blast radius honestly: global install at user scope
affecting every repo, a `SessionStart` hook that auto-updates third-party code from a public repo and
then executes it, on a machine that will shortly hold seller tax returns. v2 names its own fallback —
five hand-written commands in `.claude/commands/`: research, plan, implement, review, ship — which
reproduces the loop with no third-party dependency.

**Take the fallback.** It costs no setup Saturday, carries no supply-chain exposure, and it resolves
v2 open questions #1 (when to install) and #3 (does `/qa` need the browser pack) by deleting both.

Reconsider only when the hand-written commands have been used 20+ times and have stopped changing.

### 3.2 Two lanes

| | Light lane — `exitIQ` showroom | Full lane — `scorta-app` |
|---|---|---|
| Gates | typecheck · lint · **build** | all six: typecheck · lint · prettier · test · **build** · e2e |
| gitleaks | yes | yes |
| Plan file | one paragraph in the PR | `plan.md`, seven sections |
| Acceptance test | agent writes | **human writes, locked, before implementation** — risky only |
| Review | Claude `/review` | Claude `/review` **+** `codex review --base main` in a fresh session |
| Human checkpoint | owner ships | second reader on risky; **read the diff** |

Gate 5 (`pnpm build`) is the one v1 omitted and the highest-yield addition on App Router — `tsc
--noEmit` passes happily on code that cannot build.

### 3.3 Gate 4 carries the architecture rules

Write these as tests before the first feature in `scorta-app`, and retro-fit to `exitIQ`:

- No file outside `env.mjs` contains `process.env` (allow the documented `lib/debug/workflow-trace.ts`
  exception).
- No file under `components/` imports `@/lib/db`.
- Every table in `lib/db/schema/` has a matching RLS policy in some migration.
- `lib/` never imports from `app/`.
- **New:** no module outside the vault package constructs an S3 client or a presigned URL.

Every prose rule you care about should make this trip. This is the single best idea in v2.

### 3.4 Risk taxonomy — unchanged, and it is right

Mark a ticket risky if it touches: auth/session · permissions/RLS/grants · payments · schema/migrations
· deploy config, `middleware.ts`, `env.mjs` · **the seller↔buyer data boundary** · **real seller
financial data**. The last two are the Scorta-specific additions and they are correct.

### 3.5 The first real ticket is the vault, not DealIQ auth

Replace v2's worked example throughout. **Ticket 1: secure document intake.** Presigned S3 upload →
evidence row carrying engagement, document type, source, classification and retention → per-engagement
RLS → CloudTrail object logging.

It hits risk items 2, 4, 6 and 7 simultaneously, it is genuinely first on the critical path, and it is
the thing you cannot afford to get wrong. It deserves the locked acceptance test that v2 wrote for
DealIQ auth.

Its section-6 proof-of-done, written before code exists:

> Two engagements seeded. A presigned URL issued for engagement A, replayed against engagement B's
> object key, returns 403 — not a 200, not a 404. A direct `SELECT` on `evidence` as engagement B's
> role returns zero rows for A's documents. The presigned URL expires and a replay after expiry fails.
> CloudTrail shows the object-level GET. Screenshots of each, plus the RLS policy text in the same
> migration as the table.

### 3.6 Codex as the independent reviewer — keep

```bash
ln -s "/Applications/ChatGPT.app/Contents/Resources/codex" /usr/local/bin/codex
codex review --base main
```

Fresh session, no access to the conversation that wrote the code. Do **not** give Codex the same
instruction set as the implementer — shared instructions mean shared blind spots, which is the entire
purchase.

### 3.7 Worktree databases — deferred, not solved on Saturday

v2 open question #2. The showroom needs no scratch DB (no real data). `scorta-app` at one or two
concurrent implementers does not need per-worktree databases on day one. When it starts hurting:
schema-per-worktree in the non-prod Supabase project. Do not spend Saturday on it.

---

## 4. The sequence

### Now → Day 3 · unblock

1. Second Supabase project (non-prod) + Vercel Preview-scoped env vars + `https://*.vercel.app` in the
   redirect allow list.
2. Turn on the light lane in `exitIQ`: delete `if: false`, add `pnpm typecheck` and `pnpm build`, add
   gitleaks. ~1 hour.
3. Create `scorta-app`. Port the ~20 files from §1. Six gates and the §3.3 boundary tests land in the
   first commits, before any feature.
4. Symlink Codex. Write the five `.claude/commands/`.

**Exit:** both repos deploy green from CI. No feature work has started in `scorta-app`.

### Day 3 → Day 14 · showroom + spine, in parallel

**`exitIQ` (showroom, light lane):** three seller paths · pricing (5% / 2.5% / ~$5K) · confidentiality
language · buyer doorway · un-gate the synthetic transaction to a public `/demo` (it currently sits
behind the `(app)` auth guard) · Offer Review upload + `offers@scorta.com` forwarding · ExitIQ v0
dynamic branching + persistent Owner Profile + Attio sync.

**`scorta-app` (full lane):** Ticket 1, the vault. Then the Business Brain canonical schema —
evidence, claim, canonical fact, conflict, version, engagement — with RLS in the same migrations. Then
minimum seller auth and workspace shell.

**Exit / GTM gate:** build plan §19 checklist green, **plus** the vault acceptance test passing.
GTM turns on hard.

### On `engagement_status = signed` · Seller #1

Delegation-first onboarding · secure requests · QBO export/upload · parser → intermediate evidence →
advisor reconciliation → canonical fact · Financial Truth · Data & Access Center · thin Advisor
Cockpit. Everything not built is bridged by a founder, visibly to no one.

### Then · run the transaction

DealBook v0 · BuyerGraph seed and matching · Passport sharing · NDA/disclosure states · AI diligence
Q&A with citations · Concern Maps · structured offer extraction. **Re-scope against §6 before
committing to this column.**

---

## 5. Rhythm

- **Daily, 10 min:** open PRs, CI status, anything flagged. By hand. Do not automate.
- **Fridays, 30 min:** delete any command or file unused this week · for anything that broke, add the
  check that would have caught it · read one random merged PR properly · review the §7 parking lot ·
  **this is the only time a FROZEN decision may be reopened.**
- **Weekly:** one founder *uses* Scorta. Not tests it. Uses it. A brokerage is a trust product and
  trust lives in feel.
- **Monthly:** one named owner for `AGENTS.md`, `PRINCIPLES.md`, the commands and the gates. Instruction
  drift is the documented failure mode; a named person or it does not happen.

---

## 6. OPEN — the one decision that changes the shape

**Team composition.** The build plan assumes CEO + CTO + 2–3 engineers. `Scorta_Dev_Workflow_v2.md`
assumes two technical cofounders splitting by layer. These conflict, and the conflict propagates:

- **If 2–3 engineers are actually joining in Month 1:** v2's Platform/Product layer split is roughly
  right, cross-approval on the Shared row holds, and the Day 22–30 column is attemptable.
- **If it is one technical founder plus a non-technical CEO:** the layer split was designed for the
  wrong team shape. Ownership becomes: the CTO owns the entire Shared row and reviews every risky
  ticket; there is no second technical approver, so `codex review` stops being a second opinion and
  becomes the *only* independent one — which raises the bar on §3.3 boundary tests considerably. And
  the Day 22–30 column is a quarter, not a week.

**Owner:** you. **Deadline:** before `scorta-app` takes its first feature commit.

Until it is answered, §1–§5 hold unchanged — none of them depend on the answer.

---

## 7. Parking Lot

Evidence that would reopen a frozen decision goes here, dated. Reviewed Fridays. Not discussed before
then.

- _(empty)_
