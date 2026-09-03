# Scorta — Founder Development Workflow

**Status:** operative. This document standardizes how a change goes from idea to production.
It is the process contract. `AGENTS.md` is the code contract. When they disagree, fix one of them,
do not improvise.

**Team:** two technical cofounders.
**Systems:** Linear (tickets) · GitHub (code, PRs, CI) · Claude Code (implementer) · Codex CLI
(independent reviewer) · Vercel (preview + prod) · Slack (notifications only) · Supabase (DB/auth).

---

## 0. Roles

| Lane | Owner | Paths |
|---|---|---|
| **Platform** (server) | **Founder A** | `app/api/**`, `lib/db/**`, `lib/supabase/**`, `lib/ai/**`, `lib/**/*.ts` engines, `lib/logger.ts`, `instrumentation.ts`, `drizzle.config.ts` |
| **Product** (client) | **Founder B** | `app/**/page.tsx`, `app/**/layout.tsx`, `app/**/loading.tsx`, `app/**/error.tsx`, `components/**`, `styles/**` |
| **Shared — both approve** | — | `middleware.ts`, `env.mjs`, `.env.local.example`, `lib/db/schema/**`, `lib/db/migrations/**`, `lib/**/types.ts`, `AGENTS.md`, `PRINCIPLES.md`, `WORKFLOW.md`, `.github/workflows/**`, `.claude/**`, `package.json` |

Rules: run agents only against your own lane · one worktree per in-flight ticket · never two agents on
one checkout · **anything in the Shared row needs the other founder's approval before merge** ·
**nobody approves their own risky ticket.**

Worktrees prevent two agents editing one file. They do not prevent two agents changing the same
*behavior* from opposite ends — that merges clean and breaks at runtime. Ownership is the only defense.

## 0.1 Risk taxonomy

Mark a ticket **Risky** if it touches any of:

1. Authentication or session handling
2. Permissions, RLS, or product grants
3. Payments or money movement
4. DB schema, migrations, or **any write path whose failure is not visible to the user**
5. Deploy config, `middleware.ts`, or `env.mjs`
6. The seller↔buyer product boundary
7. Real seller financial data

Risky changes the process in exactly four places: a locked acceptance test (§5), mandatory dual
review (§9–10), the *other* founder gives the verdict (§12), and that founder reads the diff.

**Never gate by size.** 81% of merged PRs touch fewer than ten files, so a size rule exempts almost
everything. Three lines in a migration will hurt you more than a 400-line rename.

## 0.2 Model routing

| Stage | Model |
|---|---|
| Research, planning, review | Opus 5 |
| Implementation | Sonnet 5 |
| Mechanical / cleanup | Haiku 4.5 |
| Independent review | Codex CLI (different family, fresh session) |

Implementation dominates token spend; planning and review are cheap and determine everything
downstream. Revisit monthly.

## 0.3 Session ceiling

Two sessions per founder, four across the team — **but only one at a time that requires active
thought.** The limit is the human, not the agents.

---

# The pipeline

Fifteen steps. Every step names: actor · system · command · input · output · exit condition.

| # | Step | Actor | System | Linear status |
|---|---|---|---|---|
| 1 | Intake | Human | Linear | Backlog |
| 2 | Triage | Human | Linear | Todo |
| 3 | Research | Agent | Claude Code | Todo |
| 4 | Plan | Agent | Claude Code | Todo |
| 5 | **Checkpoint 1 — read the plan** | **Human** | GitHub | Todo |
| 6 | Locked acceptance test *(risky only)* | **Human** | GitHub | Todo |
| 7 | Implement | Agent | Claude Code + worktree | In Progress |
| 8 | Self-verify | Agent | Claude Code | In Progress |
| 9 | Review A — same family | Agent | Claude Code | In Progress |
| 10 | Review B — different family | Agent | Codex CLI | In Progress |
| 11 | Merge findings | Agent | Claude Code | In Progress |
| 12 | Ship — open PR | Agent | GitHub | In Review |
| 13 | QA against preview | Human/Agent | Vercel + Playwright | In Review |
| 14 | **Checkpoint 2 — ship or block** | **Human** | GitHub | In Review |
| 15 | Land + deploy | Agent | GitHub + Vercel | Done |

Slack holds **no state**. It carries Linear, GitHub and Vercel notifications and the two human
checkpoint pings. Never treat a Slack message as the record of a decision.

---

## Step 1 — Intake

**Actor:** human. **System:** Linear. **Output:** a Linear issue with three fields and nothing else.

```
Outcome:  <what is true after this ships, in one or two sentences>
Who:      <who hits this path, and in what state they arrive>
Risky:    YES / NO  (+ which taxonomy items, if YES)
```

Do not write a detailed ticket. The agent is about to read the codebase and will know more about the
problem than you do right now. **The document that gets carefully reviewed is `plan.md`, not this.**

**Exit:** issue exists, three fields filled, in Backlog.

## Step 2 — Triage

**Actor:** human. **System:** Linear. Set: assignee (by lane, §0) · label `risk:high` or `risk:normal`
· label `lane:platform` / `lane:product` / `lane:shared` · move to Todo. Copy the Linear branch name
(`⌘⇧.`) — it is the ticket's identity for the rest of the pipeline.

**Exit:** issue is assigned, labelled, in Todo, and you have the branch name on your clipboard.

## Step 3 — Research

**Actor:** agent, unattended, 10–20 min. **Model:** Opus 5. **Where:** `main`, **not** a worktree.
**Command:** `/research <SCOR-N>`

Read the codebase before proposing anything: what exists today, which files are involved, how
information actually flows, what the existing patterns are, what will break.

> A bad line of code is one bad line. A bad line of plan is hundreds. A bad line of research is
> thousands.

**Output:** section 2 of `plan.md`. A separate `research.md` only for large unfamiliar areas.
**Exit:** the agent can describe the current behavior without opening a file.

## Step 4 — Plan

**Actor:** agent, unattended, 10–30 min. **Model:** Opus 5. **Where:** `main`.
**Command:** `/plan <SCOR-N>` → writes `tickets/<SCOR-N>-<slug>/plan.md`

Seven sections, every time, no exceptions:

1. **What we want and why** — including explicit non-goals
2. **How it works today** — the research from step 3
3. **The steps**, in order
4. **Files to be touched**, named
5. **How each step is verified** — the specific command, per step
6. **What counts as proof this is done**
7. **Riskiest part** — and what was considered and rejected

**Section 6 is the one that earns its keep.** Write down, before code exists, what evidence would
convince you. Not "the tests pass." Name the observation, the command that produces it, and the value
that would falsify it. Agents are excellent at producing convincing evidence that does not test the
thing you care about; stating the proof in advance is the only defense that has been shown to work.

`plan.md` is committed to `main` on its own branch and merged before implementation starts. It is a
reviewable artifact, not a scratch file.

**Exit:** `plan.md` merged to `main`, all seven sections present.

## Step 5 — Checkpoint 1: read the plan

**Actor: human. 5–10 minutes. This is the most important human action in the process.**

The founder who does **not** own the lane reads `plan.md` and approves or returns it.

Check four things:
- Did it understand the problem?
- Is this the approach you would have chosen?
- **Are the boundaries right?** — give this disproportionate time. Models handle seams badly and every
  later decision compounds on them. Do not trust a coding agent's taste about where a seam goes.
- Does section 6 actually prove anything, or does it prove that code ran?

Reading a 200-line plan takes minutes. Reading the 2,000 lines it produces takes hours, and you would
not do it daily. That asymmetry is the entire reason this checkpoint is here and not later.

**Exit:** an explicit "approved" comment on the plan PR, or a returned plan with the reason.

## Step 6 — Locked acceptance test *(risky tickets only)*

**Actor: human — the founder who owns the lane. Before implementation starts.**

Write the acceptance test, commit it to `main`, and **the implementing agent may not modify it.**
If an agent writes the test it will be judged by, it writes a test its implementation passes.

Enforced structurally, not by prose — a `PreToolUse` hook blocks `Edit`/`Write` under
`e2e/acceptance/**` (§17). The agent cannot edit the file even if it decides it should.

Enumerate the cases in a table in the plan first, then write them. Include at least one case that is
attacker- or environment-controlled rather than user-controlled — that is the class agents miss.

**Exit:** the acceptance test is on `main` and **failing** for the right reason.

## Step 7 — Implement

**Actor:** agent, 30 min–few hours, unattended. **Model:** Sonnet 5.
**Where:** a git worktree on the Linear branch. **Only implementation gets a worktree** — research,
planning and review run on `main`.

**Command:** `/implement <SCOR-N>`

```bash
git worktree add .worktrees/<linear-branch> -b <linear-branch>
cd .worktrees/<linear-branch> && cp ../../.env.local . && PORT=3001 pnpm dev
```

Creating the branch moves the Linear issue to In Progress automatically.

**Worktree database:** one non-prod Supabase project, shared, and schema changes are serialized —
whoever is touching `lib/db/schema/**` says so in Slack and is the only one doing it. Revisit when it
hurts; do not build schema-per-worktree before then.

**Exit:** the change is complete and the agent believes the gates pass.

## Step 8 — Self-verify

**Actor:** agent. **Command:** `/verify`

Runs exactly what CI runs, fixes failures, runs again. **The agent does not hand over failing work.**

```bash
pnpm typecheck && pnpm lint && pnpm prettier && pnpm test run && pnpm build
```

> `pnpm test run`, **not** `pnpm test`. Vitest defaults to watch mode; `pnpm test` in a hook or CI step
> hangs forever. This is the most common way these setups fail silently on day one.

Enforced by a `Stop` hook (§17) that blocks turn-end until the command passes.

**Exit:** all five pass locally.

## Step 9 — Review A: same family

**Actor:** agent. **Model:** Opus 5. **Command:** `/code-review` *(built-in skill)*

Catches the obvious and fixes it. This is the cheap pass; it is not the independent one.

**Exit:** findings produced and the obvious ones fixed.

## Step 10 — Review B: different family

**Actor:** agent. **System:** Codex CLI. **A completely fresh session with no access to the
conversation that wrote the code.**

```bash
codex review --base main "$(cat PRINCIPLES.md)"
```

Confirmed working: `codex review` takes `--base <BRANCH>`, `--uncommitted`, and a custom prompt as an
argument or from stdin. Passing `PRINCIPLES.md` makes it check **design intent**, not just correctness.

A model reviewing its own work has already formed the mental model that produced it, so it confirms
rather than challenges. A different model in a fresh session does not share those blind spots.

> ⚠️ **Independence is currently compromised — fix before first use.** `~/.codex/config.toml` has
> `feature-dev@claude-plugins-official`, `vercel@claude-plugins-official` and
> `postgres-best-practices@supabase-agent-skills` enabled — the same plugins as Claude Code. A reviewer
> sharing the implementer's instruction set shares its blind spots, which is the whole thing being
> bought here. Disable those three in Codex before step 10 runs for real. For the same reason, **never**
> give Codex the Scorta `.claude/commands/`.

**Exit:** Codex findings captured.

## Step 11 — Merge findings

**Actor:** agent. **Output:** `tickets/<SCOR-N>-<slug>/review.md`

Both sets of findings, deduplicated, ordered by severity, ending in exactly one of:
**BLOCK** / **CONCERNS** / **CLEAN**.

You read that file. Not the diff — yet.

**Exit:** `review.md` written with a verdict.

## Step 12 — Ship

**Actor:** agent. **System:** GitHub. **Command:** `/ship <SCOR-N>`

Opens the PR. Title carries the Linear ID; body contains `Fixes SCOR-N` so Linear transitions the issue
to In Review on open and to Done on merge. Body links `plan.md` and `review.md`.

**Six required CI gates. Branch protection: no merge unless all six pass.**

| # | Gate | Command | Catches |
|---|---|---|---|
| 1 | Typecheck | `pnpm typecheck` | type errors |
| 2 | Lint | `pnpm lint` | correctness lints, import order |
| 3 | Format | `pnpm prettier` | diff noise |
| 4 | Unit + **structural** | `pnpm test run` | logic **and the architecture rules** (§18) |
| 5 | **Build** | `pnpm build` | RSC/client violations, `next/headers` in a client component, bad dynamic config |
| 6 | E2E smoke | `pnpm e2e` against the preview URL | the acceptance test, sign-in, the one money path |

Plus **gitleaks** on every PR — a leaked key blocks the merge.

**Gate 5 is the one most setups omit and you will need most.** On App Router `tsc --noEmit` passes
happily on code that cannot build. Gate 6 needs the preview URL, which is not predictable — CI must
wait on the Vercel deployment status and read the URL from it rather than guessing the hostname.

**Exit:** PR open, six gates green.

## Step 13 — QA against the preview

**Actor:** human for anything visual; agent for anything scriptable. **System:** Vercel preview URL.

Then the step people skip: **hold the output against section 6 of the plan.** Does the evidence
demonstrate the specific thing you said in advance would count? This is where fabricated evidence gets
caught, and only if you re-read section 6 rather than glancing at green checkmarks.

**Exit:** section 6's proof has been observed, not assumed.

## Step 14 — Checkpoint 2: ship or block

**Not risky:** the owning founder ships, if CI is green and Codex came back CLEAN. No second founder.

**Risky:** the *other* founder gives the verdict, **and actually reads the diff.**

The argument that no founder reads every line is directionally right and mostly kept here. But the
person who most influentially made it reversed himself after four months, citing accumulated mess as
one reason his team rebuilt from scratch. And a five-person team merged a 3,600-line agent-written PR
containing a stubbed-out function — tests passed, CI green, PR looked fine — which broke a core
operation and cost them a major customer.

The practical middle: **read the diff on risky paths. Read findings on everything else. Once a week,
pick one merged PR at random and read it properly.** That last habit is cheap and is the thing that
tells you whether the process is quietly degrading.

**Exit:** an explicit approval on the PR from the correct person.

## Step 15 — Land and deploy

**Actor:** agent. Merge, wait for CI on `main`, confirm the Vercel production deploy is healthy,
confirm Linear moved to Done. Post the production URL to Slack.

**Exit:** production is serving the change and the Linear issue is Done.

## Step 16 — If it breaks in production

Write `tickets/<SCOR-N>-<slug>/incident.md`: what broke, why, how it got through the six gates.

Then the part that matters: **the incident must produce either a new automated check or a new line in
`PRINCIPLES.md`.** Closed loop. An incident that produces only a fix will happen again.

---

## 17. Hooks — what is enforced by the machine

In `.claude/settings.json` (repo, committed — this is a Shared-row file).

| Hook | Matcher | Command | Why |
|---|---|---|---|
| `PreToolUse` | `Bash(git commit:*)` | `pnpm typecheck && pnpm lint` | stops a bad commit |
| `PreToolUse` | `Edit`, `Write` | block if path matches `e2e/acceptance/**` | **makes step 6's lock real** — the agent cannot edit the test that judges it |
| `PreToolUse` | `Edit`, `Write` | block if path matches `lib/db/migrations/**` and file is tracked in git | migrations are append-only |
| `Stop` | — | `pnpm typecheck && pnpm lint && pnpm test run` | agent cannot declare victory on failing work |

The commit hook and the verify gate are **not the same guarantee** and you want both: the verify gate
stops an agent *declaring victory*, the commit hook stops a bad commit landing. Keep `build` and `e2e`
out of local hooks — too slow. CI owns those.

The acceptance-test lock is the highest-value hook here and no third-party pack provides it. It is the
one rule in this document that is otherwise pure prose, and prose is not a rule.

## 18. Structural tests — architecture rules that run in CI

Gate 4 carries the architecture rules. Write these as Vitest tests **before the first feature**, not
later. Each is a prose rule in `AGENTS.md` that becomes real here.

- No file outside `env.mjs` contains `process.env` (allow-list the documented exceptions by path).
- No file under `components/` imports `@/lib/db`.
- `lib/` never imports from `app/`.
- No repo-internal import uses `../` — `@/*` only.
- Every table in `lib/db/schema/` has a matching RLS policy in some migration.
- Every applied migration file is unmodified since its commit.

**Every rule you care about should make this trip.** When agents remember the rules, work goes faster;
when they forget, nothing goes off track. That property is what is being bought.

## 19. GStack — the trim, identified

**Finding: GStack cannot be partially adopted.** This was the open question; here is the answer, from
reading the source rather than the README.

- `bin/` contains **82 executables**.
- `/ship` invokes ~40 distinct `gstack-*` binaries; `/review` ~30; `/office-hours` ~30.
- Even `/careful` — 87 lines, the smallest useful skill — declares a `PreToolUse` hook hardcoding
  `$HOME/.claude/skills/gstack/careful/bin/check-careful.sh`, and writes to `~/.gstack/analytics/`.
- `/office-hours` lazy-loads its own sections by absolute path from inside the global install.

So copying `SKILL.md` files into the repo produces commands that fail at their first line. **The trim
is only available *after* a full global install, by removing skills you don't want — not by porting
skills you do.** The "install it then delete the symlinks" plan was right about the mechanism; the
"port a few skills" plan is not available.

That reduces the decision to two real options:

| | **A — full install, trim after** | **B — own thin commands, seeded from GStack's prompts** |
|---|---|---|
| Scope | Global: every repo on the machine | This repo only |
| Surface | 82 binaries, `SessionStart` auto-update hook pulling and executing third-party code, `Stop` hook, `~/.gstack/` state | Five `.md` files |
| Get | `/ship`, `/review`, `/qa`, `/retro`, `/office-hours` as designed — genuinely well-built, ~1000 lines of prompt each | Exactly your fifteen steps, nothing else |
| Cost | `gstack-config set auto_upgrade false` and `set telemetry off` immediately after install; accept the rest | You write ~5 × 150 lines |
| Risk | Auto-updating third-party code executing on a machine holding Supabase service keys and, soon, seller tax returns | Loses craftsmanship you'd have to rebuild |

**Recommended: B for Month 1**, with a named revisit trigger — reconsider A once these commands have
run 20+ times and their steps have stopped changing. A reference clone already exists at
`/private/tmp/.../scratchpad/gstack`; mine its prompts as source material. **Never run `./setup`.**

### Step → GStack skill → what we do instead

| Step | GStack skill | Verdict | What we use |
|---|---|---|---|
| 1–2 Intake, triage | `/office-hours` | **Not ported** — 30+ binary deps; also aimed at product strategy, not ticket intake | Linear, three fields |
| 3 Research | — *(GStack has no research-only step; this is the gap)* | — | `/research` — new, ours |
| 4 Plan | `/autoplan`, `/plan-*-review` | **Not ported** — deepest binary coupling of any skill | `/plan` — new, ours. Mine `plan-eng-review/SKILL.md` for its edge-case checklist |
| 6 Acceptance test | — | — | Human + the `PreToolUse` lock hook (§17) |
| 7 Implement | — | — | `/implement` — new, ours |
| 8 Self-verify | `gstack-verify-gate` | **Not ported** — it is a binary, not a skill | `Stop` hook (§17) |
| 9 Review A | `/review` | **Not ported** | Built-in `/code-review` skill — already installed, no dependency |
| 10 Review B | `/codex` | **Not ported** — and deliberately so | `codex review --base main` called directly. A shell call cannot drift |
| 11 Merge findings | — | — | `/review-merge` — new, ours |
| 12 Ship | `/ship` | **Not ported** — ~40 binary deps | `/ship` — new, ours: `gh pr create` + Linear magic words |
| 13 QA | `/qa` | **Not ported** — 20+ binary deps | Playwright against the preview URL + human eyes on anything visual |
| 15 Land | `/land-and-deploy` | **Not ported** | `gh pr merge` + Vercel deployment status |
| 16 Retro | `/retro` | **Not ported** | 30-minute Friday agenda (§21). Mine `retro/SKILL.md` for its agenda |
| Guardrails | `/careful`, `/freeze` | **Not ported** — hooks hardcode the global install path | Our own `PreToolUse` hooks (§17), which are stricter anyway |

**Ported: zero. Mined for content: four.** That is the trimmed setup.

## 20. Documents — what exists and who reads it

Load-bearing constraint: **`AGENTS.md` is read natively by Claude Code, Codex and Cursor.
`CLAUDE.md` is Claude-only.** So the split is by *which agent must obey the rule*, not by topic.
Anything Codex needs at review time cannot live in `CLAUDE.md`.

| Document | Scope | Claude Code | Codex | Cursor | Contents |
|---|---|---|---|---|---|
| **`AGENTS.md`** | repo, **< 150 lines** | ✅ | ✅ | ✅ | Ownership map · the literal command table · the hard boundaries · links out. **No architecture essays.** |
| **`PRINCIPLES.md`** | repo | ✅ | ✅ *(passed explicitly at step 10)* | ✅ | Design intent and judgment calls a correctness reviewer would otherwise miss |
| **`WORKFLOW.md`** | repo | ✅ | — | — | This file. Process, not code |
| **`CLAUDE.md`** | repo | ✅ | ✗ | ✗ | One line: `See AGENTS.md.` Plus Claude-only config. Nothing load-bearing |
| **`.claude/commands/*.md`** | repo | ✅ | ✗ | ✗ | The five commands. **Never share with Codex** (§10) |
| **`.claude/settings.json`** | repo | ✅ | ✗ | ✗ | The four hooks (§17) |
| **`docs/DECISIONS.md`** | repo | on demand | on demand | on demand | Running decision record. Appended when a ticket settles something that binds later work |
| **`tickets/<ID>/plan.md`** | per ticket | ✅ | — | — | Seven sections (§ step 4) |
| **`tickets/<ID>/review.md`** | per ticket | ✅ | — | — | Merged findings + verdict |
| **`tickets/<ID>/incident.md`** | per ticket | ✅ | — | — | Only when production broke |

**`PRINCIPLES.md` starting set** — design intent, not operations:

- One seller's financials are never reachable from a buyer session. Product grants are
  server-controlled (`app_metadata`), never client-assertable.
- **A write is not acknowledged to a user until it is durable.** A 200 means the data is committed.
- No business fact lives in a component. Content belongs in a `data/` module.
- Money and valuation math happens in exactly one place, unit-tested, never inline in a route.
- A new module requires a written reason in the plan file.
- Mock personas are debt. New code reads real per-user data unless the plan says otherwise and says why.
- Automated parser and LLM output is intermediate evidence, never canonical by itself.

Add a line here every time an incident teaches you something (§16). This file is the reviewer's
conscience — it is what makes step 10 check intent rather than syntax.

**`.claude/` is configuration, not storage.** In the current repo it holds 3MB of research documents,
YC transcripts and PDFs, and zero config subdirectories. In the new repo `.claude/` contains
`commands/`, `settings.json` and nothing else. Research goes to Obsidian (already wired via MCP).

## 21. Rhythm

**Daily, ~10 min.** Open PRs, CI status, anything flagged for a human. By hand. Do not automate this
yet — a background agent watching your PRs means unbounded token cost and notification fatigue, and two
people cannot supervise a fleet. Do the cheap manual version until it genuinely hurts.

**Fridays, ~30 min.**
- Delete any command, hook or document you did not use this week. Accumulating process nobody follows
  is the most common small-team waste mode.
- For anything that broke: could a check have caught it? If yes, add the check. This is how the gates
  improve instead of ossifying.
- Read one randomly chosen merged PR properly.
- **Weeks 1–2 only:** is the layer split working, or is every ticket cross-lane? If most tickets are
  cross-lane, the split is not buying the isolation it is supposed to buy — change it.

**Weekly.** One of you *uses* Scorta. Not tests it. Uses it. Review tooling does not solve what a human
clicking through the product solves, and the specific danger of agentic development is shipping things
you have never felt. A brokerage is a trust product and trust lives almost entirely in feel.

**Monthly.** One named person owns `AGENTS.md`, `PRINCIPLES.md`, the commands, the hooks and the gates.
Not both of you, not nobody. The failure mode is documented and named — **instruction drift**: agents
gradually stop following your instruction files and reintroduce patterns you deliberately removed. Two
defenses and you want both: keep pushing rules out of prose into checks (§18), and once a month have an
agent read back over recent sessions and propose updates to the instruction files, which you then
review yourself.

## 22. What this does not solve

**Frontend and UX correctness.** Every team that has written about this still does manual QA on the
interface. There is a large gap between code being correct and code being good. §21's weekly-use rule
is the response, and it is not optional.

**Whether the agent's evidence is real.** Section 6 and step 13 reduce this a lot. They do not
eliminate it. Treat "the agent says it works" as an unverified claim until a deterministic check
agrees, and stay suspicious of impressive demonstrations that do not map exactly onto the proof you
specified in advance.

One framing worth keeping on hand: **PR review is a specification written too late.** It forces the
reviewer to reconstruct intent from a diff, which is precisely why people rubber-stamp. Everything here
that pushes work upstream — research, plan, proof-of-done, locked acceptance tests — exists so that by
the time anyone looks at a diff, the intent is already written down and already agreed.

---

## Appendix — setup checklist

- [ ] `ln -s "/Applications/ChatGPT.app/Contents/Resources/codex" /usr/local/bin/codex` *(binary is present, not on PATH)*
- [ ] Disable `feature-dev`, `vercel`, `postgres-best-practices` plugins in `~/.codex/config.toml` (§10)
- [ ] Fix the global Supabase MCP — `~/.claude/settings.json` still has the literal `YOUR_SUPABASE_PROJECT_REF`
- [ ] Write the five commands in `.claude/commands/`: `/research`, `/plan`, `/implement`, `/verify`, `/ship`, `/review-merge`
- [ ] Write the four hooks in `.claude/settings.json` (§17)
- [ ] Write the six structural tests (§18)
- [ ] `.github/workflows/check.yml` — remove `if: false`, add all six gates + gitleaks
- [ ] Branch protection on `main`: all six gates required
- [ ] Second Supabase project + Vercel Preview-scoped env vars + `https://*.vercel.app` in the redirect allow list
- [ ] Linear: confirm GitHub integration is on, and that branch-create → In Progress and PR-merge → Done actually fire
- [ ] Slack: Linear + GitHub + Vercel notifications into one channel
- [ ] `AGENTS.md` (<150 lines), `PRINCIPLES.md`, `CLAUDE.md` (one line), `docs/DECISIONS.md`
- [ ] `tickets/_template/` with `plan.md` and `review.md` skeletons committed
