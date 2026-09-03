import { RecastStation } from "@/components/scorta/RecastStation"
import { PERSONA } from "@/lib/persona"

export const metadata = { title: "Financials Recast — Scorta" }

export default function RecastPage() {
  return <RecastStation persona={PERSONA} />
}
