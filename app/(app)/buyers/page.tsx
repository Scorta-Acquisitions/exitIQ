import { BuyersStation } from "@/components/scorta/BuyersStation"
import { PERSONA } from "@/lib/persona"

export const metadata = { title: "Buyer Outreach — Scorta" }

export default function BuyersPage() {
  return <BuyersStation persona={PERSONA} />
}
