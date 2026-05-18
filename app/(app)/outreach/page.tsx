import { OutreachStation } from "@/components/scorta/OutreachStation"
import { PERSONA } from "@/lib/persona"

export const metadata = { title: "Lenders, Buyers & Outreach — Scorta" }

export default function OutreachPage() {
  return <OutreachStation persona={PERSONA} />
}
