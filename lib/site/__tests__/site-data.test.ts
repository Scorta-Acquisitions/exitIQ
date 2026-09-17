import { describe, expect, it } from "vitest"
import {
  ADVISOR_ACK,
  ADVISOR_AGENDA,
  ADVISOR_CARE,
  ADVISOR_QUESTION_IDS,
  ADVISOR_QUESTIONS,
} from "@/lib/site/advisor/data"
import {
  ACCESS_LOG,
  CONFIDENTIALITY_RULES,
  fieldTone,
  HOME_STAGE_NAMES,
  homeStageName,
  MAX_PERMISSION_LEVEL,
  OWNER_CONTROLS,
  OWNER_DECIDES,
  PERMISSION_LEVELS,
  RECORD_FIELDS,
} from "@/lib/site/confidentiality/data"
import { insightFor, QUESTION_IDS, QUESTIONS, READ } from "@/lib/site/exitiq/questions"
import {
  HERO_OPTIONS,
  pathForStage,
  SELL_REVENUE_CHIPS,
  SELL_TIMING_CHIPS,
  STAGE_PROGRESS_LABEL,
} from "@/lib/site/hero/funnel"
import { OFFERS, PRIORITIES, type Priority, PRIORITY_WHY } from "@/lib/site/offers/data"
import { HOME_TEASER, QUESTION_CATEGORIES, QUESTION_CATEGORY_LINKS } from "@/lib/site/questions/data"
import { FOOTER_GROUPS, MOBILE_NAV_LINKS, NAV_GROUPS, PAGE_META, ROUTES, SUBNAV } from "@/lib/site/routes"

const unique = <T>(xs: T[]) => new Set(xs).size === xs.length

describe("questions data", () => {
  const allItems = QUESTION_CATEGORIES.flatMap((c) => c.items)

  it("gives every question a non-empty question and answer, phrased as a question", () => {
    expect(allItems).toHaveLength(25)
    for (const item of allItems) {
      expect(item.q.trim().length, item.q).toBeGreaterThan(0)
      expect(item.a.trim().length, item.q).toBeGreaterThan(0)
      expect(item.q.endsWith("?"), item.q).toBe(true)
    }
  })

  it("never repeats a question across categories", () => {
    expect(unique(allItems.map((i) => i.q))).toBe(true)
  })

  it("anchors the six categories at the ids the jump links and the page use", () => {
    expect(QUESTION_CATEGORIES.map((c) => c.id)).toEqual([
      "q-money",
      "q-conf",
      "q-fit",
      "q-process",
      "q-buyers",
      "q-about",
    ])
    expect(QUESTION_CATEGORIES.map((c) => c.label)).toEqual([
      "Fees",
      "Confidentiality",
      "Fit and readiness",
      "Sale process",
      "Buyers",
      "About Heirloom",
    ])
  })

  it("mirrors the categories in the jump links, in order and with the same labels", () => {
    expect(QUESTION_CATEGORY_LINKS.map((l) => l.href)).toEqual(QUESTION_CATEGORIES.map((c) => `#${c.id}`))
    expect(QUESTION_CATEGORY_LINKS.map((l) => l.label)).toEqual(QUESTION_CATEGORIES.map((c) => c.label))
  })

  it("keeps the home teaser as shortened copy: one question is shared verbatim and its answer is intentionally shorter", () => {
    const byQuestion = new Map(allItems.map((i) => [i.q, i.a]))
    const shared = HOME_TEASER.filter((t) => byQuestion.has(t.q))
    expect(shared.map((t) => t.q)).toEqual(["How much does Heirloom charge?"])
    for (const t of shared) {
      const full = byQuestion.get(t.q)!
      expect(t.a).not.toBe(full)
      expect(t.a.length).toBeLessThan(full.length)
    }
    for (const t of HOME_TEASER) {
      expect(t.q.endsWith("?")).toBe(true)
      expect(t.a.trim().length).toBeGreaterThan(0)
    }
  })
})

describe("offers data", () => {
  it("has four offers with ids A through D in order and distinct buyers", () => {
    expect(OFFERS.map((o) => o.id)).toEqual(["A", "B", "C", "D"])
    expect(unique(OFFERS.map((o) => o.who))).toBe(true)
  })

  it("publishes the four headline prices and never pays more cash than the headline", () => {
    expect(OFFERS.map((o) => o.head)).toEqual([4.3, 4.55, 4.05, 4.65])
    for (const o of OFFERS) {
      for (const key of ["note", "earn", "roll"] as const) {
        expect(o[key], `${o.id}.${key}`).toBeGreaterThanOrEqual(0)
      }
      expect(o.cash, o.id).toBeLessThanOrEqual(o.head)
      expect(o.cash, o.id).toBeGreaterThan(0)
    }
  })

  it("adds cash, note, earnout, and rollover up to the headline price for every offer", () => {
    for (const o of OFFERS) expect(o.cash + o.note + o.earn + o.roll, o.id).toBeCloseTo(o.head, 10)
  })

  it("keeps certainty in (0, 1] and the staff protection score in 0..100", () => {
    for (const o of OFFERS) {
      expect(o.cert, o.id).toBeGreaterThan(0)
      expect(o.cert, o.id).toBeLessThanOrEqual(1)
      expect(o.staff, o.id).toBeGreaterThanOrEqual(0)
      expect(o.staff, o.id).toBeLessThanOrEqual(100)
    }
  })

  it("states the exclusivity each letter asks for", () => {
    expect(OFFERS.map((o) => o.excl)).toEqual(["60 days", "90 days", "45 days", "60 days"])
  })

  it("lists each priority once with a unique label and an explanation", () => {
    const values = PRIORITIES.map((p) => p.v)
    expect(unique(values)).toBe(true)
    expect(unique(PRIORITIES.map((p) => p.l))).toBe(true)
    expect([...values].sort()).toEqual(Object.keys(PRIORITY_WHY).sort())
    expect(values).toEqual(["cash", "certainty", "upside", "team"])
    for (const p of values as Priority[]) expect(PRIORITY_WHY[p].endsWith(".")).toBe(true)
  })
})

describe("confidentiality data", () => {
  it("names six permission levels with unique titles and a viewer for each", () => {
    expect(unique(PERMISSION_LEVELS.map((p) => p.t))).toBe(true)
    expect(PERMISSION_LEVELS.map((p) => p.t)).toEqual([
      "Public",
      "Anonymous overview",
      "NDA signed",
      "Qualified buyer",
      "Finalist diligence",
      "Closing parties",
    ])
    for (const p of PERMISSION_LEVELS) {
      for (const key of ["who", "see", "trig"] as const)
        expect(p[key].trim().length, `${p.t}.${key}`).toBeGreaterThan(0)
    }
  })

  it("names the viewer at every one of the six levels", () => {
    expect(PERMISSION_LEVELS.map((p) => p.who)).toEqual([
      "Anyone",
      "Prospective buyer matching your approved criteria",
      "Interested buyer who passes initial review",
      "Serious buyer whose identity, fit, and ability to close have been reviewed",
      "Selected buyer or approved finalist",
      "People with a confirmed role in closing",
    ])
  })

  it("records the eight access-log entries with their actor, organisation, and level", () => {
    expect(ACCESS_LOG.map((e) => [e.who, e.org, e.lvl])).toEqual([
      ["M. Alden", "Cadence Facility Partners", 4],
      ["M. Alden", "Cadence Facility Partners", 4],
      ["J. Ferro", "Bellhaven Search", 3],
      ["Heirloom", "Advisor action", 0],
      ["K. Ortiz", "Meridian Trades Group", 2],
      ["Heirloom", "Advisor action", 0],
      ["Prewitt & Co.", "Seller’s accountant", 3],
      ["J. Ferro", "Bellhaven Search", 3],
    ])
    for (const e of ACCESS_LOG) {
      expect(e.lvl, e.act).toBeLessThanOrEqual(MAX_PERMISSION_LEVEL)
      expect(e.act.trim().length, e.t).toBeGreaterThan(0)
      expect(e.t.trim().length, e.act).toBeGreaterThan(0)
    }
    expect(unique(ACCESS_LOG.map((e) => `${e.t}-${e.act}`))).toBe(true)
  })

  it("records advisor actions at level 0 and buyer activity above it", () => {
    for (const e of ACCESS_LOG) {
      if (e.who === "Heirloom") expect(e.lvl, e.act).toBe(0)
      else expect(e.lvl, e.act).toBeGreaterThan(0)
    }
  })

  it("gives every record field six values whose level-0 value is hidden (never a masked or shown fact)", () => {
    expect(unique(RECORD_FIELDS.map((f) => f.l))).toBe(true)
    for (const f of RECORD_FIELDS) {
      for (const v of f.v) expect(v.trim().length, f.l).toBeGreaterThan(0)
      expect(fieldTone(f.v[0]), f.l).toBe("hidden")
      expect(["No sale record", "Not available"]).toContain(f.v[0])
    }
  })

  it("only masks the company name and owner at the anonymous level", () => {
    const masked = RECORD_FIELDS.filter((f) => fieldTone(f.v[1]) === "masked").map((f) => f.l)
    expect(masked).toEqual(["Company name", "Owner"])
  })

  it("lists what the owner decides and the controls the owner holds", () => {
    expect(HOME_STAGE_NAMES).toHaveLength(MAX_PERMISSION_LEVEL)
    expect(OWNER_DECIDES).toEqual([
      "Buyer types allowed",
      "Named buyers or competitors excluded",
      "Customer, supplier, and employee restrictions",
      "Information that requires your specific approval",
      "Standard access expiry",
      "People allowed to collaborate on the sale",
    ])
    expect(OWNER_CONTROLS).toEqual([
      "Add an excluded buyer",
      "Approve my rules",
      "Review an exception",
      "Revoke access",
      "Extend access",
      "Download access history",
    ])
  })

  it("states the eight confidentiality rules the page promises", () => {
    expect(CONFIDENTIALITY_RULES.map((r) => r.title)).toEqual([
      "Your business is never publicly listed",
      "No contact with employees, customers, or suppliers without your approval",
      "You set buyer exclusions before outreach",
      "Your identity is released after an NDA",
      "Sensitive records are released after qualification",
      "Every access is recorded",
      "Access expires and can be revoked",
      "Retention rules are written before you sign",
    ])
  })

  it("tones a value by what it reveals", () => {
    for (const hidden of ["Not available", "No sale record", "Not disclosed"]) {
      expect(fieldTone(hidden), hidden).toBe("hidden")
    }
    expect(fieldTone("Hidden")).toBe("masked")
    expect(fieldTone("$4.24M")).toBe("shown")
    expect(fieldTone("")).toBe("shown")
  })

  it("names the home stage of every non-public level and falls back outside the range", () => {
    expect([1, 2, 3, 4, 5].map(homeStageName)).toEqual([...HOME_STAGE_NAMES])
    expect(homeStageName(0)).toBe("Anonymous overview")
    expect(homeStageName(6)).toBe("Anonymous overview")
  })
})

describe("advisor data", () => {
  it("asks the five questions in the declared id order with unique chip values and labels", () => {
    expect(ADVISOR_QUESTIONS.map((q) => q.id)).toEqual([...ADVISOR_QUESTION_IDS])
    for (const q of ADVISOR_QUESTIONS) {
      expect(q.q.endsWith("?"), q.id).toBe(true)
      expect(q.chips.length, q.id).toBeGreaterThanOrEqual(4)
      expect(unique(q.chips.map((c) => c[0])), q.id).toBe(true)
      expect(unique(q.chips.map((c) => c[1])), q.id).toBe(true)
    }
  })

  it("has exactly one acknowledgement for every question:chip pair and no orphans", () => {
    const pairs = ADVISOR_QUESTIONS.flatMap((q) => q.chips.map((c) => `${q.id}:${c[0]}`))
    expect(Object.keys(ADVISOR_ACK).sort()).toEqual([...pairs].sort())
    for (const key of pairs) expect(ADVISOR_ACK[key]!.endsWith("."), key).toBe(true)
  })

  it("keys the agenda by the topic chips and the care lines by the care chips", () => {
    const topicValues = ADVISOR_QUESTIONS.find((q) => q.id === "topic")!.chips.map((c) => c[0])
    const careValues = ADVISOR_QUESTIONS.find((q) => q.id === "care")!.chips.map((c) => c[0])
    expect(Object.keys(ADVISOR_AGENDA).sort()).toEqual([...topicValues].sort())
    expect(Object.keys(ADVISOR_CARE).sort()).toEqual([...careValues].sort())
    for (const [topic, items] of Object.entries(ADVISOR_AGENDA)) {
      expect(items, topic).toHaveLength(3)
      expect(unique(items), topic).toBe(true)
    }
    for (const line of Object.values(ADVISOR_CARE)) expect(line.trim().length).toBeGreaterThan(0)
  })
})

describe("exitIQ questions", () => {
  it("asks seven questions in the declared id order", () => {
    expect(QUESTIONS.map((q) => q.id)).toEqual([...QUESTION_IDS])
    expect(QUESTIONS).toHaveLength(7)
  })

  it("keeps chip values and labels unique within each question", () => {
    for (const q of QUESTIONS) {
      expect(q.chips.length, q.id).toBeGreaterThanOrEqual(3)
      expect(unique(q.chips.map((c) => c.v)), q.id).toBe(true)
      expect(unique(q.chips.map((c) => c.l)), q.id).toBe(true)
    }
  })

  it("reads the recurring-services answer back in the words the console shows", () => {
    expect(insightFor("type", "recurring")).toBe(
      "Contracted recurring revenue can support buyer confidence when the agreements, renewal history, and margins are clear."
    )
    expect(insightFor("type", "nope")).toBeNull()
  })

  it("has an insight for every chip and no insight without a chip", () => {
    const pairs = QUESTIONS.flatMap((q) => q.chips.map((c) => `${q.id}:${c.v}`))
    expect(Object.keys(READ).sort()).toEqual([...pairs].sort())
    for (const q of QUESTIONS) {
      for (const c of q.chips) {
        const insight = insightFor(q.id, c.v)
        expect(insight, `${q.id}:${c.v}`).not.toBeNull()
        expect(insight!.endsWith("."), `${q.id}:${c.v}`).toBe(true)
      }
    }
  })
})

describe("hero funnel data", () => {
  it("labels the progress of every hero stage", () => {
    expect(STAGE_PROGRESS_LABEL).toEqual({
      route: "",
      sellQ1: "QUESTION 1 OF 2",
      sellQ2: "QUESTION 2 OF 2",
      sellDone: "YOUR RESULT",
      offer: "FREE OFFER REVIEW",
      ready: "EXITIQ",
    })
  })

  it("offers three numbered paths whose stages map back to their own path", () => {
    expect(HERO_OPTIONS.map((o) => o.k)).toEqual(["sell", "offer", "ready"])
    expect(HERO_OPTIONS.map((o) => o.num)).toEqual(["01", "02", "03"])
    expect(unique(HERO_OPTIONS.map((o) => o.title))).toBe(true)
    for (const o of HERO_OPTIONS) expect(pathForStage(o.stage), o.k).toBe(o.k)
    expect(pathForStage("sellDone")).toBe("sell")
    expect(pathForStage("route")).toBe("sell")
  })

  it("offers the timing and revenue chips the console shows and the advisor prefill reads", () => {
    expect(SELL_TIMING_CHIPS).toEqual([
      ["now", "Now or within 6 months"],
      ["mid", "In 6 to 18 months"],
      ["explore", "I am only exploring"],
    ])
    expect(SELL_REVENUE_CHIPS).toEqual([
      ["u1", "Under $1M"],
      ["1-3", "$1M to $3M"],
      ["3-10", "$3M to $10M"],
      ["10+", "More than $10M"],
    ])
  })
})

describe("page metadata and navigation", () => {
  it("keeps every title at most 70 characters and every description between 50 and 220", () => {
    for (const [key, meta] of Object.entries(PAGE_META)) {
      expect(meta.title.length, `${key}.title`).toBeLessThanOrEqual(70)
      expect(meta.title.length, `${key}.title`).toBeGreaterThan(0)
      expect(meta.description.length, `${key}.description`).toBeGreaterThanOrEqual(50)
      expect(meta.description.length, `${key}.description`).toBeLessThanOrEqual(220)
    }
  })

  it("reaches every page except home from the primary nav, the mobile menu, or the footer", () => {
    // Home is reached through the wordmark link in the header, not a nav group.
    const linked = new Set<string>([
      ...NAV_GROUPS.flatMap((g) => g.links.map((l) => l.href)),
      ...MOBILE_NAV_LINKS.map((l) => l.href),
      ...FOOTER_GROUPS.flatMap((g) => g.links.map((l) => l.href.split("#")[0]!)),
    ])
    for (const [key, path] of Object.entries(ROUTES)) {
      if (path === ROUTES.home) continue
      expect(linked.has(path), `${key} (${path})`).toBe(true)
    }
    expect(linked.has(ROUTES.home)).toBe(false)
  })

  it("fills the bar's three dropdowns with their labels, notes, and destinations", () => {
    expect(NAV_GROUPS.map((g) => [g.label, g.minWidth])).toEqual([
      ["For owners", 310],
      ["The process", 280],
      ["The firm", 270],
    ])
    expect(NAV_GROUPS.map((g) => g.links.map((l) => [l.label, l.href, l.note]))).toEqual([
      [
        ["Sell my business", "/how-it-works", "Private sale, preparation to closing"],
        ["Review my offer", "/offer-review", "Free read of the terms"],
        ["Check sale readiness", "/score", "Seven questions, no name needed"],
      ],
      [
        ["How it works", "/how-it-works", "The eight stages of a sale"],
        ["Fees", "/fees", "5% success fee, no retainer"],
        ["Confidentiality", "/confidentiality", "Who sees what, and when"],
      ],
      [
        ["Who we are", "/who-we-are", "The firm and its founder"],
        ["Questions", "/questions", "Answers on fees, confidentiality, fit"],
        ["Why Heirloom", "/why", "How private businesses sell today"],
      ],
    ])
    expect(unique(NAV_GROUPS.flatMap((g) => g.links).map((l) => l.label))).toBe(true)
  })
})

describe("sub-nav data", () => {
  const entries = Object.entries(SUBNAV)

  it("covers every public page except the home page, each with a title and a call to action", () => {
    const covered = entries.map(([path]) => path).sort()
    expect(covered).toEqual(
      Object.values(ROUTES)
        .filter((r) => r !== ROUTES.home)
        .sort()
    )
    for (const [path, nav] of entries) {
      expect(nav!.title.trim().length, path).toBeGreaterThan(0)
      expect(nav!.cta.label.trim().length, path).toBeGreaterThan(0)
    }
  })

  it("links only to in-page anchors, never repeating one within a page", () => {
    for (const [path, nav] of entries) {
      const hrefs = nav!.links.map((l) => l.href)
      expect(unique(hrefs), path).toBe(true)
      for (const href of hrefs) expect(href, `${path} ${href}`).toMatch(/^#[a-z][a-z0-9-]*$/)
      if (nav!.cta.href) expect(nav!.cta.href, path).toMatch(/^#[a-z][a-z0-9-]*$/)
      expect(unique(nav!.links.map((l) => l.label)), path).toBe(true)
    }
  })

  it("keeps the anchor targets the rest of the site already depends on", () => {
    expect(SUBNAV[ROUTES.fees]!.cta.href).toBe("#fees-calc")
    expect(SUBNAV[ROUTES.offerReview]!.cta.href).toBe("#offer-intake")
    expect(SUBNAV[ROUTES.buyers]!.cta.href).toBe("#buyer-register")
    expect(SUBNAV[ROUTES.questions]!.cta.href).toBe("#q-ask")
    expect(SUBNAV[ROUTES.confidentiality]!.links.map((l) => l.href)).toContain("#conf-levels")
    expect(SUBNAV[ROUTES.score]!.links.map((l) => l.href)).toContain("#exitiq-run")
  })

  it("falls back to the advisor dialog wherever a page has no anchor call to action", () => {
    for (const path of [ROUTES.score, ROUTES.howItWorks, ROUTES.confidentiality, ROUTES.whoWeAre, ROUTES.why]) {
      expect(SUBNAV[path]!.cta.href, path).toBeUndefined()
      expect(SUBNAV[path]!.cta.label, path).toBe("Talk to an advisor")
    }
  })
})
