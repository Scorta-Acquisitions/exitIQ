# Workflow — Build Brief

**Audience:** the agent that will build this workflow into the new Scorta repository.
**This is a specification, not an implementation.** It tells you *what artifacts must exist, what each
must contain, and how we will know it works.* It deliberately does not contain scripts, YAML, hook
bodies, or command text — writing those is your job, in the target repo, against its real stack.

**Supersedes** the draft `WORKFLOW.md` in this repository. That draft was written for a single platform
and a fixed founder split; both assumptions are gone. Treat it as background only.

**Portability note:** this repo is not the one being used. Every path below is illustrative. Confirm
the target repo's real layout before creating anything.

---

## 0. How to use this document

1. Read §1. Those invariants constrain every artifact; violating one invalidates the build.
2. Read §2. That is the canonical pipeline. Do not add, reorder, or drop steps.
3. Build the artifacts in §3, in the order given in §4.
4. Anything in §6 is a decision you must **surface to the founders, not guess.**
5. Your final deliverable is a working workflow *plus* the repo's real `WORKFLOW.md`, generated from
   §2 once the artifacts exist and their actual command names are known.

---

## 1. Invariants

These are not preferences. An artifact that breaks one of these is wrong.

### 1.1 Platform agnostic

The workflow runs on **Claude Code, Codex, and Cursor**. No step may depend on a capability only one
of them has.

- **One canonical definition per step**, stored platform-neutrally in the repo. Per-platform wrappers
  are generated or symlinked from it. A step's logic is never authored twice.
- `AGENTS.md` is the only instruction file all three read natively. Anything every agent must obey
  lives there. Platform-specific files hold platform-specific mechanics only.
- **Enforcement must not live in platform hooks.** Claude Code has a rich hook system; Codex and
  Cursor do not have equivalents. Therefore every *guarantee* lives in **git hooks + CI**, which are
  platform-independent. Platform hooks are an accelerator that fails fast locally — never the only
  thing standing between a mistake and `main`.
- Any script you write is invoked as a plain shell command, so all three can call it.

### 1.2 Cross-platform review

**The platform that implements may not be the platform that reviews.**

- The pipeline records which platform did the plan and which did the implementation.
- Reviewer dispatch reads that record and selects a *different* platform.
- If the reviewing platform resolves to the implementing platform, the step **fails loudly** rather
  than silently reviewing itself.
- A reviewer must not be given the implementer's command set or instruction files. Shared instructions
  mean shared blind spots, which is the entire purchase.

### 1.3 Lanes, not people

Work is split by **Platform** (server) and **Product** (client). Founders are not bound to a lane —
either founder may take either lane, and they may swap between tickets or mid-ticket. Every artifact
that references ownership references *the lane*, never a named person.

- The ticket records which lane it is in and which founder currently holds it.
- The "other founder" in a human checkpoint means *whoever does not currently hold this ticket*,
  resolved at runtime — never hardcoded.

### 1.4 Separate branches for plan and implementation

Plan and implementation live on different branches, merged independently. Keep this: if one is lost or
rejected, the other survives and the missing half can be re-derived from it.

### 1.5 Nothing silently dropped

Every finding, every check, every claim in the plan's proof section gets an explicit disposition.
"Not mentioned again" is never an outcome.

---

## 2. The canonical pipeline

Eleven steps. Steps 6a–6d run as one automatic chain with no human in the middle.

| # | Step | Actor | Branch | Linear |
|---|---|---|---|---|
| 1 | Intake | Human | — | Backlog → Todo |
| 2 | Research + Plan | Agent | plan branch | Todo |
| 3 | **Checkpoint 1 — read the plan** | **Human** | plan branch | Todo |
| 4 | Acceptance test authored + proven | Agent | plan branch | Todo |
| 5 | Implement | Agent | implementation branch (worktree) | In Progress |
| 6a | Verify | Agent | ↳ automatic | In Progress |
| 6b | Reviews — **two, in parallel, cross-platform** | Agent | ↳ automatic | In Progress |
| 6c | Merge findings | Agent | ↳ automatic | In Progress |
| 6d | Remediation loop | Agent | ↳ automatic | In Progress |
| 7 | QA — agents + humans, against proof | Agent + Human | preview | In Review |
| 8 | **Checkpoint 2 — ship or block** | **Human** | PR | In Review |
| 9 | Land + deploy | Agent | main | Done |
| 10 | Incident *(conditional)* | Human + Agent | — | — |

**Slack holds no state.** It carries notifications and the two human checkpoint pings. A decision is
never recorded only in Slack.

### Step 1 — Intake

Merged intake and triage: one human action producing one Linear issue.

Must capture: **Outcome** · **Who** · **Risky (yes/no + which taxonomy items)** · lane
(platform/product/both) · assignee · risk label. Nothing more. Do not write a detailed ticket — the
agent is about to read the codebase and will know more than the author does.

Ends in Todo, with the Linear branch name available.

### Step 2 — Research + Plan

Merged. **Runs on whatever branch the founder is currently on** — do not prescribe a branch or force a
checkout. Output is committed to a dedicated plan branch and merged on approval.

Research must precede proposal: what exists today, which files are involved, how information actually
flows, what will break. A bad line of research costs more than a bad line of code by orders of
magnitude.

The plan must contain seven sections: what/why including non-goals · how it works today · the steps in
order · files to be touched, named · how each step is verified with the specific command · **what
counts as proof this is done** · riskiest part and what was rejected.

Machine-readable frontmatter is required (see §3.9) — at minimum: ticket ID, lane, risk, whether it
touches schema, and which platform produced the plan.

### Step 3 — Checkpoint 1

Human. The founder not holding the ticket reads the plan and approves or returns it. Highest-leverage
human action in the pipeline: reading a 200-line plan takes minutes; reading the 2,000 lines it
produces takes hours.

Give disproportionate attention to **boundaries and seams** — models handle those badly and every later
decision compounds on them.

### Step 4 — Acceptance test, authored by the agent and proven to work

The agent writes the test. It must then **prove the test is real**, because a test nobody has seen fail
is not evidence. Required with every acceptance test:

- **A case table.** Every case: what it exercises · the input/state · expected outcome · *why this case
  exists*. A reader must be able to tell what is and is not covered.
- **A named fixture set** with realistic values — not `foo`/`bar`. Where the ticket concerns real data
  shapes, the fixture must resemble production data.
- **A red/green demonstration.** The test is shown *failing* against the pre-change code and *passing*
  after. This is the primary proof and it is why the test is authored before implementation.
- **A negative control** where red/green is not possible (e.g. new surface with no prior behavior):
  deliberately break the implementation in a stated way, show the test catches it, revert.
- **Coverage honesty.** An explicit list of what the test does *not* cover.

Authorship moved to the agent; **immutability did not.** Once merged on the plan branch, the
implementing agent may not modify the acceptance test — enforced by git hook and CI, not by prose.

### Step 5 — Implement

Agent, in a worktree on the implementation branch. Creating the branch moves Linear to In Progress.

If the plan declares a schema touch, the schema-lock automation (§3.8) fires here.

### Steps 6a–6d — The automatic chain

**No human intervenes between 5 and 7.** Completing implementation triggers, in order:

- **6a Verify** — the local gate suite (§3.3). Failures are fixed and it re-runs. The chain does not
  advance on red.
- **6b Reviews** — **two reviews, launched in parallel, on platforms other than the implementer.**
  Each writes to its own findings file. Neither sees the other's output.
- **6c Merge findings** — deduplicated, severity-ordered, single verdict: **BLOCK / CONCERNS / CLEAN**.
- **6d Remediation** — *this is the step whose absence was the gap.* Findings are not advisory.
  - Every **BLOCK** must be fixed or explicitly rejected with a written reason.
  - Every **CONCERNS** item is dispositioned: fixed · rejected with reason · deferred to a new Linear
    issue (which must be created, with its ID recorded).
  - After remediation, 6a re-runs, and any review that raised a blocking finding re-runs against the
    fix.
  - **Iteration cap.** After N cycles (recommend 3) the chain stops and escalates to a human rather
    than looping.
  - Exit: verdict is CLEAN or CONCERNS-with-all-items-dispositioned, and gates are green.

### Step 7 — QA

Heavier than a smoke test. Three components, all required:

- **Agent-driven functional testing** against the deployed preview, and against a **non-production
  database clone** seeded with the fixture set — not against mocks.
- **Proof assertion.** The plan's proof section is checked claim by claim. A claim that cannot be
  demonstrated is a failure *even when every gate is green*.
- **Human pass.** A person clicks through the actual surface. Review tooling does not solve what a
  human using the product solves, and the specific danger of agentic development is shipping things
  nobody has felt.

Produces an evidence bundle stored with the ticket.

### Step 8 — Checkpoint 2

Not risky: the holding founder ships on green + CLEAN. Risky: the *other* founder gives the verdict and
**reads the diff.** Never gate by diff size — gate by risk. Three lines in a migration outrank a
400-line rename.

### Step 9 — Land + deploy

Merge, CI on main, production deploy healthy, Linear → Done, URL to Slack.

### Step 10 — Incident

Only when production broke. Must produce **either a new automated check or a new line in
`PRINCIPLES.md`.** An incident that produces only a fix will recur.

---

## 3. Artifacts to build

For each: what it is · what it must contain (categories, not contents) · acceptance criteria.

### 3.1 Canonical step definitions + per-platform adapters

**Build:** a platform-neutral directory of step definitions, plus an adapter that materializes them for
each platform.

Must contain, per step: name and trigger · required inputs and where they come from · the actions in
order · outputs and their paths · exit condition · which model tier to prefer · what to do on failure.

The adapter must emit the right shape for each of Claude Code, Codex, and Cursor. Research each
platform's current command/prompt/rule format before designing this — do not assume.

**Acceptance:** editing one canonical file changes behavior on all three platforms after regeneration.
A drift check fails CI if a generated wrapper is out of date with its source.

### 3.2 The command set

Six commands, each defined once per §3.1:

| Command | Covers | Notes |
|---|---|---|
| `plan` | Step 2 | Research and plan merged. Runs on current branch |
| `accept` | Step 4 | Authors the acceptance test *and* produces its proof bundle |
| `implement` | Step 5 | Worktree setup, branch, schema-lock trigger |
| `verify` | Step 6a | The local gate suite |
| `review` | Steps 6b–6d | Dispatch, parallel wait, merge, remediation loop |
| `ship` | Steps 8–9 | PR, gates, Linear transitions, deploy verification |

`implement` should chain into `verify` → `review` automatically (§2, steps 6a–6d).

**Acceptance:** each command is invocable on all three platforms and produces identical artifacts.

### 3.3 Verify scripts

**Build:** a small set of composable scripts, callable individually and as one suite, from any
platform's shell.

Categories the suite must cover:

- **Types** — strict typecheck, no error tolerance
- **Lint** — fail on error, include import-order and any custom rules
- **Format** — check mode, never write
- **Unit tests** — non-watch mode. *Confirm the runner's non-watch invocation explicitly; a runner left
  in watch mode hangs a hook or CI step forever and is the most common silent failure of setups like
  this.*
- **Structural tests** — the architecture rules (§3.6)
- **Build** — the real production build. On App Router, typecheck passes on code that cannot build;
  this gate is not optional
- **Migration safety** — applied migrations unmodified; new user-data tables ship RLS in the same
  migration
- **Secret scan** — staged content only, for speed

Requirements: individually runnable · composable into one command · **a fast subset for the pre-commit
path and the full suite for the pre-push/CI path** · machine-readable output so the review and QA steps
can consume results · non-zero exit on any failure · no network dependency in the fast subset.

**Acceptance:** the fast subset completes in a time a human will tolerate on every commit; the full
suite is exactly what CI runs, with no divergence.

### 3.4 Review skills — one per platform

**Build:** a review definition for **Claude Code** and one for **Codex**, and confirm whether Cursor can
host a third. They must be *different documents*, not one shared file — shared instructions defeat the
purpose.

Each must specify: what to examine (the diff, the plan, the acceptance test, `PRINCIPLES.md`) · a
severity scale with definitions · required output schema (see below) · explicit instruction to check
**design intent** against `PRINCIPLES.md`, not only correctness · instruction to flag anything the plan
promised but the diff does not deliver.

Deliberately differentiate them. Give each reviewer a different emphasis — e.g. one weighted toward
correctness, data integrity and boundary violations; the other toward simplification, dead paths,
and whether the change matches its stated intent. Two reviewers looking for the same things is one
reviewer running twice.

**Findings output schema** (both must emit the same shape so 6c can merge them): file · line · severity
· category · one-sentence claim · concrete failure scenario · confidence.

**Acceptance:** run both against a deliberately flawed branch; each finds real defects, and their
finding sets are not identical.

### 3.5 Cross-platform review dispatch

**Build:** a script that launches the two reviews in parallel on platforms other than the implementer.

Must handle: reading the recorded implementing platform · selecting two different reviewers · **failing
loudly if a reviewer resolves to the implementer** · launching both concurrently · waiting for both ·
timeout with partial-result handling · writing each to its own file · never letting one reviewer see
the other's output.

Both CLIs support non-interactive invocation from a shell, so each platform can launch the others. Verify
the current flags for each before building — they change. Investigate whether Cursor's CLI can serve as
a third reviewer.

**Acceptance:** implementing on any of the three platforms produces two reviews from the other(s), and
attempting a same-platform review fails rather than proceeding.

### 3.6 Structural tests

**Build:** unit tests that encode architecture rules, so prose becomes a gate. Rule categories:

- Environment access confined to the single env module, with a path allow-list for documented exceptions
- No database import reachable from client components
- No upward imports from the lib layer into the app layer
- Import alias only; no relative parent-directory imports for repo-internal modules
- Product-boundary isolation: a designated module tree imports nothing outside itself
- Every schema table has a matching RLS policy in some migration
- Applied migration files unmodified since their commit
- The acceptance-test directory unmodified on an implementation branch

**Acceptance:** every rule in `AGENTS.md` that can be mechanically checked has a test here. Deleting a
rule's test causes its `AGENTS.md` line to be deleted too — prose and check stay in sync.

### 3.7 CI gates

**Build:** the CI workflow. Gates below are tuned to a Next.js App Router / TypeScript strict / pnpm /
Drizzle / Supabase / Vitest / Playwright / Vercel stack — confirm against the target repo.

| Gate | Blocking | Notes |
|---|---|---|
| Typecheck | ✅ | |
| Lint | ✅ | Fail on error only |
| Format | ✅ | |
| Unit + structural | ✅ | Carries §3.6 |
| **Build** | ✅ | Catches RSC/client boundary violations typecheck cannot see |
| **Migration safety** | ✅ | *New.* Append-only + RLS-with-table. Cheap, and the failure mode is severe |
| **Secret scan** | ✅ | Full history on PR |
| Acceptance + E2E vs preview | ✅ | Needs the real preview URL — have CI read it from the deployment status rather than guessing the hostname |
| **Generated-wrapper drift** | ✅ | *New.* Enforces §3.1 |
| Bundle budget | ⚠️ advisory | Warn, don't block, until a budget is agreed |
| Accessibility smoke | ⚠️ advisory | Promote to blocking once the design system stabilizes |

Also required: branch protection so no merge occurs without the blocking set · preview-scoped
environment variables pointing at the non-production project, never production · the seeded non-prod
clone that step 7 needs.

**Acceptance:** a PR failing any blocking gate cannot be merged. Verify by testing each gate
individually with a deliberately broken PR — do not assume configuration works.

### 3.8 Schema-lock automation

**Build:** an advisory mutual-exclusion mechanism for schema and migration work, driven by the plan and
by hooks — not by someone remembering to post in Slack.

Behavior:

1. **Declare** — the plan's frontmatter marks whether the ticket touches schema/migrations.
2. **Detect** — a hook also detects edits under the schema/migration paths, in case the plan was wrong.
3. **Check first** — before claiming, query whether a lock is already held. If it is: report who, which
   ticket, and since when, and **do not proceed.**
4. **Claim** — record the lock and announce it to Slack automatically.
5. **Release** — on PR merge, ticket close, or worktree teardown. Announce the release too.
6. **Stale handling** — a TTL, and a defined path for breaking an abandoned lock.

**Lock store — decide and justify.** Options: a committed repo file (git-visible, but merge-conflicts);
a Linear label or custom field (already the system of record, and Linear tooling is available); a Slack
message (bad — Slack holds no state per §2). Recommend Linear; confirm with the founders.

**Acceptance:** two concurrent worktrees both declaring a schema touch — the second is refused with a
useful message. Both the claim and the release appear in Slack without anyone typing them.

### 3.9 Ticket artifacts and machine-readable state

**Build:** a per-ticket directory and its templates.

Files: the intake issue · the plan · the acceptance-test proof bundle · one findings file per reviewer ·
the merged review with verdict and dispositions · the QA evidence bundle · an incident file when
applicable.

**The plan needs machine-readable frontmatter** — several steps depend on reading it: ticket ID · lane ·
risk flag and taxonomy items · touches-schema flag · platform that produced the plan · platform that
implemented · reviewer platforms used · remediation cycle count.

**Acceptance:** every automated step reads its inputs from this frontmatter rather than from prose or
from a human telling it.

### 3.10 Hooks

Remember §1.1: **hooks accelerate, git hooks and CI guarantee.**

**Git hooks (the guarantee — platform-independent):** pre-commit runs the fast verify subset ·
pre-commit blocks edits to applied migrations · pre-commit blocks acceptance-test edits on an
implementation branch · pre-push runs the full suite.

**Platform hooks (the accelerator — best-effort, per platform):** block turn-end while verify is red ·
warn on destructive shell commands · fire the schema-lock check on first edit to a schema path.

**Acceptance:** every guarantee holds when the platform hooks are disabled entirely. If disabling
platform hooks weakens a guarantee, that guarantee is in the wrong layer.

### 3.11 Instruction documents

Load-bearing constraint: **`AGENTS.md` is read natively by Claude Code, Codex and Cursor.** Split by
*which agent must obey the rule*, never by topic.

| Document | Read by | Contains |
|---|---|---|
| `AGENTS.md` | all three | Lane map · command table · hard boundaries · links out. Keep it short; long instruction files are skimmed |
| `PRINCIPLES.md` | all three, passed explicitly to reviewers | Design intent and judgment a correctness reviewer would miss. Grows one line per incident |
| `WORKFLOW.md` | humans + agents | The pipeline. **You generate this at the end**, from §2, once real command names exist |
| Platform-specific config | one platform each | Mechanics only. Nothing load-bearing |
| `DECISIONS.md` | on demand | Running decision record; appended when a ticket settles something binding on later work |

**`PRINCIPLES.md` seed categories:** cross-tenant and cross-product data isolation · durability
(a success response means committed data) · where business facts may live · single-location money and
valuation math · when a new module is justified · mock data as debt · machine output as intermediate
evidence, never canonical.

**Also:** the config directory is for configuration. In the current repo it holds megabytes of research
documents and no config. Keep research out of it.

### 3.12 Linear integration

Confirmed live: a Linear MCP is available, workspace has one team (**Heirloom**), statuses are
Backlog / Todo / In Progress / Done / Canceled / Duplicate.

**Gaps to close:**

- **No "In Review" status exists.** The pipeline needs it. Add it, or map steps 7–8 onto existing
  statuses and document the mapping.
- Decide the binding mechanism: agent tool calls via MCP, or branch-name + PR magic words via the
  GitHub integration, or both. Both is fine; **one must be authoritative** so status cannot diverge.
- Confirm which transitions fire automatically today versus which the workflow must drive.
- Linear also exposes diff and review primitives. Investigate whether they can host the review
  artifacts; do not assume they can.

---

## 4. Build order

Dependencies are real; this order is not arbitrary.

1. **Instruction documents** (§3.11) — everything else references them
2. **Verify scripts** (§3.3) — hooks, CI, and the chain all call these
3. **Structural tests** (§3.6) — part of verify
4. **Git hooks** (§3.10, guarantee layer)
5. **CI gates + branch protection** (§3.7) — prove each gate blocks
6. **Canonical steps + adapters** (§3.1) — the platform-agnostic substrate
7. **Command set** (§3.2)
8. **Review skills** (§3.4) — two genuinely different documents
9. **Cross-platform dispatch** (§3.5) — needs 3.4 and 3.1
10. **Ticket artifacts + frontmatter** (§3.9)
11. **Schema-lock automation** (§3.8) — needs frontmatter and hooks
12. **Linear integration** (§3.12)
13. **QA harness + seeded non-prod clone** (step 7)
14. **Platform hooks** (§3.10, accelerator layer) — last, because nothing may depend on them
15. **Generate the real `WORKFLOW.md`**

---

## 5. Test the workflow before trusting it

Run one deliberately disposable ticket end to end and confirm each of the following. Do not skip this;
a process that has never been exercised is a document, not a workflow.

- The plan command produces all seven sections with valid frontmatter
- The acceptance test ships with a case table, fixtures, and a red/green demonstration
- The implementing agent **cannot** edit the acceptance test
- Implementation auto-chains into verify without a human
- Two reviews launch **in parallel**, on platforms other than the implementer
- A same-platform review attempt **fails** rather than proceeding
- A BLOCK finding is actually remediated, and remediation re-runs verify
- The iteration cap triggers and escalates rather than looping
- Each blocking CI gate independently prevents a merge
- Two concurrent schema claims — the second is refused
- Schema claim and release both post to Slack unprompted
- QA compares against the plan's proof section and **fails on a mismatch even with green gates**
- Linear moves through every status without manual editing
- Both human checkpoints resolve to the founder *not* holding the ticket

Then delete the ticket.

---

## 6. Decisions to surface, not guess

Bring these to the founders. Each changes what you build.

1. **Lock store** for schema mutual exclusion (§3.8) — recommend Linear; needs confirmation.
2. **"In Review" status** (§3.12) — add it to Linear, or define the mapping.
3. **Cursor's role** — full third platform (implement + review), reviewer only, or out of scope.
4. **Non-prod database clone** (step 7) — refresh cadence, and how production data is anonymized if it
   is used at all.
5. **Remediation iteration cap** — recommend 3; confirm.
6. **Advisory gates** (§3.7) — when bundle budget and accessibility become blocking.
7. **Verify fast-subset composition** — what a founder will actually tolerate on every commit.
8. **Whether GStack is adopted at all.** Prior investigation found it cannot be partially adopted:
   82 binaries, and every skill hardcodes absolute paths into a global install, so copying skill files
   produces commands that fail on their first line. The choice is full global install or none. It is
   also single-platform, which conflicts with §1.1. Recommend building the six commands natively and
   revisiting once they have run 20+ times and stopped changing.

---

## 7. Requirements traceability

| Requirement | Addressed |
|---|---|
| Platform agnostic across Claude Code / Codex / Cursor | §1.1, §3.1, §3.2 |
| Review from a different platform than implementation | §1.2, §3.5 |
| 1. Founder-agnostic roles; keep platform/product distinction | §1.3 |
| 2. Remove shared-row dual approval | Removed; not present |
| 3. Remove session ceiling | Removed; not present |
| 4. Combine intake and triage | §2 step 1 |
| 5. Research runs on current branch | §2 step 2 |
| 6. Combine research and plan | §2 step 2 |
| 7. Agent writes acceptance test with proof it works | §2 step 4, §3.2 |
| 8. Plan and implementation on separate branches | §1.4 |
| 9. Automated schema-lock announce + release | §3.8 |
| 10. Verify and reviews run automatically after implement | §2 steps 6a–6d |
| 11. Two reviews in parallel | §2 step 6b, §3.5 |
| 12. Define verify scripts | §3.3 |
| 13. Build code-review skills for Claude and Codex | §3.4 |
| 14. Script the independent review across platforms | §3.5 |
| 15. When review findings get implemented | §2 step 6d |
| 16. CI gates tuned to the stack | §3.7 |
| 17. QA: agents + non-prod clone + humans, against proof | §2 step 7 |
