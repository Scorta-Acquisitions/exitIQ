import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { PassportTiers } from "@/components/site/buyers/PassportTiers"
import { DisclosureLevels } from "@/components/site/confidentiality/DisclosureLevels"
import { OfferComparison } from "@/components/site/home/OfferComparison"
import { BusinessBrain } from "@/components/site/how-it-works/BusinessBrain"
import { QuestionsAccordion } from "@/components/site/questions/QuestionsAccordion"
import {
  isMutedPassportValue,
  PASSPORT_ROWS,
  PASSPORT_TIER_DESCRIPTIONS,
  PASSPORT_TIERS,
  passportProgress,
  passportShareText,
  type PassportTierIndex,
} from "@/lib/site/buyers/passport"
import { ACCESS_LOG, PERMISSION_LEVELS, RECORD_FIELDS } from "@/lib/site/confidentiality/data"
import { formatMillions } from "@/lib/site/format"
import { copyText } from "@/lib/site/mailto"
import { OFFERS, PRIORITIES, PRIORITY_WHY } from "@/lib/site/offers/data"
import { certaintyLabel, findOffer, paidLater, rankOffers, retained } from "@/lib/site/offers/score"
import { QUESTION_CATEGORIES } from "@/lib/site/questions/data"

vi.mock("@/lib/site/mailto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/site/mailto")>()
  return { ...actual, copyText: vi.fn().mockResolvedValue(true) }
})

/** Text of the value that follows a label inside a label/value pair. */
function valueAfter(scope: HTMLElement, label: string): string {
  return within(scope).getByText(label).nextElementSibling?.textContent ?? ""
}

async function settle(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms)
  })
}

describe("<DisclosureLevels />", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
  afterEach(() => vi.useRealTimers())

  it("moves between levels and updates the record", () => {
    render(<DisclosureLevels />)
    expect(screen.getByTestId("perm-level")).toHaveTextContent("View level 1 of 5")
    expect(screen.getByTestId("perm-who")).toHaveTextContent("Prospective buyer matching your approved criteria")
    fireEvent.click(screen.getByTestId("perm-stop-3"))
    expect(screen.getByTestId("perm-level")).toHaveTextContent("View level 3 of 5")
    expect(screen.getByText("Greenville-Spartanburg area")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Move to next level" }))
    expect(screen.getByTestId("perm-level")).toHaveTextContent("View level 4 of 5")
    fireEvent.click(screen.getByRole("button", { name: "Move to next level" }))
    fireEvent.click(screen.getByRole("button", { name: "Move to next level" }))
    expect(screen.getByTestId("perm-level")).toHaveTextContent("View level 5 of 5")
    fireEvent.click(screen.getByRole("button", { name: "Return to anonymous view" }))
    expect(screen.getByTestId("perm-level")).toHaveTextContent("View level 1 of 5")
    expect(screen.getAllByText("Hidden").length).toBeGreaterThan(0)
  })

  it("exposes the level as a 0..5 range slider that starts at the anonymous overview", () => {
    render(<DisclosureLevels />)
    const slider = screen.getByRole("slider", { name: "Choose what this buyer can see" }) as HTMLInputElement
    expect(slider).toHaveAttribute("min", "0")
    expect(slider).toHaveAttribute("max", "5")
    expect(slider).toHaveAttribute("step", "1")
    expect(slider.value).toBe("1")
  })

  it("changes the level, the viewer, and the pressed stop when the slider moves", () => {
    render(<DisclosureLevels />)
    const slider = screen.getByRole("slider", { name: "Choose what this buyer can see" }) as HTMLInputElement
    fireEvent.change(slider, { target: { value: "4" } })
    expect(slider.value).toBe("4")
    expect(screen.getByTestId("perm-level")).toHaveTextContent("View level 4 of 5")
    expect(screen.getByTestId("perm-who")).toHaveTextContent("Selected buyer or approved finalist")
    expect(screen.getByTestId("perm-stop-4")).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByTestId("perm-stop-1")).toHaveAttribute("aria-pressed", "false")
  })

  it("reaches the public level 0 through the slider and steps back up from it", () => {
    render(<DisclosureLevels />)
    fireEvent.change(screen.getByRole("slider", { name: "Choose what this buyer can see" }), { target: { value: "0" } })
    expect(screen.getByTestId("perm-level")).toHaveTextContent("View level 0 of 5")
    expect(screen.getByTestId("perm-who")).toHaveTextContent("Anyone")
    expect(screen.getAllByText("No sale record")).toHaveLength(1)
    fireEvent.click(screen.getByRole("button", { name: "Move to next level" }))
    expect(screen.getByTestId("perm-level")).toHaveTextContent("View level 1 of 5")
  })

  it("keeps 'Move to next level' enabled at level 5 and clamps instead of moving past it", () => {
    render(<DisclosureLevels />)
    fireEvent.click(screen.getByTestId("perm-stop-5"))
    const next = screen.getByRole("button", { name: "Move to next level" })
    expect(next).not.toBeDisabled()
    fireEvent.click(next)
    fireEvent.click(next)
    expect(screen.getByTestId("perm-level")).toHaveTextContent("View level 5 of 5")
    expect(screen.getByTestId("perm-stop-5")).toHaveAttribute("aria-pressed", "true")
    expect((screen.getByRole("slider", { name: "Choose what this buyer can see" }) as HTMLInputElement).value).toBe("5")
  })

  it.each(PERMISSION_LEVELS.map((p, i) => [i, p] as const))(
    "shows the viewer, disclosure, trigger, and record values for level %i",
    async (level, perm) => {
      render(<DisclosureLevels />)
      fireEvent.click(screen.getByTestId(`perm-stop-${level}`))
      expect(screen.getByText("Applying the selected access rules...")).toBeInTheDocument()
      await settle(320)
      expect(screen.queryByText("Applying the selected access rules...")).toBeNull()
      expect(screen.getByTestId("perm-who")).toHaveTextContent(perm.who)
      expect(screen.getByText("What they see:").parentElement).toHaveTextContent(`What they see: ${perm.see}`)
      expect(screen.getByText("What moves access:").parentElement).toHaveTextContent(`What moves access: ${perm.trig}`)
      const record = screen.getByTestId("company-record")
      for (const field of RECORD_FIELDS) expect(valueAfter(record, field.l), field.l).toBe(field.v[level])
    }
  )

  it("labels every stop with its index and title", () => {
    render(<DisclosureLevels />)
    PERMISSION_LEVELS.forEach((p, i) => expect(screen.getByTestId(`perm-stop-${i}`)).toHaveTextContent(`${i} · ${p.t}`))
  })

  it("renders every access-log entry with its time, action, actor line, and level badge", () => {
    render(<DisclosureLevels />)
    const log = screen.getByRole("group", { name: "Buyer access history" })
    expect(within(log).getAllByText(/^L[0-5]$/)).toHaveLength(ACCESS_LOG.length)
    for (const e of ACCESS_LOG) {
      const entry = within(log).getByText(e.act).parentElement!.parentElement!
      expect(entry).toHaveTextContent(e.t)
      expect(within(entry).getByText(`L${e.lvl}`)).toBeInTheDocument()
      const meta = within(log).getByText(e.act).nextElementSibling
      expect(meta).toHaveTextContent(e.note ? `${e.who}, ${e.org} · ${e.note}` : `${e.who}, ${e.org}`)
    }
  })

  it("does not append a separator to log entries that carry no note", () => {
    render(<DisclosureLevels />)
    const expired = screen.getByText("R. Sandoval access expired after 30 days").nextElementSibling
    expect(expired?.textContent).toBe("Heirloom, Advisor action")
  })
})

describe("<PassportTiers />", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.mocked(copyText).mockClear()
  })
  afterEach(() => vi.useRealTimers())

  const progressBar = () =>
    screen.getByTestId("passport-tiers").querySelector('[aria-hidden="true"] > div') as HTMLElement

  it("starts on Heirloom Verified and switches tiers", () => {
    render(<PassportTiers />)
    expect(screen.getByTestId("passport-tier-name")).toHaveTextContent("Heirloom Verified")
    expect(screen.getByText("Verified capacity range: $3M to $6M")).toBeInTheDocument()
    fireEvent.click(screen.getByTestId("passport-tier-3"))
    expect(screen.getByTestId("passport-tier-name")).toHaveTextContent("Deal Qualified")
    expect(screen.getByText("Matched to this transaction")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Share this Passport" }))
    return screen.findByText("A shareable Passport summary has been copied.")
  })

  it("marks only the default tier as pressed and fills two thirds of the progress bar", () => {
    render(<PassportTiers />)
    expect(screen.getByRole("button", { name: "View Heirloom Verified" })).toHaveAttribute("aria-pressed", "true")
    for (const name of ["View Network Member", "View Identity Verified", "View Deal Qualified"]) {
      expect(screen.getByRole("button", { name })).toHaveAttribute("aria-pressed", "false")
    }
    expect(progressBar().style.width).toBe("66.66666666666666%")
  })

  it.each([0, 1, 2, 3] as PassportTierIndex[])(
    "shows the exact card values, muting, description, and progress for tier %i",
    async (tier) => {
      render(<PassportTiers />)
      fireEvent.click(screen.getByTestId(`passport-tier-${tier}`))
      expect(screen.getByText("Loading the selected verification level...")).toBeInTheDocument()
      await settle(320)
      expect(screen.queryByText("Loading the selected verification level...")).toBeNull()
      expect(screen.getByTestId("passport-tier-name")).toHaveTextContent(PASSPORT_TIERS[tier])
      expect(screen.getByText(PASSPORT_TIER_DESCRIPTIONS[tier]!)).toBeInTheDocument()
      expect(progressBar().style.width).toBe(passportProgress(tier))
      const card = screen.getByTestId("passport-tiers")
      for (const row of PASSPORT_ROWS) {
        const value = within(card).getByText(row.l).nextElementSibling as HTMLElement
        expect(value.textContent, row.l).toBe(row.v[tier])
        if (isMutedPassportValue(row.v[tier])) {
          expect(value.className, `${row.l} muted`).toContain("text-dfull/30")
          expect(value.className, `${row.l} muted`).not.toContain("text-d1")
        } else {
          expect(value.className, `${row.l} shown`).toContain("text-d1")
          expect(value.className, `${row.l} shown`).not.toContain("text-dfull/30")
        }
      }
    }
  )

  it("shows the literal progress widths 0%, a third, two thirds, and 100% across the tiers", () => {
    render(<PassportTiers />)
    const widths: string[] = []
    for (const tier of [0, 1, 2, 3]) {
      fireEvent.click(screen.getByTestId(`passport-tier-${tier}`))
      widths.push(progressBar().style.width)
    }
    expect(widths).toEqual(["0%", "33.33333333333333%", "66.66666666666666%", "100%"])
  })

  it("copies the share line for the tier on display and confirms", async () => {
    render(<PassportTiers />)
    fireEvent.click(screen.getByRole("button", { name: "Share this Passport" }))
    expect(await screen.findByText("A shareable Passport summary has been copied.")).toBeInTheDocument()
    expect(copyText).toHaveBeenCalledTimes(1)
    expect(copyText).toHaveBeenCalledWith(
      "Buyer Passport · Heirloom Verified · verification details available on request via buyers@heirloom.com"
    )
    fireEvent.click(screen.getByTestId("passport-tier-0"))
    fireEvent.click(screen.getByRole("button", { name: "Share this Passport" }))
    await act(async () => {})
    expect(copyText).toHaveBeenLastCalledWith(passportShareText(0))
    expect(copyText).toHaveBeenLastCalledWith(
      "Buyer Passport · Network Member · verification details available on request via buyers@heirloom.com"
    )
  })

  it("does not show the copied confirmation before sharing", () => {
    render(<PassportTiers />)
    expect(screen.queryByText("A shareable Passport summary has been copied.")).toBeNull()
  })

  it("links the two request pills to buyers@heirloom.com with their exact subjects", () => {
    render(<PassportTiers />)
    expect(screen.getByRole("link", { name: "Request updated verification" })).toHaveAttribute(
      "href",
      "mailto:buyers@heirloom.com?subject=Request%20updated%20verification"
    )
    expect(screen.getByRole("link", { name: "Verify this Passport" })).toHaveAttribute(
      "href",
      "mailto:buyers@heirloom.com?subject=Verify%20this%20Passport"
    )
  })
})

describe("<OfferComparison />", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
  afterEach(() => vi.useRealTimers())

  it("re-ranks by priority and reveals the selected offer", () => {
    render(<OfferComparison />)
    expect(screen.getByTestId("offer-card-C")).toHaveAttribute("data-best", "true")
    fireEvent.click(screen.getByRole("button", { name: "Most cash at closing" }))
    expect(screen.getByTestId("offer-card-D")).toHaveAttribute("data-best", "true")
    expect(screen.getByText("Choose an offer.")).toBeInTheDocument()
    fireEvent.click(screen.getByTestId("offer-card-A"))
    expect(screen.getByText("Reading the offer terms...")).toBeInTheDocument()
  })

  it("reveals the exact terms of Letter of intent A after the reading delay", async () => {
    render(<OfferComparison />)
    fireEvent.click(screen.getByTestId("offer-card-A"))
    expect(screen.getByTestId("offer-card-A")).toHaveAttribute("aria-pressed", "true")
    expect(screen.queryByTestId("offer-detail")).toBeNull()
    expect(screen.queryByText("Choose an offer.")).toBeNull()
    await settle(340)
    expect(screen.queryByText("Reading the offer terms...")).toBeNull()
    const detail = screen.getByTestId("offer-detail")
    expect(within(detail).getByText("Letter of intent A · Regional consolidator")).toBeInTheDocument()
    expect(within(detail).getByText("Owns four contractors in the Carolinas")).toBeInTheDocument()
    expect(valueAfter(detail, "Headline price")).toBe("$4.30M")
    expect(valueAfter(detail, "Cash at closing")).toBe("$2.75M")
    expect(valueAfter(detail, "Money paid later")).toBe("$1.25M")
    expect(valueAfter(detail, "Retained ownership")).toBe("$0.30M")
    expect(valueAfter(detail, "Buyer financing")).toBe("Bank line plus SBA 7(a) top-up")
    expect(valueAfter(detail, "Time you stay")).toBe("12 months, full time")
    expect(valueAfter(detail, "Team and company name")).toBe(
      "Kept all staff, the name and the location in three prior acquisitions. Verified against public record."
    )
    expect(valueAfter(detail, "Closing risk")).toBe("Moderate · 60 days exclusivity")
  })

  it.each(OFFERS.map((o) => o.id))("shows the derived terms for offer %s", async (id) => {
    render(<OfferComparison />)
    fireEvent.click(screen.getByTestId(`offer-card-${id}`))
    await settle(340)
    const offer = findOffer(id)!
    const detail = screen.getByTestId("offer-detail")
    expect(within(detail).getByText(`Letter of intent ${id} · ${offer.who}`)).toBeInTheDocument()
    expect(valueAfter(detail, "Headline price")).toBe(formatMillions(offer.head))
    expect(valueAfter(detail, "Cash at closing")).toBe(formatMillions(offer.cash))
    expect(valueAfter(detail, "Money paid later")).toBe(paidLater(offer))
    expect(valueAfter(detail, "Retained ownership")).toBe(retained(offer))
    expect(valueAfter(detail, "Closing risk")).toBe(`${certaintyLabel(offer.cert)} · ${offer.excl} exclusivity`)
  })

  it("shows 'None' for an offer with no rollover and for one with nothing paid later", async () => {
    render(<OfferComparison />)
    fireEvent.click(screen.getByTestId("offer-card-D"))
    await settle(340)
    expect(valueAfter(screen.getByTestId("offer-detail"), "Retained ownership")).toBe("None")
    expect(valueAfter(screen.getByTestId("offer-detail"), "Money paid later")).toBe("$1.20M")
    fireEvent.click(screen.getByTestId("offer-card-C"))
    await settle(340)
    expect(valueAfter(screen.getByTestId("offer-detail"), "Money paid later")).toBe("$0.15M")
    expect(valueAfter(screen.getByTestId("offer-detail"), "Retained ownership")).toBe("$0.80M")
  })

  it("clicking the selected offer again collapses the detail panel", async () => {
    render(<OfferComparison />)
    fireEvent.click(screen.getByTestId("offer-card-B"))
    await settle(340)
    expect(screen.getByTestId("offer-detail")).toBeInTheDocument()
    fireEvent.click(screen.getByTestId("offer-card-B"))
    expect(screen.queryByTestId("offer-detail")).toBeNull()
    expect(screen.getByTestId("offer-card-B")).toHaveAttribute("aria-pressed", "false")
    expect(screen.getByText("Choose an offer.")).toBeInTheDocument()
  })

  it("selects an offer with Enter and toggles it off with Space, ignoring other keys", async () => {
    render(<OfferComparison />)
    const card = screen.getByTestId("offer-card-C")
    fireEvent.keyDown(card, { key: "a" })
    expect(card).toHaveAttribute("aria-pressed", "false")
    fireEvent.keyDown(card, { key: "Enter" })
    expect(card).toHaveAttribute("aria-pressed", "true")
    await settle(340)
    expect(screen.getByTestId("offer-detail")).toHaveTextContent("Letter of intent C · Private equity add-on")
    fireEvent.keyDown(card, { key: " " })
    expect(card).toHaveAttribute("aria-pressed", "false")
    expect(screen.queryByTestId("offer-detail")).toBeNull()
  })

  it("explains the default certainty priority and marks exactly one strongest fit", () => {
    render(<OfferComparison />)
    expect(screen.getByRole("button", { name: "Highest chance of closing" })).toHaveAttribute("aria-pressed", "true")
    expect(
      screen.getByText("Rewards committed financing, a proven buyer, fewer conditions, and a shorter path to close.")
    ).toBeInTheDocument()
    expect(screen.getAllByText("Strongest fit")).toHaveLength(1)
    expect(within(screen.getByTestId("offer-card-C")).getByText("Strongest fit")).toBeInTheDocument()
  })

  it.each([
    ["cash", "Most cash at closing", "D"],
    ["certainty", "Highest chance of closing", "C"],
    ["upside", "Keep future upside", "B"],
    ["team", "Protect employees and the company name", "A"],
  ] as const)("moves the strongest fit to offer %s for the '%s' priority", (priority, label, expectedBest) => {
    render(<OfferComparison />)
    fireEvent.click(screen.getByRole("button", { name: label }))
    expect(screen.getByRole("button", { name: label })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText(PRIORITY_WHY[priority])).toBeInTheDocument()
    expect(rankOffers(priority).bestId).toBe(expectedBest)
    for (const o of OFFERS) {
      expect(screen.getByTestId(`offer-card-${o.id}`), o.id).toHaveAttribute("data-best", String(o.id === expectedBest))
    }
    expect(screen.getAllByText("Strongest fit")).toHaveLength(1)
    expect(within(screen.getByTestId(`offer-card-${expectedBest}`)).getByText("Strongest fit")).toBeInTheDocument()
  })

  it("keeps only one priority pressed at a time", () => {
    render(<OfferComparison />)
    fireEvent.click(screen.getByRole("button", { name: "Keep future upside" }))
    const pressed = PRIORITIES.filter(
      (p) => screen.getByRole("button", { name: p.l }).getAttribute("aria-pressed") === "true"
    )
    expect(pressed.map((p) => p.v)).toEqual(["upside"])
  })

  it("flags offer D as the highest headline price under every priority", () => {
    render(<OfferComparison />)
    for (const p of PRIORITIES) {
      fireEvent.click(screen.getByRole("button", { name: p.l }))
      expect(screen.getAllByText("Highest headline price")).toHaveLength(1)
      expect(within(screen.getByTestId("offer-card-D")).getByText("Highest headline price")).toBeInTheDocument()
    }
  })

  it("prints each card's headline, cash, certainty band, and certainty bar width", () => {
    render(<OfferComparison />)
    const expected = { A: "Moderate", B: "Lower", C: "High", D: "Moderate" } as const
    for (const o of OFFERS) {
      const card = screen.getByTestId(`offer-card-${o.id}`)
      expect(within(card).getByText(o.who)).toBeInTheDocument()
      expect(valueAfter(card, "Headline price")).toBe(formatMillions(o.head))
      expect(valueAfter(card, "Cash at closing")).toBe(formatMillions(o.cash))
      expect(valueAfter(card, "Closing risk")).toBe(expected[o.id])
      const bar = card.querySelector('[style*="width"]') as HTMLElement
      expect(bar.style.width, o.id).toBe(`${Math.round(o.cert * 100)}%`)
    }
  })
})

describe("<BusinessBrain />", () => {
  it("resolves and resets the reconciliation example", () => {
    render(<BusinessBrain />)
    expect(screen.getByTestId("brain-status")).toHaveTextContent("Advisor review required")
    fireEvent.click(screen.getByRole("button", { name: /Show the resolution/ }))
    expect(screen.getByTestId("brain-status")).toHaveTextContent("Resolved by the advisor")
    expect(screen.getByText("$845,000")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Reset example" }))
    expect(screen.getByText("$817,400")).toBeInTheDocument()
  })
})

describe("<QuestionsAccordion />", () => {
  it("opens one answer at a time", () => {
    render(<QuestionsAccordion />)
    const first = screen.getByRole("button", { name: "How much does Heirloom charge?" })
    const second = screen.getByRole("button", { name: "Will my employees find out I am selling?" })
    expect(first).toHaveAttribute("aria-expanded", "false")
    fireEvent.click(first)
    expect(first).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText(/A full private sale costs a \$5,000/)).toBeVisible()
    fireEvent.click(second)
    expect(first).toHaveAttribute("aria-expanded", "false")
    expect(second).toHaveAttribute("aria-expanded", "true")
    const region = within(second.parentElement as HTMLElement).getByRole("region")
    expect(region).toHaveTextContent(/Not from Heirloom/)
  })

  it("gives every category a level-2 heading whose id is the category id", () => {
    render(<QuestionsAccordion />)
    for (const cat of QUESTION_CATEGORIES) {
      const heading = screen.getByRole("heading", { level: 2, name: cat.label })
      expect(heading.id, cat.label).toBe(cat.id)
      expect(document.getElementById(cat.id)).toBe(heading)
    }
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(QUESTION_CATEGORIES.length)
  })

  it("renders a collapsed button controlling a hidden region for every question", () => {
    render(<QuestionsAccordion />)
    const items = QUESTION_CATEGORIES.flatMap((c) => c.items)
    expect(screen.getAllByRole("button")).toHaveLength(items.length)
    for (const item of items) {
      const button = screen.getByRole("button", { name: item.q })
      expect(button).toHaveAttribute("aria-expanded", "false")
      const region = document.getElementById(button.getAttribute("aria-controls") ?? "")
      expect(region, item.q).not.toBeNull()
      expect(region!.hidden, item.q).toBe(true)
      expect(region!).toHaveTextContent(item.a)
    }
  })

  it("collapses an open answer when its question is clicked again", () => {
    render(<QuestionsAccordion />)
    const button = screen.getByRole("button", { name: "Do buyers pay Heirloom?" })
    fireEvent.click(button)
    const region = document.getElementById(button.getAttribute("aria-controls") ?? "")!
    expect(region.hidden).toBe(false)
    expect(region).toHaveTextContent(
      "Buyers pay no transaction fee on a business we represent. Buyer Passport is currently free."
    )
    fireEvent.click(button)
    expect(button).toHaveAttribute("aria-expanded", "false")
    expect(region.hidden).toBe(true)
  })

  it("renders the fee answer as a single paragraph that covers both the full sale and the existing buyer", () => {
    render(<QuestionsAccordion />)
    const button = screen.getByRole("button", { name: "How much does Heirloom charge?" })
    fireEvent.click(button)
    const region = document.getElementById(button.getAttribute("aria-controls") ?? "")!
    expect(within(region).getAllByRole("paragraph")).toHaveLength(1)
    expect(region).toHaveTextContent(
      "A full private sale costs a $5,000 engagement commitment and a 5% success fee. The $5,000 is credited against the fee if the business sells. There is no retainer, listing fee, or minimum. If you already have a buyer, the offer review is free and the success fee is 2.5%, with no upfront fee."
    )
  })
})
