# Report UI structure & interaction pass

## Context

The post-gate Exit IQ report at [/app/report/[sessionId]/page.tsx](app/report/[sessionId]/page.tsx) renders [`FullReportVisual`](components/exitiq/report-visual.tsx) — a long, writing-heavy single-page report. We just fixed currency formatting and basic markdown rendering. The seller still hits four issues on first scroll:

1. **Valuation methods collapse in the prose.** The LLM is instructed to write "Method 1 (X), Method 2 (Y), Method 3 (Z)" inside a single sentence ([prompts.ts:399](lib/ai/prompts.ts#L399)), so the three methods read as a wall instead of three distinct lines.
2. **Transferability hover target is too small.** Hover is bound to the tiny 2-pill toggle ([report-visual.tsx:1047](components/exitiq/report-visual.tsx#L1047)); the mouse leaves the pill as soon as the reader moves to the narrative on the right, so the state flickers between "Today" and "If you fix it."
3. **Sections are dense with no orientation.** The current `SectionLabel` ([report-visual.tsx:48](components/exitiq/report-visual.tsx#L48)) emits "§02 VALUATION ANALYSIS" only; the next thing the reader sees is the marketing h2 and the content. There's no calm "what this is" line to let the reader pace themselves.
4. **Expandable cards (MethodBar, DriverCard, DetractorCard, StatItem) hide their interactivity** — there's no chevron or cursor cue, so the reader doesn't know to mouse over.
5. **The 7-axis Exit Readiness shape exists pre-gate** ([preview.tsx:247](components/exitiq/preview.tsx#L247)) but disappears post-gate. The seller saw a radar at the gate teaser; the report hero shows three StatItems (Valuation midpoint, Timeline runway, Buyer pool) where the radar visual lived, and a 5-bar subscore strip below — neither matches the gate aesthetic.

Outcome: a hero that leads with the seller's diagnostic shape, sections that are skim-friendly, and expandable detail the reader can both peek (hover) and pin (click). No information removed — only structured and progressively disclosed.

---

## Approach

### 1. Valuation methods — one line per method in the prose

**Edit** [lib/ai/prompts.ts](lib/ai/prompts.ts) §Valuation Analysis instructions ([line 399](lib/ai/prompts.ts#L399)).

Change the "Then reference all three pre-computed methodologies: Method 1 (…), Method 2 (…), Method 3 (…)" clause from one inline sentence to three bolded paragraph items, each separated by a blank line so the existing `\n\n+` block splitter in `NarrativeProse` ([report-visual.tsx:174](components/exitiq/report-visual.tsx#L174)) puts each method on its own `<p>`. Use the bold pattern already used for Drivers/Detractors:

```
**Method 1 — SDE × Industry Multiple ($X–$Y).** Why this is primary for {industry}…

**Method 2 — Revenue Multiple ($A–$B).** Cross-check…

**Method 3 — Asset Floor ($C).** Absolute floor; reference only.
```

The renderer's `renderInlineMd` ([report-visual.tsx:101](components/exitiq/report-visual.tsx#L101)) already handles `**bold**`. No render code change needed.

### 2. Hero — radar swaps in for the stat column; stats move to the strip

**Edit** [components/exitiq/report-visual.tsx](components/exitiq/report-visual.tsx) `HeroScorecard` ([line 265](components/exitiq/report-visual.tsx#L265)).

- **Extract `RadarChart`** from [preview.tsx:247-355](components/exitiq/preview.tsx#L247-L355) into a new shared file `components/exitiq/radar.tsx`. Keep `preview.tsx` importing the same component (no behavior change pre-gate). The extracted component takes `scores: number[]` (0–1 range, length 7) and `labels: string[]`, plus an optional `onAxisHover(i)` / `onAxisClick(i)` callback so the hero can render axis-specific explanations.
- **Third column of hero main row** ([report-visual.tsx:357](components/exitiq/report-visual.tsx#L357)): replace the StatItem stack ([L505-L517](components/exitiq/report-visual.tsx#L505-L517)) with `<RadarChart>` sourced from the 7-axis subscores. Use `score.subscores` when its length is 7 (which is the readiness snapshot path); when it's the legacy 5-dim fallback, project the 5 dims into the 7-axis layout via a small map (reusing `READINESS_AXIS_KEYS` from [report-transform.ts:199](lib/assessment/report-transform.ts#L199)). The radar's interior shows the composite number; the gauge stays in the first column.
- **Subscore strip below the gauge** ([L520-L534](components/exitiq/report-visual.tsx#L520-L534)): replace the `SubscoreBar` grid with a 3-column grid of the existing `StatItem`s — Valuation midpoint, Timeline runway, Buyer pool. Use the existing StatItem styling.
- **Axis explanations** — render directly below the radar (still in the third column, or full-width below the main row if space is tight): a small "About this axis" card. State machine: hover an axis label → preview that axis's card; click an axis → pin it (clicking the same axis again, or a "✕ close" affordance, un-pins). Pinned state takes precedence over hover. Each axis card shows: axis label, score (e.g. "Owner Dependency · 68/100"), and a one-sentence explanation pulled from a new lookup table `READINESS_AXIS_DESCRIPTIONS` (add it to [report-transform.ts](lib/assessment/report-transform.ts) next to `READINESS_AXIS_LABELS`).

The lookup table values (one sentence each, calm and descriptive, not advisory):

| key | sentence |
|-----|----------|
| finDocs | "How clean and lender-ready your financial statements look on a quality of earnings review." |
| ownerDep | "How much of the business runs through you personally — owner involvement is what buyers discount most aggressively." |
| revQuality | "How predictable your top line is — recurring, contracted, or repeat revenue scores higher than transactional." |
| custConc | "How exposed the business is if a top customer leaves; concentration above 20% is a major buyer concern." |
| longevity | "Years operating under current ownership — buyers and SBA lenders price longer track records higher." |
| opsDepth | "Whether the business can run without a key person — documented SOPs, cross-trained staff, and a #2." |
| positioning | "How defensible your market position looks to a buyer — industry fundamentals, geography, and reputation." |

### 3. SectionLead — a calm one-liner under each SectionLabel

**Add** a small component `SectionLead({ children })` in [report-visual.tsx](components/exitiq/report-visual.tsx) right under `SectionLabel`. Styling: 12px, color `var(--t3)`, italic, max-width ~640px, marginBottom 14 — sits between the SectionLabel and the section's h2.

Insert a `<SectionLead>` line into each section. Proposed copy (kept literal; no statistics so it doesn't drift):

- §02 Valuation Analysis — "Three valuation lenses, blended into one defensible listing range buyers and lenders will recognize."
- §03 SBA 7(a) Eligibility — "Whether a financing-eligible buyer can write the equity check needed to close this deal."
- §04 Transferability Score — "How easily this business runs without you — the variable buyers discount most aggressively."
- §05 Value Drivers — "Strengths a sophisticated buyer will pay up for — make sure they're documented."
- §06 Value Detractors — "Discounts buyers will insist on at the table — and what to fix before listing."
- §07 Recommended Deal Structure — "How this deal should be priced and financed to attract the strongest buyer pool."
- §08 Growth Levers — "Upside levers worth documenting for the buyer's underwriting model."
- §09 Next Steps — "What to do this quarter to land the upper end of the range."

Skip the lead for the hero (§01) and the boardroom CTA (§10) — the hero gauge speaks for itself and the CTA copy is already lead-form.

### 4. Expandable cards — chevron + "More" label + click-to-pin

**Add** a small hook + component in [report-visual.tsx](components/exitiq/report-visual.tsx):

```ts
function useExpandable() {
  const [hover, setHover] = React.useState(false)
  const [pinned, setPinned] = React.useState(false)
  const expanded = pinned || hover
  return {
    expanded,
    pinned,
    handlers: {
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      onClick: () => setPinned((p) => !p),
    },
  }
}

function ExpandHint({ expanded, pinned }: { expanded: boolean; pinned: boolean }) { /* chevron + "More"/"Less"/"Pinned" label */ }
```

Apply to:
- [`MethodBar`](components/exitiq/report-visual.tsx#L576) — replace its local hover-only state, render `<ExpandHint>` in the bottom-right of the bar.
- [`DriverCard`](components/exitiq/report-visual.tsx#L1169) and [`DetractorCard`](components/exitiq/report-visual.tsx) — same pattern.
- [`StatItem`](components/exitiq/report-visual.tsx#L541) — only the ones that currently hover-expand. If a StatItem has no extra content (most don't), it stays as-is.

Add `cursor: pointer` to each card root. When pinned, render a subtle "Pinned · click to close" microcopy in place of "More".

### 5. Transferability — section-wide hover target

**Edit** [`TransferabilitySection`](components/exitiq/report-visual.tsx#L972).

- Move `onMouseEnter`/`onMouseLeave` from the small pill ([L1047-L1048](components/exitiq/report-visual.tsx#L1047)) up to the outer section card div ([L984](components/exitiq/report-visual.tsx#L984)). The pill becomes a passive visual indicator that reflects the section-wide state.
- Add a click toggle backup: clicking anywhere in the section pins the state (mirrors the expandable-card pattern from §4 above). Reuse `useExpandable`.
- Add `cursor: pointer` to the section card so the affordance is visible.
- Keep the gauge transition at 0.8s; the section-wide target eliminates the flicker without needing to chase animation timing.
- Update the "Hover to compare" microcopy to "Hover or click to compare — current vs. fixed."

---

## Critical files

- **Edit** [components/exitiq/report-visual.tsx](components/exitiq/report-visual.tsx) — hero radar swap, stat-strip relocation, `SectionLead`, `useExpandable` + chevron pattern in MethodBar/DriverCard/DetractorCard, TransferabilitySection hover-target widening.
- **Edit** [lib/ai/prompts.ts](lib/ai/prompts.ts) — Valuation Analysis instruction at [line 399](lib/ai/prompts.ts#L399) to put each method on its own bold paragraph.
- **Edit** [lib/assessment/report-transform.ts](lib/assessment/report-transform.ts) — add `READINESS_AXIS_DESCRIPTIONS` next to `READINESS_AXIS_LABELS` ([line 209](lib/assessment/report-transform.ts#L209)) and export it.
- **Create** [components/exitiq/radar.tsx](components/exitiq/radar.tsx) — extract the existing `RadarChart` from [preview.tsx:247-369](components/exitiq/preview.tsx#L247) so both surfaces use one implementation; add `onAxisHover`/`onAxisClick`/`activeAxis` props.
- **Edit** [components/exitiq/preview.tsx](components/exitiq/preview.tsx) — replace its local `RadarChart` with an import from the shared module.

## Reusable code already in the repo

- `RadarChart` SVG implementation — [preview.tsx:247](components/exitiq/preview.tsx#L247)
- 7-axis labels — `RADAR_AXES` in [lib/exitiq/data.ts:272](lib/exitiq/data.ts#L272)
- 7-axis label/key map for subscore data — `READINESS_AXIS_KEYS` / `READINESS_AXIS_LABELS` in [lib/assessment/report-transform.ts:199-217](lib/assessment/report-transform.ts#L199-L217)
- Spring animation — `useSpringNum` in [report-visual.tsx:9](components/exitiq/report-visual.tsx#L9)
- `SectionLabel` styling — [report-visual.tsx:48](components/exitiq/report-visual.tsx#L48) (`SectionLead` will live next to it and share font/colour tokens)
- Markdown renderer — `renderInlineMd` + `NarrativeProse` ([report-visual.tsx:101](components/exitiq/report-visual.tsx#L101), [L140](components/exitiq/report-visual.tsx#L140)) — already handles `**bold**` and `\n\n` block splits, so the prompt change carries through with no render edits.

## Verification

1. `pnpm dev` and navigate to a completed report at `/report/[sessionId]`.
2. Hero card:
   - Third column shows the 7-axis radar (no StatItems).
   - Below the gauge: 3 StatItems (Valuation midpoint, Timeline runway, Buyer pool) in a 3-column grid where the subscore bars used to live.
   - Hover an axis label → axis description card appears (axis name · score · one-sentence explanation).
   - Click an axis label → pin the description; click again or click another axis → switch / un-pin.
3. Each section (§02–§09) renders a one-line italic `SectionLead` between the section number/label and the h2.
4. Hover a `MethodBar` / `DriverCard` / `DetractorCard` → chevron rotates, content expands, "More" label appears. Click the card → state pins (label switches to "Pinned · click to close"); click again → collapses. Cursor is `pointer` on each.
5. Roam the mouse anywhere inside the Transferability section card → "Today/If you fix it" state holds steady; gauge animates once and stops. Click anywhere inside the card → state pins.
6. Open a freshly generated LLM run (force regeneration by clearing the cache or completing a new flow): Valuation Analysis prose renders each method on its own bolded line ("**Method 1 — SDE × Industry Multiple ($X–$Y).**" / "**Method 2 — …**" / "**Method 3 — …**").
7. `pnpm typecheck` passes.
8. `pnpm lint` shows no new errors (pre-existing warnings are unrelated).
9. Spot-check `pnpm dev` print preview (`Cmd+P`) — the radar should print as SVG, axis cards should fall back to a static "all axes shown" state.

## Non-goals (deferred)

- Restructuring the Boardroom CTA (§10) — out of scope.
- Replacing the static "Spread drivers" list in the Valuation right card (audit issue #8) — out of scope.
- The "Generated just now" timestamp (audit issue #7) — out of scope.
- Wiring the boardroom buttons to a real route (audit issue #5) — out of scope.
