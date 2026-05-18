import { LockedStation } from "@/components/scorta/LockedStation"
import { STATIONS } from "@/lib/persona"

export const metadata = { title: "Scorta Score — Scorta" }

const station = STATIONS.find((s) => s.href === "/score")!

export default function ScorePage() {
  return (
    <LockedStation
      station={`${station.sublabel} · ${station.href}`}
      agent="Case Manager Agent"
      title="Scorta Score"
      blurb="Animated 0–100 dial with the four sub-scores — Financial Health, Market Position, Transferability, Documentation Quality — and an improvement accordion driven by the Case Manager Agent's plan."
      prereq={station.prereq ?? "the previous station is complete"}
    />
  )
}
