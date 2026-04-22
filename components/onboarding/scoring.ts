import type { Answers, ScoreLabel } from "@/components/onboarding/types"

export function fmt(n: number): string {
  return "$" + n.toLocaleString()
}

export function calcScore(answers: Answers): number {
  let score = 50

  const rev = answers.revenue?.value
  if (rev === "under_250") score += 0
  if (rev === "250_500") score += 8
  if (rev === "500_1m") score += 14
  if (rev === "1m_3m") score += 18
  if (rev === "3m_10m") score += 22
  if (rev === "over_10m") score += 20

  const yrs = answers.years?.value
  if (yrs === "under_2") score -= 5
  if (yrs === "2_5") score += 3
  if (yrs === "5_10") score += 10
  if (yrs === "over_10") score += 16

  const tl = answers.timeline?.value
  if (tl === "asap") score += 2
  if (tl === "6mo") score += 5
  if (tl === "1yr") score += 4

  const ind = answers.industry?.value
  if (ind === "home_services" || ind === "healthcare") score += 5
  if (ind === "tech") score += 8
  if (ind === "food_bev") score += 2

  return Math.min(99, Math.max(42, score))
}

export function getScoreLabel(score: number): ScoreLabel {
  if (score >= 85)
    return {
      label: "Exceptional",
      color: "#84e7a5",
      desc: "Your business is in an excellent position to sell at a premium multiple.",
    }
  if (score >= 70)
    return {
      label: "Strong",
      color: "#84e7a5",
      desc: "Solid fundamentals with a few areas to optimize before going to market.",
    }
  if (score >= 55)
    return {
      label: "Good",
      color: "#fbbd41",
      desc: "Good foundation. With targeted prep, you can significantly improve your valuation.",
    }
  return {
    label: "Developing",
    color: "#fc7981",
    desc: "Early stage — but we can help you build toward a great exit over 12–18 months.",
  }
}

export function getValuationRange(answers: Answers): [number, number] {
  const revenueMap: Record<string, [number, number]> = {
    under_250: [80000, 180000],
    "250_500": [200000, 450000],
    "500_1m": [420000, 950000],
    "1m_3m": [900000, 2800000],
    "3m_10m": [2500000, 9500000],
    over_10m: [9000000, 25000000],
  }
  const base = revenueMap[answers.revenue?.value ?? ""] ?? [200000, 600000]
  const multiplier =
    answers.years?.value === "over_10" ? 1.15 : answers.years?.value === "5_10" ? 1.05 : 1
  return [Math.round(base[0] * multiplier), Math.round(base[1] * multiplier)]
}

export function getSuggestedTimeline(timelineValue?: string): string {
  if (timelineValue === "asap") return "30–60 days"
  if (timelineValue === "6mo") return "3–6 months"
  if (timelineValue === "1yr") return "6–12 months"
  return "12–18 months"
}
