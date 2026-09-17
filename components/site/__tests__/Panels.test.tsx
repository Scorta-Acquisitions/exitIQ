import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { PassportTiers } from "@/components/site/buyers/PassportTiers"
import { CompanyRecord } from "@/components/site/confidentiality/CompanyRecord"
import { DisclosureLevels } from "@/components/site/confidentiality/DisclosureLevels"
import { BusinessBrain } from "@/components/site/how-it-works/BusinessBrain"
import { QuestionsAccordion } from "@/components/site/questions/QuestionsAccordion"
import {
  isMutedPassportValue,
  PASSPORT_ROWS,
  PASSPORT_TIER_DESCRIPTIONS,
  PASSPORT_TIERS,
  passportProgress,
  type PassportTierIndex,
} from "@/lib/site/buyers/passport"
import { ACCESS_LOG, PERMISSION_LEVELS, RECORD_FIELDS } from "@/lib/site/confidentiality/data"
import { RECONCILIATION } from "@/lib/site/content/stages"
import { copyText } from "@/lib/site/mailto"
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

  it("returns to the anonymous overview from the last level, with two fields hidden again", () => {
    render(<DisclosureLevels />)
    fireEvent.click(screen.getByTestId("perm-stop-5"))
    expect(screen.getByTestId("perm-level")).toHaveTextContent("View level 5 of 5")
    fireEvent.click(screen.getByRole("button", { name: "Return to anonymous view" }))
    expect(screen.getByTestId("perm-level")).toHaveTextContent("View level 1 of 5")
    expect(screen.getByTestId("perm-who")).toHaveTextContent("Prospective buyer matching your approved criteria")
    // At the overview the company name and the owner are the two fields still withheld.
    expect(screen.getAllByText("Hidden")).toHaveLength(2)
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
    }
    // An entry with a note reads actor, organisation, then the note behind a middle dot.
    expect(screen.getByText("Viewed 2025 payroll register").nextElementSibling).toHaveTextContent(
      "M. Alden, Cadence Facility Partners · Finalist access"
    )
  })

  it("does not append a separator to log entries that carry no note", () => {
    render(<DisclosureLevels />)
    const expired = screen.getByText("R. Sandoval access expired after 30 days").nextElementSibling
    expect(expired?.textContent).toBe("Heirloom, Advisor action")
  })
})

describe("<CompanyRecord />", () => {
  /** The inline delay on each animated value, in the order the record lists its rows. */
  const delays = () =>
    Array.from(
      screen.getByTestId("company-record").querySelectorAll<HTMLElement>("span[style*='animation-delay']"),
      (el) => el.style.animationDelay
    )

  it("staggers its animated values 60ms apart on the first play and not at all on a replay", () => {
    const { rerender } = render(<CompanyRecord level={2} title="Company record" size="sm" animated cycle={0} />)
    expect(delays().slice(0, 4)).toEqual(["0ms", "60ms", "120ms", "180ms"])
    // A replay re-keys the same rows: `demoStagger` gives every one of them 0ms, so nothing re-staggers.
    rerender(<CompanyRecord level={3} title="Company record" size="sm" animated cycle={1} />)
    expect(delays()).toEqual(delays().map(() => "0ms"))
    expect(delays()).toHaveLength(RECORD_FIELDS.length)
  })

  it("leaves the page's static record unanimated, whatever the demo's cycle is", () => {
    render(<CompanyRecord level={3} title="Company record · Project Ridgeline" />)
    const record = screen.getByTestId("company-record")
    expect(record.querySelectorAll("[style*='animation-delay']")).toHaveLength(0)
    expect(record.querySelectorAll(".animate-row-in")).toHaveLength(0)
    expect(valueAfter(record, "Company name")).toBe(RECORD_FIELDS[0]!.v[3])
  })

  it("falls closed to the sealed values for a level the record does not hold", () => {
    render(<CompanyRecord level={6} title="Project Ridgeline" />)
    const record = screen.getByTestId("company-record")
    expect(valueAfter(record, "Company name")).toBe("No sale record")
    expect(valueAfter(record, "Last 12 months revenue")).toBe("Not available")
    // Every row shows what an unrecognised level is entitled to, which is what level 0 shows.
    for (const f of RECORD_FIELDS) expect(valueAfter(record, f.l), f.l).toBe(f.v[0])
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
          expect(value, `${row.l} muted`).toHaveClass("text-fg-3")
          expect(value, `${row.l} muted`).not.toHaveClass("text-fg")
        } else {
          expect(value, `${row.l} shown`).toHaveClass("text-fg")
          expect(value, `${row.l} shown`).not.toHaveClass("text-fg-3")
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
    expect(copyText).toHaveBeenLastCalledWith(
      "Buyer Passport · Network Member · verification details available on request via buyers@heirloom.com"
    )
  })

  it("shows the buyers@ fallback and no confirmation when the browser refuses the clipboard", async () => {
    // The reachable failure: copyText resolves false and never rejects.
    vi.mocked(copyText).mockResolvedValueOnce(false)
    render(<PassportTiers />)
    fireEvent.click(screen.getByRole("button", { name: "Share this Passport" }))
    const error = await screen.findByText("We could not copy the summary. Email buyers@heirloom.com directly.")
    expect(error).toHaveClass("type-caption", "text-error")
    expect(error).toHaveAttribute("aria-live", "polite")
    expect(screen.queryByText("A shareable Passport summary has been copied.")).toBeNull()
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

describe("<BusinessBrain />", () => {
  it("resolves and resets the reconciliation example", () => {
    render(<BusinessBrain />)
    expect(screen.getByTestId("brain-status")).toHaveTextContent("Advisor review required")
    expect(valueAfter(screen.getByTestId("business-brain"), "Adjusted earnings")).toBe("$817,400")
    fireEvent.click(screen.getByRole("button", { name: /Show the resolution/ }))
    expect(screen.getByTestId("brain-status")).toHaveTextContent("Resolved by the advisor")
    expect(valueAfter(screen.getByTestId("business-brain"), "Adjusted earnings")).toBe("$845,000")
    fireEvent.click(screen.getByRole("button", { name: "Reset example" }))
    expect(screen.getByText("$817,400")).toBeInTheDocument()
  })

  it("reads the resolved owner compensation back with the family payroll it accounts for", () => {
    render(<BusinessBrain />)
    fireEvent.click(screen.getByRole("button", { name: /Show the resolution/ }))
    expect(screen.getByTestId("business-brain")).toHaveTextContent(
      "$214,000, including $27,600 of documented family payroll with no recorded hours."
    )
  })

  it("prints the four disagreeing records as $186,400 against $214,000, the figures RECONCILIATION holds", () => {
    render(<BusinessBrain />)
    const card = screen.getByTestId("business-brain")
    const rows = Array.from(card.querySelectorAll(".border-b.py-3")).slice(0, 4)
    expect(
      rows.map((r) => [r.firstElementChild?.firstElementChild?.textContent, r.lastElementChild?.textContent])
    ).toEqual([
      ["Books", "$186,400"],
      ["Payroll", "$214,000"],
      ["Tax return", "$186,400"],
      ["Owner explanation", "$214,000"],
    ])
    expect(within(card).getByText("Payroll register, including a family member with no recorded hours")).toBeVisible()
    expect(RECONCILIATION.records.map((r) => r.value)).toEqual(["$186,400", "$214,000", "$186,400", "$214,000"])
  })

  it("answers the buyer's question with both figures once the advisor has resolved it", () => {
    render(<BusinessBrain />)
    expect(screen.getByText("Buyer question: Why is owner compensation adjusted to $214,000?")).toBeVisible()
    expect(screen.getByText("Advisor review required.").tagName).toBe("EM")
    fireEvent.click(screen.getByRole("button", { name: /Show the resolution/ }))
    expect(screen.getByTestId("business-brain")).toHaveTextContent(
      '"The tax return reports $186,400 of officer compensation. Payroll records show another $27,600 paid to a family member with no recorded hours. Both amounts are included in the adjustment, with the payroll lines attached for review."'
    )
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
