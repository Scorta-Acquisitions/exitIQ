import { VDRStation } from "@/components/scorta/VDRStation"
import { PERSONA } from "@/lib/persona"

export const metadata = { title: "Virtual Data Room — Scorta" }

export default function VdrPage() {
  return <VDRStation persona={PERSONA} />
}
