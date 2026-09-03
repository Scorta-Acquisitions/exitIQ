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
  MAX_PERMISSION_LEVEL,
  OWNER_CONTROLS,
  OWNER_DECIDES,
  PERMISSION_LEVELS,
  RECORD_FIELDS,
} from "@/lib/site/confidentiality/data"
import { chipLabel, insightFor, QUESTION_IDS, QUESTIONS, READ } from "@/lib/site/exitiq/questions"
import {
  HERO_OPTIONS,
  type HeroStage,
  pathForStage,
  SELL_REVENUE_CHIPS,
  SELL_TIMING_CHIPS,
  STAGE_INTENSITY,
  STAGE_PROGRESS_LABEL,
} from "@/lib/site/hero/funnel"
import { OFFERS, PRIORITIES, type Priority, PRIORITY_WHY } from "@/lib/site/offers/data"
import { offerScore } from "@/lib/site/offers/score"
import { HOME_TEASER, QUESTION_CATEGORIES, QUESTION_CATEGORY_LINKS } from "@/lib/site/questions/data"
import { FOOTER_GROUPS, MOBILE_NAV_LINKS, NAV_GROUPS, PAGE_META, ROUTES } from "@/lib/site/routes"

const unique = <T>(xs: T[]) => new Set(xs).size === xs.length

describe("questions data", () => {
  const allItems = QUESTION_CATEGORIES.flatMap((c) => c.items)

  it("gives every question a non-empty question and answer, phrased as a question", () => {
    expect(allItems.length).toBeGreaterThanOrEqual(20)
    for (const item of allItems) {
      expect(item.q.trim().length, item.q).toBeGreaterThan(0)
      expect(item.a.trim().length, item.q).toBeGreaterThan(0)
      expect(item.q.endsWith("?"), item.q).toBe(true)
      if (item.a2 !== undefined) expect(item.a2.trim().length, item.q).toBeGreaterThan(0)
    }
  })

  it("never repeats a question across categories", () => {
    expect(unique(allItems.map((i) => i.q))).toBe(true)
  })

  it("uses unique q- prefixed category ids and unique labels", () => {
    const ids = QUESTION_CATEGORIES.map((c) => c.id)
    expect(unique(ids)).toBe(true)
    for (const id of ids) expect(id).toMatch(/^q-[a-z]+$/)
    expect(unique(QUESTION_CATEGORIES.map((c) => c.label))).toBe(true)
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
      expect(t.a2).toBeUndefined()
    }
  })
})

describe("offers data", () => {
  it("has four offers with ids A through D in order and distinct buyers", () => {
    expect(OFFERS.map((o) => o.id)).toEqual(["A", "B", "C", "D"])
    expect(unique(OFFERS.map((o) => o.who))).toBe(true)
  })

  it("keeps every dollar component numeric, non-negative, and never pays more cash than the headline", () => {
    for (const o of OFFERS) {
      for (const key of ["head", "cash", "note", "earn", "roll"] as const) {
        expect(Number.isFinite(o[key]), `${o.id}.${key}`).toBe(true)
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

  it("fills the descriptive fields for every offer", () => {
    for (const o of OFFERS) {
      for (const key of ["sub", "trans", "fin", "excl", "staffNote"] as const) {
        expect(o[key].trim().length, `${o.id}.${key}`).toBeGreaterThan(0)
      }
      expect(o.excl, o.id).toMatch(/^\d+ days$/)
    }
  })

  it("lists each priority once with a unique label and an explanation, and offerScore handles all of them", () => {
    const values = PRIORITIES.map((p) => p.v)
    expect(unique(values)).toBe(true)
    expect(unique(PRIORITIES.map((p) => p.l))).toBe(true)
    expect([...values].sort()).toEqual(Object.keys(PRIORITY_WHY).sort())
    expect(values).toEqual(["cash", "certainty", "upside", "team"])
    for (const p of values as Priority[]) {
      expect(PRIORITY_WHY[p].endsWith(".")).toBe(true)
      for (const o of OFFERS) expect(Number.isFinite(offerScore(o, p)), `${o.id}/${p}`).toBe(true)
    }
  })
})

describe("confidentiality data", () => {
  it("names six permission levels with unique titles and a viewer for each", () => {
    expect(PERMISSION_LEVELS).toHaveLength(MAX_PERMISSION_LEVEL + 1)
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

  it("keeps every access-log entry at a valid level with an actor and an action", () => {
    expect(ACCESS_LOG.length).toBeGreaterThan(0)
    for (const e of ACCESS_LOG) {
      expect(Number.isInteger(e.lvl), e.act).toBe(true)
      expect(e.lvl, e.act).toBeGreaterThanOrEqual(0)
      expect(e.lvl, e.act).toBeLessThanOrEqual(MAX_PERMISSION_LEVEL)
      expect(e.who.trim().length, e.act).toBeGreaterThan(0)
      expect(e.act.trim().length).toBeGreaterThan(0)
      expect(e.t.trim().length, e.act).toBeGreaterThan(0)
      expect(e.org.trim().length, e.act).toBeGreaterThan(0)
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
      expect(f.v, f.l).toHaveLength(6)
      for (const v of f.v) expect(v.trim().length, f.l).toBeGreaterThan(0)
      expect(fieldTone(f.v[0]), f.l).toBe("hidden")
      expect(["No sale record", "Not available"]).toContain(f.v[0])
    }
  })

  it("only masks the company name and owner at the anonymous level", () => {
    const masked = RECORD_FIELDS.filter((f) => fieldTone(f.v[1]) === "masked").map((f) => f.l)
    expect(masked).toEqual(["Company name", "Owner"])
  })

  it("names one home stage per non-public level and lists six owner decisions and controls", () => {
    expect(HOME_STAGE_NAMES).toHaveLength(MAX_PERMISSION_LEVEL)
    expect(unique([...HOME_STAGE_NAMES])).toBe(true)
    expect(OWNER_DECIDES).toHaveLength(6)
    expect(OWNER_CONTROLS).toHaveLength(6)
    expect(unique(OWNER_DECIDES)).toBe(true)
    expect(unique(OWNER_CONTROLS)).toBe(true)
    expect(unique(CONFIDENTIALITY_RULES.map((r) => r.title))).toBe(true)
    expect(CONFIDENTIALITY_RULES).toHaveLength(8)
  })
})

describe("advisor data", () => {
  it("asks the five questions in the declared id order with unique chip values and labels", () => {
    expect(ADVISOR_QUESTIONS.map((q) => q.id)).toEqual([...ADVISOR_QUESTION_IDS])
    expect(unique(ADVISOR_QUESTIONS.map((q) => q.id))).toBe(true)
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

  it("returns null for unknown chips and undefined values", () => {
    expect(insightFor("type", "nope")).toBeNull()
    expect(chipLabel("type", undefined)).toBeNull()
    expect(chipLabel("type", "nope")).toBeNull()
    expect(chipLabel("rev", "3-5")).toBe("$3M to $5M")
  })
})

describe("hero funnel data", () => {
  const stages: HeroStage[] = ["route", "sellQ1", "sellQ2", "sellDone", "offer", "ready"]

  it("has a progress label for every stage and an intensity for every stage except ready", () => {
    for (const s of stages) expect(typeof STAGE_PROGRESS_LABEL[s], s).toBe("string")
    expect(STAGE_PROGRESS_LABEL.route).toBe("")
    expect(STAGE_PROGRESS_LABEL.ready).toBe("EXITIQ")
    expect(Object.keys(STAGE_INTENSITY).sort()).toEqual(["offer", "route", "sellDone", "sellQ1", "sellQ2"])
    for (const v of Object.values(STAGE_INTENSITY)) {
      expect(v).toBeGreaterThan(0)
      expect(v).toBeLessThanOrEqual(1)
    }
    expect(STAGE_INTENSITY.sellQ1).toBeLessThan(STAGE_INTENSITY.sellQ2)
    expect(STAGE_INTENSITY.sellQ2).toBeLessThan(STAGE_INTENSITY.sellDone)
  })

  it("offers three numbered paths whose stages map back to their own path", () => {
    expect(HERO_OPTIONS.map((o) => o.k)).toEqual(["sell", "offer", "ready"])
    expect(HERO_OPTIONS.map((o) => o.num)).toEqual(["01", "02", "03"])
    expect(unique(HERO_OPTIONS.map((o) => o.title))).toBe(true)
    for (const o of HERO_OPTIONS) expect(pathForStage(o.stage), o.k).toBe(o.k)
    expect(pathForStage("sellDone")).toBe("sell")
    expect(pathForStage("route")).toBe("sell")
  })

  it("has non-empty, unique chip lists for the two sell questions", () => {
    expect(SELL_TIMING_CHIPS.length).toBe(3)
    expect(SELL_REVENUE_CHIPS.length).toBe(4)
    for (const chips of [SELL_TIMING_CHIPS, SELL_REVENUE_CHIPS]) {
      expect(unique(chips.map((c) => c[0]))).toBe(true)
      expect(unique(chips.map((c) => c[1]))).toBe(true)
      for (const [, label] of chips) expect(label.trim().length).toBeGreaterThan(0)
    }
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

  it("gives every primary nav link a label and a note, with no label repeated across groups", () => {
    const links = NAV_GROUPS.flatMap((g) => g.links)
    expect(unique(links.map((l) => l.label))).toBe(true)
    for (const l of links) {
      expect(l.note.trim().length, l.label).toBeGreaterThan(0)
      expect(l.href.startsWith("/"), l.label).toBe(true)
    }
    for (const g of NAV_GROUPS) expect(g.minWidth).toBeGreaterThanOrEqual(240)
  })
})
