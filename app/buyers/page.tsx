import type { Metadata } from "next"
import Image from "next/image"
import { BuyerRegisterForm } from "@/components/site/buyers/BuyerRegisterForm"
import { PassportTiers } from "@/components/site/buyers/PassportTiers"
import { Button } from "@/components/site/ui/Button"
import { Card, Container, Eyebrow, Tile } from "@/components/site/ui/primitives"
import { BUYER_QUESTIONS, PASSPORT_BENEFITS } from "@/lib/site/buyers/passport"
import { ANCHORS, PAGE_META, ROUTES } from "@/lib/site/routes"

export const metadata: Metadata = { title: PAGE_META.buyers.title, description: PAGE_META.buyers.description }

/** `ANCHORS.buyerRegister` read from this page itself: the fragment alone, with the route prefix off. */
const REGISTER_HREF = ANCHORS.buyerRegister.replace(ROUTES.buyers, "")
const REGISTER_ID = REGISTER_HREF.slice(1)

/** The page's CTA pair, opening and closing the page; both jump to the registration tile. */
function RegisterCtas({ className }: { className: string }) {
  return (
    <div className={className}>
      <Button href={REGISTER_HREF}>Get Heirloom Verified</Button>
      <Button href={REGISTER_HREF} variant="secondary">
        Register my criteria
      </Button>
    </div>
  )
}

export default function BuyersPage() {
  return (
    <>
      <Tile tone="light">
        <Container className="desk:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)] desk:items-center grid grid-cols-1 gap-x-12 gap-y-12">
          <div className="desk:text-left text-center">
            <Eyebrow className="mb-4">Buyer Passport</Eyebrow>
            <h1 className="type-hero text-fg">A verified record of who you are and what you buy</h1>
            <p className="type-lead-airy text-fg-2 desk:mx-0 mx-auto mt-5 max-w-[560px]">
              Buyer Passport verifies your identity, acquisition criteria, and capacity range once. You choose which
              details each seller sees.
            </p>
            <RegisterCtas className="desk:justify-start mt-8 flex flex-wrap justify-center gap-3" />
            <p className="type-caption text-fg-3 mt-5">
              Capacity is shown as a range. Heirloom represents sellers. Buyer Passport verifies buyers.
            </p>
          </div>
          {/* The passport as an object beside the copy: the booklet on parchment, no caption of its own. Capped at 280px on phones so the plate does not swallow the viewport; 400px from the desktop breakpoint. */}
          <figure
            className="desk:justify-self-end desk:mx-0 desk:max-w-[400px] mx-auto my-0 w-full max-w-[280px]"
            data-testid="passport-figure"
          >
            <div className="bg-canvas-parchment shadow-product relative aspect-[3/4] overflow-hidden rounded-lg">
              <Image
                src="/generated/passport.webp"
                alt="A deep green Buyer Passport booklet with a brass Heirloom seal on the cover"
                fill
                priority
                sizes="(max-width: 1068px) 100vw, 400px"
                className="object-contain p-8"
              />
            </div>
          </figure>
        </Container>
      </Tile>

      <Tile tone="parchment">
        <Container>
          <h2 className="type-display-md text-fg">What it does</h2>
          <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-x-6 gap-y-10">
            {PASSPORT_BENEFITS.map((b) => (
              <div key={b.title}>
                <div className="type-body-strong text-fg">{b.title}</div>
                <p className="type-body text-fg-2 mt-2">{b.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Tile>

      <Tile tone="dark" id="passport-tiers" className="anchor-target">
        <Container>
          <PassportTiers />
        </Container>
      </Tile>

      <Tile tone="light">
        <Container>
          <h2 className="type-display-lg text-fg">Before a seller shares a name</h2>
          <p className="type-body text-fg-2 mt-4 max-w-[692px]">
            Expect to sign an NDA and explain how you would finance the purchase.
          </p>
          <Card padded={false} className="mt-10 overflow-hidden">
            <div className="border-line-soft border-b px-6 py-4">
              <Eyebrow as="span">Questions buyers answer</Eyebrow>
            </div>
            <div className="px-6 pt-1 pb-2">
              {BUYER_QUESTIONS.map((q, i) => (
                <div key={q} className="border-line flex items-baseline gap-4 border-b py-3 last:border-b-0">
                  <span className="type-caption text-fg-3 tabular w-6 flex-none">0{i + 1}</span>
                  <span className="type-body text-fg">{q}</span>
                </div>
              ))}
            </div>
          </Card>
          <p className="type-caption text-fg-3 mt-4 max-w-[692px]">
            Answers may be shared with the seller and checked against available records.
          </p>
        </Container>
      </Tile>

      <Tile tone="parchment" id={REGISTER_ID} className="anchor-target">
        <Container className="tab:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] tab:items-start grid grid-cols-1 gap-x-16 gap-y-10">
          <div>
            <h2 className="type-display-md text-fg">Register my criteria</h2>
            <p className="type-body text-fg-2 mt-4">
              We contact you only about a relevant opportunity or a verification step. Your criteria are not shared with
              other buyers.
            </p>
            <p className="type-caption text-fg-3 mt-4">About three minutes.</p>
          </div>
          <BuyerRegisterForm />
        </Container>
      </Tile>

      <Tile tone="light">
        <Container size="text" className="text-center">
          <h2 className="type-display-md text-fg">Register once</h2>
          <p className="type-body text-fg-2 mt-4">Complete Buyer Passport once and keep it current.</p>
          <RegisterCtas className="mt-8 flex flex-wrap justify-center gap-3" />
          <p className="type-caption text-fg-3 mt-5">Buyer Passport is currently free.</p>
        </Container>
      </Tile>
    </>
  )
}
