import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest"
import { NextRequest } from "next/server"

// Mock next/server after() to be a no-op
vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>()
  return { ...actual, after: vi.fn() }
})

// Build a chainable drizzle-like mock
const mockInsertChain = {
  values: vi.fn().mockReturnThis(),
  onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
}

const mockFindFirst = vi.fn()

vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(() => mockInsertChain),
    query: {
      assessmentSessions: {
        findFirst: mockFindFirst,
      },
    },
  },
}))

vi.mock("@/lib/assessment/scoring", () => ({
  computeScore: vi.fn().mockReturnValue({ composite: 72, grade: "B" }),
}))

vi.mock("@/lib/assessment/sba", () => ({
  computeSBASnapshot: vi.fn().mockReturnValue({ eligible: true }),
}))

type PostHandler = (req: Request) => Promise<Response>
type GetHandler = (req: NextRequest, ctx: { params: Promise<{ session_id: string }> }) => Promise<Response>

let POST: PostHandler
let GET: GetHandler

beforeAll(async () => {
  const sessionRoute = await import("@/app/api/assessment/session/route")
  POST = sessionRoute.POST as PostHandler
  const sessionGetRoute = await import("@/app/api/assessment/session/[session_id]/route")
  GET = sessionGetRoute.GET as GetHandler
})

describe("POST /api/assessment/session", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInsertChain.values.mockReturnThis()
    mockInsertChain.onConflictDoUpdate.mockResolvedValue(undefined)
  })

  it("upserts a session and returns sessionId, score, sbaEligible", async () => {
    const req = new Request("http://localhost/api/assessment/session", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "test-123",
        stage1: { industry: "retail", years: 5 },
        completedAt: Date.now(),
      }),
      headers: { "Content-Type": "application/json" },
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    const data = (await res.json()) as { sessionId: string; score: number | null; sbaEligible: boolean | null }
    expect(data.sessionId).toBe("test-123")
    expect(data.score).toBe(72)
    expect(data.sbaEligible).toBe(true)
  })

  it("returns 400 with issues array for invalid body", async () => {
    const req = new Request("http://localhost/api/assessment/session", {
      method: "POST",
      body: JSON.stringify({ sessionId: "" }), // empty sessionId fails min(1)
      headers: { "Content-Type": "application/json" },
    })

    const res = await POST(req)
    expect(res.status).toBe(400)

    const data = (await res.json()) as { error: string; issues: unknown[] }
    expect(data.error).toBe("validation_error")
    expect(Array.isArray(data.issues)).toBe(true)
    expect(data.issues.length).toBeGreaterThan(0)
  })

  it("returns null score when completedAt is not provided", async () => {
    const req = new Request("http://localhost/api/assessment/session", {
      method: "POST",
      body: JSON.stringify({ sessionId: "test-456" }),
      headers: { "Content-Type": "application/json" },
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    const data = (await res.json()) as { sessionId: string; score: number | null; sbaEligible: boolean | null }
    expect(data.sessionId).toBe("test-456")
    expect(data.score).toBeNull()
    expect(data.sbaEligible).toBeNull()
  })
})

describe("GET /api/assessment/session/[session_id]", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns the session row when found", async () => {
    const mockRow = {
      id: "uuid-1",
      sessionId: "test-123",
      createdAt: new Date(),
      stage1: { industry: "retail" },
    }
    mockFindFirst.mockResolvedValueOnce(mockRow)

    const req = new NextRequest("http://localhost/api/assessment/session/test-123")
    const res = await GET(req, { params: Promise.resolve({ session_id: "test-123" }) })

    expect(res.status).toBe(200)
    const data = (await res.json()) as { sessionId: string }
    expect(data.sessionId).toBe("test-123")
  })

  it("returns 404 when session is not found", async () => {
    mockFindFirst.mockResolvedValueOnce(undefined)

    const req = new NextRequest("http://localhost/api/assessment/session/unknown")
    const res = await GET(req, { params: Promise.resolve({ session_id: "unknown" }) })

    expect(res.status).toBe(404)
    const data = (await res.json()) as { error: string }
    expect(data.error).toBe("not_found")
  })
})
