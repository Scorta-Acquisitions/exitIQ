import { IngestionStation } from "@/components/scorta/IngestionStation"
import { PERSONA } from "@/lib/persona"

export const metadata = { title: "Data Processing — Scorta" }

export default function IngestionPage() {
  return <IngestionStation persona={PERSONA} />
}
