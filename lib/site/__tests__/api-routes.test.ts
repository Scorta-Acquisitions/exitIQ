// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { GET as healthGet } from "@/app/api/health/route"
import { POST } from "@/app/api/inquiry/route"
import robots from "@/app/robots"
import sitemap from "@/app/sitemap"
import { ALL_ROUTES, CONTACT } from "@/lib/site/routes"

const { mockEnv, sendMock, resendKeys, afterCallbacks, logger } = vi.hoisted(() => ({
  mockEnv: { RESEND_API_KEY: undefined as string | undefined, NEXT_PUBLIC_SITE_URL: undefined as string | undefined },
  sendMock: vi.fn(),
  resendKeys: [] as string[],
  afterCallbacks: [] as Array<() => Promise<void> | void>,
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock("@/env.mjs", () => ({ env: mockEnv }))
vi.mock("@/lib/logger", () => ({ logger }))
vi.mock("next/server", () => ({
  after: (cb: () => Promise<void> | void) => {
    afterCallbacks.push(cb)
  },
}))
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock }
    constructor(key: string) {
      resendKeys.push(key)
    }
  },
}))

/** Runs everything the route deferred with `after()`, the way Next does once the response is sent. */
async function runAfter() {
  const cbs = afterCallbacks.splice(0)
  for (const cb of cbs) await cb()
}

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/inquiry", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  })
}

const VALID = { kind: "question", email: "owner@example.com", body: "How long does a sale take?", source: "questions" }

type Issue = { path: Array<string | number>; code: string }

beforeEach(() => {
  mockEnv.RESEND_API_KEY = undefined
  mockEnv.NEXT_PUBLIC_SITE_URL = undefined
  sendMock.mockReset()
  sendMock.mockResolvedValue({ data: { id: "re_123" }, error: null })
  resendKeys.length = 0
  afterCallbacks.length = 0
  logger.info.mockReset()
  logger.warn.mockReset()
  logger.error.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("POST /api/inquiry — request guards", () => {
  it("rejects a declared payload above 32KB with 413 before reading the body", async () => {
    const res = await POST(post(VALID, { "content-length": String(32 * 1024 + 1) }))
    expect(res.status).toBe(413)
    expect(await res.json()).toEqual({ error: "payload_too_large" })
    expect(logger.info).not.toHaveBeenCalled()
  })

  it("accepts a declared payload of exactly 32KB", async () => {
    const res = await POST(post(VALID, { "content-length": String(32 * 1024) }))
    expect(res.status).toBe(202)
  })

  it("returns 400 invalid_json for a body that is not JSON", async () => {
    const res = await POST(post("{not json"))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: "invalid_json" })
  })

  it("returns 400 validation_error with issues for an unknown kind", async () => {
    const res = await POST(post({ ...VALID, kind: "newsletter" }))
    expect(res.status).toBe(400)
    const json = (await res.json()) as { error: string; issues: Issue[] }
    expect(json.error).toBe("validation_error")
    expect(json.issues.map((i) => i.path)).toEqual([["kind"]])
  })

  it("returns 400 validation_error listing kind and body for an empty object", async () => {
    const res = await POST(post({}))
    expect(res.status).toBe(400)
    const json = (await res.json()) as { issues: Issue[] }
    expect(json.issues.map((i) => i.path).sort()).toEqual([["body"], ["kind"]])
  })

  it("returns 400 validation_error for a malformed email", async () => {
    const res = await POST(post({ ...VALID, email: "not-an-email" }))
    expect(res.status).toBe(400)
    const json = (await res.json()) as { issues: Issue[] }
    expect(json.issues.map((i) => i.path)).toEqual([["email"]])
  })

  it("returns 400 validation_error for a body over 6000 characters", async () => {
    const res = await POST(post({ ...VALID, body: "a".repeat(6001) }))
    expect(res.status).toBe(400)
    const json = (await res.json()) as { issues: Issue[] }
    expect(json.issues.map((i) => [i.path, i.code])).toEqual([[["body"], "too_big"]])
  })

  it("accepts a body of exactly 6000 characters", async () => {
    const res = await POST(post({ ...VALID, body: "a".repeat(6000) }))
    expect(res.status).toBe(202)
  })

  it("returns 400 validation_error for a whitespace-only body", async () => {
    const res = await POST(post({ ...VALID, body: "   \n  " }))
    expect(res.status).toBe(400)
    const json = (await res.json()) as { issues: Issue[] }
    expect(json.issues.map((i) => [i.path, i.code])).toEqual([[["body"], "too_small"]])
  })

  it("does not log an inquiry that failed validation", async () => {
    await POST(post({ ...VALID, kind: "bogus" }))
    expect(logger.info).not.toHaveBeenCalled()
    expect(logger.error).not.toHaveBeenCalled()
  })
})

describe("POST /api/inquiry — without a Resend key", () => {
  it("accepts the inquiry with 202 and reports it was not forwarded", async () => {
    const res = await POST(post(VALID))
    expect(res.status).toBe(202)
    expect(await res.json()).toEqual({ accepted: true, forwarded: false })
  })

  it("never constructs Resend or schedules deferred work", async () => {
    await POST(post(VALID))
    expect(afterCallbacks).toHaveLength(0)
    expect(resendKeys).toHaveLength(0)
    expect(sendMock).not.toHaveBeenCalled()
  })

  it("logs a redacted received event with kind, source, hasEmail, and bodyLength only", async () => {
    await POST(post(VALID))
    expect(logger.info).toHaveBeenCalledTimes(1)
    expect(logger.info).toHaveBeenCalledWith("site.inquiry.received", {
      kind: "question",
      source: "questions",
      hasEmail: true,
      bodyLength: VALID.body.length,
    })
    const serialized = JSON.stringify(logger.info.mock.calls)
    expect(serialized).not.toContain(VALID.email)
    expect(serialized).not.toContain(VALID.body)
  })

  it("logs source as unknown and hasEmail false when both are omitted", async () => {
    await POST(post({ kind: "advisor_briefing", body: "Briefing text" }))
    expect(logger.info).toHaveBeenCalledWith("site.inquiry.received", {
      kind: "advisor_briefing",
      source: "unknown",
      hasEmail: false,
      bodyLength: "Briefing text".length,
    })
  })

  it("treats an empty-string email as no email", async () => {
    const res = await POST(post({ ...VALID, email: "" }))
    expect(res.status).toBe(202)
    expect(logger.info).toHaveBeenCalledWith("site.inquiry.received", expect.objectContaining({ hasEmail: false }))
  })
})

describe("POST /api/inquiry — with a Resend key", () => {
  beforeEach(() => {
    mockEnv.RESEND_API_KEY = "re_test_key"
  })

  it("reports forwarded true and defers the send until after the response", async () => {
    const res = await POST(post(VALID))
    expect(res.status).toBe(202)
    expect(await res.json()).toEqual({ accepted: true, forwarded: true })
    expect(sendMock).not.toHaveBeenCalled()
    expect(afterCallbacks).toHaveLength(1)
  })

  it("constructs Resend with the configured key", async () => {
    await POST(post(VALID))
    await runAfter()
    expect(resendKeys).toEqual(["re_test_key"])
  })

  it("forwards an offer review to the offers inbox with the visitor as reply-to", async () => {
    await POST(post({ kind: "offer_review", email: "seller@example.com", body: "LOI: $4.65M", source: "offer-review" }))
    await runAfter()
    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(sendMock).toHaveBeenCalledWith({
      from: "Heirloom Site <noreply@heirloom.com>",
      to: CONTACT.offers,
      replyTo: "seller@example.com",
      subject: "[site] offer review · offer-review",
      text: "LOI: $4.65M",
    })
  })

  it("forwards a buyer passport registration to the buyers inbox", async () => {
    await POST(post({ kind: "buyer_passport", email: "buyer@example.com", body: "Criteria", source: "buyers" }))
    await runAfter()
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: CONTACT.buyers, subject: "[site] buyer passport · buyers" })
    )
  })

  it.each(["question", "advisor_briefing", "exitiq_review"] as const)(
    "forwards %s to the hello inbox",
    async (kind) => {
      await POST(post({ kind, body: "Text", source: "page" }))
      await runAfter()
      expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({ to: CONTACT.hello }))
    }
  )

  it("omits the source suffix from the subject when no source was sent", async () => {
    await POST(post({ kind: "question", body: "Text" }))
    await runAfter()
    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({ subject: "[site] question" }))
  })

  it("sends undefined reply-to when the visitor left the email blank", async () => {
    await POST(post({ kind: "question", email: "", body: "Text" }))
    await runAfter()
    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({ replyTo: undefined }))
  })

  it("logs the Resend id once the message is sent", async () => {
    await POST(post(VALID))
    await runAfter()
    expect(logger.info).toHaveBeenCalledWith("site.inquiry.sent", { kind: "question", resendId: "re_123" })
    expect(logger.error).not.toHaveBeenCalled()
  })

  it("logs send_failed with the provider message when Resend returns an error", async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: "Invalid `to` address", name: "validation_error" } })
    await POST(post(VALID))
    await runAfter()
    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalledWith("site.inquiry.send_failed", {
      kind: "question",
      error: "Invalid `to` address",
    })
    expect(logger.info).not.toHaveBeenCalledWith("site.inquiry.sent", expect.anything())
  })

  it("logs send_failed with the thrown message when Resend throws", async () => {
    sendMock.mockRejectedValue(new Error("network down"))
    await POST(post(VALID))
    await expect(runAfter()).resolves.toBeUndefined()
    expect(logger.error).toHaveBeenCalledWith("site.inquiry.send_failed", { kind: "question", error: "network down" })
  })

  it("stringifies a non-Error throw in the failure log", async () => {
    sendMock.mockRejectedValue("quota")
    await POST(post(VALID))
    await runAfter()
    expect(logger.error).toHaveBeenCalledWith("site.inquiry.send_failed", { kind: "question", error: "quota" })
  })
})

describe("GET /api/health", () => {
  it("returns 200 with the ok status and service name", async () => {
    const res = healthGet()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: "ok", service: "heirloom-site" })
  })
})

describe("sitemap()", () => {
  it("lists every public route once against localhost when no site URL is set", () => {
    const entries = sitemap()
    expect(entries).toHaveLength(ALL_ROUTES.length)
    expect(entries.map((e) => e.url)).toEqual(ALL_ROUTES.map((p) => `http://localhost:3000${p}`))
  })

  it("strips a trailing slash from the configured site URL", () => {
    mockEnv.NEXT_PUBLIC_SITE_URL = "https://heirloom.com/"
    const entries = sitemap()
    expect(entries[0]?.url).toBe("https://heirloom.com/")
    expect(entries.find((e) => e.url.endsWith("/fees"))?.url).toBe("https://heirloom.com/fees")
    expect(entries.some((e) => e.url.includes("//fees"))).toBe(false)
  })

  it("ranks the home page weekly at priority 1 and every other page monthly at 0.7", () => {
    mockEnv.NEXT_PUBLIC_SITE_URL = "https://heirloom.com"
    const entries = sitemap()
    const home = entries.find((e) => e.url === "https://heirloom.com/")
    expect(home).toMatchObject({ changeFrequency: "weekly", priority: 1 })
    const others = entries.filter((e) => e.url !== "https://heirloom.com/")
    expect(others).toHaveLength(ALL_ROUTES.length - 1)
    for (const e of others) expect(e).toMatchObject({ changeFrequency: "monthly", priority: 0.7 })
  })

  it("stamps every entry with the same lastModified date", () => {
    const entries = sitemap()
    const first = entries[0]?.lastModified
    expect(first).toBeInstanceOf(Date)
    for (const e of entries) expect(e.lastModified).toBe(first)
  })
})

describe("robots()", () => {
  it("allows everything except /api/ for every user agent", () => {
    expect(robots().rules).toEqual([{ userAgent: "*", allow: "/", disallow: ["/api/"] }])
  })

  it("points at the localhost sitemap when no site URL is set", () => {
    expect(robots().sitemap).toBe("http://localhost:3000/sitemap.xml")
  })

  it("points at the configured origin without a doubled slash", () => {
    mockEnv.NEXT_PUBLIC_SITE_URL = "https://heirloom.com/"
    expect(robots().sitemap).toBe("https://heirloom.com/sitemap.xml")
  })
})
