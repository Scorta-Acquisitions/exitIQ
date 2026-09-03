import { ScortaScoreStation } from "@/components/scorta/ScortaScoreStation"
import { PERSONA } from "@/lib/persona"

export const metadata = { title: "Scorta Score — Scorta" }

export default function ScorePage() {
  return <ScortaScoreStation persona={PERSONA} />
}
