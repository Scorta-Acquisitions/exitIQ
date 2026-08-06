/**
 * Capital-verification logic — synthetic fixtures only, per Execution Plan §1:
 * a total swap of `lib/dealiq/data/` must not touch this file.
 */

import { describe, expect, it } from "vitest"

import {
  acceptAttribute,
  fileExtension,
  isAcceptedFundingDocument,
  VERIFICATION_CHECK_SETTLE_MS,
  VERIFICATION_CHECK_STEP_MS,
  VERIFICATION_TAIL_MS,
  verificationRunMs,
} from "@/lib/dealiq/verification"

describe("fileExtension", () => {
  it("lowercases the final extension", () => {
    expect(fileExtension("Proof-of-Funds.PDF")).toBe("pdf")
    expect(fileExtension("statement.q2.docx")).toBe("docx")
  })

  it("returns null when there is no usable extension", () => {
    expect(fileExtension("statement")).toBeNull()
    expect(fileExtension(".gitignore")).toBeNull()
    expect(fileExtension("archive.")).toBeNull()
  })
})

describe("isAcceptedFundingDocument", () => {
  it("accepts documents by MIME type", () => {
    expect(isAcceptedFundingDocument("letter.pdf", "application/pdf")).toBe(true)
    expect(isAcceptedFundingDocument("scan.png", "image/png")).toBe(true)
    expect(isAcceptedFundingDocument("photo.heic", "image/heic")).toBe(true)
    expect(isAcceptedFundingDocument("letter.docx", "application/msword")).toBe(true)
  })

  it("falls back to the extension when the browser reports no MIME type", () => {
    expect(isAcceptedFundingDocument("prequal.docx", "")).toBe(true)
    expect(isAcceptedFundingDocument("LETTER.PDF", "")).toBe(true)
  })

  it("falls back to the extension on the generic octet-stream type", () => {
    expect(isAcceptedFundingDocument("statement.pdf", "application/octet-stream")).toBe(true)
    expect(isAcceptedFundingDocument("statement.bin", "application/octet-stream")).toBe(false)
  })

  it("rejects non-document files", () => {
    expect(isAcceptedFundingDocument("archive.zip", "application/zip")).toBe(false)
    expect(isAcceptedFundingDocument("clip.mp4", "video/mp4")).toBe(false)
    expect(isAcceptedFundingDocument("setup.exe", "")).toBe(false)
    expect(isAcceptedFundingDocument("script.js", "text/javascript")).toBe(false)
  })

  it("rejects a file with neither a usable MIME type nor an extension", () => {
    expect(isAcceptedFundingDocument("statement", "")).toBe(false)
  })
})

describe("acceptAttribute", () => {
  it("is a comma-separated list covering extensions, types, and prefixes", () => {
    const accept = acceptAttribute()
    expect(accept).toContain(".pdf")
    expect(accept).toContain("application/pdf")
    expect(accept).toContain("image/*")
    expect(accept.split(",").every((token) => token.trim().length > 0)).toBe(true)
  })
})

describe("verificationRunMs", () => {
  it("matches the scripted timeline for n lines", () => {
    expect(verificationRunMs(3)).toBe(
      2 * VERIFICATION_CHECK_STEP_MS + VERIFICATION_CHECK_SETTLE_MS + VERIFICATION_TAIL_MS
    )
  })

  it("runs roughly the ~2.2s the plan scripts for three check lines", () => {
    const run = verificationRunMs(3)
    expect(run).toBeGreaterThanOrEqual(1800)
    expect(run).toBeLessThanOrEqual(2600)
  })

  it("is zero for an empty script and monotonic in line count", () => {
    expect(verificationRunMs(0)).toBe(0)
    expect(verificationRunMs(4)).toBeGreaterThan(verificationRunMs(3))
  })
})
