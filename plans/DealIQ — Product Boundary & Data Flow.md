# DealIQ ↔ Scorta — Product Boundary & Data Flow

> What the [`DealIQ — Execution Plan.md`](./DealIQ%20—%20Execution%20Plan.md) currently defines about the
> relationship between the buy-side and sell-side applications: where one can reach the other, which
> way data moves, and what is inside that flow.
> Sourced from the execution plan's §1 rule 5, §2, items 4, 13, 14, §7, and the QA integrity block.

---

## 1. Navigation — one door, one direction

```
   Public landing page (/)
   ├── nav "For buyers" ─────┐
   ├── hero secondary line ──┤
   ├── SBuySide band CTA ────┼──▶ /dealiq ──▶ [guard] ──▶ /dealiq/signin ──▶ /dealiq
   └── footer link ──────────┘                              (own branding)

   Seller workspace (/dashboard …)  ──✗──▶  DealIQ     no link, pill, or menu item
   DealIQ (/dealiq …)              ──✗──▶  Seller      sign-out returns to /dealiq/signin
```

The **public landing page is the only navigational bridge**, and it points one way only — into DealIQ.

- Item 4 step 5: no link, pill, or menu item in the seller workspace navigates to DealIQ. `AppShell.tsx`
  is not touched by the sprint at all.
- Enforced in QA: `grep -rn "dealiq" components/scorta/AppShell.tsx` must return nothing.
- Item 14: all four landing entries point at `/dealiq`; the landing page never links to `/login`.
- Item 4: DealIQ's own sign-in lives at `/dealiq/signin`, outside the `(workspace)` auth guard, and
  sign-out returns there rather than to the seller's `/login`.
- Demo movement between products is a second browser tab or a trip back through the landing page
  (execution plan §9, open decision 2).

**Rationale.** Someone selling a business is not simultaneously buying one. An in-app switcher would
make two products read as one app with a toggle.

---

## 2. Code coupling — three shared things, everything else walled off

**Shared**

| What | Where |
|---|---|
| Design language — CSS-variable tokens, fonts, glass treatments | `styles/tailwind.css` |
| Two UI primitives | `components/shared/ScoreDial.tsx`, `components/shared/StreamingLog.tsx` |
| Platform — one Next app, one deployment, one Supabase session, AI provider, logger | `lib/ai`, `lib/logger`, `lib/supabase` |

**Walled off**

- No component imports in either direction between `components/scorta/` and `components/dealiq/`.
- DealIQ never imports `@/lib/persona` (§1 rule 5).
- `ApproveGate` is **copied** into `components/dealiq/`, not imported from the sell-side.
- No shared shell, rail, or navigation component (§7).
- Both walls are grep-enforced in the QA pass.

**One asymmetry worth naming: auth is shared, not separated.** A single Supabase account reaches both
apps, so a signed-in seller who typed `/dealiq` would pass the guard. §7 marks role separation as
explicitly out of scope for this sprint — the separation is by product surface, not by permission.

---

## 3. The data flow — exactly one, buy-side → sell-side

Defined by item 13, via a pure adapter. No shared types, no shared components.

```
lib/dealiq/data/buyer.ts  (BuyerProfile + Mandate)
        │
        ▼  toSellSideBuyer()          ← lib/dealiq/adapters/, pure, unit-tested
        │
        ▼
components/scorta/OutreachStation.tsx
        → the third buyer slot (:171, today "Search Fund (Profile TBD)")
        → secondary target: the /network shortlist, if DEMO P1.2 ever ships
```

### What travels

| Field group | Contents |
|---|---|
| Identity | Buyer name, initials, firm |
| Classification | Archetype / buyer type |
| Mandate summary | Industries, geography, EV band — rendered as the profile line |
| Match rationale | Why this buyer fits the seller's deal |
| Capital status | Capital-verified badge, verification method, verification date |

Plus **one runtime read**: the sell-side card checks the `scorta:dealiq:verified` sessionStorage key —
but only to add a *"verified in this session"* pulse. The card's presence is unconditional, so landing
directly on `/buyers` still works.

### What does not travel

- No deal data
- No reverse-recast output
- No returns figures
- No LOI terms
- No pipeline state

Item 10's *"Send to seller's Case Manager"* approve gate is **narrated, not wired** — it produces a
toast and a DealIQ-side pipeline move. Nothing lands in the seller workspace.

---

## 4. Content-level relationship — deliberately absent for now

§1 rule 5 decouples the two products' *facts*, not only their code: DealIQ imports nothing from the
sell-side persona.

If the two products should eventually agree on a shared business — the same deal seen from both sides
of the table — that agreement is **authored in the content pass** (§8), by seeding `lib/dealiq/data/`
and the sell-side data to match. It is not a code dependency, and nothing in this sprint creates one.

---

## 5. Open detail to resolve when item 13 is implemented

`OutreachStation`'s `Buyer` type carries sell-side narrative fields the buy side has no opinion about:

```ts
sequence[] · held · holdReason · holdEstimate · agentNote · initialColumn
```

These are outreach-campaign concepts. The adapter should map **identity and capital fields only**, and
let the sell-side call site supply the campaign fields. Otherwise buy-side data begins owning sell-side
workflow state — precisely the coupling this boundary exists to prevent.

---

## 6. Summary

| Question | Answer |
|---|---|
| Can a seller reach DealIQ from the workspace? | **No.** By design, enforced by grep in QA. |
| Can a buyer reach the seller workspace from DealIQ? | **No.** Sign-out returns to `/dealiq/signin`. |
| Where do the products meet in the UI? | The **public landing page only**, pointing into DealIQ. |
| Which way does data move? | **Buy-side → sell-side**, one direction, one adapter. |
| What is in the flow? | A buyer profile: identity, firm, archetype, mandate summary, match rationale, capital-verified status — plus a session flag for a "verified just now" pulse. |
| What is explicitly *not* in the flow? | Deal data, recast output, returns, LOI terms, pipeline state. |
| Do the two products share code? | Tokens, two primitives, and platform modules. No shells, no navigation, no cross-imports. |
| Do they share content/numbers? | Not in code. Any agreement is authored later in the content pass. |
