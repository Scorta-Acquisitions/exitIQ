import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest"
import { NextRequest } from "next/server"

const mockReportFindFirst = vi.fn()

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      assessmentReports: {
        findFirst: mockReportFindFirst,
      },
    },
  },
}))

type GetHandler = (req: NextRequest, ctx: { params: Promise<{ session_id: string }> }) => Promise<Response>

let GET: GetHandler

beforeAll(async () => {
  const mod = await import("@/app/api/assessment/report/[session_id]/route")
  GET = mod.GET as GetHandler
})

describe("GET /api/assessment/report/[session_id]", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns reportMd, teaserJson, and createdAt for a known session", async () => {
    const mockCreatedAt = new Date("2024-01-15T10:00:00.000Z")
    mockReportFindFirst.mockResolvedValueOnce({
      id: "report-uuid",
      sessionId: "test-123",
      reportMd: "# Exit IQ Report\n\nFull report content here",
      teaserJson: {
        headline: "Profitable retail business",
        valuationRange: "$1.2M – $1.8M",
        topStrength: "Strong recurring revenue",
        topRisk: "High owner dependency",
        segmentTag: "hot_seller",
      },
      modelUsed: "claude-sonnet-4-6",
      generationMs: 8500,
      createdAt: mockCreatedAt,
    })

    const req = new NextRequest("http://localhost/api/assessment/report/test-123")
    const res = await GET(req, { params: Promise.resolve({ session_id: "test-123" }) })

    expect(res.status).toBe(200)

    const data = (await res.json()) as { reportMd: string; teaserJson: { segmentTag: string }; createdAt: string }
    expect(data).toHaveProperty("reportMd")
    expect(data).toHaveProperty("teaserJson")
    expect(data).toHaveProperty("createdAt")
    expect(data.reportMd).toContain("Exit IQ Report")
    expect(data.teaserJson.segmentTag).toBe("hot_seller")
  })

  it("returns 404 for an unknown session_id", async () => {
    mockReportFindFirst.mockResolvedValueOnce(undefined)

    const req = new NextRequest("http://localhost/api/assessment/report/unknown-session")
    const res = await GET(req, { params: Promise.resolve({ session_id: "unknown-session" }) })

    expect(res.status).toBe(404)

    const data = (await res.json()) as { error: string }
    expect(data.error).toBe("not_found")
  })
})
