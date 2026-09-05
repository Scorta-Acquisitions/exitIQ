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
