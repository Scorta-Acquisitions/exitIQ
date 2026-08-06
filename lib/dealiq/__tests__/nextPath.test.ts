import { describe, expect, it } from "vitest"

import { safeDealIqPath } from "@/lib/dealiq/nextPath"

const FALLBACK = "/dealiq"

describe("safeDealIqPath", () => {
  it("accepts valid deep links under /dealiq", () => {
    expect(safeDealIqPath("/dealiq")).toBe("/dealiq")
    expect(safeDealIqPath("/dealiq/deal/deal-x?tab=recast")).toBe("/dealiq/deal/deal-x?tab=recast")
    expect(safeDealIqPath("/dealiq/verify")).toBe("/dealiq/verify")
  })

  it("falls back on empty input", () => {
    expect(safeDealIqPath(null)).toBe(FALLBACK)
    expect(safeDealIqPath(undefined)).toBe(FALLBACK)
    expect(safeDealIqPath("")).toBe(FALLBACK)
  })

  it("rejects off-product and external targets", () => {
    expect(safeDealIqPath("//evil.com")).toBe(FALLBACK)
    expect(safeDealIqPath("https://evil.com")).toBe(FALLBACK)
    expect(safeDealIqPath("/\\evil.com")).toBe(FALLBACK)
    expect(safeDealIqPath("%2f%2fevil.com")).toBe(FALLBACK)
    expect(safeDealIqPath("/dashboard")).toBe(FALLBACK)
  })

  it("rejects traversal, prefix spoofing, and malformed encoding", () => {
    expect(safeDealIqPath("/dealiq/../dashboard")).toBe(FALLBACK)
    expect(safeDealIqPath("/dealiq%2f..%2f..%2fdashboard")).toBe(FALLBACK)
    expect(safeDealIqPath("/dealiqevil")).toBe(FALLBACK)
    expect(safeDealIqPath("/dealiq/%")).toBe(FALLBACK)
  })
})
