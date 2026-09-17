import { describe, expect, it } from "vitest"
import { HARD_PARTS, RECONCILIATION, SALE_STAGES, TIMING_ROWS } from "@/lib/site/content/stages"
import {
  FINANCIAL_TITLE,
  RIDGELINE_BASE,
  RIDGELINE_LINES,
  RIDGELINE_RANGE_AFTER,
  RIDGELINE_RANGE_BEFORE,
  RIDGELINE_SHOWN_WITHOUT_OWNER_ADJUSTMENT,
} from "@/lib/site/financial/data"
import { formatDollars } from "@/lib/site/format"

describe("SALE_STAGES", () => {
  it("has exactly eight stages in the published order", () => {
    expect(SALE_STAGES).toHaveLength(8)
    expect(SALE_STAGES.map((s) => s.label)).toEqual([
      "Goals",
      "Numbers",
      "Value",
      "Privacy",
      "Market",
      "Meetings",
      "Offers",
      "Close",
    ])
  })

  it("names what Heirloom does at every stage", () => {
    expect(SALE_STAGES.map((s) => s.heirloom)).toEqual([
      "We learn the business, your timing, the outcome you want, and any buyers to exclude.",
      "We organize the books, tax returns, payroll, owner adjustments, customer concentration, and contracts before market.",
      "We set a valuation range and prepare the anonymous overview and buyer materials.",
      "We turn your exclusions and disclosure choices into rules for outreach and buyer access.",
      "We research likely acquirers, contact them without naming the business, and screen for fit and ability to close.",
      "We answer routine questions and prepare you for each meeting.",
      "We compare each offer’s economics, financing, conditions, and closing risk, then negotiate around your priorities.",
      "We coordinate the buyer, lender, lawyers, and accountants, and push back on late price cuts.",
    ])
  })

  it("names what the owner does at every stage", () => {
    expect(SALE_STAGES.map((s) => s.you)).toEqual([
      "Join one working conversation and introduce your accountant or bookkeeper.",
      "Explain the items only you can explain.",
      "Approve how the business is presented.",
      "Approve the rules once. Afterward you decide only exceptions.",
      "Nothing until qualified buyers are ready.",
      "Meet the buyers you choose.",
      "Choose the offer and approve the major terms.",
      "Answer the questions only you can answer and approve the final documents.",
    ])
  })

  it("names what the owner receives at every stage", () => {
    expect(SALE_STAGES.map((s) => s.receive)).toEqual([
      "A sale plan and information request.",
      "Adjusted financials with support for the earnings shown to buyers.",
      "Valuation, anonymous overview, and buyer materials.",
      "A buyer plan and disclosure rules.",
      "A qualified group of buyers.",
      "Written indications of interest.",
      "A negotiated letter of intent.",
      "A completed ownership transfer.",
    ])
  })

  it("badges every stage with a distinct artifact name", () => {
    expect(SALE_STAGES.map((s) => s.artifact)).toEqual([
      "Sale plan",
      "Financials",
      "Valuation",
      "Access rules",
      "Buyer group",
      "Indications",
      "Signed LOI",
      "Ownership transfer",
    ])
  })

  it("publishes the eight stage titles in order", () => {
    expect(SALE_STAGES.map((s) => s.title)).toEqual([
      "Your goals and timing",
      "Prepare the numbers",
      "Valuation and materials",
      "Privacy rules",
      "Buyer market",
      "Buyer meetings",
      "Compare the offers",
      "Diligence, financing, and closing",
    ])
  })

  it("ends the roadmap with a completed ownership transfer and starts it with the sale plan", () => {
    expect(SALE_STAGES[0]).toMatchObject({ label: "Goals", artifact: "Sale plan" })
    expect(SALE_STAGES[7]).toMatchObject({
      label: "Close",
      artifact: "Ownership transfer",
      receive: "A completed ownership transfer.",
    })
  })

  it("asks nothing of the owner during buyer-market building until qualified buyers are ready", () => {
    const market = SALE_STAGES.find((s) => s.label === "Market")
    expect(market?.you).toBe("Nothing until qualified buyers are ready.")
  })
})

describe("HARD_PARTS", () => {
  it("lists the four failure scenarios and what Heirloom does about each", () => {
    expect(HARD_PARTS.map((h) => h.title)).toEqual([
      "The buyer's lender says no",
      "Diligence finds a problem",
      "The buyer tries to lower the price",
      "You change your mind",
    ])
    expect(HARD_PARTS.map((h) => h.body)).toEqual([
      "We check financing readiness before meetings and keep other qualified buyers engaged where practical.",
      "We look for accounting gaps, customer concentration, lease issues, and unsupported adjustments before market, so they are explained before they become a price cut.",
      "We compare the stated reason with the records, challenge unsupported changes, and return to other buyers when the process supports it.",
      "We stop outreach, revoke buyer access, tell buyers only that the owner withdrew, and follow the retention rules in your agreement.",
    ])
  })

  it("states exactly what happens when the owner withdraws", () => {
    const change = HARD_PARTS.find((h) => h.title === "You change your mind")
    expect(change?.body).toBe(
      "We stop outreach, revoke buyer access, tell buyers only that the owner withdrew, and follow the retention rules in your agreement."
    )
  })
})

describe("TIMING_ROWS", () => {
  it("pairs each of the four phases with its timing line", () => {
    expect(TIMING_ROWS).toEqual([
      ["Preparation", "Before buyer outreach"],
      ["Buyer process", "Depends on buyer interest and the business"],
      ["Diligence and financing", "Run in parallel where practical"],
      ["Closing", "One shared list of conditions and owners"],
    ])
  })

  it("does not promise a fixed number of weeks or months for any phase", () => {
    for (const [, timing] of TIMING_ROWS) expect(timing).not.toMatch(/\d/)
  })
})

describe("RECONCILIATION", () => {
  it("heads the example with the financial section's own title and one sentence about the disagreement", () => {
    expect(RECONCILIATION.heading).toBe(FINANCIAL_TITLE)
    expect(RECONCILIATION.heading).toBe("Financial preparation")
    expect(RECONCILIATION.intro).toBe(
      "The books, payroll, tax return, and your own explanation often disagree. Your advisor records the resolution and the evidence for it, and every buyer document, lender package, and diligence answer uses that figure."
    )
    expect(RECONCILIATION.subject).toBe("Owner compensation · Project Ridgeline")
    expect(RECONCILIATION.statusOpen).toBe("Advisor review required")
    expect(RECONCILIATION.statusResolved).toBe("Resolved by the advisor")
  })

  it("prints the four records that disagree, $186,400 against $214,000", () => {
    expect(RECONCILIATION.records).toEqual([
      { name: "Books", note: "QuickBooks · officer compensation", value: "$186,400" },
      {
        name: "Payroll",
        note: "Payroll register, including a family member with no recorded hours",
        value: "$214,000",
      },
      { name: "Tax return", note: "Filed return, provided by the accountant", value: "$186,400" },
      { name: "Owner explanation", note: "Working conversation, March", value: "$214,000" },
    ])
  })

  it("quotes the same two figures the home page's owner-compensation line plays", () => {
    const ownerComp = RIDGELINE_LINES.find((l) => l.id === "ownerComp")!
    expect(ownerComp.records).toEqual([
      ["Tax return", 186_400],
      ["Payroll register", 214_000],
    ])
    // Books and the return read the return's figure; payroll and the owner's explanation read the register's.
    const [fromReturn, fromRegister] = ownerComp.records.map(([, n]) => formatDollars(n))
    expect(RECONCILIATION.records.map((r) => r.value)).toEqual([fromReturn, fromRegister, fromReturn, fromRegister])
    expect(formatDollars(ownerComp.amount)).toBe("$27,600")
    expect(RECONCILIATION.resolution).toBe(
      "$214,000, including $27,600 of documented family payroll with no recorded hours."
    )
    expect(RECONCILIATION.resolutionTitle).toBe("Resolution, recorded with support")
    expect(RECONCILIATION.resolutionSupport).toBe("Support: Payroll register and tax return attached")
    expect(RECONCILIATION.resolveLabel).toBe("Show the resolution →")
    expect(RECONCILIATION.resetLabel).toBe("Reset example")
  })

  it("moves six rows from the open figures to the resolved ones", () => {
    expect(RECONCILIATION.updatedTitle).toBe("Updated in")
    expect(RECONCILIATION.rows).toEqual([
      { label: "Owner compensation adjustment", open: "On hold", resolved: "$27,600, documented" },
      { label: "Adjusted earnings", open: "$817,400", resolved: "$845,000" },
      { label: "Valuation", open: "$2.86M – $3.38M", resolved: "$2.96M – $3.49M" },
      { label: "Buyer materials", open: "On hold", resolved: "Updated" },
      { label: "Lender package", open: "On hold", resolved: "Updated" },
      { label: "Diligence answers", open: "On hold", resolved: "Updated" },
    ])
  })

  it("carries the worked example's own earnings and valuation, the en dash apart", () => {
    const earnings = RECONCILIATION.rows.find((r) => r.label === "Adjusted earnings")!
    expect(earnings.open).toBe(formatDollars(RIDGELINE_SHOWN_WITHOUT_OWNER_ADJUSTMENT))
    const settled = RIDGELINE_LINES.filter((l) => l.countsInOpen).reduce((n, l) => n + l.amount, RIDGELINE_BASE)
    expect(settled).toBe(845_000)
    expect(earnings.resolved).toBe(formatDollars(settled))
    // The demo prints its range with "to"; the page sets the same two figures with an en dash.
    const valuation = RECONCILIATION.rows.find((r) => r.label === "Valuation")!
    expect(valuation.open).toBe(RIDGELINE_RANGE_BEFORE.replace(" to ", " – "))
    expect(valuation.resolved).toBe(RIDGELINE_RANGE_AFTER.replace(" to ", " – "))
  })

  it("answers the buyer's question with both figures, and says review is required until then", () => {
    expect(RECONCILIATION.buyerQuestion).toBe("Buyer question: Why is owner compensation adjusted to $214,000?")
    expect(RECONCILIATION.answerPending).toBe("Advisor review required.")
    expect(RECONCILIATION.answer).toBe(
      "The tax return reports $186,400 of officer compensation. Payroll records show another $27,600 paid to a family member with no recorded hours. Both amounts are included in the adjustment, with the payroll lines attached for review."
    )
    expect(RECONCILIATION.answerSupport).toBe("Support: payroll register and tax return attached")
  })
})
