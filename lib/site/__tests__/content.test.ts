import { describe, expect, it } from "vitest"
import { askQuestionBody } from "@/lib/site/questions/data"
import { ALL_ROUTES, ANCHORS, FOOTER_GROUPS, MOBILE_NAV_LINKS, NAV_GROUPS, PAGE_META } from "@/lib/site/routes"

describe("routes", () => {
  it("gives every page a distinct title and description, each title ending with the brand", () => {
    const titles = Object.values(PAGE_META).map((m) => m.title)
    const descriptions = Object.values(PAGE_META).map((m) => m.description)
    expect(new Set(titles).size).toBe(titles.length)
    expect(new Set(descriptions).size).toBe(descriptions.length)
    // Every tab title ends with the brand after a pipe, so the page subject leads and the site name still shows.
    for (const t of titles) expect(t).toMatch(/^.{6,} \| Heirloom( M&A Advisory)?$/)
  })

  it("lists each destination once in the mobile menu and the footer, and links only to known pages", () => {
    expect(ALL_ROUTES).toEqual([
      "/",
      "/score",
      "/offer-review",
      "/how-it-works",
      "/fees",
      "/confidentiality",
      "/buyers",
      "/who-we-are",
      "/questions",
      "/why",
    ])
    const known = new Set<string>(ALL_ROUTES)
    const footerLinks = FOOTER_GROUPS.flatMap((g) => g.links)
    // The mobile menu and the footer are flat lists: each destination appears once.
    for (const list of [MOBILE_NAV_LINKS, footerLinks]) {
      const hrefs = list.map((l) => l.href)
      expect(new Set(hrefs).size).toBe(hrefs.length)
    }
    // Every link in the bar's dropdowns, the mobile menu and the footer points at a route the site serves.
    for (const list of [NAV_GROUPS.flatMap((g) => g.links), MOBILE_NAV_LINKS, footerLinks]) {
      for (const l of list) expect(known.has(l.href.split("#")[0]!), l.href).toBe(true)
    }
    expect(ANCHORS.buyerRegister).toBe("/buyers#buyer-register")
    expect(footerLinks.map((l) => l.label)).toContain("Get Heirloom Verified")
  })
})

describe("askQuestionBody", () => {
  it("writes the question and the reply address as the mail body", () => {
    expect(askQuestionBody("Why?", "q@x.com")).toBe("Question: Why?\n\nReply to: q@x.com")
  })
})
