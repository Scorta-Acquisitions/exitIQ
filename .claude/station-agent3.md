# STATION_3.md — Platform Connectors

## Goal
Give the seller a credible, production-feeling data connection surface
that triggers the Ingestion Agent. The connectors screen must make it
immediately obvious that Scorta pulls data directly from the seller's
existing business software — no manual uploads, no CSV exports. The
connection flow must feel like a real OAuth-based integration even
though all data is hard-coded.

---

## Route + Entry Point
**Route:** `/connect`
**Arrives from:** `/dashboard` via ARIA's first action item CTA
("Connect your financial accounts")
**Exits to:** `/ingestion` via "Run Ingestion Agent" CTA once sync
is complete

---

## What This Station Must Establish for Downstream Stations

Every station after this one depends on the premise that financial
data has been pulled and verified. The connect screen is what makes
that premise believable.

- `/ingestion` — receives the "data has been synced" state and
  immediately has something to process. The ingestion log must feel
  like a natural continuation of what the connect screen started.
- `/recast` — the normalized financials it displays are only credible
  if the audience has watched data get pulled first. Connect is the
  foundation of that credibility.
- `/risk` — the concentration and owner-dependency data surfaces as
  a byproduct of what the Ingestion Agent found after connection.
- `/marketplace` — the lender package is built from data that
  originated here. The lender match percentages are only meaningful
  if the audience believes the underlying data is real.

If the connect screen feels fake or rushed, every downstream station
loses credibility. This station sets the believability floor for the
entire demo.

---

## Hard-Coded Surface

All values pulled from `demo-persona.json` and `DEMO_PERSONA.md`.
Do not invent connector names, data point labels, or sync results.

### Connector Tiles (on arrival)

| Connector | Status | Detail line |
|-----------|--------|-------------|
| QuickBooks Online | Connected ✅ | Last synced: today · 1,247 transactions |
| Plaid (Bank Feed) | Connected ✅ | Last synced: today · 36 months of deposits |
| Stripe | Not connected | Online ordering revenue — pending |
| Google Drive | Not connected | Tax returns, lease docs — pending |

Header above tiles:
"2 of 4 sources connected · QuickBooks + Plaid live"

### Sync Flow (on "Sync Now" click — QuickBooks tile)

Status lines cycling at 400ms intervals:
1. "Authenticating with QuickBooks..."
2. "Fetching chart of accounts..."
3. "Pulling 36 months of transaction history..."
4. "Analyzing 1,247 transactions..."
5. "Sync complete."

Result card after sync:
- Transactions: 1,247 across 36 months
- Revenue confirmed: $2.1M
- Data sources: 3-year P&L · Payroll · COGS
- Status: ✅ Ready for Ingestion Agent

### Stripe "Connect" Flow (optional interaction)

On click: modal appears with fake OAuth redirect UI
("Redirecting to Stripe authorization...")
After 1.5s: modal closes, tile updates to
"⏳ Awaiting authorization — complete in Stripe dashboard"

This interaction is optional. Include it only if it does not
complicate the primary sync flow. The primary flow is QuickBooks.

### Banner (after sync completes)

"2 of 4 sources connected · Ingestion Agent is ready to run →"
CTA: "Run Ingestion Agent" → navigates to `/ingestion`

---

## Interactions

- **"Sync Now" button** on QuickBooks tile — primary demo interaction.
  Triggers the cycling status line sequence. Button disables and shows
  spinner during sequence. Cannot be clicked twice.
- **"Sync Now" button** on Plaid tile — same sequence with bank-feed
  specific copy. Secondary interaction, not required in demo path.
- **Connector tile hover** — subtle elevation shadow + border highlight.
  Communicates interactivity without being distracting.
- **"Not connected" tile click** — Stripe triggers the OAuth modal
  flow described above. Google Drive tile shows a coming-soon tooltip:
  "Document ingestion via Drive coming soon."
- **"Run Ingestion Agent" CTA** — appears only after QuickBooks sync
  completes. Navigates to `/ingestion`. This is the exit point of the
  station.

---

## Loading States

- Sync Now 