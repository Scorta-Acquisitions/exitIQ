import type { SegmentTag } from "@/lib/assessment/session"

export function computeTag(sellingTimeline: string): SegmentTag {
  if (sellingTimeline === "already" || sellingTimeline === "6_12mo") return "hot_seller"
  if (sellingTimeline === "1_2yr" || sellingTimeline === "3plus") return "warm_explorer"
  return "nurture"
}

export const SELLING_TIMELINE_OPTIONS = [
  { value: "already", label: "Already trying to sell" },
  { value: "6_12mo", label: "6–12 months" },
  { value: "1_2yr", label: "1–2 years" },
  { value: "3plus", label: "3+ years" },
  { value: "curious", label: "Just curious" },
]
