import { HomeHero } from "@/components/site/hero/HomeHero"
import { CloseSection } from "@/components/site/home/CloseSection"
import { FinancialPrep } from "@/components/site/home/FinancialPrep"
import { OfferComparison } from "@/components/site/home/OfferComparison"
import { QuestionsTeaser } from "@/components/site/home/QuestionsTeaser"
import { SellerWorkload } from "@/components/site/home/SellerWorkload"
import { SpeedSection } from "@/components/site/home/SpeedSection"
import { TermsStrip } from "@/components/site/home/TermsStrip"
import { TransactionCarries } from "@/components/site/home/TransactionCarries"
import { MarketScene } from "@/components/site/scenes/MarketScene"
import { PrivacyScene } from "@/components/site/scenes/PrivacyScene"

/**
 * The home page is a stack of full-bleed tiles whose tones alternate down the page; the colour change
 * is the only divider. Each section owns its tone, so this order is the page's rhythm:
 *
 *   HomeHero            light
 *   TermsStrip          parchment
 *   MarketScene         dark        (scroll scene)
 *   FinancialPrep       light       (demo)
 *   PrivacyScene        dark        (demo)
 *   OfferComparison     parchment
 *   SellerWorkload      light       (demo)
 *   SpeedSection        dark
 *   TransactionCarries  dark-3      (the video tile, a micro-step darker than the tile above it)
 *   QuestionsTeaser     parchment
 *   CloseSection        light
 *
 * The three demos (FinancialPrep, PrivacyScene, SellerWorkload) are a few words beside the software's
 * screen, which plays itself once and then rests. Neither PrivacyScene nor SellerWorkload pins: MarketScene
 * is the only scroll-driven scene left on the page.
 */
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <TermsStrip />
      <MarketScene />
      <FinancialPrep />
      <PrivacyScene />
      <OfferComparison />
      <SellerWorkload />
      <SpeedSection />
      <TransactionCarries />
      <QuestionsTeaser />
      <CloseSection />
    </>
  )
}
