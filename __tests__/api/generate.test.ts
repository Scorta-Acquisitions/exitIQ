import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest"

// Mock after() to execute immediately for testing
vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>()
  return { ...actual, after: vi.fn((fn: () => void | Promise<void>) => fn()) }
})

// Build a mock ReadableStream response
const mockToTextStreamResponse = vi.fn(() => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode("# Exit IQ Report\n\nTest content"))
      controller.close()
    },
  })
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
})

const mockStreamText = vi.fn(() => ({
  toTextStreamResponse: mockToTextStreamResponse,
}))

vi.mock("ai", () => ({
  streamText: mockStreamText,
  generateObject: vi.fn(),
}))

const mockSessionFindFirst = vi.fn()
const mockReportFindFirst = vi.fn()

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
        findFirst: mockReportFindFirst,
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
}))

type PostHandler = (req: Request) => Promise<Response>

let POST: PostHandler

beforeAll(async () => {
  const mod = await import("@/app/api/assessment/generate/route")
  POST = mod.POST as PostHandler
})

const completeSession = {
  id: "uuid-1",
  sessionId: "test-123",
  createdAt: new Date(),
  completedAt: new Date(),
  stage1: { industry: "retail", years: 5 },
  gate: { firstName: "John", email: "john@test.com", sellingTimeline: "6_months", tag: "hot_seller" },
  stage2: { ownerDependency: "minor_impact", customerConcentration: "under_10" },
  stage3: {
    sbaRestricted: "no",
    keyPersonRisk: "none",
    sops: "mostly_docs",
    growthLevers: "digital",
    legal: "no_issues",
  },
  stage4: {
    askingPrice: "1500000",
    dealStructure: ["sba", "seller_finance"],
    urgency: "flexible",
    brokerStatus: "none",
  },
  score: 72,
  sbaEligible: true,
  segmentTag: "hot_seller",
}

describe("POST /api/assessment/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInsertChain.values.mockReturnThis()
    mockInsertChain.onConflictDoUpdate.mockResolvedValue(undefined)
    mockReportFindFirst.mockResolvedValue(null)
    mockStreamText.mockReturnValue({ toTextStreamResponse: mockToTextStreamResponse })
  })

  it("returns a ReadableStream body for a complete session", async () => {
    mockSessionFindFirst.mockResolvedValueOnce(completeSession)

    const req = new Request("http://localhost/api/assessment/generate", {
      method: "POST",
      body: JSON.stringify({ sessionId: "test-123" }),
      headers: { "Content-Type": "application/json" },
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(res.body).toBeInstanceOf(ReadableStream)
  })

  it("calls streamText for a complete session", async () => {
    mockSessionFindFirst.mockResolvedValueOnce(completeSession)

    const req = new Request("http://localhost/api/assessment/generate", {
      method: "POST",
      body: JSON.stringify({ sessionId: "test-123" }),
      headers: { "Content-Type": "application/json" },
    })

    await POST(req)
    expect(mockStreamText).toHaveBeenCalledOnce()
  })

  it("returns cached report without calling streamText on second call", async () => {
    mockSessionFindFirst.mockResolvedValue(completeSession)
    mockReportFindFirst.mockResolvedValueOnce({
      id: "report-uuid",
      sessionId: "test-123",
      reportMd: "# Cached Report\n\nExisting content",
      modelUsed: "claude-sonnet-4-6",
      generationMs: 5000,
      createdAt: new Date(),
    })

    const req = new Request("http://localhost/api/assessment/generate", {
      method: "POST",
      body: JSON.stringify({ sessionId: "test-123" }),
      headers: { "Content-Type": "application/json" },
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockStreamText).not.toHaveBeenCalled()

    const text = await res.text()
    expect(text).toContain("Cached Report")
  })

  it("succeeds when stage2/3/4 are null (they are optional in the 10-question flow)", async () => {
    mockSessionFindFirst.mockResolvedValueOnce({
      ...completeSession,
      stage2: null,
      stage3: null,
      stage4: null,
    })

    const req = new Request("http://localhost/api/assessment/generate", {
      method: "POST",
      body: JSON.stringify({ sessionId: "test-123" }),
      headers: { "Content-Type": "application/json" },
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockStreamText).toHaveBeenCalledOnce()
  })

  it("returns 404 when session not found", async () => {
    mockSessionFindFirst.mockResolvedValueOnce(undefined)

    const req = new Request("http://localhost/api/assessment/generate", {
      method: "POST",
      body: JSON.stringify({ sessionId: "unknown" }),
      headers: { "Content-Type": "application/json" },
    })

    const res = await POST(req)
    expect(res.status).toBe(404)
  })
})
