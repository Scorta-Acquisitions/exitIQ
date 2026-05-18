import { ConnectStation } from "@/components/scorta/ConnectStation"
import { PERSONA } from "@/lib/persona"

export const metadata = { title: "Platform Connectors — Scorta" }

export default function ConnectPage() {
  return <ConnectStation persona={PERSONA} />
}
