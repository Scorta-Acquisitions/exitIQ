import type { Metadata } from "next"
import { Button } from "@/components/site/ui/Button"
import { Container, Eyebrow } from "@/components/site/ui/primitives"
import { ROUTES, SITE_NAME } from "@/lib/site/routes"

export const metadata: Metadata = {
  title: `${SITE_NAME} | Page not found`,
  description: "The address may have changed. Start from the Heirloom home page or go straight to the sale process.",
  robots: { index: false },
}

export default function NotFound() {
  return (
    <section className="bg-paper px-6 py-[clamp(56px,8vw,110px)]">
      <Container className="max-w-[720px]">
        <Eyebrow className="mb-[18px]">Page not found</Eyebrow>
        <h1 className="font-display mb-4 text-[clamp(32px,4.8vw,56px)] leading-[1.05] font-normal tracking-[-1.2px]">
          That page is not part of the record.
        </h1>
        <p className="text-l2 mb-6 text-[16px] leading-[1.6]">
          The address may have changed. Start from the home page, or go straight to the sale process.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button href={ROUTES.home}>Back to the home page</Button>
          <Button href={ROUTES.howItWorks} variant="outline-plain">
            See how it works
          </Button>
        </div>
      </Container>
    </section>
  )
}
