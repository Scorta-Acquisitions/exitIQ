# Phase 1 Audit Prompt — Data Traceability Map

> Drop this file into the root of the repo as a scratch document. The goal of this task is **read-only reconnaissance** — no code changes, no refactors, no fixes. You are mapping, not editing.

---

## Objective

Produce a complete, layer-by-layer traceability map of every data point that appears in the final rendered report (the output the user sees after passing through the email gate). For each data point, trace its full lifecycle from the moment it is collected all the way to the moment it is rendered — touching every layer in between.

The deliverable is a set of markdown tables in this file — one table per report section — completed with no assumptions or blanks. If a data point's origin is unclear, flag it explicitly rather than guessing.

---

## Ground Rules

- **Do not modify any source files.** This is an audit, not a refactor.
- **Do not fix anything you find.** If you spot a bug, log it in the Issues section at the bottom of this file and keep moving.
- **Do not skip fields that seem obvious.** Every displayed data point gets a row, including labels, scores, computed values, and conditional UI elements.
- **When in doubt, trace deeper.** If a prop comes from a helper function or utility, trace through that too.

---

## Software Layers to Map

Organize your trace along these distinct layers. Every data point must be accounted for at each layer that touches it:

| Layer | What to Document |
|-------|-----------------|
| **Render Layer** | The exact prop, field name, or expression the render component reads to display this value |
| **State / Orchestration Layer** | Where that prop lives in application state — how it is passed down, and from what parent or context it originates |
| **Computation / Transformation Layer** | Any scoring logic, derived calculations, formatting functions, or conditional transforms applied before or during render |
| **Collection Layer** | The specific question, input, or user interaction that produced this raw value — include question ID or key if one exists |
| **API / Server Layer** | The API route, server action, or data-fetching function responsible for reading or writing this value |
| **Database Layer** | The table name and column name where this value is persisted. If not persisted, note "ephemeral" |

---

## Inventory Format

For each section of the report, produce a table in this format:

```markdown
### [Section Name]

| Data Point | Render Field | State/Prop Path | Computed? (Y/N — describe if Y) | Collection Source (Question / Input) | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|----------------------------------|--------------------------------------|--------------------|-----------------|
| ... | ... | ... | ... | ... | ... | ... |
```

**Flags to use in any cell:**
- `⚠️ UNCLEAR` — origin is ambiguous or couldn't be traced with confidence
- `⚠️ HARDCODED` — value is static/hardcoded in render, not data-driven
- `⚠️ MISSING` — expected to be populated but no data flows to it
- `⚠️ DUPLICATE` — same value computed or stored in more than one place
- `⚠️ EPHEMERAL` — exists only in client memory, never persisted

---

## Report Sections to Cover

Work through the rendered report **in visual order, top to bottom**. For each distinct section or card in the report, create a table block. Treat the following as minimum section granularity — if a section has subsections or nested data, break those out as well:

1. Report header / metadata (business name, date, owner info, etc.)
2. Overall score / summary grade
3. Each scored dimension or category (e.g., financial health, operations, market position — whatever sections exist)
4. Any charts, gauges, or visual score indicators
5. Qualitative insights or recommendation blocks
6. Any conditional sections (sections that only appear based on answer thresholds or score ranges)
7. Any data shown only in the "full" vs. "preview" variant of the report

---

## Issues Log

As you audit, append any anomalies here. Do not fix them — just document them.

```markdown
### Issues Found During Audit

| # | Layer | Data Point / Location | Issue Description | Severity (High / Med / Low) |
|---|-------|-----------------------|-------------------|-----------------------------|
| 1 | | | | |
```

---

## Completion Checklist

Before closing this audit:

- [ ] Every report section has a completed table — no section skipped
- [ ] Every row has all 7 columns filled or explicitly flagged
- [ ] All `⚠️` flags have a brief description in the cell
- [ ] Issues log is populated (even if empty, note "No issues found")
- [ ] No code was changed during this audit
