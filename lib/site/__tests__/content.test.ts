import { describe, expect, it } from "vitest"
import {
  buyerRegistrationBody,
  EMPTY_BUYER_REGISTRATION,
  isMutedPassportValue,
  PASSPORT_ROWS,
  PASSPORT_TIERS,
  passportProgress,
  passportShareText,
} from "@/lib/site/buyers/passport"
import {
  ACCESS_LOG,
  fieldTone,
  homeStageName,
  MAX_PERMISSION_LEVEL,
  PERMISSION_LEVELS,
  RECORD_FIELDS,
} from "@/lib/site/confidentiality/data"
import { inquirySchema } from "@/lib/site/inquiry"
import { EMPTY_OFFER_INTAKE, mailtoHref, OFFER_FORWARD_MAILTO, offerReviewBody } from "@/lib/site/mailto"
import { askQuestionBody, HOME_TEASER, QUESTION_CATEGORIES, QUESTION_CATEGORY_LINKS } from "@/lib/site/questions/data"
import { ALL_ROUTES, ANCHORS, FOOTER_GROUPS, MOBILE_NAV_LINKS, NAV_GROUPS, PAGE_META, ROUTES } from "@/lib/site/routes"

describe("routes", () => {
  it("has metadata for every route and only links to known routes from the nav", () => {
    expect(ALL_ROUTES).toHaveLength(10)
    for (const key of Object.keys(ROUTES) as Array<keyof typeof ROUTES>) {
      expect(PAGE_META[key].title.length).toBeGreaterThan(5)
      expect(PAGE_META[key].description.length).toBeGreaterThan(20)
    }
    const known = new Set<string>(ALL_ROUTES)
    for (const g of NAV_GROUPS) for (const l of g.links) expect(known.has(l.href)).toBe(true)
  })

  it("gives every page a distinct title and description", () => {
    const titles = Object.values(PAGE_META).map((m) => m.title)
    const descriptions = Object.values(PAGE_META).map((m) => m.description)
    expect(new Set(titles).size).toBe(titles.length)
    expect(new Set(descriptions).size).toBe(descriptions.length)
    for (const d of descriptions) expect(d.length).toBeLessThanOrEqual(220)
    // The brand leads every tab title so the site name is what survives truncation in a crowded tab strip.
    for (const t of titles) expect(t).toMatch(/^Heirloom \| .{6,}/)
  })

  it("lists each destination once in the mobile menu and footer, and only known pages", () => {
    const known = new Set<string>(ALL_ROUTES)
    const footerLinks = FOOTER_GROUPS.flatMap((g) => g.links)
    for (const list of [MOBILE_NAV_LINKS, footerLinks]) {
      const hrefs = list.map((l) => l.href)
      expect(new Set(hrefs).size).toBe(hrefs.length)
      for (const href of hrefs) expect(known.has(href.split("#")[0]!)).toBe(true)
    }
    expect(ANCHORS.buyerRegister).toBe("/buyers#buyer-register")
    expect(footerLinks.map((l) => l.label)).toContain("Get Heirloom Verified")
  })
})

describe("confidentiality data", () => {
  it("aligns record values with the six permission levels", () => {
    expect(PERMISSION_LEVELS).toHaveLength(6)
    expect(MAX_PERMISSION_LEVEL).toBe(5)
    for (const f of RECORD_FIELDS) expect(f.v).toHaveLength(6)
    expect(ACCESS_LOG.length).toBeGreaterThan(5)
  })
  it("tones values", () => {
    expect(fieldTone("Not available")).toBe("hidden")
    expect(fieldTone("Hidden")).toBe("masked")
    expect(fieldTone("$4.24M")).toBe("shown")
    expect(homeStageName(1)).toBe("Anonymous overview")
    expect(homeStageName(9)).toBe("Anonymous overview")
  })
})

describe("buyer passport", () => {
  it("has four tiers with a value per tier", () => {
    expect(PASSPORT_TIERS).toHaveLength(4)
    for (const r of PASSPORT_ROWS) expect(r.v).toHaveLength(4)
    expect(passportProgress(3)).toBe("100%")
    expect(passportProgress(0)).toBe("0%")
    expect(isMutedPassportValue("Not shown")).toBe(true)
    expect(isMutedPassportValue("Shown")).toBe(false)
    expect(passportShareText(2)).toContain("Heirloom Verified")
  })
  it("writes the registration email", () => {
    const body = buyerRegistrationBody({
      ...EMPTY_BUYER_REGISTRATION,
      name: "A. Buyer",
      email: "a@b.com",
      industries: "HVAC",
      targetSize: "$2M to $8M",
      geography: "Southeast",
    })
    expect(body).toContain("Firm: Independent buyer")
    expect(body).toContain("Geography: Southeast")
    expect(body).not.toContain("Financing plan:")
  })
})

describe("mailto helpers", () => {
  it("encodes and truncates", () => {
    const href = mailtoHref("a@b.com", "Hi there", "x".repeat(50), 10)
    expect(href).toBe("mailto:a@b.com?subject=Hi%20there&body=xxxxxxxxxx")
    expect(OFFER_FORWARD_MAILTO).toContain("mailto:offers@heirloom.com")
  })
  it("writes offer review bodies for pasted and verbal offers", () => {
    const pasted = offerReviewBody({ ...EMPTY_OFFER_INTAKE, mode: "paste", text: "LOI text", email: "me@x.com" })
    expect(pasted).toContain("I received the following terms")
    expect(pasted).toContain("LOI text")
    expect(pasted).toContain("Email for your review: me@x.com")
    const verbal = offerReviewBody({ ...EMPTY_OFFER_INTAKE, mode: "verbal", price: "$4.5M", later: "$500K" })
    expect(verbal).toContain("Headline price: $4.5M")
    expect(verbal).toContain("Paid later: $500K")
    expect(verbal).not.toContain("Other concerns")
  })
  it("writes question bodies", () => {
    expect(askQuestionBody("Why?", "q@x.com")).toBe("Question: Why?\n\nReply to: q@x.com")
  })
})

describe("questions content", () => {
  it("has an anchor for every category and five teaser items", () => {
    const ids = new Set(QUESTION_CATEGORIES.map((c) => c.id))
    for (const l of QUESTION_CATEGORY_LINKS) expect(ids.has(l.href.slice(1))).toBe(true)
    expect(HOME_TEASER).toHaveLength(5)
  })
})

describe("inquiry schema", () => {
  it("accepts a valid payload and rejects bad ones", () => {
    expect(inquirySchema.safeParse({ kind: "question", body: "Hello", email: "" }).success).toBe(true)
    expect(inquirySchema.safeParse({ kind: "question", body: "Hello", email: "a@b.co" }).success).toBe(true)
    expect(inquirySchema.safeParse({ kind: "nope", body: "Hello" }).success).toBe(false)
    expect(inquirySchema.safeParse({ kind: "question", body: "" }).success).toBe(false)
    expect(inquirySchema.safeParse({ kind: "question", body: "x", email: "not-an-email" }).success).toBe(false)
    expect(inquirySchema.safeParse({ kind: "question", body: "x".repeat(6001) }).success).toBe(false)
  })
})
