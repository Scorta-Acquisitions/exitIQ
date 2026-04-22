export type SegmentTag = "hot_seller" | "warm_explorer" | "nurture" | "burned_by_broker"

export interface Stage1Answers {
  industry: string
  years: number
  revenue: string
  sde: string
  employees: string
  state: string
}

export interface GateAnswers {
  firstName: string
  email: string
  sellingTimeline: string
  tag: SegmentTag
}

export interface Stage2Answers {
  ownerDependency: string
  customerConcentration: string
  revenueTrend: string
  recurringRevenue: string
  docReadiness: string
  realEstate: string
  reasonForSelling: string
}

export interface Stage3Answers {
  sbaRestricted: string
  keyPersonRisk: string
  sops: string
  growthLevers: string
  legal: string
}

export interface Stage4Answers {
  askingPrice: string
  dealStructure: string[]
  urgency: string
  brokerStatus: string
}

export interface AssessmentSession {
  sessionId: string
  createdAt: number
  stage1?: Partial<Stage1Answers>
  gate?: Partial<GateAnswers>
  stage2?: Partial<Stage2Answers>
  stage3?: Partial<Stage3Answers>
  stage4?: Partial<Stage4Answers>
  completedAt?: number
}

export const SESSION_KEY = "scorta-session-v2"

export function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

export function loadSession(): Partial<AssessmentSession> {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) ?? "{}") as Partial<AssessmentSession>
  } catch {
    return {}
  }
}

export function saveSession(patch: Partial<AssessmentSession>): void {
  if (typeof window === "undefined") return
  try {
    const existing = loadSession()
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...existing, ...patch }))
  } catch {}
}

export function saveStage1(answers: Partial<Stage1Answers>): void {
  const session = loadSession()
  const stage1 = { ...session.stage1, ...answers }
  let sessionId = session.sessionId
  if (!sessionId) sessionId = generateSessionId()
  saveSession({ sessionId, createdAt: session.createdAt ?? Date.now(), stage1 })
}

export function saveGate(answers: Partial<GateAnswers>): void {
  saveSession({ gate: { ...loadSession().gate, ...answers } })
}

export function saveStage(stage: "stage2" | "stage3" | "stage4", answers: Record<string, string | string[]>): void {
  saveSession({ [stage]: { ...((loadSession()[stage] ?? {}) as Record<string, unknown>), ...answers } })
}

export function markComplete(): void {
  saveSession({ completedAt: Date.now() })
}

export function clearSession(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {}
}
