import { describe, expect, it } from "vitest"
import { SALE_STAGES } from "@/lib/site/content/stages"
import {
  AS_ONE_OWNER,
  BEFORE_CONTACT_LINE,
  CLOSE_LINE,
  DECISION_IDS,
  DECISION_LABEL,
  DECISION_STAGE,
  DECISIONS,
  DEMO_ANCHOR,
  DEMO_LABEL,
  DEMO_SUBJECT,
  FIGURE_LABELS,
  HANDLED_LABEL,
  HEIRLOOM_HANDLES,
  LETTER_DETAIL,
  LETTER_WORDS,
  LIT_AFTER_ANSWER,
  MEET_KEEPS,
  NEXT_DECISION,
  PRIORITY_ROW_LABEL,
  READY_BEFORE,
  RULE_REMOVES,
  SECTION_LINK,
  SECTION_WORDS,
  STAGES_BEFORE_CONTACT,
  TIMING_LINE,
  WORKING_LABEL,
} from "@/lib/site/decisions/data"
import { overLongDemoWords } from "@/lib/site/demo/chrome"
import { OFFERS } from "@/lib/site/offers/data"
import { ANCHORS, ROUTES } from "@/lib/site/routes"

/** The copy rules of the demos: at most two sentences, no dash, no semicolon, no exclamation mark, no LIVE. */
function expectCopyLine(line: string) {
  expect(line.split(". ").length, line).toBeLessThanOrEqual(2)
  expect(line, line).not.toMatch(/—|;|!|\bLIVE\b/)
}

/** Every line of copy the demo shows, beyond the figures it composes. */
const COPY_LINES = [
  SECTION_WORDS.heading,
  SECTION_WORDS.sentence,
  SECTION_LINK.label,
  DEMO_SUBJECT,
  DEMO_LABEL,
  AS_ONE_OWNER,
  BEFORE_CONTACT_LINE,
  CLOSE_LINE,
  HANDLED_LABEL,
  WORKING_LABEL,
  TIMING_LINE,
  NEXT_DECISION("Privacy"),
  DECISION_LABEL(2, 4, "Privacy"),
  ...DECISIONS.flatMap((d) => [d.q, ...d.chips.map((c) => c.label)]),
  ...HEIRLOOM_HANDLES.map((t) => t.t),
  ...Object.values(LETTER_DETAIL),
  LETTER_WORDS.sealed,
  LETTER_WORDS.onTable,
  LETTER_WORDS.removed,
  LETTER_WORDS.waiting,
  LETTER_WORDS.chosen,
  LETTER_WORDS.certainty("High"),
  LETTER_WORDS.removedByRules,
  LETTER_WORDS.notMet,
  LETTER_WORDS.letter("A"),
  FIGURE_LABELS.stage(4, "Privacy"),
  READY_BEFORE,
  PRIORITY_ROW_LABEL,
]

describe("decisions data: the words beside the screen", () => {
  it("keeps the section to one heading, one sentence and one link", () => {
    expect(SECTION_WORDS.heading).toBe("The whole sale asks four decisions of you.")
    expect(SECTION_WORDS.sentence).toBe(
      "Heirloom handles the preparation, buyer work, negotiation, and closing while you keep running the company."
    )
    expect(SECTION_LINK).toEqual({ href: ANCHORS.saleStages, label: "The eight stages" })
    expect(ANCHORS.saleStages).toBe(`${ROUTES.howItWorks}#stages`)
  })

  it("holds those words to the caps a few words means", () => {
    expect(overLongDemoWords(SECTION_WORDS)).toEqual([])
  })

  it("names the screen, its anchor and the group the keyboard reaches", () => {
    expect(DEMO_SUBJECT).toBe("Sale plan")
    expect(DEMO_ANCHOR).toBe("four-decisions")
    expect(DEMO_LABEL).toBe("The four decisions, a worked example that plays itself")
  })
})

describe("decisions data: the moved lists", () => {
  it("keeps Heirloom's nine tasks and the decision that unlocks each", () => {
    expect(HEIRLOOM_HANDLES).toEqual([
      { t: "Organize and reconcile the financials", by: 0 },
      { t: "Build the valuation and sale materials", by: 0 },
      { t: "Research and contact buyers privately", by: 1 },
      { t: "Screen buyers and manage NDAs", by: 1 },
      { t: "Answer routine diligence questions from approved records", by: 1 },
      { t: "Prepare you for buyer meetings", by: 2 },
      { t: "Compare and negotiate offers", by: 3 },
      { t: "Coordinate diligence, financing, lawyers, and closing", by: 3 },
      { t: "Send a weekly update", by: 3 },
    ])
    expect(HEIRLOOM_HANDLES.every((t) => t.by < DECISION_IDS.length)).toBe(true)
  })
})

describe("decisions data: the four decisions", () => {
  it("runs when, rules, meet, priority, one per step, each with its question", () => {
    expect(DECISION_IDS).toEqual(["when", "rules", "meet", "priority"])
    expect(DECISIONS.map((d) => d.id)).toEqual(DECISION_IDS)
    expect(DECISIONS.map((d) => d.q)).toEqual([
      "When would you want the sale to close?",
      "Which buyers must never hear the business is for sale?",
      "Which qualified buyers do you want to meet?",
      "What matters most when you choose the offer?",
    ])
  })

  it("offers the advisor dialog's own timing answers on the first decision", () => {
    expect(DECISIONS[0]!.chips.map((c) => c.label)).toEqual([
      "Within a year",
      "In 1 to 2 years",
      "Depends on what I learn",
    ])
    expect(DECISIONS[0]!.chips.map((c) => c.v)).toEqual(["when:soon", "when:mid", "when:depends"])
  })

  it("offers the four exclusion rules, then the three meeting filters, then the four priorities", () => {
    expect(DECISIONS[1]!.chips.map((c) => c.label)).toEqual([
      "Competitors in my service area",
      "Private equity groups",
      "Named companies I list",
      "No exclusions, I decide exceptions",
    ])
    expect(DECISIONS[2]!.chips.map((c) => c.label)).toEqual([
      "Buyers who have shown their financing",
      "Buyers with a written plan for the team and the name",
      "Every qualified buyer",
    ])
    expect(DECISIONS[3]!.chips.map((c) => c.label)).toEqual([
      "Most cash at closing",
      "Highest chance of closing",
      "Keep future upside",
      "Protect employees and the company name",
    ])
    expect(DECISIONS[3]!.chips.map((c) => c.v)).toEqual([
      "priority:cash",
      "priority:certainty",
      "priority:upside",
      "priority:team",
    ])
  })

  it("prefixes every answer with its decision id and never repeats one", () => {
    const values: string[] = []
    DECISIONS.forEach((d) =>
      d.chips.forEach((c) => {
        expect(c.v.startsWith(`${d.id}:`), c.v).toBe(true)
        values.push(c.v)
      })
    )
    expect(new Set(values).size).toBe(values.length)
    expect(values).toHaveLength(14)
  })

  it("keeps every line of copy to two sentences, without dashes, semicolons, exclamation marks or LIVE", () => {
    expect(COPY_LINES).toHaveLength(57)
    COPY_LINES.forEach(expectCopyLine)
  })

  it("states the staff-plan and financing facts the meeting filters rest on, from the offers themselves", () => {
    const staff = Object.fromEntries(OFFERS.map((o) => [o.id, o.staff]))
    expect(staff).toEqual({ A: 95, B: 70, C: 55, D: 30 })
    expect(OFFERS.find((o) => o.id === "B")!.fin).toBe("SBA 7(a), contingent, no prior closes")
    expect(OFFERS.find((o) => o.id === "D")!.head).toBe(4.65)
  })
})

describe("decisions data: stages, rules and timing", () => {
  it("places the decisions at Goals, Privacy, Meetings and Offers and lights the stages Heirloom runs after each", () => {
    expect(DECISION_STAGE).toEqual({ when: 0, rules: 3, meet: 5, priority: 6 })
    expect(SALE_STAGES[0]!.label).toBe("Goals")
    expect(SALE_STAGES[3]!.label).toBe("Privacy")
    expect(SALE_STAGES[5]!.label).toBe("Meetings")
    expect(SALE_STAGES[6]!.label).toBe("Offers")
    expect(LIT_AFTER_ANSWER).toEqual({ when: 3, rules: 5, meet: 6, priority: 8 })
  })

  it("counts four stages before any buyer is contacted: Market is the fifth", () => {
    expect(SALE_STAGES.findIndex((s) => s.label === "Market")).toBe(4)
    expect(STAGES_BEFORE_CONTACT).toBe("4 of 8")
    expect(BEFORE_CONTACT_LINE).toBe("4 of 8 stages before any buyer is contacted")
  })

  it("maps the exclusion rules onto Ridgeline's letters: competitors remove D, private equity removes C", () => {
    expect(RULE_REMOVES).toEqual({ "rules:competitors": "D", "rules:pe": "C", "rules:named": null, "rules:none": null })
    expect(OFFERS.find((o) => o.id === "D")!.sub).toBe("Competitor in an overlapping service area")
    expect(OFFERS.find((o) => o.id === "C")!.who).toBe("Private equity add-on")
  })

  it("maps the meeting filters onto the letters: financing shown A C D, a staff plan of 70 or more A B, all four", () => {
    expect(MEET_KEEPS).toEqual({
      "meet:financed": ["A", "C", "D"],
      "meet:team": ["A", "B"],
      "meet:all": ["A", "B", "C", "D"],
    })
    OFFERS.filter((o) => o.staff >= 70)
      .map((o) => o.id)
      .forEach((id) => expect(MEET_KEEPS["meet:team"]).toContain(id))
    OFFERS.filter((o) => !/contingent/.test(o.fin))
      .map((o) => o.id)
      .forEach((id) => expect(MEET_KEEPS["meet:financed"]).toContain(id))
  })

  it("states the only timing fact the site has, taken from the speed section's own note", () => {
    expect(TIMING_LINE).toBe("A traditional sale runs 6 to 9 months. Heirloom averages 3 to 4.")
    expect(TIMING_LINE).not.toMatch(/\d-\d/)
  })
})

describe("decisions data: the words on the screen", () => {
  it("writes the eyebrow over a decision, the working line and the close", () => {
    expect(DECISION_LABEL(2, 4, "Privacy")).toBe("Decision 2 of 4 · Privacy")
    expect(WORKING_LABEL).toBe("Heirloom is working")
    expect(NEXT_DECISION("Meetings")).toBe("Next decision at Meetings")
    expect(CLOSE_LINE).toBe("Four decisions were yours. Nine tasks were not.")
    expect(HANDLED_LABEL).toBe("Handled without you")
    expect(FIGURE_LABELS.stage(4, "Privacy")).toBe("Stage 4 of 8 · Privacy")
    expect(AS_ONE_OWNER).toBe("as one owner chose")
  })

  it("says where a letter stands in words, never in a colour or a symbol", () => {
    expect(LETTER_WORDS.sealed).toBe("Not yet received")
    expect(LETTER_WORDS.onTable).toBe("On the table")
    expect(LETTER_WORDS.removed).toBe("Left the table")
    expect(LETTER_WORDS.waiting).toBe("Not on the calendar")
    expect(LETTER_WORDS.chosen).toBe("Chosen")
    expect(LETTER_WORDS.certainty("Moderate")).toBe("Moderate certainty")
    expect(LETTER_WORDS.removedByRules).toBe("removed by your rules")
    expect(LETTER_WORDS.notMet).toBe("not met")
    expect(LETTER_WORDS.letter("D")).toBe("Offer D")
    Object.values(LETTER_WORDS).forEach((word) => {
      if (typeof word === "string") expect(word).not.toMatch(/[✓×✗!]/)
    })
  })

  it("labels the four figures a previewed letter reads", () => {
    expect(LETTER_DETAIL).toEqual({
      headline: "Headline",
      cash: "Cash",
      certainty: "Certainty",
      staff: "Staff plan",
      outOf: "of 100",
    })
  })
})
