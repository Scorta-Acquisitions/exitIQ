import type { Stage1Answers } from "@/lib/assessment/session"
import { US_STATES } from "@/lib/assessment/states"

// Frontend uses human-readable labels; backend scoring uses short slugs.
// These maps translate one to the other server-side, keeping stored JSONB
// human-readable for AI prompts while scoring receives correct codes.

const INDUSTRY_MAP: Record<string, string> = {
  Restaurant: "food_bev",
  Retail: "retail",
  "Home Services": "home_services",
  Medical: "healthcare_medical",
  Manufacturing: "manufacturing_light",
  "Professional Services": "accounting",
  Other: "other",
}

const REVENUE_MAP: Record<string, string> = {
  "Under $250K": "under_250",
  "$250K – $500K": "250_500",
  "$500K – $1M": "500_1m",
  "$1M – $3M": "1m_2m",
  "$3M – $10M": "2m_5m",
  "$10M+": "5m_10m",
}

const SDE_MAP: Record<string, string> = {
  "Under $100K": "under_250",
  "$100K – $250K": "under_250",
  "$250K – $500K": "250_500",
  "$500K – $1M": "500_1m",
  "$1M+": "1m_2m",
}

const EMPLOYEE_MAP: Record<string, string> = {
  "Just me": "solo",
  "2 – 5": "1_5",
  "6 – 15": "6_15",
  "16 – 50": "16_50",
  "50+": "50plus",
}

function stateNameToCode(stateName: string): string {
  const found = US_STATES.find((s) => s.label === stateName)
  return found?.value ?? stateName
}

/**
 * Translates frontend human-readable Stage1 labels to the short-slug codes
 * expected by backend scoring and SBA functions. Does not mutate the input;
 * the original stage1 JSONB in the DB retains human-readable labels for prompts.
 */
export function mapStage1ForScoring(s1: Partial<Stage1Answers>): Partial<Stage1Answers> {
  return {
    industry: INDUSTRY_MAP[s1.industry ?? ""] ?? s1.industry,
    years: s1.years,
    revenue: REVENUE_MAP[s1.revenue ?? ""] ?? s1.revenue,
    sde: SDE_MAP[s1.sde ?? ""] ?? s1.sde,
    employees: EMPLOYEE_MAP[s1.employees ?? ""] ?? s1.employees,
    state: s1.state ? stateNameToCode(s1.state) : undefined,
  }
}

/** Maps the EmailGateModal timeline label to the backend sellingTimeline slug. */
export const TIMELINE_LABEL_TO_SLUG: Record<string, string> = {
  "Just curious": "curious",
  "6–12 months": "6_12mo",
  "1–2 years": "1_2yr",
  "3+ years": "3plus",
  "Already selling": "already",
}
