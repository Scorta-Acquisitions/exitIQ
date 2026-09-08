scorta/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── .nvmrc
├── .gitignore
├── .env.example
├── README.md
│
├── .github/
│   └── workflows/
│       ├── ci.yml                      # typecheck, lint, unit, schema drift
│       ├── preview.yml                 # Vercel preview comments
│       └── workers.yml                 # worker image / cron deploy
│
├── apps/
│   ├── web/                            # Next.js App Router on Vercel
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── middleware.ts               # Clerk + tenant context
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── globals.css
│   │   │   │
│   │   │   ├── (marketing)/
│   │   │   │   ├── page.tsx            # hero, 3 seller doors, pricing, process
│   │   │   │   ├── process/page.tsx
│   │   │   │   ├── pricing/page.tsx
│   │   │   │   ├── team/page.tsx
│   │   │   │   ├── for-buyers/page.tsx
│   │   │   │   ├── deal-iq/page.tsx    # waitlist / coming soon only
│   │   │   │   └── privacy/page.tsx
│   │   │   │
│   │   │   ├── (auth)/
│   │   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   │   │
│   │   │   ├── exit-iq/
│   │   │   │   ├── page.tsx            # progressive assessment
│   │   │   │   ├── [profileId]/page.tsx
│   │   │   │   └── share/[token]/page.tsx
│   │   │   │
│   │   │   ├── offer-review/
│   │   │   │   ├── page.tsx            # upload LOI / indication
│   │   │   │   └── [reviewId]/page.tsx
│   │   │   │
│   │   │   ├── demo/
│   │   │   │   └── [company]/          # public synthetic transaction
│   │   │   │       ├── page.tsx
│   │   │   │       ├── business/page.tsx
│   │   │   │       ├── buyers/page.tsx
│   │   │   │       ├── offers/page.tsx
│   │   │       ├── documents/page.tsx
│   │   │       ├── diligence/page.tsx
│   │   │       └── passport/page.tsx
│   │   │   │
│   │   │   ├── onboarding/
│   │   │   │   └── [engagementId]/page.tsx
│   │   │   │
│   │   │   ├── sign/
│   │   │   │   └── complete/page.tsx   # DocuSign return
│   │   │   │
│   │   │   ├── workspace/
│   │   │   │   └── [engagementId]/
│   │   │   │       ├── layout.tsx
│   │   │   │       ├── page.tsx        # Overview + weekly update
│   │   │   │       ├── business/       # Financial Truth, valuation, readiness
│   │   │   │       ├── buyers/         # Buyer Market
│   │   │   │       ├── offers/
│   │   │   │       ├── documents/      # Data & Access Center
│   │   │   │       └── updates/
│   │   │   │
│   │   │   ├── passport/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── apply/page.tsx
│   │   │   │   └── [buyerId]/page.tsx
│   │   │   │
│   │   │   ├── verify/
│   │   │   │   └── [token]/page.tsx    # no-login verification card
│   │   │   │
│   │   │   ├── collaborate/
│   │   │   │   └── [token]/            # accountant / bookkeeper path
│   │   │   │       ├── page.tsx
│   │   │   │       └── financials/page.tsx
│   │   │   │
│   │   │   ├── advisor/                # thin cockpit — not a product
│   │   │   │   ├── page.tsx            # exceptions, hot buyers, next actions
│   │   │   │   ├── engagements/[id]/page.tsx
│   │   │   │   ├── conflicts/page.tsx
│   │   │   │   ├── offers/page.tsx
│   │   │   │   └── queue/page.tsx
│   │   │   │
│   │   │   └── api/
│   │   │       ├── webhooks/
│   │   │       │   ├── clerk/route.ts
│   │   │       │   ├── docusign/route.ts
│   │   │       │   ├── calendly/route.ts
│   │   │       │   ├── zoom/route.ts
│   │   │       │   ├── postmark/route.ts
│   │   │       │   ├── twilio/route.ts
│   │   │       │   ├── stripe/route.ts           # reserved; unused M1
│   │   │       │   └── attio/route.ts
│   │   │       ├── ingest/
│   │   │       │   ├── email/route.ts            # offers@ + inbound docs
│   │   │       │   └── upload/route.ts
│   │   │       ├── exit-iq/route.ts
│   │   │       ├── qbo/callback/route.ts
│   │   │       └── cron/
│   │   │           ├── expire-access/route.ts
│   │   │           └── weekly-update-draft/route.ts
│   │   │
│   │   ├── components/
│   │   │   ├── marketing/
│   │   │   ├── exit-iq/
│   │   │   ├── workspace/
│   │   │   ├── passport/
│   │   │   ├── diligence/
│   │   │   ├── offers/
│   │   │   ├── access/
│   │   │   └── advisor/
│   │   │
│   │   └── lib/
│   │       ├── auth.ts
│   │       ├── tenant.ts
│   │       └── server.ts
│   │
│   └── workers/                        # long-running / retryable jobs
│       ├── package.json
│       ├── src/
│       │   ├── index.ts
│       │   ├── queues.ts
│       │   ├── jobs/
│       │   │   ├── ingest-document.ts
│       │   │   ├── parse-document.ts           # Reducto
│       │   │   ├── extract-claims.ts           # OpenAI → claim schema
│       │   │   ├── detect-conflicts.ts
│       │   │   ├── ingest-transcript.ts
│       │   │   ├── ingest-email.ts
│       │   │   ├── generate-dealbook.ts
│       │   │   ├── generate-concern-map.ts
│       │   │   ├── generate-weekly-update.ts
│       │   │   ├── extract-offer.ts
│       │   │   ├── match-buyers.ts
│       │   │   ├── sync-attio.ts               # GTM only; never canonical
│       │   │   └── expire-access.ts
│       │   └── webhooks/
│       │       └── normalize.ts
│       └── Dockerfile
│
├── packages/
│   ├── config/
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── tailwind/
│   │
│   ├── ui/                             # institutional design system
│   │   ├── src/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── empty-state.tsx
│   │   │   └── tokens.ts
│   │   └── package.json
│   │
│   ├── db/                             # Supabase / Postgres access
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── schema/
│   │   │   │   ├── orgs.ts
│   │   │   │   ├── people.ts
│   │   │   │   ├── engagements.ts
│   │   │   │   ├── evidence.ts
│   │   │   │   ├── claims.ts
│   │   │   │   ├── facts.ts
│   │   │   │   ├── financials.ts
│   │   │   │   ├── addbacks.ts
│   │   │   │   ├── buyers.ts
│   │   │   │   ├── passports.ts
│   │   │   │   ├── permissions.ts
│   │   │   │   ├── offers.ts
│   │   │   │   ├── meetings.ts
│   │   │   │   ├── diligence.ts
│   │   │   │   └── events.ts
│   │   │   ├── rls.ts
│   │   │   └── repos/
│   │   └── package.json
│   │
│   ├── domain/                         # canonical objects + rules
│   │   ├── src/
│   │   │   ├── owner-profile.ts
│   │   │   ├── engagement.ts
│   │   │   ├── evidence.ts
│   │   │   ├── claim.ts
│   │   │   ├── fact.ts                 # versioned canonical fact
│   │   │   ├── financial-truth.ts
│   │   │   ├── addback.ts
│   │   │   ├── valuation.ts            # range + drivers + confidence
│   │   │   ├── readiness.ts
│   │   │   ├── disclosure.ts           # presets + exclusions + expiry
│   │   │   ├── buyer.ts
│   │   │   ├── passport.ts             # tiers + shareable card payload
│   │   │   ├── buyergraph.ts
│   │   │   ├── offer.ts
│   │   │   ├── diligence.ts
│   │   │   ├── concern-map.ts
│   │   │   └── process.ts              # hard-coded stage machine
│   │   └── package.json
│   │
│   ├── events/
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── emit.ts
│   │   │   └── idempotency.ts
│   │   └── package.json
│   │
│   ├── ai/
│   │   ├── src/
│   │   │   ├── client.ts               # OpenAI, scoped context only
│   │   │   ├── schemas/
│   │   │   │   ├── claims.ts
│   │   │   │   ├── offers.ts
│   │   │   │   ├── exit-iq.ts
│   │   │   │   └── diligence.ts
│   │   │   ├── extract.ts
│   │   │   ├── grounded-qa.ts          # cite canonical facts only
│   │   │   ├── gates.ts                # auto / notify / approve
│   │   │   └── prompts/
│   │   └── package.json
│   │
│   ├── storage/
│   │   ├── src/
│   │   │   ├── s3.ts
│   │   │   ├── kms.ts
│   │   │   ├── presign.ts
│   │   │   ├── classify.ts
│   │   │   └── retention.ts
│   │   └── package.json
│   │
│   ├── documents/
│   │   ├── src/
│   │   │   ├── reducto.ts
│   │   │   ├── ingest.ts
│   │   │   └── types.ts
│   │   └── package.json
│   │
│   ├── comms/
│   │   ├── src/
│   │   │   ├── postmark.ts
│   │   │   ├── twilio.ts
│   │   │   ├── front.ts
│   │   │   ├── templates/
│   │   │   └── preferences.ts
│   │   └── package.json
│   │
│   ├── auth/
│   │   ├── src/
│   │   │   ├── clerk.ts
│   │   │   └── roles.ts                # seller, advisor, collaborator, buyer
│   │   └── package.json
│   │
│   └── integrations/
│       ├── src/
│       │   ├── attio.ts                # GTM system of record only
│       │   ├── calendly.ts
│       │   ├── docusign.ts
│       │   ├── zoom.ts
│       │   ├── qbo.ts
│       │   ├── persona.ts
│       │   ├── middesk.ts
│       │   ├── plaid.ts
│       │   ├── sourcescrub.ts
│       │   ├── axial.ts
│       │   └── bizequity.ts
│       └── package.json
│
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 0001_tenancy.sql
│   │   ├── 0002_brain.sql
│   │   ├── 0003_financials.sql
│   │   ├── 0004_buyers.sql
│   │   ├── 0005_offers.sql
│   │   ├── 0006_events.sql
│   │   └── 0007_rls.sql
│   ├── seed/
│   │   └── synthetic_northfork.sql     # the one demo company
│   └── functions/                      # only if a webhook must live at the edge
│
├── infra/
│   ├── aws/
│   │   ├── s3.tf
│   │   ├── kms.tf
│   │   └── cloudtrail.tf
│   ├── vercel/
│   │   └── project.json
│   └── secrets.md                      # names only; values in 1Password
│
└── docs/
    ├── architecture.md
    ├── canonical-objects.md
    ├── ai-autonomy.md
    ├── security.md
    ├── retention.md
    └── month-1-build-plan.md