# Heirloom copy reduction: agent brief

You are implementing a site-wide copy reduction on the Heirloom marketing site in this repo. Read
`.claude/CLAUDE.md` first, in full. It is the engineering contract and describes the site's file map,
conventions, test rigor rules, and verification commands. Everything below assumes you have read it.
This brief is self-contained: the copy manifest is in Part B. You do not need any other document.

---

# Part A. Rules

## A1. The goal, stated once

Cut the copy hard. Keep the information and the design.

Cut the visible copy on every route by roughly half. Compress strings in place as the default, and
delete a string outright when it carries nothing a visitor needs. You have discretion to delete; you
do not have discretion to hollow out a section, drop a fact that appears nowhere else on the page, or
remove a way to get somewhere. Layout, components, sections, WebGL, scroll scenes, demonstrations
(Project Ridgeline, LOI, reconciliation, access log, Passport card), forms, and interactions stay
exactly as they are.

Two earlier attempts failed in opposite ways and you must avoid both:

- The first followed the manifest literally and deleted every string it marked for deletion. That
  removed information people need (the nav dropdown descriptions, the video panel's text and link at
  the bottom of the home page, the speed section's heading and timeline link, the offer-review
  closing section, whole blocks on /why and /who-we-are) and left bare labels where content had been.
- The second tried to fix the hollowed sections with layout changes (height caps, centred panels,
  moving steps into pill strips). Those are design changes and are not wanted.

The rule that resolves both: **treat the manifest as a word budget and a style guide, not as a list
of removals.** Where it says "Cut or shorten", decide for yourself whether the string carries
information, navigation, or structure. If it does, write a shorter version. If it does not, delete it.
Section A3 gives the test.

## A2. Owner overrides (these win over the manifest)

- Keep the hero eyebrow "Technology-enabled sell-side M&A for established business owners".
- Hero H1 is exactly `Sell your business privately, with qualified buyers competing.` with the second
  half in the existing `<em>`.
- Every advisor call to action is `Talk to an M&A advisor`. Never drop "M&A". This covers the dialog
  title, header, footer, hero, roadmap trigger, and every page that used "Talk to Suyash".
- Where a manifest replacement is drastically plainer than the original, keep up to about ten
  percent of the original wording to land on a natural middle.
- Standard labels: Talk to an M&A advisor · Review my offer · Check sale readiness · Start exitIQ
  (only on /score and in the hero exitIQ panel) · See how it works · See fees · Calculate my fee ·
  Get Heirloom Verified · Register my criteria · Email Suyash.

## A3. Policy for every string

For "Replace" and "Retain" entries, follow the manifest, adjusted for the overrides and the style
rules. If the manifest replacement is longer than the original, cut it.

For every "Cut or shorten" entry, and for any string you want to cut on your own, ask three questions.
If any answer is yes, the string stays in shorter form. If all three are no, delete it.

1. **Does it carry a fact that appears nowhere else on this page?** A price, a timing, a rule, who
   does what, what a buyer sees at a level.
2. **Does it carry a destination?** A link or button to fees, the process, the offer review, the
   readiness check, the buyer page, or the advisor. A destination already offered within the same
   section by another control is a duplicate and can go.
3. **Does the layout need it?** A card with a title needs a line under it, a section needs a heading
   and at least one sentence, a scroll step needs a label and a line, a video panel needs its text.

Deletions that usually pass: an eyebrow restating the heading under it, a second disclaimer, a
sentence repeating a fact from the same page, a decorative sub-line, a trailing arrow glyph, a "no
obligation" reassurance next to another one, a paragraph that only sets up the next paragraph.

Deletions that usually fail: nav dropdown descriptions, the text on the home video panel, a section's
only link to the page holding the detail, the only sentence under a heading, card lines, step bodies,
rule bodies.

Be creative before you delete. Two paragraphs can become one sentence with both facts. A heading and
its eyebrow can swap so the shorter one survives. A link can absorb the sentence that introduced it.
A card body can shrink to a six-word clause.

Sections marked **KEEP SECTION** in the manifest were candidates for removal in the original spec.
Removal is not approved. Keep the section and its structure and fill every slot with short copy.

Length guide: eyebrows and nav notes 3 to 6 words, headings 2 to 6 words, body paragraphs 12 to 30
words, card and step lines 6 to 14 words, button and link labels 2 to 4 words. Aim for 40 to 60
percent fewer words per string you keep.

## A4. Writing rules (anti-slop, enforced on what you write, not only what you remove)

The easiest way to fail this job is to delete a slogan and replace it with a shorter slogan. Short is
not the same as plain. A three-word heading can still be a flourish; a twelve-word body can still be
rhythm without a fact. Every replacement must state something a reader could check: who does it,
what happens, when, or how much. If it has no checkable content it is slop at any length; give it a
fact or delete it. Run this list per string, then again reading the finished route top to bottom.

- No slogans or aphorisms ("One buyer should not set the price", "Most owners sell one company once").
- No "one X" flourishes ("one advisor, one record, one number").
- No mirrored You/We rhythm ("You run the company. We run the sale.").
- No forced groups of three; no comma lists longer than three items used for rhythm.
- No "not X, but Y" or "isn't just X".
- No motivational or manifesto headings ("Start where you are", "Keep more of what you built",
  "Owners deserve…").
- No superlatives about Heirloom.
- No vague proof. "Millions in enterprise value" is banned. The attributable fact is: Suyash acquired
  and operated small businesses as a micro-PE investor. If the owner supplies an exact figure later,
  it goes in then.
- No em dashes in rendered copy. No semicolons joining clauses. No colons as explainers in headings.
- No rhetorical questions as headings except "Where are you today?" and "Is the business ready to
  sell?".
- Plain verbs, concrete nouns, present tense. "We reconcile the books" beats "The books are
  reconciled."
- Each fact appears once per page: representation, never-listed, timing, experience each live in the
  home facts strip; pricing lives in the home Fees section. A short link to the detail page is not a
  repeat.
- No label pretending to be a body sentence. "Financial preparation" is a heading, not a body.
- No filler openers or closers: "Simply", "Here's how", "That's it", "In short", "No surprises",
  "Peace of mind".
- No abstract nouns doing the work of verbs: "clarity", "confidence", "alignment", "transparency",
  "certainty" as a selling point.
- No stacked fragments ("Private. Prepared. Competitive.") and no parallel pairs or triplets built for
  cadence ("We prepare. We qualify. We close.").
- No corporate verbs or adjectives: "leverage", "empower", "unlock", "streamline", "seamless",
  "robust", "holistic", "end-to-end", "best-in-class", "tailored", "bespoke", "curated".
- No addressing feelings ("You deserve", "Rest assured", "You can relax").
- Prefer the original sentence trimmed over a new sentence invented. Rewriting is where slop gets in.
- Do not invent facts, figures, guarantees, or commitments.

Self-test: could a competitor paste the line on their site unchanged? If yes, it says nothing
specific. Cut it or make it concrete.

## A5. Claims that need owner or legal confirmation

Implement the copy, but list every one of these that appears in your final copy in your report.

- Pricing: 5% success fee on a full sale; $5,000 engagement commitment credited if the business
  sells, not refunded otherwise; 2.5% with an existing buyer, no upfront fee, free offer review; no
  retainer, listing fee, or minimum; fee base is cash, seller financing, earnouts, retained ownership,
  excluding post-close salary; fee on closing cash due at closing, fee on deferred amounts due when
  received; readiness fees may be partly credited later.
- Timing: many transactions close in roughly six to nine months (always "usually", never a promise);
  offer review reply usually the same business day.
- Comparison: traditional firms at this size often charge high single-digit or low double-digit
  rates, sometimes with minimums; 5% is roughly half at many transactions in Heirloom's range; the
  calculator's 10% figure is labelled an illustration.
- Confidentiality: never publicly listed; no contact with employees, customers, suppliers, or
  competitors without approval; identity released only after an NDA; sensitive records only after
  qualification; every access recorded; access expires and can be revoked; on withdrawal access is
  revoked and buyers are told only that the owner withdrew; retention rules are in the engagement
  agreement; Heirloom does not contact the buyer during an offer review.
- Privacy: exitIQ needs no name, email, phone, or documents; the advisor intake leaves the page only
  when the user books or emails; addresses are not added to a marketing list.
- Experience: Suyash acquired and operated small businesses as a micro-PE investor; founded and sold a
  company; built software at Atlassian; backed by Y Combinator. No dollar figures anywhere.
- Representation: sellers only; Heirloom does not buy represented businesses; buyers pay no fee.
- Software: organizes records, flags inconsistencies, researches buyers, drafts materials, answers
  routine questions from approved evidence; cannot release sensitive information on its own; Passport
  verification is dated and never downgraded automatically; a Passport can be verified without an
  account.
- Fit: full representation usually from about $1M revenue, transaction value usually below $10M.
- Project Ridgeline and all worked examples are fictional (already stated in the footer).

---

# Part B. Copy manifest

Actions: **Replace** (use the wording given, subject to A2 and A4), **Retain**, **Cut or shorten**
(apply the A3 test), **KEEP SECTION** (removal not approved; fill every slot with short copy). Strings
not listed are retained. Locations name the component or data file where the string lives.

## B1. Global (`lib/site/routes.ts`, `SiteHeader.tsx`, `SiteFooter.tsx`)

| Location | Action | Final copy |
| --- | --- | --- |
| Every advisor button, including dialog title, "Discuss my sale →", "Talk to Suyash…" | Replace | Talk to an M&A advisor |
| Every exitIQ entry outside /score and the hero panel ("Check if my business is ready", "Check my business privately", "Check my business →", "Still deciding? Check if my business is ready.") | Replace | Check sale readiness |
| Every how-it-works link ("See the… →" variants, "Want the details? See how the sale works.", "Ready to sell? See how Heirloom runs the process.", "See how Heirloom prepares a business") | Replace | See how it works |
| Every fees link ("See all fees →", "See fees →", "Compare the fees →", "Compare the fees on my sale →") | Replace | See fees (inside the /fees comparison section: Calculate my fee) |
| Every offer-review link ("Review my offer →", "Review my offer first →", "Already have a buyer? Have the offer reviewed first.", "Get a free review before you sign exclusivity or agree to terms.") | Replace | Review my offer |
| Nine desktop nav dropdown descriptions (`NAV_GROUPS[].links[].note`) | Cut or shorten | Owner wants these kept. Shorten each to 3 to 6 words that say where the link goes. |
| Nav labels | Replace | Only "Check my business" changes, to Check sale readiness |
| Mobile nav "Check if my business is ready" | Replace | Check sale readiness |
| Footer description | Replace | Heirloom is a sell-side M&A firm for owners of established private businesses. (One more short clause on what it does is acceptable.) |
| Footer seller statement | Replace | Heirloom works for sellers only. We do not buy the businesses we represent, and buyers pay us no fee on them. |
| Footer links | Replace | "Check my business" becomes Check sale readiness. Others unchanged. |
| Footer legal | Replace | © {year} Heirloom. All rights reserved. Heirloom provides M&A advisory services in the United States. Figures are in US dollars. Nothing on this site is legal, tax, investment, lending, or accounting advice. Worked examples, including Project Ridgeline, use fictional companies, people, buyers, and figures and do not describe a Heirloom client or transaction. |
| Open Graph image alt in `app/layout.tsx` | Replace | Remove the em dash: "Heirloom, sell-side M&A for established private businesses" |

## B2. Metadata (`PAGE_META` in `lib/site/routes.ts`)

| Route | Title | Description |
| --- | --- | --- |
| / | Sell Your Business Privately \| Heirloom M&A Advisory | Heirloom represents owners of established private businesses, brings qualified buyers into a private sale process, and manages the transaction through closing. |
| /score | Is Your Business Ready to Sell? exitIQ Readiness Check \| Heirloom | Seven questions on how buyers and lenders would view your business, with findings and a 90-day plan. No name, email, or documents required. |
| /offer-review | Free Business Offer Review Before You Sign \| Heirloom | Heirloom reviews the cash at closing, deferred payments, financing, exclusivity, and missing terms in an offer for your business, for free. |
| /how-it-works | How Heirloom Sells Your Business: The Eight Stages \| Heirloom | What Heirloom does at each stage of a private business sale, from preparing the financials to closing, and where the owner decides. |
| /fees | M&A Advisory Fees: 5% Success Fee, No Retainer \| Heirloom | 5% success fee on a full private sale, 2.5% with an existing buyer, free initial offer review. No monthly retainer, listing fee, or minimum. |
| /confidentiality | Sell Your Business Confidentially: Who Sees What \| Heirloom | Your business is never publicly listed. Buyers see staged information after an NDA and qualification, and every access is recorded. |
| /buyers | Buyer Passport: Verified Business Buyer Record \| Heirloom | Verify your identity, acquisition criteria, and capacity range once, and share only the details you choose with each seller. |
| /who-we-are | Who We Are: The Team Behind Heirloom M&A \| Heirloom | The firm and founder behind Heirloom, with firm transactions and the founder's buy-side experience stated separately. |
| /questions | Business Sale Questions Answered: Fees, Confidentiality, Timing \| Heirloom | Direct answers on fees, confidentiality, fit, timing, buyers, and the firm. |
| /why | Why Heirloom Exists: A Private Sale Process for Owners \| Heirloom | Why established business owners need a private, competitive sale process, and what Heirloom is building. |

## B3. Advisor intake dialog (`AdvisorDialog.tsx`, `lib/site/advisor/data.ts`, `intake.ts`)

| Current | Action | Final copy |
| --- | --- | --- |
| "Talk to an M&A advisor" (title, aria-label) | Retain | |
| "How we prepare" (ack label) | Replace | Call agenda |
| "Finish the briefing →" | Replace | Finish |
| "Your advisor reads this before you say a word." | Cut or shorten | |
| "Book the call and the conversation starts from your situation… on your clipboard for the booking notes." | Replace | We copied the briefing so you can paste it into the booking notes. |
| "Book the call →" | Replace | Book the call |
| "Prefer email? Send the briefing instead" | Replace | Send the briefing by email instead |
| "No documents required. Nothing you shared here leaves this page until you book or email." | Replace | Nothing you enter here leaves this page until you book or email. |
| "Builds as you answer" | Cut or shorten | |
| "Read by your advisor before the call. Not shared outside Heirloom." | Replace | Not shared outside Heirloom. |
| Question note "This sets the agenda, not a commitment." | Replace | This only sets the agenda. |
| Question note "A range is enough. No one checks the number here." | Replace | A range is enough. |
| Ack topic:offer | Replace | Notes from a conversation are enough for a first read of the terms. |
| Ack topic:value | Replace | Estimates are enough to discuss value and timing. |
| Ack topic:else | Replace | There is no follow-up email sequence after the call. |
| Ack type:recurring | Retain | Expect questions about contracts and renewals. Buyers price them heavily. |
| Ack type:prof | Replace | We will discuss how client relationships would transfer to a buyer. |
| Ack type:dist | Replace | Inventory and working capital will come up. |
| Ack rev:u1 | Replace | Full representation usually begins around $1M in revenue. The call can still cover next steps. |
| Ack rev:1-2 | Replace | This range draws individual and SBA-financed buyers. |
| Ack rev:5+ | Replace | Businesses this size attract larger buyers and longer diligence. |
| Ack when:soon | Replace | At this timing, preparation would start almost immediately. |
| Ack when:mid | Replace | There is time to fix what buyers would flag before they see the business. |
| Ack when:later | Replace | The call will focus on what builds value in the meantime. |
| Ack when:depends | Replace | We will lay out the decisions that affect timing. |
| Ack care:price | Replace | The call will cover how competing buyers affect the final price. |
| Ack care:team | Replace | We will show how buyers are screened on their plans for employees. |
| Carried-over ack "What you already told us carried over. {n} questions left before booking." | Replace | Your earlier answers carried over. {n} left before booking. (keep the singular/plural logic) |
| All other questions, chips, acks, agenda items, briefing rows | Retain | |

## B4. Home (/)

Each fact appears once on the page: representation, never-listed, timing, and experience in the
facts strip; pricing in the Fees section; the three paths in the hero.

**Hero** (`HomeHero.tsx`, `HeroConsole.tsx`, `lib/site/hero/funnel.ts`, `HeroGraph.tsx`)

| Current | Action | Final copy |
| --- | --- | --- |
| Eyebrow | Retain | (owner override) |
| H1 | Replace | Sell your business privately, `<em>`with qualified buyers competing.`</em>` |
| Body "Heirloom prepares your company, creates competition…" | Replace | We prepare the company and bring qualified buyers into a private process. You choose the offer. We manage the transaction through closing while you keep running the business. |
| BACKED BY Y COMBINATOR | Retain | |
| Hero buttons | Replace | Talk to an M&A advisor / See how it works |
| Panel sub-label "Seller represented · Private by default" | Cut or shorten | Panel keeps "Heirloom" |
| "Where are you today?" | Retain | |
| Option 01 sub | Replace | A full private sale. |
| Option 02 sub | Replace | A free review of the offer before you sign. |
| Option 03 sub | Replace | Seven questions on how buyers would see the business today. |
| sr-only "Choose this path" | Replace | Continue |
| Eyebrow "About your timing" ×3 | Replace | First stays; second becomes About your revenue; third: Cut or shorten |
| "A rough answer is enough. No one is checking the number here." | Replace | A rough answer is enough. |
| sellDoneTitle now | Replace | You could start a full sale process now. |
| sellDoneTitle mid | Replace | This timing leaves room to prepare before buyers see the business. |
| sellDoneTitle explore | Replace | An advisor call does not commit you to selling. |
| sellDoneSub under $1M | Replace | Full representation usually begins around $1M in annual revenue. An advisor can still suggest a next step. |
| sellDoneSub else | Replace | Your business is in Heirloom's usual range. |
| "See what your sale would require." | Cut or shorten | |
| "Heirloom can assess the business… no obligation to enter the market." | Replace | An advisor can look at the business, describe the likely buyers, and give a view on timing. |
| Result buttons | Replace | Talk to an M&A advisor / See how it works |
| Offer panel eyebrow "Free Offer Review" | Replace | Free offer review |
| "Have the offer read before you sign." | Cut or shorten | |
| Offer panel body | Replace | We show you how much of the price is cash at closing, what is paid later or depends on financing, and which terms are missing. |
| Row note "2 minutes" | Cut or shorten | |
| Row note "rough notes are fine" | Replace | Rough notes are fine |
| "Confidential. No commitment. We do not contact the buyer during the review." | Replace | Confidential. We do not contact the buyer. |
| "See how the business looks to buyers today." | Cut or shorten | |
| exitIQ panel body | Replace | Seven questions. You get the issues a buyer would raise first and a 90-day plan. |
| "About 2 minutes. No name, email, phone number, or documents required." (every occurrence, incl. /score and the hero question footnote) | Replace | About 2 minutes. No name, email, or documents required. |
| "Your exitIQ result is ready." | Replace | Your result is ready. |
| "See my findings and 90-day plan →" | Replace | See my findings and 90-day plan |
| "Buying a business? Get Heirloom Verified →" | Replace | Buyers: Get Heirloom Verified |
| HeroGraph aria-label | Replace | Diagram of a private buyer process around one business |

**Facts strip** (`TermsStrip.tsx`)

| Cell | Final copy |
| --- | --- |
| 1 | Representation / Sellers only. |
| 2 | Listing / Never public. |
| 3 | Company fit / Usually $1M or more in annual revenue. |
| 4 | Experience / Founder acquired and operated small businesses as a micro-PE investor. |
| 5 | Timing / Usually six to nine months. (link this cell to /how-it-works) |

**Market scene** (`scenes/MarketScene.tsx`). Keep the scene height, stickiness, panel size, and choreography untouched.

| Current | Action | Final copy |
| --- | --- | --- |
| "A private market for your business" | Retain | |
| "One buyer should not set the price." | Cut or shorten | A heading here helps the card; if kept, make it factual. |
| Body | Replace | We find and qualify several buyers for your business and run the process privately. You compare their offers instead of negotiating with whoever approached you. |
| Step 01 "One buyer appears" + body | Replace | Inbound offer / one short line |
| Step 02 "We build the buyer list" + body | Replace | Buyer research / one short line |
| Step 03 "We qualify interest" + body | Replace | NDA and qualification / one short line |
| Step 04 "You choose from real options" + body | Replace | Offer comparison / one short line |
| "See the full sale process →" | Replace | See how it works (owner wants the link kept) |

**Financial preparation** (`home/FinancialPrep.tsx`)

| Current | Action | Final copy |
| --- | --- | --- |
| Eyebrow "Get the numbers straight before buyers see them" | Cut or shorten | |
| "Explain the business once." | Replace | Financial preparation |
| Body | Replace | Before any buyer sees the business, we reconcile the books, tax returns, and payroll. Buyers, lenders, and diligence all get the same figures. |
| Button "See how Heirloom prepares a business" | Replace | See how it works (keep the button) |

**Privacy scene** (`scenes/PrivacyScene.tsx`)

| Current | Action | Final copy |
| --- | --- | --- |
| Eyebrow "Confidential from the first conversation" | Cut or shorten | |
| "Selling should not become public news." | Replace | Who sees what |
| Body | Replace | Buyers start with an anonymous overview. They learn your name after signing an NDA and see detailed records only after we qualify them. |
| "See who can access what →" | Replace | See who can access what |
| "Employees, customers, suppliers, and competitors are never contacted without your approval." | Retain | |

**Offer comparison** (`home/OfferComparison.tsx`)

| Current | Action | Final copy |
| --- | --- | --- |
| Eyebrow "Compare the whole deal" | Cut or shorten | |
| "Know what each offer puts in your pocket." | Replace | Compare offers |
| Body | Replace | The highest price is not always the best offer. We rank offers on what you receive, when, and how likely the deal is to close, using the priorities you set. |
| "Choose an offer to see the terms broken down." | Replace | Choose an offer. |

**Seller workload** (`home/SellerWorkload.tsx`)

| Current | Action | Final copy |
| --- | --- | --- |
| Eyebrow "Your time stays on the business" | Cut or shorten | |
| "You run the company. We run the sale." | Replace | Who does what |
| Body | Cut or shorten | Owner wants a one-sentence body kept. |
| Column "You handle" / "Heirloom handles" | Replace | Owner / Heirloom |
| "Send one clear weekly update" | Replace | Send a weekly update |
| "See every stage →" | Replace | See how it works |

**Speed and Fees** (`home/SpeedAndFees.tsx`) **KEEP SECTION**

| Current | Action | Final copy |
| --- | --- | --- |
| "Speed" label | Retain | |
| "Keep the deal moving toward close." | Cut or shorten | Owner wants a heading kept; make it factual. |
| Speed body | Cut or shorten | One sentence. |
| Five step pills | Retain | |
| "See the sale timeline →" | Replace | See how it works (owner wants the link kept) |
| Timing paragraph | Replace | Preparation, buyer qualification, and diligence run against one plan. |
| "Fees" label | Retain | |
| "Keep more of what you built." | Cut or shorten | Owner wants a heading kept; make it factual. |
| Fees body | Replace | A 5% success fee on a full private sale. Details and a calculator are on the fees page. |
| Row "Full private sale / 5% success fee" | Retain | |
| Row "Engagement commitment / $5,000, fully credited at closing" | Replace | Engagement commitment / $5,000, credited against the success fee if the business sells |
| Row "Existing buyer / Free Offer Review, then 2.5%…" | Replace | Existing buyer / Free offer review, then 2.5% if Heirloom runs the transaction |
| Footnote "Traditional fee schedules vary…" | Cut or shorten | |
| "See all fees →" | Replace | See fees |

**Experience and advisor** (`home/ExperienceAdvisor.tsx`) **KEEP SECTION**

| Current | Action | Final copy |
| --- | --- | --- |
| "Transaction experience on both sides of the table." | Cut or shorten | Keep a heading. |
| Two paragraphs | Cut or shorten | One or two short paragraphs; no dollar figures. |
| Two proof cells ("Millions…") | Replace | Attributable facts only: firm side states the fact without a figure; founder side: Small-business acquisitions as a micro-PE investor before Heirloom. |
| Eyebrow "One advisor owns the engagement" | Cut or shorten | |
| "Your advisor stays accountable through close." + paragraphs | Replace | Heading: Your advisor. Body: Suyash Agrawal, founder and CEO, leads each early engagement himself and stays on it until the sale closes. Engineers and transaction specialists support him. |
| "Email Suyash" and hello@heirloom.com | Retain | |
| "Meet the firm →" | Replace | Who we are |

**What the transaction carries** (`home/TransactionCarries.tsx`) **KEEP SECTION**. Owner wants the text and link on the video panel kept. Shorten eyebrow, heading, and line; link label "Why Heirloom exists".

**Questions teaser** (`home/QuestionsTeaser.tsx`) **KEEP SECTION**. Heading: Questions. Link: See all questions. The five Q&A pairs may reuse shortened answers from /questions (B12).

**Close section** (`home/CloseSection.tsx`) **KEEP SECTION**

| Current | Action | Final copy |
| --- | --- | --- |
| "Start where you are." | Cut or shorten | Keep a factual heading. |
| Four cards | Replace | Titles: Talk to an M&A advisor / Review my offer / Check sale readiness / See how it works. Keep each card's eyebrow and one-line body, shortened. |
| "No public listing. No obligation to sell." | Cut or shorten | |

## B5. exitIQ (/score) (`app/score/page.tsx`, `exitiq/*`, `lib/site/exitiq/*`)

| Current | Action | Final copy |
| --- | --- | --- |
| H1 "See how buyers would view your business today." | Replace | Is the business ready to sell? |
| Body | Replace | Seven questions on whether a lender would finance a buyer, whether the business runs without you, and how much of your numbers a buyer could verify. You get findings and a 90-day plan. |
| Time note | Replace | About 2 minutes. No name, email, or documents required. |
| Question notes (`questions.ts`) | Replace | "Estimates are fine. You can change any answer before finishing." / "Use your best estimate." |
| "Your most important findings" / "What a buyer is likely to question first." | Replace | Findings / Cut or shorten |
| "Review my result with an advisor →" | Replace | Review my result with an advisor |
| "Book a call with Suyash for a deeper look… rides along in the booking notes…" | Replace | Book a call with Suyash. Your result goes into the booking notes. |
| Booking-opened state (both places) | Replace | The booking page opened in a new tab with your result attached. If it is missing, paste the copied text into the notes. |
| "How buyers may view the business today" | Replace | Scores |
| "Start with the actions tied to your highest-priority findings." | Cut or shorten | |
| "Review this result with an advisor" | Replace | Review my result with an advisor |
| Save state | Replace | Your plan was downloaded and copied. |
| "The result uses the answers you provided. Records can change it in either direction." | Cut or shorten | |
| Disclaimer (page and download in `scoring.ts`) | Replace | exitIQ is a readiness screen based on your answers. It is not a valuation, appraisal, financing decision, or assurance that a business will sell. |
| "What to do with the result" / "You already have the useful part. A conversation is optional." | Replace | Next steps / one short sentence (owner wants the intro kept) |
| "Keep the plan" + body | Replace | Keep the plan / The actions are useful whether or not you sell. |
| "See how Heirloom runs a sale" + body | Replace | See how it works / one short line |
| "Ask an advisor to review the result" + body | Cut or shorten | Owner wants the card kept; shorten both. |
| "What an advisor review adds" + body | Replace | What an advisor review adds / An advisor checks the financials, tests who would buy the business, and gives you a valuation range. If the business should wait, you get the milestones to hit and a date to revisit. |
| Page-level review button + sentence | Cut or shorten | Owner wants the button kept; shorten the sentence. |
| Bottom links | Replace | See fees / See how it works / Review my offer |

## B6. Offer review (/offer-review) (`app/offer-review/page.tsx`, `OfferIntake.tsx`, `lib/site/mailto.ts`)

| Current | Action | Final copy |
| --- | --- | --- |
| Eyebrow "Free Offer Review" | Replace | Free offer review |
| H1 "Before you sign, know what the offer really pays." | Cut or shorten | Keep a real h1; do not promote the eyebrow. |
| Hero body | Replace | Send us the offer. We tell you how much is cash at closing, what is paid later or depends on the buyer's financing, what the exclusivity period commits you to, and which terms are missing. |
| "Free. Confidential. No commitment. We do not contact the buyer during the review." | Replace | Free and confidential. We do not contact the buyer. |
| "Send whatever you have." | Replace | Send the offer |
| Body under it | Replace | An email, letter of intent, draft agreement, or notes from a conversation are enough. |
| "Prefer email? Forward the original message or attach the document to offers@heirloom.com." | Replace | Or forward it to offers@heirloom.com. |
| "A person reviews the submission. You will usually hear back the same business day." (both branches) | Replace | A person reviews it. You usually hear back the same business day. |
| "Send for free review" | Replace | Send for review |
| Error | Replace | We could not prepare the message. Email {addr} directly. |
| Intake footer confidentiality line | Cut or shorten | (repeats the hero line) |
| Mail subject "Free Offer Review" | Replace | Free offer review |
| Worked example heading "The number is only the first line." | Cut or shorten | |
| Worked example body | Replace | A fictional letter of intent. The terms below decide what the seller actually receives. |
| Step 01 | Replace | We read what you send / one short line |
| Step 02 | Replace | We separate price from terms / one short line |
| Step 03 | Replace | You get a written read / What you would receive, what could still change, and where you can push back. |
| Step 04 | Replace | You decide / Keep negotiating yourself, hire Heirloom to run the transaction, or open the sale to other buyers. |
| "Your review stays between you and Heirloom…" | Cut or shorten | |
| Eyebrow "If you want Heirloom to take it from here" | Cut or shorten | |
| "A buyer is only the beginning of the transaction." | Replace | If you hire Heirloom after the review |
| Two paragraphs | Replace | We negotiate the full deal, coordinate diligence and financing, push back on late price cuts, and manage the closing. |
| "Included / Negotiation, diligence, …" row | Cut or shorten | Owner wants the row kept; shorten the value. |
| "Review my offer first →" | Replace | Review my offer |
| Closing section (heading, line, button, forward link, note) | Cut or shorten | Owner wants the section kept; shorten each string. |

## B7. How it works (/how-it-works) (`app/how-it-works/page.tsx`, `scenes/StagesScene.tsx`, `lib/site/content/stages.ts`, `BusinessBrain.tsx`)

| Current | Action | Final copy |
| --- | --- | --- |
| Eyebrow "How Heirloom sells your business" | Replace | How Heirloom sells a business |
| H1 "You make the decisions. We carry the deal." | Cut or shorten | Keep a real h1. |
| Hero body | Replace | Heirloom prepares the company, finds and qualifies buyers, negotiates the offers, and manages diligence, financing, and closing. Each stage below shows where you are needed. |
| Buttons | Replace | Talk to an M&A advisor / See fees |
| Hero timing sentence | Cut or shorten | Owner wants it kept short. |
| "The sale, from first conversation to close" | Replace | The eight stages |
| Stage 01 title / Heirloom / you / receive | Replace | Goals / We learn the business, your timing, the outcome you want, and any buyers to exclude. / Join one working conversation and introduce your accountant or bookkeeper. / A sale plan and information request. |
| Stage 02 | Replace | Numbers / We organize the books, tax returns, payroll, owner adjustments, customer concentration, and contracts before market. / Explain the items only you can explain. / Adjusted financials with support for the earnings shown to buyers. |
| Stage 03 | Replace | Valuation and materials / We set a valuation range and prepare the anonymous overview and buyer materials. / Approve how the business is presented. / Valuation, anonymous overview, and buyer materials. |
| Stage 04 | Replace | Privacy rules / We turn your exclusions and disclosure choices into rules for outreach and buyer access. / Approve the rules once. Afterward you decide only exceptions. / A buyer plan and disclosure rules. |
| Stage 05 | Replace | Buyer market / We research likely acquirers, contact them without naming the business, and screen for fit and ability to close. / Nothing until qualified buyers are ready. / A qualified group of buyers. |
| Stage 06 | Replace | Buyer meetings / We answer routine questions and prepare you for each meeting. / Meet the buyers you choose. / Written indications of interest. |
| Stage 07 | Replace | Offers / We compare each offer's economics, financing, conditions, and closing risk, then negotiate around your priorities. / Choose the offer and approve the major terms. / A negotiated letter of intent. |
| Stage 08 | Replace | Diligence, financing, and closing / We coordinate the buyer, lender, lawyers, and accountants, and push back on late price cuts. / Answer the questions only you can answer and approve the final documents. / A completed ownership transfer. |
| Hint "Move through the stages to see what Heirloom handles and when you are needed." | Cut or shorten | Owner wants a hint kept. |
| "Discuss my sale →" | Replace | Talk to an M&A advisor |
| Eyebrow "One approved answer, used everywhere" | Cut or shorten | |
| "Keep every number consistent." | Replace | Financial preparation |
| Body | Replace | The books, payroll, tax return, and your own explanation often disagree. Your advisor records the resolution and the evidence for it, and every buyer document, lender package, and diligence answer uses that figure. |
| "Strong sale processes plan for the hard parts." | Replace | When a sale runs into trouble |
| Failure card 1 | Replace | The buyer's lender says no / We check financing readiness before meetings and keep other qualified buyers engaged where practical. |
| Failure card 2 | Replace | Diligence finds a problem / We look for accounting gaps, customer concentration, lease issues, and unsupported adjustments before market, so they are explained before they become a price cut. |
| Failure card 3 | Replace | The buyer tries to lower the price / We compare the stated reason with the records, challenge unsupported changes, and return to other buyers when the process supports it. |
| Failure card 4 | Replace | You change your mind / We stop outreach, revoke buyer access, tell buyers only that the owner withdrew, and follow the retention rules in your agreement. |
| Timing label | Retain | |
| "Preparation saves the most time." | Cut or shorten | Owner wants a heading kept. |
| Timing body (two paragraphs) | Replace | Many transactions of this size close in roughly six to nine months. Timing depends on how ready the business is, buyer interest, financing, diligence, and legal work. This is an expectation, not a guaranteed closing date. |
| Timing rows | Replace | Preparation / Before buyer outreach · Buyer process / Depends on buyer interest and the business · Diligence and financing / Run in parallel where practical · Closing / One shared list of conditions and owners |
| Experience block (eyebrow, heading, two paragraphs) **KEEP SECTION** | Cut or shorten | Heading plus one paragraph, attributable facts only. |
| Final buttons | Replace | Talk to an M&A advisor / Check sale readiness |

## B8. Fees (/fees) (`app/fees/page.tsx`, `fees/FeeCalculator.tsx`, `lib/site/fees/calc.ts`)

| Current | Action | Final copy |
| --- | --- | --- |
| Eyebrow "Full sale, existing buyer, and readiness work" | Cut or shorten | |
| H1 "What Heirloom costs." | Replace | Fees |
| Hero body | Cut or shorten | Owner wants one sentence kept. |
| "5% / Full private sale, paid when the transaction closes" | Replace | 5% / Success fee on a full private sale |
| "$5,000 / Engagement commitment, credited in full…" | Replace | $5,000 / Engagement commitment, credited against the success fee if the business sells |
| "2.5% / Existing-buyer transaction…" | Replace | 2.5% / Success fee when you already have the buyer, after a free offer review, no upfront fee |
| Buttons and note | Replace | Calculate my fee / Talk to an M&A advisor / No monthly retainer, listing fee, or minimum success fee. |
| Comparison eyebrow "The comparison" | Cut or shorten | |
| Comparison heading and two paragraphs | Replace | Compared with traditional fees / Brokers and M&A firms at this deal size often charge high single-digit or low double-digit rates, sometimes with a minimum. At many transactions in Heirloom's range, 5% is roughly half. Fees vary by firm and deal, so compare the actual agreements. |
| "Compare the fees on my sale →" | Replace | Calculate my fee |
| "What would Heirloom cost on your sale?" | Replace | Fee calculator |
| Path card "Full private sale" + sentence | Replace | Full private sale / one short line |
| Path card "I already have the buyer" + sentence | Replace | I already have the buyer / one short line |
| Rate note | Replace | Enter the rate from a proposal if you have one. Through $5M the calculator starts at a 10% illustration. Above $5M, enter a quoted rate, since traditional schedules often decline as deals get larger. |
| Guard RATE_INVALID | Replace | Enter a rate between 0 and 50. |
| Guard RATE_PENDING | Replace | Enter a rate to compare. |
| Guard RATE_LARGE | Replace | Above $5M, enter the quoted rate to compare. |
| Illustration footnote | Cut or shorten | |
| "Full private sale" eyebrow / "5% when the business sells." | Replace | Full private sale / Cut or shorten |
| Three paragraphs | Replace | You pay $5,000 when the work begins. It covers the preparation done before buyers see the company. If the business sells, it is credited against the 5% success fee. If it does not sell, it is not refunded, and you keep the work produced. The success fee applies to the purchase value you receive, including cash, seller financing, earnouts, and retained ownership. Salary you earn after closing is excluded. The fee on cash paid at closing is due at closing. The fee on any amount paid later is due when you receive it. (May stay as three short paragraphs.) |
| Spec row "Payment timing: Heirloom is paid as you are paid" | Replace | Payment timing: Due as each payment is received |
| "You already have the buyer" eyebrow / "Free review first. 2.5% if we run the transaction." | Replace | Existing buyer / Cut or shorten |
| Body | Replace | The offer review is free. If you then hire Heirloom, the 2.5% success fee covers negotiation, diligence and financing coordination, defense against late price cuts, and closing. |
| Spec row | Replace | Offer review: Free · Upfront fee: $0 · Success fee: 2.5% |
| "Review my offer →" | Replace | Review my offer |
| "If broader buyer competition would likely improve the outcome…" | Cut or shorten | |
| "Other costs you may encounter" | Replace | Other costs |
| Readiness work | Replace | If the business needs significant preparation before market, Heirloom scopes and prices that work first. Eligible readiness fees may be partly credited toward a later full-sale engagement. |
| Your lawyer | Replace | Legal fees are separate. Your lawyer handles the letter of intent, purchase agreement, and disclosure schedules. |
| Accountant | Replace | Your accountant / Accounting fees are separate when the books need assembly or a buyer requires a quality-of-earnings review. |
| Tax advice | Replace | Transaction tax planning is separate. It should happen before final terms are set. |
| Other specialists | Replace | Insurance, environmental, licensing, or industry-specific work may be needed. Heirloom coordinates the timing. |
| Footnote | Replace | You approve third-party costs before the work begins. |
| "Common fee questions" + five Q&A **KEEP SECTION** | Replace | Keep the heading. Answers may reuse the Fees answers from B12 (first five) verbatim. |
| "Ask about the fee on your sale." | Cut or shorten | Owner wants a closing heading kept. |
| Close buttons and links | Replace | Talk to an M&A advisor / Review my offer / Check sale readiness / See how it works |

## B9. Confidentiality (/confidentiality) (`app/confidentiality/page.tsx`, `confidentiality/DisclosureLevels.tsx`, `lib/site/confidentiality/data.ts`)

| Current | Action | Final copy |
| --- | --- | --- |
| Eyebrow "Confidential business sales" | Cut or shorten | |
| H1 "Deciding to sell should stay private." | Replace | Confidentiality |
| Hero body | Replace | Your business is never listed publicly. Buyers learn your name only after signing an NDA. They see detailed records only after we have qualified them. |
| Buttons | Replace | Talk to an M&A advisor / See the disclosure levels |
| "Who can see what" eyebrow / heading / body | Replace | Keep eyebrow; heading and body: Cut or shorten (keep one line) |
| "Access history" label / heading / body | Replace | Keep label; heading and body: Cut or shorten (keep one line) |
| NDA body (two paragraphs) | Replace | An NDA creates a legal duty, but no document guarantees behavior, and serious buyers have to involve their lawyers, accountants, and lenders. Heirloom limits who receives information, records every access, and helps document any breach. |
| Exclusions eyebrow / heading / body | Replace | Cut eyebrow / Your exclusions and limits / You approve the buyer categories, named exclusions, and information limits before outreach starts. After that, you decide only the exceptions. |
| "You can add an exclusion or revoke buyer access at any time." | Cut or shorten | |
| "The confidentiality rules we follow" | Replace | Rules |
| Rule 01 body | Cut or shorten | Keep a one-line body. |
| Rule 02 | Replace | No contact with employees, customers, or suppliers without your approval / one short line |
| Rule 03 body | Replace | You can add exclusions at any time. |
| Rule 04 | Replace | Your identity is released after an NDA / one short line |
| Rule 05 | Replace | Sensitive records are released after qualification / one short line |
| Rule 06 | Replace | Every access is recorded / one short line |
| Rule 07 body | Replace | Buyers who leave the process lose access. You can ask us to revoke it sooner. |
| Rule 08 body | Replace | Your engagement agreement states how documents, recordings, transcripts, and transaction records are kept and deleted. |
| Close heading / body | Replace | Cut or shorten heading (owner wants one kept) / Ask Suyash a question, or use exitIQ without giving your name. |
| Buttons and closing sentence | Replace | Talk to an M&A advisor / Check sale readiness / closing note: Cut or shorten |
| Level viewer data (`PERMISSION_LEVELS`), company record, access log | Retain | |

## B10. Buyers (/buyers) (`app/buyers/page.tsx`, `buyers/PassportTiers.tsx`, `lib/site/buyers/passport.ts`)

| Current | Action | Final copy |
| --- | --- | --- |
| H1 "Prove you are ready to close." | Replace | A verified record of who you are and what you buy |
| Hero body | Replace | Buyer Passport verifies your identity, acquisition criteria, and capacity range once. You choose which details each seller sees. |
| Note | Replace | Capacity is shown as a range. Heirloom represents sellers; Buyer Passport verifies buyers. |
| "Spend less time proving the same facts." | Replace | What it does |
| Benefit "Move faster with sellers" | Cut or shorten | Owner wants all five cards; shorten. |
| Benefit "Repeat less paperwork" | Replace | Less repeat paperwork / Approved verification is reused on each opportunity. |
| Benefit "See fitting opportunities sooner" | Replace | Earlier access / Verified buyers can receive earlier alerts and more anonymous detail when the seller's rules allow it. |
| Benefit "Protect financial privacy" | Replace | Financial privacy / Sellers see a verified capacity range. Exact balances stay private unless you authorize more. |
| Benefit "Prove seriousness before the meeting" | Cut or shorten | Owner wants all five cards; shorten. |
| "Four levels of buyer readiness" | Replace | Verification levels |
| How-it-works rows "Private sharing", "Range, not balance" | Cut or shorten | Owner wants all seven rows; shorten. |
| Row "Dated verification" | Retain | |
| Row "No recipient account required" | Replace | A seller or advisor can verify a Passport without a Heirloom account. |
| Row "No public buyer score" | Replace | No public score / The Passport shows checks and dates only. |
| Row "Human review for status changes" | Replace | Human review / Verification is never downgraded or revoked automatically. |
| Row "Outside advisors keep their clients" | Replace | An advisor can request a buyer's Passport without involving Heirloom in the seller relationship. |
| "What sellers need before sharing a name" + body | Replace | Before a seller shares a name / Expect to sign an NDA and explain how you would finance the purchase. |
| Form intro (heading, body, mono line) | Replace | Register my criteria / We contact you only about a relevant opportunity or a verification step. Your criteria are not shared with other buyers. / mono line: Cut or shorten |
| Close heading and body | Cut or shorten | Owner wants them kept short. |
| Close note | Replace | Buyer Passport is currently free. |
| Tier descriptions, Passport rows, buyer questions, form labels | Retain | |

## B11. Who we are (/who-we-are) (`app/who-we-are/page.tsx`)

| Current | Action | Final copy |
| --- | --- | --- |
| Eyebrow "The firm behind your sale" | Cut or shorten | |
| H1 "M&A experience from both sides of the table." | Replace | Who we are |
| Hero body | Cut or shorten | Owner wants one sentence kept. |
| Proof grid (four rows) | Replace | Heirloom transactions / state the fact without a figure · Founder buy-side experience / Small-business acquisitions as a micro-PE investor before Heirloom · Engagement model / One named advisor from first call to closing · Backing / Y Combinator |
| Buttons | Replace | Talk to an M&A advisor / See how it works |
| Bio paragraph 1 | Retain | Remove the "millions of dollars" sentence. |
| Bio paragraph 2 | Replace | As a buyer, he evaluated earnings, challenged owner adjustments, structured offers, worked with lenders, and ran diligence. |
| "Who does the work" eyebrow / heading / body | Replace | Cut eyebrow / Who does the work / one short sentence |
| Three bench rows | Replace | Lead advisor / Owns valuation, buyer strategy, negotiation, and closing. · Engineering / Keeps financial records, materials, and buyer access consistent. · Legal, accounting, lending, and tax specialists / Do the regulated work. Heirloom coordinates timing. |
| Note | Replace | You can use your existing professionals, or Heirloom can recommend one. |
| "What this experience changes for you" + five cards **KEEP SECTION** | Cut or shorten | Heading plus five one-line cards. |
| Close heading / body | Replace | Cut or shorten heading (keep one) / Large investment banks rarely take businesses in this size range, and many local brokers rely on public listings. |
| Buttons | Replace | Talk to an M&A advisor / See how it works |
| Seller statement | Cut or shorten | (already in the footer) |

## B12. Questions (/questions) (`app/questions/page.tsx`, `questions/AskForm.tsx`, `lib/site/questions/data.ts`)

Eyebrow "Questions": Cut or shorten. H1: Questions owners ask. Category links: Retain.

| Question | Final answer |
| --- | --- |
| How much does Heirloom charge? | A full private sale costs a $5,000 engagement commitment and a 5% success fee. The $5,000 is credited against the fee if the business sells. There is no retainer, listing fee, or minimum. If you already have a buyer, the offer review is free and the success fee is 2.5%, with no upfront fee. |
| Is the $5,000 refundable if the business does not sell? | No. It is credited against the success fee if the business sells and is not refunded otherwise. You keep the financial work, valuation, and materials produced. |
| What does the 5% apply to? | The purchase value you receive, including cash at closing, seller financing, earnouts, and retained ownership. The fee on cash paid at closing is due at closing. The fee on anything paid later is due when you receive it. Salary you earn after closing is excluded. |
| How does 5% compare with a traditional broker or M&A firm? | Firms at this deal size often charge high single-digit or low double-digit rates, sometimes with a minimum. At many transactions in our range, 5% is roughly half. Compare the actual agreements, because schedules vary. |
| Why would I pay 2.5% if I found the buyer? | Price, cash, financing, working capital, diligence, and legal terms can all change after the first offer. The 2.5% covers negotiation, diligence, financing coordination, and closing. |
| Will my employees find out I am selling? | Not from Heirloom. We do not contact employees, customers, or suppliers without your approval, and buyers learn the company's identity only after signing an NDA. |
| Will my business be listed publicly? | No. Buyer outreach is private and begins without naming the business. |
| Who decides which buyers can see my information? | You set the buyer categories, named exclusions, and information limits before outreach. Heirloom works inside those rules and comes back to you for exceptions. |
| What does a prospective buyer see before learning my name? | Industry, broad geography, and a revenue or earnings range. Your identity and full materials follow a signed NDA. Detailed financials and contracts follow qualification. |
| What happens to my data if I stop the process? | Buyer access is revoked and buyers are told only that the owner withdrew. Your engagement agreement states the retention and deletion rules for each type of record. |
| What size businesses does Heirloom work with? | Usually US businesses with at least $1M in annual revenue and a transaction value below $10M. We look at larger businesses, and exceptional smaller ones, individually. |
| Can you value my business from seven questions? | No. exitIQ shows how buyers and lenders may view the business and which readiness issues matter most. A valuation needs verified financials and market evidence. |
| What happens if I am not ready to sell? | We explain the issues, give you milestones, and coordinate the accountants, lawyers, or lenders needed. Significant readiness work is scoped and priced before it begins. |
| What happens if Heirloom cannot sell my business? | We explain in writing why no acceptable sale resulted, and you keep the work produced. The $5,000 commitment is not refunded. We take a full-sale engagement only when a realistic buyer market looks possible. |
| How long does it take to sell a business this size? | Many transactions close in roughly six to nine months. Timing depends on how ready the business is, buyer interest, financing, diligence, and legal work. |
| What does software do, and what does the advisor decide? | Software organizes records, flags inconsistencies, researches buyers, drafts materials, and answers routine questions from approved evidence. Your advisor decides valuation, disclosure, negotiating positions, and offer recommendations. Software cannot release sensitive information on its own. |
| Who actually runs my deal? (rename to: Who runs my deal?) | One named advisor owns the engagement from the first conversation through closing. Suyash Agrawal leads early seller engagements himself, with engineers and transaction specialists supporting him. |
| How much of the sale falls on me? | You explain the business, approve the privacy rules and materials, meet the buyers you choose, and decide on the offer and major terms. Heirloom handles the rest. |
| Can I talk to someone without giving a phone number? | Yes. Email Suyash at hello@heirloom.com. Your address is not added to a marketing list. |
| Does Heirloom represent buyers? | No. Heirloom represents sellers and never buys a business it represents. Buyer Passport verifies buyers; it does not advise them. |
| Do buyers pay Heirloom? | Buyers pay no transaction fee on a business we represent. Buyer Passport is currently free. |
| What is Buyer Passport? | A private record confirming a buyer's identity, acquisition criteria, capacity range, and lender preparation. Verification is dated, capacity appears as a range, and the buyer controls what each recipient sees. |
| What transaction experience does Heirloom have? | Before Heirloom, founder Suyash Agrawal acquired and operated small businesses as a micro-PE investor. Firm transactions and his earlier buy-side record are separate. (No dollar figures.) |
| Why should I trust Heirloom with the sale? | We work for sellers only, publish our fees, and name the advisor who runs your engagement. The full process is on this site before you sign anything. |
| Is Project Ridgeline a real transaction? | No. Project Ridgeline is a fictional company used to show how Heirloom prepares financials, controls access, answers diligence, and compares offers. Every name and figure is invented. |

Ask form: heading Ask a question; body: one sentence (owner wants it kept); mono note: A person
replies once by email. Your address is not added to a list.; textarea placeholder: keep, shorter.
Home teaser (`HOME_TEASER`): may reuse five of these answers verbatim.

## B13. Why (/why) (`app/why/page.tsx`)

| Current | Action | Final copy |
| --- | --- | --- |
| Eyebrow "Why Heirloom exists" | Retain | |
| H1 "Owners deserve the same deal discipline as buyers." | Cut or shorten | Keep a real h1; do not duplicate the eyebrow. |
| Hero body | Replace | Professional buyers acquire companies regularly and bring lenders, attorneys, and research with them. The owner across from them is usually selling for the first time. |
| Buttons | Replace | See how it works / Talk to an M&A advisor |
| "The seller side has fallen behind" eyebrow / heading / body | Replace | Cut eyebrow / How private businesses sell today / one short sentence (owner wants a body) |
| Path card 1 | Replace | Public listing / Employees, customers, and competitors may learn the company is for sale. (keep the card's eyebrow, shortened) |
| Path card 2 | Replace | A single direct buyer / The buyer knows there are no competing offers, and the terms reflect that. |
| Path card 3 | Replace | Heirloom / Several qualified buyers make offers privately. One advisor manages the sale to closing. |
| "What we do now" (heading, body, six cards, three links) **KEEP SECTION** | Cut or shorten | Every slot stays, shorter. Links: See how it works / See fees / one label for the confidentiality link. |
| "Where this can lead" eyebrow / heading / body | Replace | Cut eyebrow / What Heirloom is building / A sale where the owner, buyers, lenders, and advisors work from the same approved facts, with controlled access and nothing explained twice. |
| Four cards | Replace | One financial record / Approved figures stay consistent from preparation through closing. · Verified buyers / Buyers verify identity, criteria, and capacity once through Buyer Passport. · Comparable offers / Price, cash at closing, financing, and closing risk in one view. · Shared closing record / Diligence, financing, and legal work run from one record with access rules. |
| Experience block (heading, body, note) **KEEP SECTION** | Cut or shorten | Heading plus one paragraph, attributable facts only. |
| Buttons | Replace | Talk to an M&A advisor / Who we are |
| Owners card | Replace | Owners / one short line / Check sale readiness |
| Offer card | Replace | Existing offer / one short line / Review my offer |
| Buyers card | Replace | Buyers / one short line / Get Heirloom Verified |
| General contact line | Retain | |

---

# Part C. Working method and verification

## C1. Starting point

Fresh start from `new-website` HEAD. The working tree is clean apart from this brief. HEAD is your
inventory: every element that exists at HEAD exists in your end state, filled with shorter copy,
except where the A3 test lets a string go. A stash named `copy-pass-v1` holds the earlier literal
attempt; treat it as reference only, never apply it.

## C2. Method

- Text-node changes only. Do not add, remove, or reorder components, sections, elements, or classes.
  Do not change scene heights, sticky offsets, breakpoints, or panel sizes.
- **Element inventory check.** Before you start, count per route file the headings, paragraphs,
  links, buttons, and list items: `grep -cE "<h[1-3]|<p |<Link|<TextLink|<Button|AdvisorCtaButton"
  <file>`. Counts may fall where you deleted under A3, but every drop must be explainable as an
  eyebrow, a duplicate, or a set-up sentence. No route loses a link destination, no section loses its
  heading or its only sentence, no card, step, or rule loses its line. Put before and after counts in
  the report with one line per drop.
- Strings that live in data live in `lib/site/**` (metadata, nav notes, advisor dialog, exitIQ notes
  and disclaimer, roadmap, fee guards, passport data, confidentiality rules, questions). Edit the
  data, not the component, when the string lives in data.
- Keep mailto subject lines and inquiry bodies consistent with visible labels (`lib/site/mailto.ts`).
- Tests pin exact copy. After source edits, update assertions to the new exact strings. Never weaken
  an assertion to a regex or substring; never delete a test unless the thing it tested is gone, and
  then replace it with an exact assertion of the new state. Unit tests: `components/site/__tests__`,
  `lib/site/__tests__`. Playwright: `e2e/`; the per-route h1 map is `H1_BY_PATH` in `e2e/helpers.ts`.
- Do not edit anything under `legacy/`. Do not commit.

## C3. Verification (all must pass before you report)

```bash
pnpm typecheck
pnpm lint
git diff --name-only | xargs pnpm exec prettier --check   # repo-wide prettier fails on legacy files; check only what you changed
pnpm test:site                                            # Vitest with coverage gates: 97% lines/statements, 95% branches/functions
pnpm build
lsof -iTCP:3000 -sTCP:LISTEN -t | xargs -r kill           # pkill -f "next start" does NOT kill next-server; a stale server serves a rebuilt bundle and 404s chunks
pnpm start &                                              # wait for /api/health to return 200
npx playwright test --project=chromium --repeat-each=2    # retries are 0 so flakes surface
```

Sweep rendered source for rejected phrases and report zero hits:

```bash
grep -rn --include='*.tsx' --include='*.ts' "millions\|Millions\|One buyer\|Talk to Suyash\|Check my business\|Discuss my sale\|—" app components/site lib/site | grep -v __tests__
```

Report word counts per route before and after: render each route with `pnpm start`, take
`document.body.innerText`, count words. Target about half; no route may grow.

Known gotchas: `e2e/pages.spec.ts` scrolls the stages scene to exactly 0.5, which is a stage boundary
and can land either side after any change to page height above it; scroll to 0.52 if it flakes.
Playwright's `expectPinned` expects sticky panel tops between 70 and 90px; do not change offsets. Run
Playwright alone, not concurrently with a build or a Vitest run.

## C4. Report format

Files changed; element inventory counts before and after per route with a reason for every drop;
word counts before and after per route; checks run with results; every place you departed from the
manifest and what you wrote instead; every string you deleted at your own discretion and which A3
question it failed; every A5 claim that appears in the final copy. Do not commit.
