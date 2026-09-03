import { expect, test } from "@playwright/test"
import { INQUIRY_KINDS } from "../lib/site/inquiry"
import { ALL_ROUTES } from "../lib/site/routes"

const JSON_HEADERS = { "content-type": "application/json" }

test.describe("POST /api/inquiry", () => {
  test("accepts every inquiry kind and reports that nothing was forwarded when Resend is not configured", async ({
    request,
  }) => {
    for (const kind of INQUIRY_KINDS) {
      const res = await request.post("/api/inquiry", {
        data: { kind, body: `e2e ${kind}`, email: "owner@example.com", source: "e2e" },
      })
      expect(res.status(), kind).toBe(202)
      expect(await res.json(), kind).toEqual({ accepted: true, forwarded: false })
    }
  })

  test("accepts an empty email string and a payload without optional fields", async ({ request }) => {
    const res = await request.post("/api/inquiry", { data: { kind: "question", body: "Hello", email: "" } })
    expect(res.status()).toBe(202)
    expect(await res.json()).toEqual({ accepted: true, forwarded: false })
  })

  test("rejects a payload larger than 32KB with 413 before parsing it", async ({ request }) => {
    const res = await request.post("/api/inquiry", {
      data: { kind: "question", body: "x".repeat(32 * 1024 + 1) },
    })
    expect(res.status()).toBe(413)
    expect(await res.json()).toEqual({ error: "payload_too_large" })
  })

  test("rejects a body over 6000 characters that is under the byte cap as a validation error on `body`", async ({
    request,
  }) => {
    const res = await request.post("/api/inquiry", { data: { kind: "question", body: "y".repeat(6001) } })
    expect(res.status()).toBe(400)
    const json = await res.json()
    expect(json.error).toBe("validation_error")
    expect(json.issues.map((i: { path: string[] }) => i.path)).toEqual([["body"]])
  })

  test("rejects form-encoded and plain-text bodies as invalid JSON instead of crashing", async ({ request }) => {
    const form = await request.post("/api/inquiry", {
      data: "kind=question&body=hello",
      headers: { "content-type": "application/x-www-form-urlencoded" },
    })
    expect(form.status()).toBe(400)
    expect(await form.json()).toEqual({ error: "invalid_json" })

    const text = await request.post("/api/inquiry", {
      data: "hello",
      headers: { "content-type": "text/plain" },
    })
    expect(text.status()).toBe(400)
    expect(await text.json()).toEqual({ error: "invalid_json" })
  })

  test("rejects malformed JSON sent with a JSON content type", async ({ request }) => {
    const res = await request.post("/api/inquiry", { data: Buffer.from("{not json"), headers: JSON_HEADERS })
    expect(res.status()).toBe(400)
    expect(await res.json()).toEqual({ error: "invalid_json" })
  })

  test("rejects an unknown kind, a blank body, an invalid email, and an over-long source", async ({ request }) => {
    const cases: Array<{ name: string; data: Record<string, unknown>; field: string }> = [
      { name: "unknown kind", data: { kind: "nope", body: "x" }, field: "kind" },
      { name: "blank body", data: { kind: "question", body: "   " }, field: "body" },
      { name: "invalid email", data: { kind: "question", body: "x", email: "not-an-email" }, field: "email" },
      { name: "long source", data: { kind: "question", body: "x", source: "s".repeat(121) }, field: "source" },
    ]
    for (const c of cases) {
      const res = await request.post("/api/inquiry", { data: c.data })
      expect(res.status(), c.name).toBe(400)
      const json = await res.json()
      expect(json.error, c.name).toBe("validation_error")
      expect(
        json.issues.map((i: { path: string[] }) => i.path[0]),
        `${c.name} should name ${c.field}`
      ).toContain(c.field)
    }
  })

  test("does not answer GET", async ({ request }) => {
    const res = await request.get("/api/inquiry")
    expect(res.status()).toBe(405)
  })
})

test.describe("health", () => {
  for (const path of ["/api/health", "/healthz", "/api/healthz", "/health", "/ping"]) {
    test(`${path} answers 200 with the service name`, async ({ request }) => {
      const res = await request.get(path)
      expect(res.status()).toBe(200)
      expect(await res.json()).toEqual({ status: "ok", service: "heirloom-site" })
    })
  }
})

test("the sitemap lists exactly the ten public routes, weekly for home and monthly for the rest", async ({
  request,
}) => {
  const res = await request.get("/sitemap.xml")
  expect(res.status()).toBe(200)
  expect(res.headers()["content-type"]).toContain("application/xml")
  const xml = await res.text()

  const entries = Array.from(xml.matchAll(/<url>([\s\S]*?)<\/url>/g)).map((m) => m[1]!)
  expect(entries).toHaveLength(ALL_ROUTES.length)

  const locs = entries.map((e) => /<loc>([^<]+)<\/loc>/.exec(e)![1]!)
  const origins = new Set(locs.map((u) => new URL(u).origin))
  expect(origins.size, `one origin, got ${Array.from(origins).join(", ")}`).toBe(1)
  expect(locs.map((u) => new URL(u).pathname)).toEqual(ALL_ROUTES)

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!
    const path = ALL_ROUTES[i]!
    const changefreq = /<changefreq>([^<]+)<\/changefreq>/.exec(entry)?.[1]
    const priority = /<priority>([^<]+)<\/priority>/.exec(entry)?.[1]
    expect(changefreq, path).toBe(path === "/" ? "weekly" : "monthly")
    expect(priority, path).toBe(path === "/" ? "1" : "0.7")
    expect(entry, path).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}T[\d:.]+Z<\/lastmod>/)
  }
})

test("robots.txt allows the site, disallows /api/, and points at the sitemap", async ({ request }) => {
  const res = await request.get("/robots.txt")
  expect(res.status()).toBe(200)
  const lines = (await res.text())
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
  expect(lines.slice(0, 3)).toEqual(["User-Agent: *", "Allow: /", "Disallow: /api/"])
  expect(lines[3]).toMatch(/^Sitemap: https?:\/\/[^/]+\/sitemap\.xml$/)
  expect(lines).toHaveLength(4)
})
