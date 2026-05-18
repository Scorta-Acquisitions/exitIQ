### Station 2 — Auth / Seller Home

**Goal:** Gate `/dashboard` behind a real Supabase login and render the seller
home populated with Chandan Patel's locked persona data. Navigation spine wired (all routes resolve, left-rail status indicators in place)
/dashboard      → Seller Home
/connect        → Platform Connectors
/ingestion      → Data Processing
/recast         → Financials Recast
/risk           → Risk Analysis
/documents      → CIM & Docs
/score          → Scorta Score
/marketplace    → Lenders / VDR / Listings
/outreach       → Buyer / Lender Outreach

**Route + entry point:** `/login` → on success → `/dashboard`. User arrives
after completing the Exit IQ assessment and report.

**Hard-coded surface:**
- Email: [from demo-persona.json]
- Business name: Palace Kitchen
- Revenue: $2.1M
- Scorta Score: 49/100
- [pull remaining fields from demo-persona.json]

**Interactions:**
- Login form: email + password fields, "Sign In" button
- On success: redirect to /dashboard
- Left-rail nav renders with all 9 routes, status indicators (✓ existing, ● active, ○ locked)
- Dashboard hero shows seller name, business name, key stats

**Loading states:**
- Sign In button shows spinner on submit
- Dashboard KPI cards skeleton on first load

**Done definition (QA Rule):**
1. Can click login → dashboard without breaking
2. Looks investor-ready on 1080p
3. All data matches locked persona files

## Follow-up prompt to update the landing page UI

─────────────────────────────────────────────
UI REALISM & AGENT TIMING
─────────────────────────────────────────────

GENERAL UI STANDARD
The dashboard must feel like a funded, production SaaS product —
not a prototype. Reference Linear, Stripe, and Notion for visual
quality bar. Every element must earn its place on screen.

- No placeholder text, no lorem ipsum, no "Coming Soon" banners
- Typography hierarchy must be sharp — one dominant element per
  section, everything else subordinate
- Spacing is generous but intentional — no cramped cards
- Teal/green accent used only for CTAs and status indicators,
  not decoratively
- Every interactive element has a visible hover state and
  a smooth transition (150–200ms ease-out)
- The globe animation next to ARIA must feel premium — slow
  rotation (1 full rotation per 12s), subtle atmospheric glow,
  gentle pulse on the teal highlight every 4s. Not flashy.
  Calm and capable.

AGENT RESPONSE TIMING
ARIA and any other agent surface must simulate real LLM behavior.
Agents do not respond instantly — they think, then they speak.

On initial dashboard load:
- ARIA's avatar and globe appear immediately (0ms)
- "Welcome, Chandan." appears after a 600ms delay, types out
  at ~40ms per character
- The sub-heading ("I've reviewed your answers from ExitIQ...")
  fades in 400ms after the greeting completes
- The body paragraph fades in 300ms after the sub-heading
- The 3 action steps cascade in one at a time, 250ms apart,
  each sliding up from 8px below with opacity 0→1

On any CTA click that triggers an agent action (e.g. "Start ops
documentation"):
- Button immediately shows a spinner and disables (prevents
  double-click)
- A small status bar appears below the button:
  "ARIA is reviewing your profile..." (800ms)
  then "Preparing your next step..." (600ms)
  then the result appears
- Total perceived wait: 1.4–2.0 seconds — long enough to feel
  real, short enough not to frustrate

On any locked station hover:
- Tooltip appears: "ARIA will unlock this once [prerequisite]
  is complete." — 180ms fade in
- No click action fires. The lock is meaningful, not broken.

ARIA's text must never appear all at once. Every message from
ARIA uses a typewriter effect at 35–45ms per character for the
first sentence only. Remaining paragraph text fades in as a
block after the first sentence completes. This mirrors how a
real LLM streams output without making the full response feel
slow to read.

These timing rules apply to every station that surfaces an
agent — Ingestion, Recast, Owner-Dependency, Case Manager.
The timing values above are the reference. Do not make any
agent feel instantaneous.