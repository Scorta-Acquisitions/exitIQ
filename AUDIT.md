# Phase 1 Audit — Data Traceability Map

> Read-only reconnaissance. No source files modified.
> Trace direction: **Render → State → Computation → Collection → API → DB.**

## Layer reference (architecture summary)

| Layer | Surface | Notes |
|-------|---------|-------|
| Render | [components/exitiq/report-visual.tsx](components/exitiq/report-visual.tsx) — `FullReportVisual` and section components | Client component, reads only `ReportData` props + parsed narrative prose |
| State / Orchestration | [app/report/[sessionId]/page.tsx](app/report/[sessionId]/page.tsx) — server component | Loads `assessmentSessions` + `assessmentReports`, calls `mapStage1ForScoring` then `buildReportData`, passes `{data, reportMd, sessionId}` to `FullReportVisual` |
| Computation / Transform | [lib/assessment/report-transform.ts](lib/assessment/report-transform.ts) `buildReportData` + [lib/assessment/scoring.ts](lib/assessment/scoring.ts) `computeScore`, `getValuationRange`, `getTeaserRange`, `isSBAEligible` + [lib/assessment/sba.ts](lib/assessment/sba.ts) `computeSBASnapshot` + [lib/assessment/transform.ts](lib/assessment/transform.ts) `mapStage1ForScoring` | Pure functions; produce `ReportData` consumed by both prompt + visual |
| Collection (UI) | [components/exitiq/questions.tsx](components/exitiq/questions.tsx), [components/exitiq/ExitIQApp.tsx](components/exitiq/ExitIQApp.tsx) ` ExitIQApp` step engine, [lib/exitiq/data.ts](lib/exitiq/data.ts#L436) `ANSWER_KEYS` | 10 question step engine; answers stored in `answers` state, then split into `stage1` / `stage2` / `stage3` shapes at submit |
| API / Server | [app/api/assessment/session/route.ts](app/api/assessment/session/route.ts) (POST upsert), [app/api/assessment/generate/route.ts](app/api/assessment/generate/route.ts) (POST → LLM stream) | `session/route.ts` upserts inside `after()`; `generate/route.ts` re-fetches session, builds prompt + streams Sonnet |
| Database | `assessment_sessions` (JSONB stage1/gate/stage2/stage3/stage4 + score, sba_eligible) and `assessment_reports` (report_md text) — [lib/db/schema/assessments.ts](lib/db/schema/assessments.ts) | Single row per `session_id`; report_md is the LLM narrative only |
| Prose (LLM) | [lib/ai/prompts.ts](lib/ai/prompts.ts) `buildReportPrompt` + Anthropic Sonnet via `streamText` | Produces nine `## ` sections; parsed by `parseNarrativeSections` in report-visual.tsx |

**Important rendering invariant:** every quantitative number on the report comes from the pre-frozen `ReportData` struct. The LLM prose only fills the trailing `NarrativeProse` paragraphs within each card; if the LLM is misaligned, the visible numbers do not change.

---

## §00 Top Bar (sticky nav)

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| Brand "Scorta" | hardcoded literal `Scorta` in [report-visual.tsx:2065](components/exitiq/report-visual.tsx#L2065) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Tagline "ExitIQ Report" | hardcoded literal in [report-visual.tsx:2078](components/exitiq/report-visual.tsx#L2078) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Live timestamp | `generated` prop in `ReportTopBar` | `data.meta.generated` (passed by `FullReportVisual`) | Y — hardcoded string `"Generated just now"` returned by `buildReportData` ([report-transform.ts:737](lib/assessment/report-transform.ts#L737)) | n/a — never a real timestamp | n/a | ⚠️ HARDCODED — never reads `assessmentReports.created_at` or `assessmentSessions.completed_at` |

---

## §01 Hero Scorecard

### Top header strip

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| First name ("ExitIQ Report · {meta.name}") | `meta.name` ([report-visual.tsx:227](components/exitiq/report-visual.tsx#L227)) | `data.meta.name` | Y — `buildReportData` assigns `name: firstName` ([report-transform.ts:736](lib/assessment/report-transform.ts#L736)) | EmailGateModal `firstName` field (in `ExitIQApp`'s `persistSession` payload, `gate.firstName` — [ExitIQApp.tsx:458](components/exitiq/ExitIQApp.tsx#L458)) | `POST /api/assessment/session` → `assessmentSessions.gate.firstName` | `assessment_sessions.gate` (JSONB, `.firstName`) |
| Generated timestamp | `meta.generated` | `data.meta.generated` | Y — ⚠️ HARDCODED `"Generated just now"` | n/a | n/a | n/a |
| Revenue label | `meta.revenue` | `data.meta.revenue` | Y — `REVENUE_LABELS[s1Scored.revenue]` ([report-transform.ts:739](lib/assessment/report-transform.ts#L739)); slug mapped via `REVENUE_MAP` in `mapStage1ForScoring` ([transform.ts:35–42](lib/assessment/transform.ts#L35-L42)) | Q4 "What is your annual revenue?" ([questions.tsx:455](components/exitiq/questions.tsx#L455)), key `revenue` from `ANSWER_KEYS` | `POST /api/assessment/session` | `assessment_sessions.stage1.revenue` (human label) |
| SDE label | `meta.sde` | `data.meta.sde` | Y — `SDE_LABELS[s1Scored.sde]`; slug mapped via `SDE_MAP` | Q5 "What is your annual SDE?" ([questions.tsx:507](components/exitiq/questions.tsx#L507)), key `sde` | `POST /api/assessment/session` | `assessment_sessions.stage1.sde` |
| Years in business | `meta.yearsInBusiness` | `data.meta.yearsInBusiness` | Y — `s1Scored.years ?? 0` ([report-transform.ts:743](lib/assessment/report-transform.ts#L743)); upstream defaults to `5` when null at [app/report/[sessionId]/page.tsx:59](app/report/[sessionId]/page.tsx#L59) and [api/assessment/generate/route.ts:122](app/api/assessment/generate/route.ts#L122) | Q2 slider ([questions.tsx:288](components/exitiq/questions.tsx#L288)), key `years` (string label → number via `YEAR_TO_NUMBER` in ExitIQApp) | `POST /api/assessment/session` | `assessment_sessions.stage1.years` (number) |
| Print/PDF button | hardcoded label `"Print / PDF"` ([report-visual.tsx:256](components/exitiq/report-visual.tsx#L256)) — calls `window.print()` | n/a | N | ⚠️ HARDCODED | n/a | n/a |

### Composite gauge + grade

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| Composite score (gauge value, 0–100) | `useSpringNum(score.composite)` ([report-visual.tsx:171](components/exitiq/report-visual.tsx#L171), text at L315) | `data.score.composite` | Y — `computeScore`: weighted sum of 5 dimensions ([scoring.ts:411–424](lib/assessment/scoring.ts#L411-L424)) | All stage1 + stage2 + stage3 + stage4 fields feed it — but only stage1 + (customerConcentration, recurringRevenue, keyPersonRisk) are collected in the 10-question flow | n/a (computed server-side at request time) | Derived. Snapshot of composite is persisted as `assessment_sessions.score` (integer) at session completion |
| Gauge "out of 100" label | hardcoded literal ([report-visual.tsx:328](components/exitiq/report-visual.tsx#L328)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Letter grade A/B/C/D | `score.grade` ([report-visual.tsx:357](components/exitiq/report-visual.tsx#L357)) | `data.score.grade` | Y — threshold ladder in `computeScore` (≥85 A, ≥70 B, ≥55 C, else D) ([scoring.ts:426–429](lib/assessment/scoring.ts#L426-L429)) | (Derived from composite) | n/a | Derived |
| Grade label ("Exit-Ready", "Well-Positioned", "Needs Prep", "Early Stage") | `score.gradeLabel` ([report-visual.tsx:361](components/exitiq/report-visual.tsx#L361)) | `data.score.gradeLabel` | Y — `GRADE_LABELS[scoreResult.grade]` ([report-transform.ts:752](lib/assessment/report-transform.ts#L752)) | (Derived from grade) | n/a | Derived |
| Score headline ("Your Exit IQ score of N reflects…") | `score.headline` ([report-visual.tsx:375](components/exitiq/report-visual.tsx#L375)) | `data.score.headline` | Y — `buildNarrative(composite, grade, distressed, dims)` ([scoring.ts:352–367](lib/assessment/scoring.ts#L352-L367)) | (Derived) | n/a | Derived |
| Highest-leverage move callout | `data.detractors[0].fix` + `fmt$K(data.transferability.dollarImpact)` ([report-visual.tsx:401–402](components/exitiq/report-visual.tsx#L401-L402)) | `data.detractors[0].fix`, `data.transferability.dollarImpact` | Y — see Detractors and Transferability sections | Indirect (see Detractors / Transferability rows) | n/a | Derived; conditional on `data.detractors[0]` existing |
| Callout heading "The single highest-leverage move" | hardcoded ([report-visual.tsx:398](components/exitiq/report-visual.tsx#L398)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |

### Stat strip (right column)

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| Valuation midpoint | `fmt$K(valuation.mid)` ([report-visual.tsx:418](components/exitiq/report-visual.tsx#L418)) | `data.valuation.mid` | Y — `Math.round((valLo + valHi) / 2)` ([report-transform.ts:612](lib/assessment/report-transform.ts#L612)); `getValuationRange` blends SDE×multiple and revenue×multiple with asset-floor minimum ([scoring.ts:187–208](lib/assessment/scoring.ts#L187-L208)) | Driven by `stage1.industry`, `stage1.revenue`, `stage1.sde` | n/a | Derived |
| Valuation lo–hi range | `fmt$K(valuation.lo)` / `fmt$K(valuation.hi)` ([report-visual.tsx:418](components/exitiq/report-visual.tsx#L418)) | `data.valuation.lo`, `data.valuation.hi` | Y — same as above | Same as above | n/a | Derived |
| "Timeline runway" big value | `meta.timeline` ([report-visual.tsx:419](components/exitiq/report-visual.tsx#L419)) | `data.meta.timeline` | Y — `TIMELINE_LABELS[sellingTimeline]` ([report-transform.ts:745](lib/assessment/report-transform.ts#L745)) | EmailGateModal "When are you considering selling?" → mapped to slug via `TIMELINE_LABEL_TO_SLUG` ([transform.ts:82–88](lib/assessment/transform.ts#L82-L88)) | `POST /api/assessment/session` | `assessment_sessions.gate.sellingTimeline` |
| Timeline sub-label | hardcoded `"Seller window"` ([report-visual.tsx:419](components/exitiq/report-visual.tsx#L419)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| "Buyer pool" big value | `data.sba.eligible ? "SBA-qualified" : "Conventional"` ([report-visual.tsx:420](components/exitiq/report-visual.tsx#L420)) | `data.sba.eligible` | Y — `isSBAEligible(s1)`: rejects `saas_tech`, `real_estate_svcs`, `legal`; >75 employees; >$5M revenue ([scoring.ts:375–399](lib/assessment/scoring.ts#L375-L399)) | `stage1.industry`, `stage1.employees`, `stage1.revenue` | n/a | Persisted as `assessment_sessions.sba_eligible` boolean (also derived at render) |
| Buyer-pool sub-label | `data.sba.buyerPool` | `data.sba.buyerPool` | Y — `BUYER_POOL[s1.revenue]` ([sba.ts:22–29](lib/assessment/sba.ts#L22-L29)) | `stage1.revenue` | n/a | Derived |
| Stat-strip labels ("Valuation midpoint", "Timeline runway", "Buyer pool") | hardcoded ([report-visual.tsx:418–420](components/exitiq/report-visual.tsx#L418-L420)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |

### Subscore strip (5 horizontal bars)

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| Financial Attractiveness (0–100) | `sub.value` inside `SubscoreBar` ([report-visual.tsx:436](components/exitiq/report-visual.tsx#L436)) | `data.score.subscores[0]` | Y — `scoreFinancial(s1, s2)`: SDE band base + `revenueTrend` delta + `recurringRevenue` bonus ([scoring.ts:47–77](lib/assessment/scoring.ts#L47-L77)) | `stage1.sde`, `stage2.revenueTrend` ⚠️ MISSING (never collected), `stage2.recurringRevenue` (mapped from Q10 `recurringRev`) | `POST /api/assessment/session` | `assessment_sessions.stage1.sde`, `stage2.recurringRevenue` |
| Operational Independence | `sub.value` | `data.score.subscores[1]` | Y — `scoreOperational(s2, s3)`: mean of `ownerDependency`, `keyPersonRisk`, `sops` ([scoring.ts:80–94](lib/assessment/scoring.ts#L80-L94)) | `stage2.ownerDependency` ⚠️ MISSING, `stage3.keyPersonRisk` (mapped from Q9 `keyMan`), `stage3.sops` ⚠️ MISSING | `POST /api/assessment/session` | `stage2.ownerDependency` MISSING; `stage3.keyPersonRisk` present; `stage3.sops` MISSING |
| Market Positioning | `sub.value` | `data.score.subscores[2]` | Y — `scoreMarket(s1)`: `industry.marketScore` base + years-in-business delta + state bonus ([scoring.ts:97–111](lib/assessment/scoring.ts#L97-L111)) | `stage1.industry`, `stage1.years`, `stage1.state` ⚠️ MISSING (no state question in 10-question flow) | `POST /api/assessment/session` | `stage1.industry`, `stage1.years`; `stage1.state` typically `""` |
| Deal Readiness | `sub.value` | `data.score.subscores[3]` | Y — `scoreDealReadiness(s1, s2, s3)`: `docReadiness` and `legal` averaged, ± `facilityType` lease delta ([scoring.ts:114–151](lib/assessment/scoring.ts#L114-L151)) | `stage1.docReadiness` (Q6), `stage1.facilityType` (Q3), `stage3.legal` ⚠️ MISSING (defaults to score 88) | `POST /api/assessment/session` | `stage1.docReadiness`, `stage1.facilityType` |
| Buyer Accessibility | `sub.value` | `data.score.subscores[4]` | Y — `scoreBuyerAccess(s1, s3, s4, sbaEligible)`: SBA-eligible base + `s4.dealStructure` count + asking-price proximity to range ([scoring.ts:154–184](lib/assessment/scoring.ts#L154-L184)) | All of `stage1`, `stage3.sbaRestricted`, `stage4.dealStructure`, `stage4.askingPrice` ⚠️ MISSING (stage4 never collected) — falls back to `"no_idea"` branch, giving full +20 | `POST /api/assessment/session` | `stage4` row in DB MISSING |
| Subscore color | `sub.color` | derived in `buildReportData` via `scoreColor(v)` ([report-transform.ts:182–186](lib/assessment/report-transform.ts#L182-L186)) | Y — threshold ladder | n/a | n/a | Derived |
| Subscore label ("Financial Attractiveness", etc.) | `sub.label` | `SUBSCORE_LABELS[d.key]` ([report-transform.ts:174–180](lib/assessment/report-transform.ts#L174-L180)) | Y — lookup map | n/a | n/a | ⚠️ HARDCODED display labels |

### Hero narrative prose paragraph

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| Executive Summary prose | `<NarrativeProse prose={prose["Executive Summary"]} />` ([report-visual.tsx:439](components/exitiq/report-visual.tsx#L439), L2176) | parsed from `reportMd` by `parseNarrativeSections` ([report-visual.tsx:75–86](components/exitiq/report-visual.tsx#L75-L86)) | Y — LLM (Sonnet) under `## Executive Summary` heading ([prompts.ts:395](lib/ai/prompts.ts#L395)); prompt is built by `buildReportPrompt`, fed pre-frozen `ReportData` | n/a — synthesized from all session signals | `POST /api/assessment/generate` (server streams Sonnet) | `assessment_reports.report_md` (full markdown) |

---

## §02 Valuation Analysis

### Method bars

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| Section title "Three methods. One blended range." | hardcoded ([report-visual.tsx:595](components/exitiq/report-visual.tsx#L595)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Method 0 name "SDE × Industry Multiple" | `m.name` | `data.valuation.methods[0].name` | Y — hardcoded in array literal ([report-transform.ts:623](lib/assessment/report-transform.ts#L623)) | n/a | n/a | n/a |
| Method 0 weight "Primary" | `m.weight` | `data.valuation.methods[0].weight` | Y — hardcoded ([report-transform.ts:624](lib/assessment/report-transform.ts#L624)) | n/a | n/a | n/a |
| Method 0 lo/hi `$K` | `fmt$K(m.lo)`, `fmt$K(m.hi)` ([report-visual.tsx:536](components/exitiq/report-visual.tsx#L536)) | `data.valuation.methods[0].lo/hi` | Y — `sdeMid × industry.sdeMultiple[0/1]` ([report-transform.ts:615–616](lib/assessment/report-transform.ts#L615-L616)) | `stage1.industry`, `stage1.sde` | n/a | Derived |
| Method 0 tooltip note | `m.note` ([report-visual.tsx:568](components/exitiq/report-visual.tsx#L568)) | `data.valuation.methods[0].note` | Y — template string with `fmt(sdeMid)` and multiples ([report-transform.ts:627](lib/assessment/report-transform.ts#L627)) | Same | n/a | Derived |
| Method 1 name "Revenue Multiple", weight "Secondary", lo/hi | array literal | `data.valuation.methods[1]` | Y — `revMid × industry.revenueMultiple[0/1]` ([report-transform.ts:617–618](lib/assessment/report-transform.ts#L617-L618)) | `stage1.industry`, `stage1.revenue` | n/a | Derived |
| Method 2 name "Asset Floor", weight "Reference" | array literal | `data.valuation.methods[2]` | Y — `revMid × 0.25` ([report-transform.ts:619](lib/assessment/report-transform.ts#L619)) | `stage1.revenue` | n/a | Derived |

### Blended-range card (right column)

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| "Recommended Listing Range" heading | hardcoded ([report-visual.tsx:617](components/exitiq/report-visual.tsx#L617)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Big lo / hi numbers | `fmt$K(valuation.lo)` / `fmt$K(valuation.hi)` ([report-visual.tsx:630, 643](components/exitiq/report-visual.tsx#L630)) | `data.valuation.lo/hi` | Y — `getValuationRange(s1)` ([scoring.ts:187–208](lib/assessment/scoring.ts#L187-L208)) | `stage1.industry`, `stage1.revenue`, `stage1.sde` | n/a | Derived |
| Midpoint | `fmt$K(valuation.mid)` ([report-visual.tsx:647](components/exitiq/report-visual.tsx#L647)) | `data.valuation.mid` | Y — `(lo+hi)/2` | Same as lo/hi | n/a | Derived |
| Spread-drivers list ("Owner dependency", "Documentation completeness", "Lease position") | hardcoded array `[{v, drag}…]` ([report-visual.tsx:656–660](components/exitiq/report-visual.tsx#L656-L660)) | n/a | N — ⚠️ HARDCODED (does not key off the seller's actual answers) | ⚠️ HARDCODED | n/a | n/a |
| Drag labels ("Compresses to low ×", "Discounts multiple", "Hard haircut at table") | hardcoded ([report-visual.tsx:656–660](components/exitiq/report-visual.tsx#L656-L660)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |

### Valuation prose

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| Valuation Analysis paragraph(s) | `prose["Valuation Analysis"]` | parsed from `reportMd` | Y — LLM under `## Valuation Analysis` ([prompts.ts:398](lib/ai/prompts.ts#L398)) | n/a | `POST /api/assessment/generate` | `assessment_reports.report_md` |

---

## §03 SBA 7(a) Eligibility (CONDITIONAL — renders only when `data.sba.eligible`)

### Conditional gate

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| Section presence | `if (!sba.eligible) return null` ([report-visual.tsx:733](components/exitiq/report-visual.tsx#L733)) and gated again in `FullReportVisual` ([report-visual.tsx:2178](components/exitiq/report-visual.tsx#L2178)) | `data.sba.eligible` | Y — `isSBAEligible(s1)` (see Buyer Accessibility row) | `stage1.industry`, `stage1.employees`, `stage1.revenue` | n/a | Derived; also persisted as `assessment_sessions.sba_eligible` |

### Approval stamp + headline

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| Stamp text "SBA / Eligible / 7(a) · Bankable" | hardcoded ([report-visual.tsx:770–800](components/exitiq/report-visual.tsx#L770-L800)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Headline "A qualified buyer can close this with $X down" | `fmt$K(sba.downPayment)` ([report-visual.tsx:819](components/exitiq/report-visual.tsx#L819)) | `data.sba.downPayment` | Y — `loanAmount × 0.1` in `computeSBASnapshot` ([sba.ts:48](lib/assessment/sba.ts#L48)) | `stage1.industry`, `stage1.revenue`, `stage1.sde` (via `getValuationRange`) | n/a | Derived |
| Subhead "DSCR × passes lender underwriting today" | `sba.dscr` ([report-visual.tsx:832](components/exitiq/report-visual.tsx#L832)) | `data.sba.dscr` | Y — `sdeMid / (monthlyPayment × 12)`, rounded to 1 decimal ([report-transform.ts:647–648](lib/assessment/report-transform.ts#L647-L648)) | Derived from `stage1.sde` + loan calc | n/a | Derived |

### Stat cards

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| Down payment ($, label "Down payment") | `fmt$K(sba.downPayment)` ([report-visual.tsx:837](components/exitiq/report-visual.tsx#L837)) | `data.sba.downPayment` | Y — same as above | Same | n/a | Derived |
| Down-payment-as-% of loan sub | `Math.round((sba.downPayment / sba.loan) * 100) + "% of loan"` ([report-visual.tsx:838](components/exitiq/report-visual.tsx#L838)) | inline calc on `sba.downPayment / sba.loan` | Y — render-time math | Same | n/a | Derived |
| Monthly payment ($/mo) | `fmt$K(sba.monthlyPayment) + "/mo"` ([report-visual.tsx:843](components/exitiq/report-visual.tsx#L843)) | `data.sba.monthlyPayment` | Y — amortized at 10.5%/yr over 120 months in `calcMonthlyPayment` ([sba.ts:13–20](lib/assessment/sba.ts#L13-L20)) | `stage1` via `getValuationRange` | n/a | Derived |
| Term + APR sub ("10yr · 10.5% APR") | `sba.term` and `sba.apr` ([report-visual.tsx:844](components/exitiq/report-visual.tsx#L844)) | `data.sba.term`, `data.sba.apr` | Y — ⚠️ HARDCODED constants `term: 10`, `apr: 10.5` ([report-transform.ts:767–768](lib/assessment/report-transform.ts#L767-L768)) | n/a | n/a | ⚠️ HARDCODED |
| DSCR value | `sba.dscr + "×"` ([report-visual.tsx:849](components/exitiq/report-visual.tsx#L849)) | `data.sba.dscr` | Y — see above | Same | n/a | Derived |
| DSCR floor sub ("Floor 1.25× — well above") | `sba.dscrFloor` ([report-visual.tsx:850](components/exitiq/report-visual.tsx#L850)) | `data.sba.dscrFloor` | Y — ⚠️ HARDCODED `1.25` ([report-transform.ts:766](lib/assessment/report-transform.ts#L766)) | n/a | n/a | ⚠️ HARDCODED |
| Loan amount $ | `fmt$K(sba.loan)` ([report-visual.tsx:853](components/exitiq/report-visual.tsx#L853)) | `data.sba.loan` | Y — `min(valuationMid × 0.9, 5_000_000)` ([sba.ts:47](lib/assessment/sba.ts#L47)) | `stage1` via `getValuationRange` | n/a | Derived |
| Loan-amount sub ("Underwritable today") | hardcoded ([report-visual.tsx:853](components/exitiq/report-visual.tsx#L853)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Card labels ("Down payment", "Monthly payment", "DSCR", "Loan amount") | hardcoded ([report-visual.tsx:836–853](components/exitiq/report-visual.tsx#L836-L853)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| SBA prose | `prose["SBA 7(a) Eligibility"]` | parsed from `reportMd` | Y — LLM | n/a | `POST /api/assessment/generate` | `assessment_reports.report_md` |

---

## §04 Transferability Score

### Gauge + toggle

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| Current score number | `transferability.current` ([report-visual.tsx:880, 933](components/exitiq/report-visual.tsx#L880)) | `data.transferability.current` | Y — `opScore = scoreResult.dimensions.find(d=>d.key==="operational")?.score ?? 38` ([report-transform.ts:651–652](lib/assessment/report-transform.ts#L651-L652)) | (Operational Independence dimension — see §01 subscores) | n/a | Derived |
| Target score (after fix) | `transferability.target` ([report-visual.tsx:880](components/exitiq/report-visual.tsx#L880)) | `data.transferability.target` | Y — `Math.min(opScore + 24, 72)` ([report-transform.ts:653](lib/assessment/report-transform.ts#L653)) — ⚠️ hardcoded +24 / clip 72 | n/a | n/a | Derived (with hardcoded delta) |
| Gauge stroke color (red/peach/mint via thresholds <45, <65, ≥65) | `color` ([report-visual.tsx:884](components/exitiq/report-visual.tsx#L884)) | local derived constant | Y — threshold ladder | n/a | n/a | Derived |
| Toggle labels "Today" / "If you fix it" | hardcoded ([report-visual.tsx:975](components/exitiq/report-visual.tsx#L975)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Tooltip "Hover to compare" | hardcoded ([report-visual.tsx:995](components/exitiq/report-visual.tsx#L995)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |

### Narrative + fix card

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| Title default state ("Your primary drag …") | hardcoded ([report-visual.tsx:1017–1021](components/exitiq/report-visual.tsx#L1017-L1021)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Title hover state ("Above the 60-point threshold …") | hardcoded ([report-visual.tsx:1013](components/exitiq/report-visual.tsx#L1013)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Dollar-impact figure inserted into hover body | `fmt$K(t.dollarImpact)` ([report-visual.tsx:1034](components/exitiq/report-visual.tsx#L1034)) | `data.transferability.dollarImpact` | Y — `Math.round(sdeMid × (industry.sdeMultiple[1] − industry.sdeMultiple[0]) × 0.4 / 1000)` ([report-transform.ts:659, 778](lib/assessment/report-transform.ts#L659)) | `stage1.industry`, `stage1.sde` | n/a | Derived |
| Default body text ("Owner dependency, undocumented SOPs…") | hardcoded ([report-visual.tsx:1035](components/exitiq/report-visual.tsx#L1035)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Fix card body | `t.fix` ([report-visual.tsx:1060](components/exitiq/report-visual.tsx#L1060)) | `data.transferability.fix` | Y — first checklist item whose lowercase text contains `operations manual` or `owner`; fallback to hardcoded string ([report-transform.ts:654–657](lib/assessment/report-transform.ts#L654-L657)) | Checklist built from `generateChecklist` which keys off `s2.ownerDependency`, `s3.sops`, `s3.keyPersonRisk` etc. (only `s3.keyPersonRisk` is collected in current flow) | n/a | Derived from session + fallback hardcoded |
| Fix card eyebrow ("The deliverable that moves the number" / "The fix that gets you there") | hardcoded ([report-visual.tsx:1057](components/exitiq/report-visual.tsx#L1057)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Transferability prose | `prose["Transferability Score"]` | parsed from `reportMd` | Y — LLM | n/a | `POST /api/assessment/generate` | `assessment_reports.report_md` |

---

## §05 Value Drivers (3 cards)

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| Card rank badge "1/2/3" | `d.rank` ([report-visual.tsx:1114](components/exitiq/report-visual.tsx#L1114)) | `data.drivers[i].rank` | Y — assigned via `.map((d,i)=>({...d, rank:i+1}))` at end of `buildDrivers` | n/a | n/a | Derived |
| Driver title | `d.title` ([report-visual.tsx:1125](components/exitiq/report-visual.tsx#L1125)) | `data.drivers[i].title` | Y — `buildDrivers` ([report-transform.ts:190–298](lib/assessment/report-transform.ts#L190-L298)). Sources: `s1.years`, `s2.recurringRevenue`, `s2.ownerDependency`, `s3.sops`, `dimMap.market`, `dimMap.financial`, `sba.eligible`, `facilityType / realEstate`. Fallback: industry-profile driver | Q2 `years`, Q10 → `stage2.recurringRevenue`, ⚠️ `stage2.ownerDependency` MISSING, ⚠️ `stage3.sops` MISSING, Q3 `facilityType`, `stage1.industry`, `stage1.employees`, `stage1.revenue` | n/a | Mix of session + computed dimensions |
| Driver impact label ("+ceiling", "+0.3×–0.5× on multiple", etc.) | `d.impact` ([report-visual.tsx:1138](components/exitiq/report-visual.tsx#L1138)) | `data.drivers[i].impact` | Y — branch-specific template in `buildDrivers` (some embed `fmt(...)` of derived dollar amounts) | Same as above | n/a | Derived |
| Driver detail copy | `d.detail` ([report-visual.tsx:1153](components/exitiq/report-visual.tsx#L1153)) | `data.drivers[i].detail` | Y — long-form template strings in `buildDrivers` | Same as above | n/a | Derived |
| Section eyebrow "Value Drivers" + heading "What's working in your favor." | hardcoded ([report-visual.tsx:1267, 1278](components/exitiq/report-visual.tsx#L1267)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Drivers prose | `prose["Value Drivers"]` | parsed from `reportMd` | Y — LLM | n/a | `POST /api/assessment/generate` | `assessment_reports.report_md` |

---

## §06 Value Detractors (up to 3 cards)

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| Card rank | `d.rank` ([report-visual.tsx:1200](components/exitiq/report-visual.tsx#L1200)) | `data.detractors[i].rank` | Y — assigned 1..3 in `buildDetractors` | n/a | n/a | Derived |
| Detractor title | `d.title` ([report-visual.tsx:1211](components/exitiq/report-visual.tsx#L1211)) | `data.detractors[i].title` | Y — `buildDetractors` ([report-transform.ts:300–409](lib/assessment/report-transform.ts#L300-L409)). Branches off: `s2.ownerDependency`, `dimMap.operational`, `s2.customerConcentration`, `s3.legal`, `dimMap.dealReadiness`, `facilityType`, `dimMap.financial`, `dimMap.buyerAccess` | Q7 → `stage2.customerConcentration`, ⚠️ `stage2.ownerDependency` MISSING, ⚠️ `stage3.legal` MISSING, Q3 `facilityType`, Q6 `docReadiness` (drives `dealReadiness` dim) | `POST /api/assessment/session` | `stage2.customerConcentration`, `stage1.facilityType`, `stage1.docReadiness` (plus missing fields) |
| Detractor impact label | `d.impact` ([report-visual.tsx:1224](components/exitiq/report-visual.tsx#L1224)) | `data.detractors[i].impact` | Y — template strings (some embed `fmt(multipleSwing)`) | Same | n/a | Derived |
| Detractor detail | `d.detail` ([report-visual.tsx:1238](components/exitiq/report-visual.tsx#L1238)) | `data.detractors[i].detail` | Y — template strings | Same | n/a | Derived |
| "Fix:" line | `d.fix` ([report-visual.tsx:1252](components/exitiq/report-visual.tsx#L1252)) | `data.detractors[i].fix` | Y — first matching item from `generateChecklist` filtered by keywords, with hardcoded fallback strings | `generateChecklist` inputs (see §01 subscores rows for missing fields) | n/a | Derived |
| Section eyebrow "Value Detractors" + heading "What's costing you money today." | hardcoded ([report-visual.tsx:1291, 1302](components/exitiq/report-visual.tsx#L1291)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Detractors prose | `prose["Value Detractors"]` | parsed from `reportMd` | Y — LLM | n/a | `POST /api/assessment/generate` | `assessment_reports.report_md` |

---

## §07 Recommended Deal Structure

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| Section title "A two-layer structure to maximize price and the number of qualified buyers …" | hardcoded ([report-visual.tsx:1335–1336](components/exitiq/report-visual.tsx#L1335-L1336)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Primary layer name | `dealStructure.primary.name` ([report-visual.tsx:1340](components/exitiq/report-visual.tsx#L1340)) | `data.dealStructure.primary.name` | Y — ternary on `sba.eligible` ([report-transform.ts:667–675](lib/assessment/report-transform.ts#L667-L675)) | `sba.eligible` (derived from stage1) | n/a | Derived |
| Primary layer detail | `dealStructure.primary.detail` | same as above (string includes `fmt(Math.round(valMid * 0.13))` seller-note size) | Y — template string | `stage1.industry/revenue/sde` (for valMid) | n/a | Derived |
| Secondary layer name | `dealStructure.secondary.name` ([report-visual.tsx:1341](components/exitiq/report-visual.tsx#L1341)) | `data.dealStructure.secondary.name` | Y — ternary on `sellingTimeline === "1_2yr" \|\| "3plus"` AND `valMid > 500000` ([report-transform.ts:677–686](lib/assessment/report-transform.ts#L677-L686)) | `gate.sellingTimeline`, `valuation.mid` | n/a | Derived |
| Secondary layer detail | `dealStructure.secondary.detail` | same ternary | Y | Same | n/a | Derived |
| Layer eyebrow labels "Primary" / "Secondary" | hardcoded ([report-visual.tsx:1359](components/exitiq/report-visual.tsx#L1359)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Deal Structure prose | `prose["Recommended Deal Structure"]` | parsed from `reportMd` | Y — LLM | n/a | `POST /api/assessment/generate` | `assessment_reports.report_md` |

---

## §08 Growth Levers (3 entries)

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| Section title "Three angles a buyer can see — but you haven't shown them yet." | hardcoded ([report-visual.tsx:1405](components/exitiq/report-visual.tsx#L1405)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Framed paragraph | `growth.framed` ([report-visual.tsx:1408](components/exitiq/report-visual.tsx#L1408)) | `data.growth.framed` | Y — template using `industry.sdeMultiple[0]/[1]` ([report-transform.ts:663](lib/assessment/report-transform.ts#L663)) | `stage1.industry` | n/a | Derived |
| Lever 0–2 numbering "01/02/03" | render-time `0${i+1}` ([report-visual.tsx:1436](components/exitiq/report-visual.tsx#L1436)) | n/a | Y — render index | n/a | n/a | Derived |
| Lever title | `l.title` ([report-visual.tsx:1449](components/exitiq/report-visual.tsx#L1449)) | `data.growth.levers[i].title` | Y — `buildGrowthLevers` builds up to 3 ([report-transform.ts:411–453](lib/assessment/report-transform.ts#L411-L453)). Inputs: `s3.growthLevers`, `s1.years`, `s1.employees`. First item conditional on seller-stated lever | ⚠️ `stage3.growthLevers` MISSING (Q is in `STAGE3_QUESTIONS` but never asked in 10-q flow), Q2 `years`, Q8 `employees` | n/a | Derived |
| Lever detail | `l.detail` ([report-visual.tsx:1452](components/exitiq/report-visual.tsx#L1452)) | same | Y — template strings | Same | n/a | Derived |
| Growth Levers prose | `prose["Growth Levers"]` | parsed from `reportMd` | Y — LLM | n/a | `POST /api/assessment/generate` | `assessment_reports.report_md` |

---

## §09 Next Steps (3 cards)

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| Section header "Three actions. Execute in this order." + subhead | hardcoded ([report-visual.tsx:1598, 1601](components/exitiq/report-visual.tsx#L1598)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Card rank ("01/02/03") | render-time `0${s.rank}` ([report-visual.tsx:1501](components/exitiq/report-visual.tsx#L1501)) | `data.nextSteps[i].rank` | Y — assigned 1..3 in `buildNextSteps` | n/a | n/a | Derived |
| Priority chip ("Critical" / "High") | `s.priority` ([report-visual.tsx:1515](components/exitiq/report-visual.tsx#L1515)) | `data.nextSteps[i].priority` | Y — keyword matching on checklist item text inside `buildNextSteps` ([report-transform.ts:470–515](lib/assessment/report-transform.ts#L470-L515)) | `generateChecklist` output, which keys off all stage1/2/3 signals (see §01 subscore rows) | n/a | Derived |
| "When" label ("Week 1", "Month 1–2", etc.) | `s.when` ([report-visual.tsx:1525](components/exitiq/report-visual.tsx#L1525)) | `data.nextSteps[i].when` | Y — keyword branch in `buildNextSteps` | Same | n/a | Derived |
| Card title | `s.title` ([report-visual.tsx:1540](components/exitiq/report-visual.tsx#L1540)) | `data.nextSteps[i].title` | Y — top-3 items from `generateChecklist` after re-priority-sort | Same as above | n/a | Derived |
| Card detail copy | `s.detail` ([report-visual.tsx:1545](components/exitiq/report-visual.tsx#L1545)) | `data.nextSteps[i].detail` | N for content — ⚠️ HARDCODED template string ("Completing this step before going to market…") applied to every step ([report-transform.ts:509](lib/assessment/report-transform.ts#L509)) | n/a | n/a | ⚠️ HARDCODED |
| Impact line | `s.impact` ([report-visual.tsx:1574](components/exitiq/report-visual.tsx#L1574)) | `data.nextSteps[i].impact` | Y — keyword branch yields strings like "Unlocks every other step", "+swing midpoint shift" (with `fmt` for swing), etc. | Same checklist inputs | n/a | Derived |
| Next Steps prose | `prose["Next Steps"]` | parsed from `reportMd` | Y — LLM | n/a | `POST /api/assessment/generate` | `assessment_reports.report_md` |

---

## §10 Boardroom CTA (incl. roadmap preview)

### CTA copy + bullets

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| Eyebrow "Next: Scorta Boardroom" | hardcoded ([report-visual.tsx:1811](components/exitiq/report-visual.tsx#L1811)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Headline "Save this report. Start preparing for your exit." | hardcoded ([report-visual.tsx:1825](components/exitiq/report-visual.tsx#L1825)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Body paragraph | hardcoded ([report-visual.tsx:1837–1839](components/exitiq/report-visual.tsx#L1837-L1839)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Bullet list (4 items: Download PDF, Track 3 next steps, Re-run valuation, Connect docs) | hardcoded array ([report-visual.tsx:1842–1846](components/exitiq/report-visual.tsx#L1842-L1846)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Primary CTA button | hardcoded label `Authorize & continue to Boardroom`; click → `alert("Boardroom coming soon…")` ([report-visual.tsx:1869](components/exitiq/report-visual.tsx#L1869)) | n/a | N | ⚠️ HARDCODED | n/a — stubbed | n/a |
| "Free during private beta" pill | hardcoded ([report-visual.tsx:1913](components/exitiq/report-visual.tsx#L1913)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |

### Boardroom preview card (right side mock)

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| Eyebrow "Boardroom" + "Your exit roadmap" | hardcoded ([report-visual.tsx:1641, 1652](components/exitiq/report-visual.tsx#L1641)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| 3 step pills | `data.nextSteps.slice(0,3)` → `step.title` (truncated to 40 chars) ([report-visual.tsx:1617, 1685](components/exitiq/report-visual.tsx#L1617)) | `data.nextSteps` | Y — see §09 | Same | n/a | Derived |
| Step status pill ("Not started") | hardcoded literal ([report-visual.tsx:1696](components/exitiq/report-visual.tsx#L1696)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Step progress bar percentage | `pcts[i]` from local `[0,0,0]` array ([report-visual.tsx:1618, 1702](components/exitiq/report-visual.tsx#L1618)) | n/a | Y — ⚠️ HARDCODED zeros | n/a | n/a | ⚠️ HARDCODED |
| Footer composite progression "N → N+18" | inline `data.score.composite + 18` clipped to 90 ([report-visual.tsx:1726–1729](components/exitiq/report-visual.tsx#L1726-L1729)) | `data.score.composite` (plus hardcoded +18 / clip 90) | Y — ⚠️ partly HARDCODED (the +18 lift is invented, not modeled) | n/a | n/a | ⚠️ HARDCODED delta |

### Sticky CTA

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| "Save this report & continue to Boardroom" + subtitle | hardcoded ([report-visual.tsx:1988, 2000](components/exitiq/report-visual.tsx#L1988)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Authorize button | hardcoded; click → `alert("Boardroom coming soon.")` ([report-visual.tsx:2005](components/exitiq/report-visual.tsx#L2005)) | n/a | N | ⚠️ HARDCODED | n/a — stubbed | n/a |

---

## §∞ Footer

| Data Point | Render Field | State/Prop Path | Computed? | Collection Source | API Route / Action | DB Table.Column |
|------------|-------------|-----------------|-----------|-------------------|--------------------|-----------------|
| Disclaimer line "Scorta · ExitIQ Report · For informational purposes only…" | hardcoded ([report-visual.tsx:2199](components/exitiq/report-visual.tsx#L2199)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |
| Build tag "scorta.exitiq · v1.0" | hardcoded ([report-visual.tsx:2203](components/exitiq/report-visual.tsx#L2203)) | n/a | N | ⚠️ HARDCODED | n/a | n/a |

---

## Cross-cutting data flow summary

```
[UI Q1–Q10]
   answers: Record<string,string>            (answer key set in ANSWER_KEYS — lib/exitiq/data.ts)
       │
       ▼ submit (EmailGateModal completes gate.firstName/email/timeline)
[ExitIQApp.persistSession]                   (components/exitiq/ExitIQApp.tsx:438–463)
   { sessionId, stage1, stage2, stage3, gate, completedAt }
       │
       ▼ POST /api/assessment/session
[api/assessment/session/route.ts]            (validates with Zod; in after(): upserts assessment_sessions; sends welcome email)
       │
       ▼ POST /api/assessment/generate (client awaits prior POST then calls)
[api/assessment/generate/route.ts]
   db.query.assessmentSessions.findFirst()
       ├─→ buildReportData(s1Scored, gate.firstName, gate.sellingTimeline, s2, s3, s4)
       │       which calls computeScore + computeSBASnapshot + getValuationRange
       ├─→ buildReportPrompt(session, reportData)
       └─→ streamText(Anthropic Sonnet)
              onFinish: in after() → upsert assessment_reports.report_md
       │
       ▼ Sonnet stream (text/plain) returned to client → setReportMd in ExitIQApp; router pushes /report/[sessionId]
[app/report/[sessionId]/page.tsx]            (server component)
   db.query.assessmentSessions + assessmentReports
   mapStage1ForScoring(stage1)               (translates human labels → slugs)
   buildReportData(...)                       (re-derives all numbers — does NOT trust the DB score)
       │
       ▼
[FullReportVisual]                            (client; numbers from ReportData, prose parsed from reportMd)
```

Important: **the visible composite/score on the report is re-derived by `buildReportData` on every page render** — the `assessment_sessions.score` column stored by `/api/assessment/session` is never read by the report page. They can drift if scoring rules change after a session is persisted.

---

## Issues Found During Audit

| # | Layer | Data Point / Location | Issue Description | Severity |
|---|-------|-----------------------|-------------------|----------|
| 1 | Collection | `stage1.state` — not in `ANSWER_KEYS` ([lib/exitiq/data.ts:436–447](lib/exitiq/data.ts#L436)) but written as `state: answers.state ?? ""` in `persistSession` ([ExitIQApp.tsx:446](components/exitiq/ExitIQApp.tsx#L446)) | The 10-question flow never asks for state, so `stage1.state` is always `""`. `scoreMarket` calls `getStateMarketBonus(s1.state ?? "")` ([scoring.ts:108](lib/assessment/scoring.ts#L108)) which returns 0. Market Positioning subscore loses its geographic component for every user. | High |
| 2 | Collection vs Scoring | `stage2.ownerDependency`, `stage2.revenueTrend`, `stage2.reasonForSelling`, `stage3.sops`, `stage3.legal`, `stage3.growthLevers` | Referenced by `computeScore`, `generateFlags`, `generateChecklist`, `buildDrivers`, `buildDetractors`, `buildGrowthLevers` — but the 10-question flow only persists `stage2.customerConcentration`, `stage2.recurringRevenue`, `stage3.keyPersonRisk`. The other Stage2/3 fields fall to silent defaults (e.g. `legal` defaults to `no_issues` → score 88; `ownerDependency` defaults to 35; `sops` defaults to 38). The "primary drag" callout / transferability narrative is therefore mostly fed by hidden defaults, not user signals. | High |
| 3 | Transform | `mapStage1ForScoring` ([lib/assessment/transform.ts:70–79](lib/assessment/transform.ts#L70-L79)) does not enumerate `facilityType` or `docReadiness` | Returned object has only `industry/years/revenue/sde/employees/state`. `facilityType` and `docReadiness` are absent from the return — they survive only because `s1Raw` is spread into `s1Scored` in [page.tsx:59](app/report/[sessionId]/page.tsx#L59) and [generate/route.ts:122–123](app/api/assessment/generate/route.ts#L122-L123) **before** `mapStage1ForScoring` is called. Anywhere `mapStage1ForScoring` is called directly with a stage1 object (e.g. `api/assessment/session/route.ts:90`) the returned object drops `facilityType` and `docReadiness`. `scoreDealReadiness` then falls back to defaults. | High |
| 4 | API race | `/api/assessment/session` responds 200 **before** `after()` runs the DB upsert ([api/assessment/session/route.ts:212–216](app/api/assessment/session/route.ts#L212-L216)); the client then immediately POSTs `/api/assessment/generate` which `findFirst`s the session ([generate/route.ts:39](app/api/assessment/generate/route.ts#L39)) | Documented in code: a fast client can hit a 404 "not_found" path on the generate call. | Medium |
| 5 | Render | "Boardroom" CTA buttons (main + sticky) | `onClick` only fires `alert("Boardroom coming soon …")` ([report-visual.tsx:1869, 2005](components/exitiq/report-visual.tsx#L1869)). Visible primary CTA is non-functional. | Medium |
| 6 | Render | Composite "improvement" projection `data.score.composite + 18` clipped to 90 in Boardroom preview footer ([report-visual.tsx:1726–1729](components/exitiq/report-visual.tsx#L1726-L1729)) | Hardcoded delta, displayed as if it were modeled. Identical visual treatment to the real composite. | Medium |
| 7 | Render | Top-bar "Live · {generated}" + hero "Generated just now" | `data.meta.generated` is the literal string `"Generated just now"` ([report-transform.ts:737](lib/assessment/report-transform.ts#L737)). Never reads `assessment_reports.created_at`. Misleading for a returning visitor. | Medium |
| 8 | Render | Valuation spread-drivers list ("Owner dependency / Documentation completeness / Lease position") | Static array ([report-visual.tsx:656–660](components/exitiq/report-visual.tsx#L656-L660)). Not keyed off the seller's actual scoring weak points; shown regardless of what is actually dragging value. | Medium |
| 9 | Render | Transferability target = `min(opScore + 24, 72)` ([report-transform.ts:653](lib/assessment/report-transform.ts#L653)) | Hardcoded +24 lift. The "If you fix it" gauge value is not derived from any modeled remediation effect. | Medium |
| 10 | Render | SBA card `term: 10`, `apr: 10.5`, `dscrFloor: 1.25` ([report-transform.ts:766–768](lib/assessment/report-transform.ts#L766-L768)) and corresponding sub-labels in cards | Hardcoded constants. If SBA terms change these silently misrepresent today's lender environment. | Low |
| 11 | Computation duplication | `SDE_MIDS` / `REV_MIDS` declared in [report-transform.ts:122–131](lib/assessment/report-transform.ts#L122-L131), `SDE_MIDPOINTS` / `REVENUE_MIDPOINTS` in [scoring.ts:35–44](lib/assessment/scoring.ts#L35-L44), and again as `SDE_MIDPOINTS` in [prompts.ts:131–139](lib/ai/prompts.ts#L131-L139) | ⚠️ DUPLICATE constant tables. If one is updated and another isn't, the visual range and the LLM prose will disagree. | Medium |
| 12 | Computation duplication | `REVENUE_LABELS` / `SDE_LABELS` / `EMPLOYEE_LABELS` / `TIMELINE_LABELS` / various option labels appear in [report-transform.ts:133–172](lib/assessment/report-transform.ts#L133-L172), [prompts.ts:11–129](lib/ai/prompts.ts#L11-L129), and the source-of-truth question definitions in [lib/assessment/questions.ts](lib/assessment/questions.ts) | ⚠️ DUPLICATE label maps. Each is a re-implementation rather than a re-export, so renaming an answer in `questions.ts` will silently leave stale labels in the report. | Medium |
| 13 | Storage / Cache | `/api/assessment/generate` includes a `bypassCache` block keyed on `FIX_DEPLOY_DATE = 2026-05-12` ([generate/route.ts:84–98](app/api/assessment/generate/route.ts#L84-L98)) | Stale-cache shim with a hardcoded date constant living in a route handler. Will keep paying the regeneration cost forever for any session created after that date that already has a cached report — and will never re-fire if a *new* scoring fix lands without updating the constant. | Low |
| 14 | Persistence | `assessment_sessions.score` is written by `/api/assessment/session` at completion, but **never read** by `/app/report/[sessionId]/page.tsx` — the composite is recomputed via `buildReportData` on every render | Either column is dead weight or a snapshot that can silently diverge from the rendered number. Both interpretations are wrong; pick one. | Low |
| 15 | Render | Section 7 (Deal Structure) "Primary"/"Secondary" eyebrow labels and 2-card layout ([report-visual.tsx:1339–1377](components/exitiq/report-visual.tsx#L1339-L1377)) | The two cards are passed via a hardcoded array literal that maps `dealStructure.primary` and `.secondary`. If the data model ever needs a third "tertiary" layer, the render layer will silently drop it. | Low |
| 16 | Render | Hero callout `data.detractors[0].fix` ([report-visual.tsx:401](components/exitiq/report-visual.tsx#L401)) only renders if `detractors[0]` exists | When `buildDetractors` returns zero rows (all dimensions ≥ thresholds), the "single highest-leverage move" card silently disappears with no fallback content — even though every other section keeps rendering. | Low |
| 17 | LLM contract | `parseNarrativeSections` keys off exact `## ` headers ([report-visual.tsx:75–86](components/exitiq/report-visual.tsx#L75-L86)); the canonical list is duplicated in three places: prompt writing-instructions, prompt scaffold, server `onFinish` audit, and client `useEffect` audit ([prompts.ts:374–383, 395–421](lib/ai/prompts.ts#L374), [generate/route.ts:195–199](app/api/assessment/generate/route.ts#L195), [report-visual.tsx:2144–2148](components/exitiq/report-visual.tsx#L2144)) | ⚠️ DUPLICATE canonical-section list across four sites. The Sonnet model occasionally drifts on heading capitalization/wording; any divergence silently shows "Analysis not available" in the corresponding card. | Medium |
| 18 | LLM contract | `## SBA 7(a) Eligibility` prose key | When `data.sba.eligible === false`, the SBA section is not rendered ([report-visual.tsx:733, 2178](components/exitiq/report-visual.tsx#L733)), but the LLM is still prompted to produce that section under the same heading. The prose generated for it is parsed and orphaned — never displayed. | Low |
| 19 | Render | Boardroom preview step status hardcoded "Not started" + `pcts = [0,0,0]` ([report-visual.tsx:1696, 1618](components/exitiq/report-visual.tsx#L1696)) | Implies the preview wires to user state; nothing of the sort exists today. | Low |
| 20 | Type model | `Stage1Answers.years: number` ([lib/assessment/session.ts:5](lib/assessment/session.ts#L5)) vs the Zod schema accepting `number \| string` ([session/route.ts:20](app/api/assessment/session/route.ts#L20)) | The JSONB column may hold either a number or a numeric-string for `years`. `s1.years ?? 0` works for both at render, but `s1.years <= 2` etc. in `scoreMarket` ([scoring.ts:101–106](lib/assessment/scoring.ts#L101-L106)) silently misbehaves on strings. | Low |

---

## Completion Checklist

- [x] Every report section has a completed table — no section skipped
- [x] Every row has all 7 columns filled or explicitly flagged
- [x] All `⚠️` flags have a brief description in the cell
- [x] Issues log is populated
- [x] No code was changed during this audit
