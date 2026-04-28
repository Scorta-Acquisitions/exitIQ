import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest"

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>()
  return { ...actual, after: vi.fn((fn: () => void | Promise<void>) => fn()) }
})

const mockTeaserObject = {
  headline: "Profitable retail business with strong recurring revenue",
  valuationRange: "$1.2M – $1.8M",
  topStrength: "High recurring revenue and low owner dependency",
  topRisk: "Customer concentration requires diversification before listing",
  segmentTag: "hot_seller" as const,
}

vi.mock("ai", () => ({
  streamText: vi.fn(),
  generateObject: vi.fn().mockResolvedValue({ object: mockTeaserObject }),
}))

const mockSessionFindFirst = vi.fn()
const mockInsertChain = {
  values: vi.fn().mockReturnThis(),
  onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
}

vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(() => mockInsertChain),
    query: {
      assessmentSessions: {
        findFirst: mockSessionFindFirst,
      },
      assessmentReports: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    },
  },
}))

vi.mock("@/lib/ai", () => ({
  anthropic: vi.fn((model: string) => model),
  SONNET_MODEL: "claude-sonnet-4-6",
  HAIKU_MODEL: "claude-haiku-4-5-20251001",
  DEFAULT_MODEL: "claude-sonnet-4-6",
}))

vi.mock("@/lib/ai/prompts", () => ({
  buildReportPrompt: vi.fn(() => "test prompt"),
  buildTeaserPrompt: vi.fn(() => "test teaser prompt"),
}))

type PostHandler = (req: Request) => Promise<Response>

let POST: PostHandler

beforeAll(async () => {
  const mod = await import("@/app/api/assessment/teaser/route")
  POST = mod.POST as PostHandler
})

const sessionWithStage1AndGate = {
  id: "uuid-1",
  sessionId: "test-123",
  createdAt: new Date(),
  completedAt: null,
  stage1: { industry: "retail", years: 5, revenue: "1m_2m", sde: "500_1m", employees: "6_15", state: "CA" },
  gate: { firstName: "John", email: "john@test.com", sellingTimeline: "6_months", tag: "hot_seller" },
  stage2: null,
  stage3: null,
  stage4: null,
  score: null,
  sbaEligible: null,
  segmentTag: "hot_seller",
}

describe("POST /api/assessment/teaser", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInsertChain.values.mockReturnThis()
    mockInsertChain.onConflictDoUpdate.mockResolvedValue(undefined)
  })

  it("returns headline, valuationRange, topStrength, topRisk, segmentTag", async () => {
    mockSessionFindFirst.mockResolvedValueOnce(sessionWithStage1AndGate)

    const req = new Request("http://localhost/api/assessment/teaser", {
      method: "POST",
      body: JSON.stringify({ sessionId: "test-123" }),
      headers: { "Content-Type": "application/json" },
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    const data = (await res.json()) as {
      headline: string
      valuationRange: string
      topStrength: string
      topRisk: string
      segmentTag: string
    }
    expect(data).toHaveProperty("headline")
    expect(data).toHaveProperty("valuationRange")
    expect(data).toHaveProperty("topStrength")
    expect(data).toHaveProperty("topRisk")
    expect(data).toHaveProperty("segmentTag")
    expect(data.segmentTag).toBe("hot_seller")
  })

  it("returns 422 when stage1 is missing", async () => {
    mockSessionFindFirst.mockResolvedValueOnce({
      ...sessionWithStage1AndGate,
      stage1: null,
    })

    const req = new Request("http://localhost/api/assessment/teaser", {
      method: "POST",
      body: JSON.stringify({ sessionId: "test-123" }),
      headers: { "Content-Type": "application/json" },
    })

    const res = await POST(req)
    expect(res.status).toBe(422)

    const data = (await res.json()) as { error: string; missing: string[] }
    expect(data.error).toBe("incomplete_session")
    expect(data.missing).toContain("stage1")
  })

  it("returns 422 when gate is missing", async () => {
    mockSessionFindFirst.mockResolvedValueOnce({
      ...sessionWithStage1AndGate,
      gate: null,
    })

    const req = new Request("http://localhost/api/assessment/teaser", {
      method: "POST",
      body: JSON.stringify({ sessionId: "test-123" }),
      headers: { "Content-Type": "application/json" },
    })

    const res = await POST(req)
    expect(res.status).toBe(422)

    const data = (await res.json()) as { error: string; missing: string[] }
    expect(data.error).toBe("incomplete_session")
    expect(data.missing).toContain("gate")
  })

  it("returns 404 when session not found", async () => {
    mockSessionFindFirst.mockResolvedValueOnce(undefined)

    const req = new Request("http://localhost/api/assessment/teaser", {
      method: "POST",
      body: JSON.stringify({ sessionId: "unknown" }),
      headers: { "Content-Type": "application/json" },
    })

    const res = await POST(req)
    expect(res.status).toBe(404)
  })
})
