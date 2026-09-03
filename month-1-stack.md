The PDF’s operating model is the part I’d keep. The vendor list is a job catalog, not a shopping cart.

**Build the showroom. Own the canonical truth. Rent commodity. Manually operate everything else.** That is the right Month 1 posture. Treating the named products as “must sign these 25 contracts in week 1” is how you burn the two weeks before GTM.

---

**Already in this repo — do not swap**

| PDF default | What’s already here | Call |
|---|---|---|
| Next.js + Vercel | `next@15.5.10`, Turbopack | Keep |
| Supabase Postgres | Drizzle + transaction pooler + RLS | Keep |
| Clerk | Supabase Auth, cookie sessions, middleware | Keep Supabase Auth |
| OpenAI API | AI SDK + Anthropic (`claude-sonnet-4-6` / Haiku) | Keep the SDK as the interface; don’t exclusive-lock OpenAI |
| Postmark | Resend, already optional in `env.mjs` | Keep Resend |

Clerk is the expensive fork. Organizations, MFA, and passkeys are real Clerk strengths, but wiring Clerk *and* keeping Postgres RLS means a second identity system, webhook sync, and a month of auth bugs. For operator-provisioned sellers, Supabase Auth is enough. Add MFA in-product later.

Same logic for Postmark and “OpenAI only.” The PDF wants branded transactional mail and structured, reviewed extraction. You already have both jobs covered. Brand is not the requirement.

---

**Keep as named, because the job is real**

- **Attio, Apollo, LinkedIn Sales Nav, Calendly, Google Workspace, Zoom** — configure. Almost no engineering. Attio is the GTM system of record; Scorta becomes canonical only after a prospect signs.
- **1Password** — before the first shared vendor password.
- **S3 + KMS + CloudTrail** — this is the one “rent infrastructure” item I would not defer past the first real tax return. Seller trust *is* the product. Supabase Storage is fine for the synthetic demo; it should not become the live vault by accident. Vercel Blob is the wrong class of store for this.

---

**Rent the class, not the logo — only when a live deal needs it**

- **E-sign** — DocuSign *or equivalent*. One short engagement agreement on a phone. Dropbox Sign is usually cheaper and enough. Webhook → `engagement_status = signed` → workspace. Don’t build an e-sign product.
- **Parser** — Reducto is the right *class* (tables, tax returns, provenance). Don’t exclusive-lock it before you’ve seen the first 20 real PDFs. Parsed output stays intermediate; that rule in the PDF is the important part.
- **QBO** — upload/export first. Native OAuth is not a Day-4 item. Intuit’s accounting scope is read/write; “read-only” is an app promise, not an OAuth guarantee. Production keys still need the [app assessment](https://help.developer.intuit.com/s/question/0D5TR00001Rt3gw0AB) (typically 5–10 business days). If seller #1 actually uses QBO, start that questionnaire in week 1 — don’t block onboarding on the connector.

---

**Defer hard — these are Month 1 traps**

These look institutional and will eat calendar without changing the seller experience at n=1:

- **Front, Twilio, WhatsApp Business API, Apple Messages for Business** — the PDF already says don’t build an inbox. Founder phone, Workspace, and WhatsApp-as-a-human-channel cover 15 sellers. Apple Messages is explicitly not a launch dependency.
- **Sourcescrub** — sales-gated, roughly [$20k–$60k/year](https://prospeo.io/s/sourcescrub-pricing-reviews-pros-and-cons), built for PE origination. Apollo + LinkedIn + manual research is the actual BuyerGraph seed.
- **Axial** — [membership network](https://www.axial.net/request-information/) aimed at lower-middle-market ($5M+ revenue is a common owner bar). Scorta’s wedge is sub-$2M Main Street. Fit problem, not just a pricing problem.
- **Persona / Middesk / Plaid** — three different jobs (person KYC, entity KYB, bank-linked capacity). The PDF is right that Passport is branded Scorta with a vendor underneath. For Month 1, manual verification behind a shareable card is the honest v0. Don’t pick one vendor to fake all three jobs.
- **BizEquity** — advisor-report product, demo-gated. If you need an independent multiple check, [DealStats](https://www.bvresources.com/products/dealstats) is a better fit for Main Street deal sizes (~$1,499/year or a day pass) and stay off any “license comps into ExitIQ” contract.

---

**The real Month 1 stack, if I had to freeze placeholders tomorrow**

Product: Next.js / Vercel, Supabase Auth, Supabase Postgres, AI SDK (Anthropic now, other models later), Resend.

Vault: S3 + KMS + CloudTrail, 1Password.

GTM (no code): Attio, Apollo, LinkedIn, Calendly, Workspace, Zoom.

First-deal adapters: e-sign webhook, a parser, QBO export/upload.

That’s about a dozen named things instead of ~27. Everything else is a job you can still do by hand until it repeats.

---

**Where the PDF is right, independent of vendors**

The spine is not the CRM. It’s evidence → claim → conflict → advisor reconciliation → canonical fact → versioned downstream use. ExitIQ, Financial Truth, DealBook, diligence Q&A, and lender packages must not each keep their own company. That rule should survive every vendor swap.

The three-layer standard is also right: customer surfaces polished, canonical intelligence actually working, internals allowed to be ugly.

---

**Where I’d push back even as placeholders**

The 30-day sequence still tries to *ship* Passport, BuyerGraph matching, AI diligence, Concern Maps, lender pre-underwriting, and offer comparison as product. The stack review is: those are seller-facing promises, so they belong in the **synthetic demo** in week 1. Live Seller #1 can be a founder operating the same objects in Attio / Sheets / the thin cockpit. Building every adapter in parallel with the showroom is how the canonical model never gets finished.

One repo conflict worth naming: this codebase already has DealIQ as a separate app with a 14-item plan. The PDF correctly parks DealIQ as waitlist/demo. Don’t let buy-side engineering compete with Business Brain + vault + synthetic transaction in Month 1.

---

If you want to go one level down next, the useful fork is not “Clerk vs Supabase” again — it’s **vault**: S3 now vs Supabase Storage for demo-only, and what “tenant isolation” means before the first real file lands.