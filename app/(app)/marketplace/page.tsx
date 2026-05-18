import { LockedStation } from "@/components/scorta/LockedStation"
import { STATIONS } from "@/lib/persona"

export const metadata = { title: "Lenders / VDR / Listings — Scorta" }

const station = STATIONS.find((s) => s.href === "/marketplace")!

export default function MarketplacePage() {
  return (
    <LockedStation
      station={`${station.sublabel} · ${station.href}`}
      agent="Lender Ops Agent"
      title="Lenders · VDR · Listings"
      blurb="Tabbed workspace where the Lender Ops Agent matches SBA-preferred lenders, the Virtual Data Room tracks document readiness, and your anonymized listing goes live to qualified buyers."
      prereq={station.prereq ?? "the previous station is complete"}
    />
  )
}
