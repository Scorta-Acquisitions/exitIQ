import { LendersStation } from "@/components/scorta/LendersStation"
import { PERSONA } from "@/lib/persona"

export const metadata = { title: "Lender Outreach — Scorta" }

export default function LendersPage() {
  return <LendersStation persona={PERSONA} />
}
