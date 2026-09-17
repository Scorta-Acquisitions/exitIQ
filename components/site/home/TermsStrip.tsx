import Link from "next/link"
import { ObjectFilm, RevealGroup } from "@/components/site/home/ObjectFilm"
import { Container, Eyebrow, Tile } from "@/components/site/ui/primitives"
import { ROUTES } from "@/lib/site/routes"

/** The five terms; `key` names the object film (`/media/term-<key>.mp4`) and the card's test ids. */
const TERMS: Array<{ key: string; href: string; label: string; text: string }> = [
  {
    key: "seal",
    href: ROUTES.whoWeAre,
    label: "Representation",
    text: "Sellers only.",
  },
  {
    key: "envelope",
    href: ROUTES.confidentiality,
    label: "Listing",
    text: "Never public.",
  },
  {
    key: "scale",
    href: ROUTES.questions,
    label: "Company fit",
    text: "Usually $1M or more in annual revenue.",
  },
  {
    key: "stack",
    href: ROUTES.whoWeAre,
    label: "Experience",
    text: "Millions in enterprise value transacted through Heirloom.",
  },
  {
    key: "hourglass",
    href: ROUTES.howItWorks,
    label: "Timing",
    text: "40% faster than a traditional sale.",
  },
]

/**
 * Columns no narrower than 120px: two across on every phone from 320px up, five across from 744px (the
 * tablet widths and the 980px content lock), with a short last row only in the 456–743px range between.
 */
const GRID = "grid grid-cols-[repeat(auto-fit,minmax(min(100%,120px),1fr))] gap-x-6 gap-y-10"

/**
 * The five terms of engagement, set as a parchment tile directly under the hero: five living objects.
 * Each term is one link and one card-like column: a framed turntable film of the term's object (a seal, an
 * envelope, a balance scale, a stack of sealed documents, an hourglass) that turns on its own and follows
 * the pointer, then the muted label, then the body-strong statement. The film is decorative inside the
 * link (aria-hidden), so the link's name stays its label and statement. The statement carries no colour of its
 * own, so the whole link, label included, turns to the accent on hover. The cards arrive once, 60ms apart,
 * the first time they scroll in; the link carries no transition utility of its own so that reveal
 * transition holds, and the label and statement animate their inherited colour instead.
 */
export function TermsStrip() {
  return (
    <Tile tone="parchment">
      <Container>
        <RevealGroup data-testid="terms-grid" className={GRID}>
          {TERMS.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              data-testid={`terms-link-${t.key}`}
              data-reveal=""
              className="group text-fg hover:text-accent block"
            >
              <ObjectFilm
                testId={`terms-figure-${t.key}`}
                src={`/media/term-${t.key}.mp4`}
                poster={`/media/term-${t.key}-poster.jpg`}
                className="mb-5"
              />
              <Eyebrow as="span" className="group-hover:text-accent mb-2 transition-colors duration-200">
                {t.label}
              </Eyebrow>
              <span className="type-body-strong block transition-colors duration-200">{t.text}</span>
            </Link>
          ))}
        </RevealGroup>
      </Container>
    </Tile>
  )
}
