# exitIQ — Logging & Instrumentation Reference

> Generated 2026-05-12. Describes every trace event in `.exitiq-debug/workflow.ndjson`,
> the details each event carries, and which stage of the pipeline it covers.

---

## How to activate

Add to `.env.local`:

```
EXITIQ_WORKFLOW_LOG=true
NEXT_PUBLIC_EXITIQ_WORKFLOW_LOG=true
```

Trace events append to `.exitiq-debug/workflow.ndjson` (gitignored). Each line is a
self-contained JSON object. The file is never written on Vercel (`VERCEL=1` guard).

```bash
# Pretty-print the full trace for one session
cat .exitiq-debug/workflow.ndjson | jq 'select(.sessionId == "<sid>")'

# Show only phase names in order
cat .exitiq-debug/workflow.ndjson | jq -r '.phase'

# Find any event where sectionCountOk is false
cat .exitiq-debug/workflow.ndjson | jq 'select(.detail.sectionCountOk == false)'
```

Every event has these top-level fields:

| Field | Type | Description |
|---|---|---|
| `ts` | number | Unix ms timestamp |
| `iso` | string | ISO-8601 timestamp |
| `src` | `"server"` \| `"client"` | Where the event was emitted |
| `phase` | string | Dot-namespaced event name (see below) |
| `sessionId` | string | The session being traced (when known) |
| `surface` | string | `"server"` — origin layer (server events only) |
| `origin` | string | File or function that emitted the event |
| `detail` | object | Phase-specific payload (see below) |

---

## Pipeline stages and events

Events are listed in the order they appear in a successful run.

---

### Stage 1 — Email Gate Submit (`client`)

#### `client.email_gate_submit_start`
Fired immediately when the user submits the email gate form.

| Field | Description |
|---|---|
| `emailPresent` | boolean — confirms an email address was provided |
| `timelineSlug` | translated selling timeline slug (e.g. `"6_12mo"`) |
| `tag` | computed segment tag (`"hot_seller"`, `"warm_explorer"`, etc.) |
| `answersCount` | number of answers collected (should be 10) |

---

#### `client.answers_snapshot`
All 10 raw answer slugs as the user submitted them. Lets you fully reconstruct the
pipeline input from the log without touching the database.

| Field | Description |
|---|---|
| `detail.industry` | UI answer slug (e.g. `"Restaurant"`) |
| `detail.yearsLabel` | Human-readable years label (e.g. `"5 – 10 years"`) |
| `detail.revenue` | Revenue band label |
| `detail.sde` | SDE band label |
| `detail.employees` | Employee count label |
| `detail.facilityType` | Facility type slug |
| `detail.docReadiness` | Documentation readiness slug |
| `detail.customerConc` | Raw UI answer (e.g. `"concentrated"`) — pre-translation |
| `detail.keyMan` | Raw UI answer (e.g. `"3"`) — pre-translation |
| `detail.recurringRev` | Raw UI answer (e.g. `"medium_high"`) — pre-translation |

---

#### `client.persist_session_payload_shape`
Confirms the Signal Mapping Fix is applied and shows exactly what values will be sent
to stage2 and stage3. The key diagnostic event for signal routing.

| Field | Description |
|---|---|
| `detail.signalMappingApplied` | `true` — confirms fix is active |
| `detail.stage1Fields` | Array of field names sent in stage1 (8 clean fields, no extras) |
| `detail.stage2` | `{ customerConcentration, recurringRevenue }` — translated scoring slugs |
| `detail.stage3` | `{ keyPersonRisk }` — translated scoring slug |
| `detail.unmappedSignals` | Any source answers that had no translation entry (should all be `null`) |

**What to look for:** If `detail.stage2.customerConcentration` is `null`, the user's
`customerConc` answer didn't match any entry in `CUSTOMER_CONC_MAP`. Check
`detail.unmappedSignals.customerConc` to see the raw value that failed.

---

### Stage 2 — Session Persistence (`client` → `server`)

#### `client.persist_session_http_start`
Fired when the `POST /api/assessment/session` fetch begins.

| Field | Description |
|---|---|
| `isCompletion` | `true` — this call includes `completedAt` |
| `hasGate` | boolean |
| `emailPresent` | boolean |
| `tag` | segment tag |

---

#### `client.persist_session_http_done`
Fired when the `POST /api/assessment/session` response arrives.

| Field | Description |
|---|---|
| `ok` | HTTP response ok flag |
| `status` | HTTP status code |

---

#### `api.session.post_received`
Server received the session POST. Fired synchronously before `after()`.

| Field | Description |
|---|---|
| `isCompletion` | boolean |
| `hasStage1` / `hasGate` | boolean |
| `gate` | Redacted gate object (presence flags + sellingTimeline + tag, no PII) |
| `score` | Computed composite score (if `completedAt` present) |
| `sbaEligible` | Computed SBA eligibility flag |
| `hasStage2` / `hasStage3` / `hasStage4` | boolean — confirms stages arrived |
| `s2` | Full stage2 slug values (e.g. `{ customerConcentration: "25_50" }`) |
| `s3` | Full stage3 slug values (e.g. `{ keyPersonRisk: "one" }`) |

**What to look for:** `hasStage2: false` + `s2: {}` means the client did not send
stage2. Combined with `client.persist_session_payload_shape`, this confirms whether
the problem is in the client or the API.

---

#### `api.session.http_200_sent_before_after`
HTTP 200 returned to client **before** the DB upsert runs. Documents the race window.

| Field | Description |
|---|---|
| `note` | `"DB upsert runs in after() — generate race window starts now"` |

> This event marks the start of the race window: the client may call
> `/api/assessment/generate` before the DB write completes.

---

#### `api.session.db_upsert_ok_in_after`
DB upsert succeeded inside `after()`. Confirms what was actually committed.

| Field | Description |
|---|---|
| `score` | Score written to DB |
| `sbaEligible` | SBA flag written |
| `isCompletion` | boolean |
| `wroteStage2` / `wroteStage3` | boolean — confirms stages were included in upsert |
| `s2` | Stage2 values as stored |
| `s3` | Stage3 values as stored |

---

#### `api.session.db_upsert_failed_in_after`
DB upsert failed. Session was not persisted.

| Field | Description |
|---|---|
| `error` | Error message string |

---

#### `api.session.email_send_started` / `api.session.email_send_ok` / `api.session.email_send_failed`
Welcome email lifecycle events, only on completion calls.

| Field | Description |
|---|---|
| `tag` | Segment tag used to select email template |
| `error` | (failed only) Error message |

---

### Stage 3 — Report Generation (`client` → `server`)

#### `client.request_generate_start`
Client begins the `POST /api/assessment/generate` fetch.

---

#### `client.request_generate_stream_response_received`
Server responded with a streaming body. Client is about to read it.

| Field | Description |
|---|---|
| `status` | HTTP status code |

---

#### `api.generate.post_received`
Generate endpoint received the request.

---

#### `api.generate.session_not_found`
Session missing from DB. Almost always the session/after() race: client called
`/generate` before the DB upsert in `after()` completed.

| Field | Description |
|---|---|
| `note` | Race condition explanation |

---

#### `api.generate.session_loaded`
Session fetched from DB successfully.

| Field | Description |
|---|---|
| `hasStage1` / `hasGate` | boolean |
| `hasStage2` / `hasStage3` / `hasStage4` | boolean |
| `s2` | Full stage2 slug values from DB |
| `s3` | Full stage3 slug values from DB |

**The most important verification point for the Signal Mapping Fix.** After applying
the fix, `s2.customerConcentration` and `s2.recurringRevenue` should be non-null
scoring slugs. If they are `null` or the object is empty, the signals never reached
the DB.

---

#### `api.generate.cache_hit`
A valid cached report was found and returned — no LLM call made.

| Field | Description |
|---|---|
| `model` | Model that generated the cached report |
| `reportMdLength` | Character count of cached markdown |
| `reportAge` | ISO timestamp of when the cached report was created |

---

#### `api.generate.cache_bypassed_stale_pre_fix`
A cached report was found but discarded because it predates the Signal Mapping Fix.
A fresh generation will proceed.

| Field | Description |
|---|---|
| `reportAge` | ISO timestamp of the stale cached report |
| `fixDeployDate` | `"2026-05-12T00:00:00Z"` |
| `reason` | Human-readable explanation |
| `s2Signals` | The real stage2 values that will be used for regeneration |

---

#### `api.generate.stage1_scored`
Result of `mapStage1ForScoring` — shows the label→slug translation for all stage1 fields.

| Field | Description |
|---|---|
| `raw` | Input labels (e.g. `{ industry: "Restaurant", revenue: "$500K – $1M" }`) |
| `scored` | Output slugs (e.g. `{ industry: "food_bev", revenue: "500_1m" }`) |
| `unmappedFields` | Fields present in raw but `null` in scored — translation miss |
| `yearsDefaulted` | `true` when `stage1.years` was `null`/`undefined` and defaulted to `5` — affects SDE multiple and driver scoring |

**What to look for:** Any field in `unmappedFields` means `mapStage1ForScoring` had
no entry for that label. The scoring model will receive `null` for that field and
fall back to the default band, silently producing wrong scores. If `yearsDefaulted: true`,
the tenure signal is absent from the DB row — check `client.persist_session_payload_shape`
to confirm what years value was submitted.

---

#### `buildReportData.input`
Called from `lib/assessment/report-transform.ts`. Captures the full input to the
single computation that drives both the LLM prompt and the visual renderer.

| Field | Description |
|---|---|
| `firstNameLen` | Length of first name (not PII) |
| `sellingTimeline` | Timeline slug |
| `s1` | All stage1 scored fields |
| `s2` / `s3` / `s4` | Stage values with actual slugs |
| `hasStage2` / `hasStage3` / `hasStage4` | boolean summary |

---

#### `buildReportData.output`
All computed outputs from `buildReportData`. The frozen values that the LLM prompt
and visual renderer both consume.

| Field | Description |
|---|---|
| `composite` | Overall Exit IQ score (0–100) |
| `grade` | Letter grade (`A`/`B`/`C`/`D`) |
| `distressed` | boolean — triggers distressed-business narrative |
| `dimensions` | All 5 subscore values: `{ financial, operational, market, transferability, growth }` |
| `valuationK` | `{ lo, mid, hi }` in thousands |
| `teaserK` | Pre-gate teaser range `{ lo, hi }` |
| `sbaEligible` | boolean |
| `sba` | `{ loan, dscr, dscrFloor }` |
| `driverTitles` | Top 3 value driver titles |
| `detractorTitles` | Top 3 detractor titles |
| `growthLeverTitles` | Top 3 growth lever titles |
| `nextStepTitles` | Top 3 next step titles |
| `teaserBridgeNote` | Named signals explaining teaser vs report range difference |

**What to look for:**
- `dimensions.operational` near 0 when `keyPersonRisk` should show risk → stage3 signal didn't reach scoring
- `driverTitles` / `detractorTitles` all showing generic defaults → stage2/3 signals empty

---

#### `buildReportPrompt.built`
LLM prompt constructed from the frozen `ReportData`.

| Field | Description |
|---|---|
| `promptChars` | Total character count of prompt sent to Claude |
| `sectionHeaderCount` | Number of `## ` headers in the writing instructions (should be 9) |
| `sectionHeaderTitles` | Actual `## ` strings from the prompt — lets you catch a header typo before the LLM sees it |

**What to look for:** If `sectionHeaderCount !== 9` or a title in `sectionHeaderTitles` doesn't match
one of the 9 canonical strings, the LLM will receive incorrect instructions and produce unmatched output.

---

#### `api.generate.streamText_starting`
Sonnet stream is about to begin.

| Field | Description |
|---|---|
| `model` | Model slug (e.g. `claude-sonnet-4-5`) |

---

#### `api.generate.stream_finished`
Sonnet stream completed. Key quality check.

| Field | Description |
|---|---|
| `model` | Model slug |
| `durationMs` | Total generation time in milliseconds |
| `textLength` | Character count of generated markdown |
| `isEmpty` | `true` if stream returned no content — stream error |
| `sectionCount` | Number of `## ` section headers in the output |
| `expectedSections` | `9` |
| `sectionCountOk` | `sectionCount === 9` — `false` means LLM produced malformed output |
| `sectionTitles` | Actual section header strings found in the output — catches wrong headers even when count === 9 |
| `missingSections` | Canonical headers absent from the output — each entry will show "Analysis not available" on the report page |
| `extraSections` | Headers present in output that don't match any canonical name — LLM used a different heading style |

**What to look for:** `sectionCountOk: true` but `missingSections` non-empty means the LLM produced
a different header for that section (e.g. `## SBA Eligibility` instead of `## SBA 7(a) Eligibility`).
The section count looks right but the parser won't map it. Cross-reference `extraSections` to find
the mangled header.

---

#### `api.generate.report_md_persisted_in_after`
Report markdown written to `assessment_reports` table.

| Field | Description |
|---|---|
| `textLength` | Confirms the full text was persisted |

---

#### `api.generate.persist_failed_in_after`
DB write of report failed. Report was generated but not saved.

| Field | Description |
|---|---|
| `error` | Error message |

---

### Stage 4 — CinematicLoader (`client`)

#### `client.generate_stream_reader_opened`
Client began reading the streaming response body.

---

#### `client.generate_stream_reader_closed`
Client finished reading the stream.

| Field | Description |
|---|---|
| `textLength` | Total characters accumulated |
| `isEmpty` | `true` if stream returned nothing — prevents silent failure |
| `durationMs` | Time from stream open to close |
| `sectionCount` | Number of `## ` headers counted in the received text |
| `sectionTitles` | Actual section header strings received — client-side mirror of `api.generate.stream_finished.sectionTitles` |

---

#### `client.request_generate_null_response`
`requestGenerate` returned `null` — the request failed entirely (non-ok HTTP status or network
error). The specific error was already logged as `client.request_generate_error` or
`client.request_generate_network_error` by `lib/assessment/api.ts`.

| Field | Description |
|---|---|
| `note` | Human-readable pointer to the upstream error event |

---

#### `client.request_generate_no_body`
`requestGenerate` returned a successful response but the body stream was absent — unexpected
server-side behavior (distinct from a failed request, which fires `client.request_generate_null_response`).

---

#### `client.cinematic_loader_mounted`
`CinematicLoader` component mounted. Fires once.

| Field | Description |
|---|---|
| `mountTs` | Unix ms mount timestamp — used to compute subsequent wait durations |

---

#### `client.cinematic_loader_ai_stream_ready`
The Sonnet stream finished and `aiReady` flipped to `true`.

| Field | Description |
|---|---|
| `streamWaitMs` | Milliseconds from loader mount to stream completion |
| `phasesAlreadyComplete` | `true` if the 42s phase animation already finished — navigation fires immediately |
| `willNavigateImmediately` | Synonym for `phasesAlreadyComplete` |

---

#### `client.cinematic_loader_complete_happy_path`
Both the phase animation and the AI stream finished — navigating to the report page.

| Field | Description |
|---|---|
| `totalElapsedMs` | Total time from loader mount to navigation |
| `reportMdPresent` | `true` — confirms report markdown exists before navigation |

---

#### `client.cinematic_loader_complete_failsafe_90s`
Navigation fired by the 90-second fallback. Stream did not resolve in time.

| Field | Description |
|---|---|
| `totalElapsedMs` | Should be ≈ 90000 |
| `phasesComplete` | boolean |
| `streamReady` | `false` — stream never resolved |
| `note` | `"90s failsafe fired — stream did not resolve in time"` |

---

### Stage 5 — Report Page Load (`server` + `client`)

#### `page.report.request_start`
Report page server component began executing.

---

#### `page.report.db_fetch_done`
Parallel DB fetch of session + report completed.

| Field | Description |
|---|---|
| `sessionFound` | boolean |
| `hasGateFirstName` | boolean — if false, page will redirect to `/` |
| `reportFound` | boolean |
| `reportMdChars` | Character count of stored report markdown |
| `hasStage2` / `hasStage3` | boolean |
| `s2` / `s3` | Actual stage values from DB |

---

#### `page.report.redirect_missing_gate`
Session has no gate data — user is redirected to `/`.

---

#### `page.report.stage1_scored`
`mapStage1ForScoring` result on the report page. Should match `api.generate.stage1_scored`
exactly — any divergence means the two computations are using different inputs.

| Field | Description |
|---|---|
| `raw` | Input labels |
| `scored` | Output slugs |
| `yearsDefaulted` | `true` when `stage1.years` was absent from DB and defaulted to `5` |

---

#### `buildReportData.input` / `buildReportData.output`
Same events as in Stage 3 (generate route), but emitted from the report page with
`origin: "page.report"`. Lets you compare the page's computation against the generate
route's computation — they should produce identical outputs.

---

#### `page.report.rendering_full_report_visual`
`buildReportData` is done; `FullReportVisual` JSX is about to be returned.

| Field | Description |
|---|---|
| `reportMdPassedToClientChars` | Characters of `reportMd` handed to the component |
| `reportMdIsEmpty` | `true` if no report markdown — visual will show placeholders |
| `visualComposite` | Composite score |
| `grade` | Letter grade |
| `valuationK` | `{ lo, mid, hi }` |
| `sbaEligible` | boolean |

---

#### `client.report_page_mounted`
`FullReportVisual` mounted in the browser. First client-side event on the report page.

| Field | Description |
|---|---|
| `hasReportMd` | `true` if report markdown reached the browser |
| `reportMdChars` | Characters received by the browser |
| `visualComposite` | Composite score as the browser sees it |
| `grade` | Letter grade |
| `industry` | Industry label |
| `valuationK` | Valuation range |
| `sbaEligible` | boolean |

---

#### `client.full_report_visual_parsed_narrative`
`parseNarrativeSections` completed — LLM markdown has been split into sections.

| Field | Description |
|---|---|
| `reportMdChars` | Character count of markdown being parsed |
| `isEmpty` | `true` if no markdown to parse |
| `parsedSectionCount` | How many `## ` sections were found |
| `expectedSections` | `9` |
| `sectionCountOk` | `parsedSectionCount === 9` |
| `parsedSectionTitles` | Array of section header strings actually found (e.g. `["Executive Summary", ...]`) |
| `missingSections` | Canonical headers absent from parsed output — these will show "Analysis not available" |
| `extraSections` | Headers parsed that don't match any canonical name — LLM used wrong heading |
| `sectionProseStatus` | Per-section map: `{ "Executive Summary": "present" \| "absent", ... }` for all 9 canonical sections |
| `charsPerSection` | Characters per found section — zero means the section was found but empty |
| `visualComposite` | Composite score |

**The definitive check for report rendering.** `missingSections` directly names every section
that will show "Analysis not available". `extraSections` reveals header name mismatches (e.g.,
the LLM wrote `## SBA Eligibility` when `## SBA 7(a) Eligibility` was required). Together
these two fields make the cross-reference against the 9 canonical headers automatic.

---

## Complete phase list (sorted by pipeline order)

```
client.email_gate_submit_start
client.answers_snapshot
client.persist_session_payload_shape
client.persist_session_http_start
client.persist_session_http_done         (or client.persist_session_http_error)
api.session.parse_failed                 (error path only)
api.session.validation_failed            (error path only)
api.session.post_received
api.session.http_200_sent_before_after
api.session.db_upsert_ok_in_after        (or api.session.db_upsert_failed_in_after)
api.session.email_send_started
api.session.email_send_ok                (or api.session.email_send_failed)
client.request_generate_start
client.request_generate_stream_response_received
api.generate.post_received
api.generate.session_not_found           (race-condition error path)
api.generate.session_loaded
api.generate.incomplete_session          (error path only)
api.generate.cache_hit                   (cache path — skips LLM)
api.generate.cache_bypassed_stale_pre_fix (cache exists but pre-dates Signal Mapping Fix)
api.generate.stage1_scored
buildReportData.input
buildReportData.output
buildReportPrompt.built
api.generate.streamText_starting
api.generate.stream_finished
api.generate.report_md_persisted_in_after (or api.generate.persist_failed_in_after)
client.generate_stream_reader_opened
client.generate_stream_reader_closed
client.request_generate_null_response    (error path: requestGenerate returned null)
client.request_generate_no_body          (error path: response ok but body stream missing)
client.cinematic_loader_mounted
client.cinematic_loader_ai_stream_ready
client.cinematic_loader_complete_happy_path (or client.cinematic_loader_complete_failsafe_90s)
page.report.request_start
page.report.db_fetch_done
page.report.redirect_missing_gate        (error path only)
page.report.stage1_scored
buildReportData.input                    (origin: "page.report")
buildReportData.output                   (origin: "page.report")
page.report.rendering_full_report_visual
client.report_page_mounted
client.full_report_visual_parsed_narrative
```

---

## Canonical diagnostic queries

### Verify Signal Mapping Fix is working end-to-end

```bash
jq 'select(.phase == "client.persist_session_payload_shape") | .detail' workflow.ndjson
# Expect: signalMappingApplied: true, stage2.customerConcentration non-null

jq 'select(.phase == "api.generate.session_loaded") | { s2, s3 }' workflow.ndjson
# Expect: s2.customerConcentration and s2.recurringRevenue non-null

jq 'select(.phase == "buildReportData.output") | .detail.dimensions' workflow.ndjson
# Expect: all 5 dimension scores non-zero, operational > 0
```

### Diagnose missing LLM narrative

```bash
jq 'select(.phase == "api.generate.stream_finished") | { sectionCountOk, sectionCount, isEmpty, missingSections, extraSections }' workflow.ndjson
# missingSections non-empty → LLM used wrong header names for those sections
# extraSections non-empty → shows the mangled header the LLM actually produced

jq 'select(.phase == "buildReportPrompt.built") | .detail.sectionHeaderTitles' workflow.ndjson
# Verify the prompt itself contains the correct 9 canonical headers

jq 'select(.phase == "client.full_report_visual_parsed_narrative") | .detail.sectionProseStatus' workflow.ndjson
# Per-section "present"/"absent" — directly shows which cards will display "Analysis not available"

jq 'select(.phase == "client.full_report_visual_parsed_narrative") | { missingSections: .detail.missingSections, extraSections: .detail.extraSections }' workflow.ndjson
# Client-side cross-check — should match server-side api.generate.stream_finished findings
```

### Diagnose stuck loader / navigation failure

```bash
jq 'select(.phase | startswith("client.cinematic_loader"))' workflow.ndjson
# Look for: cinematic_loader_ai_stream_ready (stream done) vs complete_failsafe_90s (timed out)
# streamWaitMs > 40000 → Sonnet is slow but working
# failsafe fires with streamReady: false → stream never resolved
```

### Diagnose empty report page

```bash
jq 'select(.phase == "page.report.rendering_full_report_visual") | .detail.reportMdIsEmpty' workflow.ndjson
# true → report was not saved to DB before page loaded (race: after() not yet committed)

jq 'select(.phase == "client.report_page_mounted") | .detail.hasReportMd' workflow.ndjson
# false → confirmed: page loaded without reportMd in the DB row
```

### Trace a full session end-to-end

```bash
SESSION="<your-session-id>"
cat workflow.ndjson | jq --arg s "$SESSION" 'select(.sessionId == $s) | { iso, phase, detail }' | jq -s 'sort_by(.iso)'
```
