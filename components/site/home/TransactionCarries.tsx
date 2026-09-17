import { AmbientVideo } from "@/components/site/ui/AmbientVideo"
import { Container, Eyebrow, Tile } from "@/components/site/ui/primitives"
import { TextLink } from "@/components/site/ui/TextLink"
import { ROUTES } from "@/lib/site/routes"

/**
 * The video tile: the archive footage sits at 30% behind the copy on the darkest tile tone, and the
 * eyebrow steps up to the second text tone, which is what keeps every line legible over the film's lit
 * shelves. No veil, no gradient. The copy is bottom-anchored in a reading
 * column so the film has room above it.
 */
export function TransactionCarries() {
  return (
    <Tile tone="dark-3" padded={false} className="flex min-h-[420px] items-end overflow-hidden px-6">
      <AmbientVideo
        src="/media/archive-hall.mp4"
        poster="/media/archive-hall-poster.jpg"
        ariaLabel="Private business records prepared for a confidential ownership transfer."
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />
      <Container className="tile relative">
        <div className="max-w-[692px]">
          <Eyebrow className="text-fg-2 mb-4">Beyond the price</Eyebrow>
          <h2 className="type-display-lg text-fg">Employees, customers, and the company name change hands too.</h2>
          <p className="type-body text-fg mt-4">We weigh them in buyer selection and negotiation, alongside price.</p>
          {/* 44px touch target: mt-3 plus the centred 44px box puts the text where mt-6 did; -mb-3 keeps the tile padding. */}
          <div className="mt-3 -mb-3">
            <TextLink href={ROUTES.why} standalone>
              Why Heirloom exists
            </TextLink>
          </div>
        </div>
      </Container>
    </Tile>
  )
}
