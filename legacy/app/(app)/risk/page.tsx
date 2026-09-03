import { RiskStation } from "@/components/scorta/RiskStation"
import { PERSONA } from "@/lib/persona"

export const metadata = { title: "Risk Analysis — Scorta" }

export default function RiskPage() {
  return <RiskStation persona={PERSONA} />
}
