import type { Metadata } from "next"
import type { ReactNode } from "react"
import { OfferIntake, type OfferIntakeMode } from "@/components/site/offer-review/OfferIntake"
import { Button } from "@/components/site/ui/Button"
import { Card, Container, Eyebrow, KeyValueRow, Tile } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { CONTACT, PAGE_META } from "@/lib/site/routes"

export const metadata: Metadata = { title: PAGE_META.offerReview.title, description: PAGE_META.offerReview.description }

const MODES: OfferIntakeMode[] = ["forward", "paste", "verbal"]

/**
 * The tone of a separated term. The legacy tones collapse onto the system's contextual text colours:
 * `d1` is the headline figure (strong, foreground, tabular), `filament` the one accent figure, and `d2`
 * every other fact, open questions included, so a value never reads dimmer than its label.
 */
type TermTone = "d1" | "d2" | "filament"

const TERM_VALUE: Record<TermTone, string> = {
  d1: "type-caption-strong text-fg tabular",
  d2: "type-caption text-fg",
  filament: "type-caption text-accent tabular",
}

/** One separated term, label over value on every viewport so the eight rows share a single layout. */
function Term({ label, value, tone = "d2" }: { label: string; value: string; tone?: TermTone }) {
  return (
    <KeyValueRow
      label={label}
      className="border-line flex-col items-start gap-y-1 border-b py-3 last:border-b-0"
      valueClassName={TERM_VALUE[tone]}
    >
      {value}
    </KeyValueRow>
  )
}

/** Emphasis inside the letter: strong foreground for a phrase; the accent is spent on the one figure only. */
function Highlight({ children, figure = false }: { children: ReactNode; figure?: boolean }) {
  return <span className={figure ? "text-accent tabular font-semibold" : "text-fg font-semibold"}>{children}</span>
}

const AFTER_STEPS = [
  { title: "We read what you send", body: "A document, email, draft, or notes from a conversation." },
  {
    title: "We separate price from terms",
    body: "Cash, deferred payments, financing, exclusivity, and missing language.",
  },
  {
    title: "You get a written read",
    body: "What you would receive, what could still change, and where you can push back.",
  },
  {
    title: "You decide",
    body: "Keep negotiating yourself, hire Heirloom to run the transaction, or open the sale to other buyers.",
  },
]

const FEE_ROWS = [
  { label: "Existing-buyer engagement", value: "2.5% success fee" },
  { label: "Upfront fee", value: "$0" },
]

export default async function OfferReviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const requested = typeof params.mode === "string" ? params.mode : undefined
  const initialMode: OfferIntakeMode = MODES.includes(requested as OfferIntakeMode)
    ? (requested as OfferIntakeMode)
    : "forward"

  return (
    <>
      <Tile tone="light">
        <Container size="text" className="text-center">
          <Eyebrow className="mb-4">Free offer review</Eyebrow>
          <h1 className="type-hero text-fg">Know what the offer pays before you sign.</h1>
          <p className="type-lead-airy text-fg-2 mt-5">
            Send us the offer. We tell you how much is cash at closing, what is paid later or depends on the buyer’s
            financing, what the exclusivity period commits you to, and which terms are missing.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="#offer-intake">Review my offer</Button>
          </div>
          <p className="type-caption text-fg-3 mt-5">Free and confidential. We do not contact the buyer.</p>
        </Container>
      </Tile>

      <Tile tone="parchment">
        <Container size="text">
          <h2 className="type-display-lg text-fg">Send the offer</h2>
          <p className="type-body text-fg-2 mt-4">
            An email, letter of intent, draft agreement, or notes from a conversation are enough.
          </p>
          <div className="mt-8">
            <OfferIntake initialMode={initialMode} />
          </div>
        </Container>
      </Tile>

      <Tile tone="dark" id="worked-example" className="anchor-target">
        <Container>
          <Eyebrow className="mb-4">Worked example</Eyebrow>
          <h2 className="type-display-lg text-fg">What the letter of intent leaves open</h2>
          <p className="type-body text-fg-2 mt-4 max-w-[692px]">
            A fictional letter of intent. The terms below decide what the seller actually receives.
          </p>
          <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-6">
            <Card padded={false}>
              <div className="border-line-soft border-b px-6 py-4">
                <Eyebrow as="span">Letter of intent · Project Ridgeline</Eyebrow>
              </div>
              <div className="type-body text-fg-2 flex flex-col gap-4 p-6">
                <p>
                  We propose an enterprise value of <Highlight figure>$4,650,000</Highlight>, including cash at closing,
                  a seller note, and an earnout based on <Highlight>post-closing performance</Highlight>.
                </p>
                <p>
                  The proposal is <Highlight>subject to financing</Highlight> and satisfactory diligence during a{" "}
                  <Highlight>90-day exclusivity period</Highlight>.
                </p>
                <p>
                  The seller will provide <Highlight>reasonable transition support</Highlight>.
                </p>
              </div>
            </Card>
            <Card padded={false}>
              <div className="border-line-soft border-b px-6 py-4">
                <Eyebrow as="span">The terms, separated</Eyebrow>
              </div>
              <div className="px-6 py-2">
                <Term label="Headline price" value="$4.65M" tone="d1" />
                <Term label="Cash at closing" value="$3.45M, or 74% of the headline price" tone="filament" />
                <Term
                  label="Seller note"
                  value="Amount, interest rate, security, and repayment terms need confirmation"
                />
                <Term label="Earnout" value="Target and accounting rules are not defined" />
                <Term label="Buyer financing" value="Required, with no lender commitment shown" />
                <Term label="Exclusivity" value="90 days during which the seller cannot negotiate elsewhere" />
                <Term label="Transition" value="“Reasonable support” has no hours, duties, or end date" />
                <Term label="Working capital" value="No target is stated, which can change cash received at closing" />
              </div>
            </Card>
          </div>
        </Container>
      </Tile>

      <Tile tone="parchment" id="after-you-send" className="anchor-target">
        <Container>
          <h2 className="type-display-md text-fg">What happens after you send it</h2>
          <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-x-6 gap-y-8">
            {AFTER_STEPS.map((s, i) => (
              <div key={s.title}>
                <div className="type-caption text-fg-3 tabular">0{i + 1}</div>
                <div className="type-body-strong text-fg mt-3">{s.title}</div>
                <p className="type-body text-fg-2 mt-2">{s.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Tile>

      <Tile tone="light" id="existing-buyer" className="anchor-target">
        <Container>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-x-16 gap-y-10">
            <div>
              <Eyebrow className="mb-4">Existing buyer</Eyebrow>
              <h2 className="type-display-md text-fg">If you hire Heirloom after the review</h2>
              <p className="type-body text-fg-2 mt-4">
                We negotiate the full deal, coordinate diligence and financing, push back on late price cuts, and manage
                the closing.
              </p>
            </div>
            <div>
              <div className="border-line border-t">
                {FEE_ROWS.map((row) => (
                  <KeyValueRow
                    key={row.label}
                    label={row.label}
                    className="border-line border-b py-3"
                    valueClassName="type-body text-fg tabular text-right"
                  >
                    {row.value}
                  </KeyValueRow>
                ))}
                <div className="border-line border-b py-3">
                  <span className="type-caption text-fg-3 block">Included</span>
                  <span className="type-body text-fg mt-1 block">
                    Negotiation, diligence and financing coordination, price-cut defense, and closing
                  </span>
                </div>
              </div>
              <Button variant="secondary" href="#offer-intake" className="mt-5">
                Review my offer
              </Button>
            </div>
          </div>
        </Container>
      </Tile>

      <Tile tone="dark">
        <Container size="text" className="text-center">
          <h2 className="type-display-lg text-fg">Have it reviewed before you sign exclusivity.</h2>
          <p className="type-body text-fg-2 mt-4">Send the document, paste the terms, or tell us what was said.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <Button href="#offer-intake">Review my offer</Button>
            <TextLink href={`mailto:${CONTACT.offers}`}>Forward it to {CONTACT.offers}</TextLink>
          </div>
          <p className="type-caption text-fg-3 mt-5">We do not contact the buyer.</p>
        </Container>
      </Tile>
    </>
  )
}
