import { NetworkStation } from "@/components/scorta/NetworkStation"
import { PERSONA } from "@/lib/persona"

export const metadata = { title: "Buyer Network — Scorta" }

export default function NetworkPage() {
  return <NetworkStation persona={PERSONA} />
}
