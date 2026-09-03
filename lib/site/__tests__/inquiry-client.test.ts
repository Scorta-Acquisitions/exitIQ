import { afterEach, describe, expect, it, vi } from "vitest"
import { INQUIRY_KINDS, type InquiryPayload, inquirySchema, submitInquiry } from "@/lib/site/inquiry"

const PAYLOAD: InquiryPayload = {
  kind: "offer_review",
  email: "seller@example.com",
  body: "LOI: $4.65M, 90-day exclusivity",
  source: "offer-review",
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("submitInquiry()", () => {
  it("posts the payload as JSON to /api/inquiry with keepalive so navigation cannot cancel it", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal("fetch", fetchMock)
    await submitInquiry(PAYLOAD)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith("/api/inquiry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(PAYLOAD),
      keepalive: true,
    })
  })

  it("resolves true when the server accepts the inquiry", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 202 }))
    await expect(submitInquiry(PAYLOAD)).resolves.toBe(true)
  })

  it("resolves false when the server rejects the inquiry", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 400 }))
    await expect(submitInquiry(PAYLOAD)).resolves.toBe(false)
  })

  it("resolves false instead of throwing when the network fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")))
    await expect(submitInquiry(PAYLOAD)).resolves.toBe(false)
  })

  it("resolves false when fetch is not available at all", async () => {
    vi.stubGlobal("fetch", undefined)
    await expect(submitInquiry(PAYLOAD)).resolves.toBe(false)
  })
})

describe("inquirySchema", () => {
  it("accepts every declared inquiry kind", () => {
    for (const kind of INQUIRY_KINDS) {
      expect(inquirySchema.safeParse({ kind, body: "x" }).success).toBe(true)
    }
  })

  it("trims the email, body, and source", () => {
    const parsed = inquirySchema.parse({ kind: "question", email: "  a@b.co ", body: "  hi  ", source: " page " })
    expect(parsed).toEqual({ kind: "question", email: "a@b.co", body: "hi", source: "page" })
  })

  it("allows an empty-string email and an omitted email", () => {
    expect(inquirySchema.safeParse({ kind: "question", body: "x", email: "" }).success).toBe(true)
    expect(inquirySchema.safeParse({ kind: "question", body: "x" }).success).toBe(true)
  })

  it("rejects an email over 254 characters", () => {
    const email = `${"a".repeat(250)}@x.co`
    expect(inquirySchema.safeParse({ kind: "question", body: "x", email }).success).toBe(false)
  })

  it("rejects a source over 120 characters", () => {
    expect(inquirySchema.safeParse({ kind: "question", body: "x", source: "s".repeat(121) }).success).toBe(false)
    expect(inquirySchema.safeParse({ kind: "question", body: "x", source: "s".repeat(120) }).success).toBe(true)
  })
})
