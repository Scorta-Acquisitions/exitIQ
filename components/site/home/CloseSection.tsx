import Link from "next/link"
import { AdvisorTrigger } from "@/components/site/advisor/AdvisorCtaButton"
import { SealFilm } from "@/components/site/home/SealFilm"
import { CARD_CLASS, CARD_PADDING, Container, Eyebrow, Tile } from "@/components/site/ui/primitives"
import { cn } from "@/lib/site/cn"
import { ROUTES } from "@/lib/site/routes"

const CARDS = [
  {
    href: ROUTES.offerReview,
    eyebrow: "Offer in hand",
    title: "Review my offer",
    body: "A free read of the cash, terms, and missing items.",
  },
  {
    href: ROUTES.score,
    eyebrow: "Still deciding",
    title: "Check sale readiness",
    body: "Seven questions, then findings and a 90-day plan.",
  },
  {
    href: ROUTES.howItWorks,
    eyebrow: "The process",
    title: "See how it works",
    body: "The eight stages from preparation to closing.",
  },
]

/** Each control is itself a card: the card recipe on the link or button, and its title takes the accent on hover. */
const CARD_ACTION = cn(
  CARD_CLASS,
  CARD_PADDING,
  "text-fg hover:text-accent block text-left transition-colors duration-200"
)

function CardText({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <>
      <Eyebrow as="span">{eyebrow}</Eyebrow>
      <span className="type-tagline mt-3 block">{title}</span>
      <span className="type-body text-fg-2 mt-2 block">{body}</span>
    </>
  )
}

/**
 * The page's close: the seal film beside one headline, then four equal cards, each a single next step.
 * The first opens the advisor dialog; the other three are routes. Cards are plain hairline surfaces
 * with no dividers of their own. Film and headline sit side by side from 800px and stack beneath it.
 */
export function CloseSection() {
  return (
    <Tile tone="light">
      <Container>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-center gap-x-12 gap-y-10">
          <SealFilm />
          <h2 className="type-display-lg text-fg max-w-[692px]">
            Choose a <em>next step.</em>
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-6">
          <AdvisorTrigger className={CARD_ACTION}>
            <CardText
              eyebrow="Ready to sell"
              title="Talk to an M&A advisor"
              body="Ask whether Heirloom fits your business and timing."
            />
          </AdvisorTrigger>
          {CARDS.map((c) => (
            <Link key={c.title} href={c.href} className={CARD_ACTION}>
              <CardText eyebrow={c.eyebrow} title={c.title} body={c.body} />
            </Link>
          ))}
        </div>
      </Container>
    </Tile>
  )
}
