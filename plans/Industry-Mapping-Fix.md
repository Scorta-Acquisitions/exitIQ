# Plan: Fix Incomplete INDUSTRY_MAP — Wrong Industry Scoring for 15/22 Industries

## Context

The exitIQ report pipeline was refactored across 8 mini-prompts (documented in `plans/Agent-Handoff.md`). All 5 documented bugs were fixed. However, a 6th bug — never listed in the handoff — was identified from the debug log and confirmed by code inspection: **the industry mapping is broken for the majority of users**.

The debug log (`workflow.ndjson`) shows:
- User selected **"Auto Services"**
- `client.report_page_mounted` logs `industry: "Other / Not Listed"` — WRONG

Root cause: `lib/assessment/transform.ts:INDUSTRY_MAP` only maps 7 industry labels, all from an older version of the UI. The live UI (`lib/exitiq/data.ts`) presents **22 industries** with new label strings. When `mapStage1ForScoring("Auto Services")` runs, it finds no match, passes the raw string to `findIndustry()`, which falls back to the last entry in `lib/assessment/industries.ts` — `{ value: "other", label: "Other / Not Listed" }`.

**Impact of wrong industry:**
- Wrong SDE and revenue multiples → wrong valuation range shown to seller
- Wrong `marketScore` base for scoring → wrong composite score
- Wrong industry label displayed in the report header
- Wrong buyer type descriptions in the narrative

Confirmed by math: the debug log's `market: 72` traces back to `other.marketScore (58) + 14 (years bonus)` — not to `automotive.marketScore (65) + 14 = 79`. The fallback is definitely happening.

Affected users: anyone who selects any of these 15 industries (all fall through to "Other / Not Listed"):
Auto Services, Beauty / Wellness, Childcare / Education, Construction / Trades, Dental / Optometry, E-commerce / DTC, Energy / Environment, Financial Services, Fitness / Gym, Landscaping / Grounds, Pet Services, Specialty Retail / Hospitality, Staffing / Recruiting, Tech / SaaS, Transportation / Logistics, Wholesale / Distribution

---

## The Fix

**Single file change**: `lib/assessment/transform.ts`

Replace the 7-entry `INDUSTRY_MAP` (lines 8–16) with a complete 22-entry map covering every label in `lib/exitiq/data.ts:INDUSTRIES`.

```typescript
const INDUSTRY_MAP: Record<string, string> = {
  // ── Direct matches ────────────────────────────────────────────────────────
  "Auto Services":                  "automotive",
  "Beauty / Wellness":              "beauty",
  "Childcare / Education":          "childcare",
  "Construction / Trades":          "construction",
  "Dental / Optometry":             "healthcare_dental",
  "E-commerce / DTC":               "ecommerce",
  "Fitness / Gym":                  "fitness",
  "Healthcare / Medical":           "healthcare_medical",
  "Home Services":                  "home_services",
  "Manufacturing":                  "manufacturing_light",
  "Pet Services":                   "pet_services",
  "Restaurant / Food Service":      "food_bev",
  "Retail (Brick & Mortar)":        "retail",
  "Staffing / Recruiting":          "staffing",
  "Tech / SaaS":                    "saas_tech",
  "Transportation / Logistics":     "transportation",
  // ── Best-fit mappings (no exact backend slug; closest by buyer profile / multiples)
  "Energy / Environment":           "construction",     // contracting / infrastructure adjacent
  "Financial Services":             "accounting",       // professional services bucket
  "Landscaping / Grounds":          "home_services",    // same PE rollup buyer profile as HVAC/plumbing
  "Professional Services":          "accounting",       // accounting / consulting / advisory
  "Specialty Retail / Hospitality": "retail",           // no dedicated hospitality slug
  "Wholesale / Distribution":       "transportation",   // SDE multiples align better than retail
}
```

The fallback in `mapStage1ForScoring` — `?? s1.industry` — remains as-is so any unrecognized label (future UI additions, direct API calls) still passes through rather than crashing.

---

## Critical File

| File | Change |
|---|---|
| [lib/assessment/transform.ts](lib/assessment/transform.ts) | Replace `INDUSTRY_MAP` (lines 8–16) with the 22-entry complete map above |

No other files need to change. `findIndustry()`, `buildReportData()`, `computeScore()`, and `buildReportPrompt()` all consume the slug downstream — they're correct once they receive the right slug.

---

## Verification

1. **Type check**: `pnpm exec tsc --noEmit` — no new type errors (it's a `Record<string, string>` replacement)
2. **Unit tests**: `pnpm test` — existing tests should pass unchanged
3. **Manual spot-check**: Select "Auto Services" → submit → report should log `industry: "Automotive (Repair, Car Wash, Detailing)"` on mount and show correct multiples `[2.0×–3.5×]` in the valuation methodology table
4. **Math sanity**: With "Auto Services" → "automotive" (sdeMultiple [2.0, 3.5], revenueMultiple [0.5, 1.0], marketScore 65):
   - SDE "under_250" (mid $125K): SDE method [$250K – $437.5K]
   - Revenue "1m_2m" (mid $1.5M): revenue method [$750K – $1.5M]
   - Combined: low = max(floor $375K, $500K) = **$500K** · high = **$968.75K**
   - Market score: 65 + 14 (years) = **79**
   - vs. current wrong output: valuation $425K–$893.75K, market 72 (both from "other" fallback)


I have a complete picture now. Let me work through each issue precisely.

What the log reveals — four separate problems
1. Score 61 in Supabase vs 92% pre-gate
These are two completely different scoring models that were never designed to agree:

Pre-gate (client-side): calcDerived() in lib/exitiq/calculations.ts runs a 7-axis radar that only counts signals that are actually answered. With your inputs, almost every axis maxes out:

docReadiness=excellent → 10/10
keyMan=5 → 10/10
recurringRev=high + 10+ years → 10/10
customerConc=diversified → 10/10
longevity 10+ years → 10/10
ops depth (employees 16–50 + keyMan=5) → ~9.2/10
positioning (Auto Services is low-multiple) → ~2.3/10
Weighted sum ≈ 9.2/10 → 92. That's what you saw.

Post-gate (server-side): computeScore() in lib/assessment/scoring.ts runs a 5-dimension weighted model. This is the score stored in Supabase. composite=61.

2. Why Operational Independence scores 54 despite keyPersonRisk="four_plus"
scoring.ts:80–94 — scoreOperational() averages three signals:


a = ownerScores[s2.ownerDependency]  // NOT collected in 10Q flow → defaults to 35
b = kprScores[s3.keyPersonRisk]      // "four_plus" → 90 ✓
c = sopScores[s3.sops]               // NOT collected in 10Q flow → defaults to 38

result = (35 + 90 + 38) / 3 = 54
The ownerDependency slider (runs_independently/significant_impact/etc.) and sops (fully_docs/some_docs/etc.) are stage 2/3 fields from the original multi-stage flow. The 10-question flow never asks them. They fall to their default branch (?? 35 and ?? 38) which correspond to "significant_impact" and "some_docs" — both mediocre. Your excellent keyPersonRisk answer (90) gets washed out by the two defaulting-to-bad signals.

3. Why "owner-dependent operations" ends up in the LLM narrative
This cascades from bug 2. In report-transform.ts:313–329, buildDetractors() fires when:


ownerDep === "everything_stops" || ownerDep === "significant_impact"
|| (dimMap.operational ?? 100) < 65   // ← this fires: 54 < 65
ownerDep is undefined (never collected), so the third condition catches it. Then the messaging uses the else branch which says "Significant owner dependency signals transition risk to buyers..." — attributing "significant_impact" language to a field that was never actually answered.

That detractor ("Operational Independence 54/100") then flows into buildTeaserBridgeNote() (report-transform.ts:540):


if (detractors.some((d) => d.title.toLowerCase().includes("operational"))) {
  signals.push("owner-dependent operations")  // ← wrong
}
This phrase gets embedded in the system prompt sent to Claude. Claude reads it, treats owner dependency as the primary weakness, and generates the entire "write an operations manual" narrative — directly contradicting your actual answer of 4+ independent managers.

The LLM is not inventing this. It's faithfully echoing a bad signal it was given.

4. Pre-gate valuation ($644K–$732K) vs report valuation ($500K–$969K)
These come from different formulas with different inputs:

Pre-gate (computeSdeMultiple)	Post-gate (getValuationRange)
SDE midpoint	$175K (true mid of $100K–$250K)	$125K (hard-coded under_250)
Multiple	Adjusted per signal: base + up to +1.5× for excellent docs, diversified customers, etc. → 3.93×	Fixed industry range: 2.0×–3.5×, no signal adjustments
Revenue method	Not used	Blended 50/50 with revenue method, widens range dramatically
The post-gate model also blends SDE method ($250K–$437K) with revenue method ($750K–$1.5M) 50/50, producing $500K–$969K — a wider but different range. The pre-gate's $644K–$732K variables are not passed to the LLM at all. Claude only sees the post-gate numbers.

5. Currency displaying as "M" instead of "K" in the report UI
Secondary issue — the report page appears to be applying a formatter that does value / 1000 then labels it "M". Since valuation.lo = 500000 (raw dollars), you get 500000/1000 = 500 → "$500M" instead of "$500K". The fmt() helper in scoring.ts:438–442 handles this correctly; the report UI component is using a different path.

Summary
The two biggest bugs causing the wrong report:

Operational score is sabotaged by uncollected fields defaulting to pessimistic values — the 10Q flow skips ownerDependency and sops, so the scoring model treats them as "significant owner dependency" and "barely any docs"
The wrong narrative hint propagates into the LLM prompt — Claude is explicitly told "owner-dependent operations" and writes accordingly
Do you want me to fix these, or do you want to discuss the approach first? The fix options are: (a) remove the two defaulting-to-bad signals from scoreOperational() when in the 10Q flow, or (b) derive ownerDependency and sops from keyPersonRisk as a proxy.