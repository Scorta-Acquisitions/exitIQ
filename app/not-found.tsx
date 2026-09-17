import type { Metadata } from "next"
import { BrandLockup } from "@/components/site/brand/BrandLockup"
import { Button } from "@/components/site/ui/Button"
import { Container, Eyebrow, Tile } from "@/components/site/ui/primitives"
import { ROUTES, SITE_NAME } from "@/lib/site/routes"

export const metadata: Metadata = {
  title: `${SITE_NAME} | Page not found`,
  description: "The address may have changed. Start from the Heirloom home page or go straight to the sale process.",
  robots: { index: false },
}

export default function NotFound() {
  return (
    <Tile tone="light">
      <Container size="text" className="text-center">
        {/* The one brand moment outside the bar: the stacked lockup as the PNGs deliver it, decorative. */}
        <div aria-hidden="true" className="text-heirloom mb-10 flex justify-center">
          <BrandLockup variant="stacked" markHeight={72} />
        </div>
        <Eyebrow className="mb-4">Page not found</Eyebrow>
        <h1 className="type-hero text-fg">That page is not part of the record.</h1>
        <p className="type-lead-airy text-fg-2 mt-5">
          The address may have changed. Start from the home page, or go straight to the sale process.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href={ROUTES.home}>Back to the home page</Button>
          <Button href={ROUTES.howItWorks} variant="secondary">
            See how it works
          </Button>
        </div>
      </Container>
    </Tile>
  )
}
