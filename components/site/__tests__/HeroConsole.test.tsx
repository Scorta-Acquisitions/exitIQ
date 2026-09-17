import { act, fireEvent, screen, within } from "@testing-library/react"
import type { RefObject } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { HeroConsole } from "@/components/site/hero/HeroConsole"
import { useSiteState } from "@/components/site/providers/SiteStateProvider"
import { QUESTION_COUNT, QUESTIONS } from "@/lib/site/exitiq/questions"
import { type ExitIqAnswers, scoreExitIq } from "@/lib/site/exitiq/scoring"
import { HERO_OPTIONS, type HeroStage, pathForStage } from "@/lib/site/hero/funnel"
import { CONTACT } from "@/lib/site/routes"
import { type ExitIqState, type FunnelState, INITIAL_SITE_STATE, type SiteState } from "@/lib/site/state/reducer"
import { renderWithSeededSite, renderWithSite } from "./test-utils"

/** The console's field hook, replaced so the test can read the target it is handed and count its pulses. */
const field = vi.hoisted(() => ({
  targets: [] as number[],
  ref: null as RefObject<HTMLCanvasElement | null> | null,
  pulse: vi.fn(),
}))
vi.mock("@/components/site/exitiq/useConsoleField", () => ({
  useConsoleField: (ref: RefObject<HTMLCanvasElement | null>, target: number) => {
    field.ref = ref
    field.targets.push(target)
    return field.pulse
  },
}))

/** The provider's pause before an exitIQ answer advances, and the hero's boot delay (SiteStateProvider). */
const IQ_ADVANCE_MS = 380
const HERO_BOOT_MS = 400

function Probe() {
  const { state } = useSiteState()
  return (
    <output data-testid="probe">
      {JSON.stringify({ funnel: state.funnel, iq: state.iq, advisorOpen: state.advisor.open })}
    </output>
  )
}
const probe = () =>
  JSON.parse(screen.getByTestId("probe").textContent ?? "null") as {
    funnel: FunnelState
    iq: ExitIqState
    advisorOpen: boolean
  }

const mount = () =>
  renderWithSite(
    <>
      <HeroConsole />
      <Probe />
    </>
  )

/** Site state for a visitor arriving on `stage` with the given funnel answers and exitIQ progress. */
function seeded(funnel: Partial<FunnelState>, iq: Partial<ExitIqState> = {}): SiteState {
  const stage = funnel.stage ?? INITIAL_SITE_STATE.funnel.stage
  return {
    ...INITIAL_SITE_STATE,
    funnel: { ...INITIAL_SITE_STATE.funnel, path: pathForStage(stage), ...funnel },
    iq: { ...INITIAL_SITE_STATE.iq, ...iq },
  }
}
const mountSeeded = (state: SiteState) =>
  renderWithSeededSite(
    <>
      <HeroConsole />
      <Probe />
    </>,
    state
  )

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms)
  })

const classes = (el: Element) => Array.from(el.classList)
const header = () => screen.getByText("Heirloom").parentElement!.parentElement!
const option = (k: "sell" | "offer" | "ready") => screen.getByTestId(`hero-option-${k}`)
const sub = (k: "sell" | "offer" | "ready") => within(option(k)).getByText(HERO_OPTIONS.find((o) => o.k === k)!.sub)
const arrow = (k: "sell" | "offer" | "ready") => within(option(k)).getByText("→")
const graph = () => screen.getByTestId("hero-graph")
const ringOpacities = () =>
  Array.from(graph().querySelectorAll("ellipse")).map((e) => (e.parentElement as HTMLElement).style.opacity)
const priceOpacity = () => (screen.getByText("$3.6M CASH AT CLOSING").parentElement as HTMLElement).style.opacity

/** Every question answered with its first chip: the "Market Ready" run the first build's test walked. */
const FIRST_CHIP_ANSWERS: ExitIqAnswers = Object.fromEntries(QUESTIONS.map((q) => [q.id, q.chips[0]!.v]))
/** Every question answered as badly as the bank allows: the fit floor, and a confidence under the field's 0.25 floor. */
const WORST_ANSWERS: ExitIqAnswers = {
  type: "prof",
  rev: "u1",
  trend: "down",
  sde: "a",
  books: "diff",
  conc: "d",
  owner: "d",
}

/** Answer the current question with `label`, then wait out the reading pause. */
function answer(label: string) {
  fireEvent.click(within(screen.getByTestId("exitiq-question")).getByRole("button", { name: label }))
  advance(IQ_ADVANCE_MS)
}

describe("<HeroConsole />", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    field.targets.length = 0
    field.ref = null
    field.pulse.mockClear()
  })
  afterEach(() => vi.useRealTimers())

  describe("route panel", () => {
    it("asks where the visitor is and lists the three numbered paths in order", () => {
      mount()
      const h2 = screen.getByRole("heading", { level: 2, name: "Where are you today?" })
      expect(classes(h2)).toEqual(expect.arrayContaining(["font-display", "text-d1", "font-normal"]))
      const group = screen.getByRole("group", { name: "Choose where you are in the sale process" })
      const buttons = within(group).getAllByRole("button")
      expect(buttons).toEqual([option("sell"), option("offer"), option("ready")])
      expect(HERO_OPTIONS.map((o) => [o.k, o.num, o.title])).toEqual([
        ["sell", "01", "I want to sell"],
        ["offer", "02", "I already have a buyer or offer"],
        ["ready", "03", "I'm not sure I'm ready"],
      ])
      for (const o of HERO_OPTIONS) {
        const el = option(o.k)
        expect(el.tagName).toBe("BUTTON")
        expect(within(el).getByText(o.num)).toHaveClass("font-mono")
        expect(within(el).getByText(o.title)).toHaveClass("font-display")
        expect(within(el).getByText("Continue")).toHaveClass("sr-only")
        expect(arrow(o.k)).toHaveAttribute("aria-hidden", "true")
      }
      expect(probe().funnel).toEqual({
        stage: "route",
        path: "sell",
        tick: 0,
        boot: true,
        sellTiming: null,
        sellRevenue: null,
      })
    })

    it("rests on the sell path: only the hot option shows its sub line, lit number, and arrow", () => {
      mount()
      expect(classes(option("sell"))).toEqual(expect.arrayContaining(["bg-filament/5", "text-d1"]))
      expect(classes(option("offer"))).toEqual(expect.arrayContaining(["text-dfull/60"]))
      expect(classes(option("offer"))).not.toContain("bg-filament/5")
      expect(classes(sub("sell"))).not.toContain("hidden")
      expect(classes(sub("offer"))).toContain("hidden")
      expect(classes(sub("ready"))).toContain("hidden")
      expect(within(option("sell")).getByText("01")).toHaveClass("text-filament")
      expect(within(option("offer")).getByText("02")).toHaveClass("text-dfull/30")
      expect(arrow("sell")).toHaveClass("opacity-100")
      expect(arrow("offer")).toHaveClass("opacity-15")
      expect(arrow("ready")).toHaveClass("opacity-15")
    })

    it("hovering an option dispatches funnel/hover: the path moves, the stage does not, and the graph follows", () => {
      mount()
      expect(priceOpacity()).toBe("0")
      fireEvent.mouseEnter(option("offer"))
      expect(probe().funnel.path).toBe("offer")
      expect(probe().funnel.stage).toBe("route")
      expect(probe().funnel.tick).toBe(0)
      expect(classes(sub("offer"))).not.toContain("hidden")
      expect(classes(sub("sell"))).toContain("hidden")
      expect(arrow("offer")).toHaveClass("opacity-100")
      expect(arrow("sell")).toHaveClass("opacity-15")
      expect(priceOpacity()).toBe("1")
    })

    it("focusing an option dispatches funnel/hover as well", () => {
      mount()
      fireEvent.focus(option("ready"))
      expect(probe().funnel.path).toBe("ready")
      expect(probe().funnel.stage).toBe("route")
      expect(sub("ready")).toHaveTextContent("Seven questions on how buyers would see the business today.")
      expect(classes(sub("ready"))).not.toContain("hidden")
      expect(classes(sub("sell"))).toContain("hidden")
      expect(within(option("ready")).getByText("03")).toHaveClass("text-filament")
    })

    it("clicking an option moves to its stage, sets the path, and steps the tick", () => {
      mount()
      fireEvent.click(option("sell"))
      expect(probe().funnel).toEqual(expect.objectContaining({ stage: "sellQ1", path: "sell", tick: 1 }))
      expect(screen.queryByTestId("hero-option-sell")).toBeNull()
      fireEvent.click(within(header()).getByRole("button", { name: "Start over" }))
      expect(probe().funnel).toEqual(expect.objectContaining({ stage: "route", path: "sell", tick: 2 }))
      fireEvent.click(option("offer"))
      expect(probe().funnel).toEqual(expect.objectContaining({ stage: "offer", path: "offer", tick: 3 }))
      expect(screen.getByTestId("hero-offer")).toBeInTheDocument()
      fireEvent.click(within(header()).getByRole("button", { name: "Start over" }))
      fireEvent.click(option("ready"))
      expect(probe().funnel).toEqual(expect.objectContaining({ stage: "ready", path: "ready", tick: 5 }))
      expect(screen.getByTestId("hero-ready")).toBeInTheDocument()
    })
  })

  describe("header", () => {
    it("names the console in mono caps and shows neither progress nor Start over on the route stage", () => {
      mount()
      expect(screen.getByText("Heirloom")).toHaveClass("font-mono", "uppercase")
      expect(screen.getByTestId("hero-progress").textContent).toBe("")
      expect(screen.queryByRole("button", { name: "Start over" })).toBeNull()
      expect(header()).toContainElement(screen.getByTestId("hero-progress"))
    })

    it.each([
      ["sellQ1", "QUESTION 1 OF 2"],
      ["sellQ2", "QUESTION 2 OF 2"],
      ["sellDone", "YOUR RESULT"],
      ["offer", "FREE OFFER REVIEW"],
      ["ready", "EXITIQ"],
    ] as Array<[HeroStage, string]>)(
      "shows the %s stage's progress label %s with a Start over button",
      (stage, label) => {
        mountSeeded(seeded({ stage }))
        const progress = screen.getByTestId("hero-progress")
        expect(progress.textContent).toBe(label)
        expect(classes(progress)).toEqual(expect.arrayContaining(["font-mono", "text-d4"]))
        const startOver = within(header()).getByRole("button", { name: "Start over" })
        expect(startOver).toHaveAttribute("type", "button")
        expect(classes(startOver)).toEqual(expect.arrayContaining(["rounded-full", "border", "font-mono", "text-d3"]))
      }
    )

    it("Start over returns to the route panel while keeping the sell answers for the next visit", () => {
      mountSeeded(seeded({ stage: "sellDone", sellTiming: "mid", sellRevenue: "3-10" }))
      expect(screen.getByTestId("hero-sell-done")).toBeInTheDocument()
      fireEvent.click(within(header()).getByRole("button", { name: "Start over" }))
      expect(screen.getByRole("heading", { level: 2, name: "Where are you today?" })).toBeInTheDocument()
      expect(screen.queryByTestId("hero-sell-done")).toBeNull()
      expect(screen.queryByRole("button", { name: "Start over" })).toBeNull()
      expect(screen.getByTestId("hero-progress").textContent).toBe("")
      expect(probe().funnel).toEqual(
        expect.objectContaining({ stage: "route", sellTiming: "mid", sellRevenue: "3-10" })
      )
      fireEvent.click(option("sell"))
      expect(screen.getByRole("button", { name: "In 6 to 18 months" })).toHaveAttribute("aria-pressed", "true")
      expect(screen.getByRole("button", { name: "Now or within 6 months" })).toHaveAttribute("aria-pressed", "false")
    })
  })

  describe("sell path", () => {
    it("asks the timing question with three unpressed chips", () => {
      mount()
      fireEvent.click(option("sell"))
      const eyebrow = screen.getByText("About your timing")
      expect(classes(eyebrow)).toEqual(expect.arrayContaining(["font-mono", "uppercase", "text-filament"]))
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("When are you thinking about selling?")
      const chips = within(screen.getByRole("group")).getAllByRole("button")
      expect(chips.map((c) => c.textContent)).toEqual([
        "Now or within 6 months",
        "In 6 to 18 months",
        "I am only exploring",
      ])
      for (const chip of chips) {
        expect(chip).toHaveAttribute("aria-pressed", "false")
        expect(chip).toHaveAttribute("type", "button")
        expect(classes(chip)).toEqual(expect.arrayContaining(["rounded-full", "border", "border-dfull/14"]))
      }
    })

    it("choosing a timing records it and asks the revenue question with four unpressed chips", () => {
      mount()
      fireEvent.click(option("sell"))
      fireEvent.click(screen.getByRole("button", { name: "In 6 to 18 months" }))
      expect(probe().funnel).toEqual(expect.objectContaining({ stage: "sellQ2", sellTiming: "mid", sellRevenue: null }))
      expect(screen.getByText("About your revenue")).toHaveClass("uppercase")
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "About how much revenue did the business generate last year?"
      )
      expect(screen.getByText("A rough answer is enough.")).toHaveClass("font-mono", "text-d4")
      const chips = within(screen.getByRole("group")).getAllByRole("button")
      expect(chips.map((c) => c.textContent)).toEqual(["Under $1M", "$1M to $3M", "$3M to $10M", "More than $10M"])
      for (const chip of chips) expect(chip).toHaveAttribute("aria-pressed", "false")
      expect(screen.getByTestId("hero-progress").textContent).toBe("QUESTION 2 OF 2")
    })

    it("choosing a revenue lands on the result, worded from the timing and the revenue", () => {
      mount()
      fireEvent.click(option("sell"))
      fireEvent.click(screen.getByRole("button", { name: "In 6 to 18 months" }))
      fireEvent.click(screen.getByRole("button", { name: "$3M to $10M" }))
      expect(probe().funnel).toEqual(
        expect.objectContaining({ stage: "sellDone", sellTiming: "mid", sellRevenue: "3-10" })
      )
      const done = screen.getByTestId("hero-sell-done")
      expect(within(done).getByRole("heading", { level: 2 })).toHaveTextContent("Timing and fit")
      expect(within(done).getByText("This timing leaves room to prepare before buyers see the business.")).toHaveClass(
        "font-semibold"
      )
      expect(within(done).getByText("Your business is in Heirloom’s usual range.")).toBeInTheDocument()
      expect(
        within(done).getByText(
          "An advisor can look at the business, describe the likely buyers, and give a view on timing."
        )
      ).toBeInTheDocument()
      expect(screen.getByTestId("hero-progress").textContent).toBe("YOUR RESULT")
    })

    it("words the result's first line for a visitor who wants to sell now", () => {
      mountSeeded(seeded({ stage: "sellDone", sellTiming: "now", sellRevenue: "1-3" }))
      const done = screen.getByTestId("hero-sell-done")
      expect(within(done).getByText("You could start a full sale process now.")).toBeInTheDocument()
    })

    it.each([
      [
        "u1",
        "Full representation usually begins around $1M in annual revenue. An advisor can still suggest a next step.",
      ],
      ["10+", "We review larger businesses individually."],
      ["1-3", "Your business is in Heirloom’s usual range."],
    ] as Array<[FunnelState["sellRevenue"] & string, string]>)(
      "words the result's second line for revenue %s",
      (sellRevenue, line) => {
        mountSeeded(seeded({ stage: "sellDone", sellTiming: "explore", sellRevenue }))
        const done = screen.getByTestId("hero-sell-done")
        expect(within(done).getByText(line)).toBeInTheDocument()
        expect(within(done).getByText("An advisor call does not commit you to selling.")).toBeInTheDocument()
      }
    )

    it("falls back to the neutral result copy when the visitor arrives on the result without answers", () => {
      mountSeeded(seeded({ stage: "sellDone", sellTiming: null, sellRevenue: null }))
      const done = screen.getByTestId("hero-sell-done")
      expect(within(done).getByText("An advisor call does not commit you to selling.")).toBeInTheDocument()
      expect(within(done).getByText("Your business is in Heirloom’s usual range.")).toBeInTheDocument()
    })

    it("offers the advisor as the result's action and links the rest to how it works", () => {
      mount()
      fireEvent.click(option("sell"))
      fireEvent.click(screen.getByRole("button", { name: "I am only exploring" }))
      fireEvent.click(screen.getByRole("button", { name: "Under $1M" }))
      const done = screen.getByTestId("hero-sell-done")
      const cta = within(done).getByTestId("open-advisor")
      expect(cta.tagName).toBe("BUTTON")
      expect(cta).toHaveTextContent("Talk to an M&A advisor")
      expect(classes(cta)).toEqual(
        expect.arrayContaining(["bg-cta", "text-ground", "rounded-full", "h-11", "font-semibold"])
      )
      // `h-11` is merged over the pill's own height, not appended to it: 44px, not 42.
      expect(classes(cta)).not.toContain("h-[42px]")
      expect(probe().advisorOpen).toBe(false)
      fireEvent.click(cta)
      expect(probe().advisorOpen).toBe(true)
      const link = within(done).getByRole("link", { name: "See how it works" })
      expect(link).toHaveAttribute("href", "/how-it-works")
      expect(classes(link)).toEqual(expect.arrayContaining(["border-b", "text-d2"]))
      expect(within(done).getAllByRole("link")).toHaveLength(1)
    })
  })

  describe("offer panel", () => {
    it("shows the free offer review copy and the three ways to send the offer, in order", () => {
      mount()
      fireEvent.click(option("offer"))
      const panel = screen.getByTestId("hero-offer")
      expect(within(panel).getByText("Free offer review")).toHaveClass("uppercase", "font-mono")
      expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent("What the offer pays")
      expect(
        within(panel).getByText(
          "We show you how much of the price is cash at closing, what is paid later or depends on financing, and which terms are missing."
        )
      ).toBeInTheDocument()
      const links = within(panel).getAllByRole("link")
      expect(links.map((l) => l.getAttribute("href"))).toEqual([
        "mailto:offers@heirloom.com",
        "/offer-review?mode=paste",
        "/offer-review?mode=verbal",
      ])
      expect(CONTACT.offers).toBe("offers@heirloom.com")
      expect(links.map((l) => l.firstElementChild!.textContent)).toEqual([
        "Forward or attach the offer",
        "Paste the terms",
        "Tell us what was said",
      ])
      expect(within(links[0]!).getByText("offers@heirloom.com")).toHaveClass("font-mono")
      expect(within(links[1]!).getByText("2 minutes")).toHaveClass("font-mono")
      expect(within(links[2]!).getByText("Rough notes are fine")).toHaveClass("font-mono")
      for (const link of links) {
        expect(link.tagName).toBe("A")
        expect(classes(link)).toEqual(expect.arrayContaining(["rounded-[11px]", "border", "border-dhair"]))
      }
      expect(within(panel).getByText("Confidential. We do not contact the buyer.")).toHaveClass("font-mono", "text-d4")
      expect(screen.getByTestId("hero-progress").textContent).toBe("FREE OFFER REVIEW")
      // The offer panel sends the offer; the advisor is not offered here.
      expect(within(panel).queryByTestId("open-advisor")).toBeNull()
    })
  })

  describe("ready path", () => {
    it("introduces exitIQ before the run starts", () => {
      mount()
      fireEvent.click(option("ready"))
      const panel = screen.getByTestId("hero-ready")
      expect(within(panel).getByText("exitIQ by Heirloom")).toHaveClass("uppercase", "font-mono")
      expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent("Is the business ready to sell?")
      expect(
        within(panel).getByText("Seven questions. You get the issues a buyer would raise first and a 90-day plan.")
      ).toBeInTheDocument()
      const start = within(panel).getByRole("button", { name: "Start exitIQ" })
      expect(start).toHaveAttribute("type", "button")
      expect(classes(start)).toEqual(expect.arrayContaining(["bg-cta", "rounded-full", "h-11"]))
      expect(within(panel).getByText("About 2 minutes. No name, email, or documents required.")).toHaveClass(
        "font-mono"
      )
      expect(screen.queryByTestId("exitiq-question")).toBeNull()
      expect(screen.queryByTestId("hero-iq-done")).toBeNull()
      expect(screen.getByTestId("hero-progress").textContent).toBe("EXITIQ")
      expect(probe().iq.started).toBe(false)
    })

    it("Start exitIQ dispatches iq/start and shows question 1 of 7 in the compact run", () => {
      mount()
      fireEvent.click(option("ready"))
      fireEvent.click(screen.getByRole("button", { name: "Start exitIQ" }))
      expect(probe().iq).toEqual(expect.objectContaining({ started: true, phase: 0, answers: {}, done: false }))
      expect(screen.queryByRole("button", { name: "Start exitIQ" })).toBeNull()
      expect(screen.queryByText("Is the business ready to sell?")).toBeNull()
      const run = screen.getByTestId("exitiq-question")
      expect(within(run).getByText("exitIQ · Question 1 of 7")).toBeInTheDocument()
      expect(within(run).getByRole("heading", { level: 2 })).toHaveTextContent("What kind of business do you run?")
      expect(screen.getByTestId("hero-ready")).toContainElement(run)
    })

    it("walking all seven answers reaches the exact result for the answers given, with the /score link", () => {
      mount()
      fireEvent.click(option("ready"))
      fireEvent.click(screen.getByRole("button", { name: "Start exitIQ" }))
      const answers: ExitIqAnswers = {}
      QUESTIONS.forEach((q, i) => {
        expect(screen.getByText(`exitIQ · Question ${i + 1} of 7`)).toBeInTheDocument()
        expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(q.q)
        const chip = q.chips[0]!
        answers[q.id] = chip.v
        answer(chip.l)
      })
      const result = scoreExitIq(answers)
      expect(result.state).toBe("Market Ready")
      expect(result.findings[0]!.t).toBe("Revenue is below our usual full-sale range")
      expect(probe().iq).toEqual(expect.objectContaining({ done: true, busy: false, phase: 6, answers }))
      expect(screen.queryByTestId("exitiq-question")).toBeNull()
      const done = screen.getByTestId("hero-iq-done")
      expect(within(done).getByText("Your result is ready.")).toHaveClass("uppercase", "font-mono")
      const state = within(done).getByText("Market Ready")
      expect(classes(state)).toEqual(expect.arrayContaining(["font-display", "text-filament"]))
      expect(within(done).queryByText(/Prepare First|More Evidence Needed|Outside Our/)).toBeNull()
      const lead = within(done).getByText("Revenue is below our usual full-sale range.")
      expect(lead.tagName).toBe("STRONG")
      expect(lead.parentElement).toHaveTextContent(
        "Heirloom’s full representation usually begins around $1M in annual revenue. The business may still be sellable through another path, and the readiness work can improve the options."
      )
      const link = within(done).getByRole("link", { name: "See my findings and 90-day plan" })
      expect(link).toHaveAttribute("href", "/score")
      expect(classes(link)).toEqual(expect.arrayContaining(["bg-cta", "rounded-full", "h-11"]))
      expect(within(done).getByRole("button", { name: "Start over" })).toHaveClass("font-mono")
      expect(screen.getByTestId("hero-progress").textContent).toBe("EXITIQ")
    })

    it("Start over in the result restarts the run at question 1 without the intro", () => {
      mountSeeded(seeded({ stage: "ready" }, { answers: FIRST_CHIP_ANSWERS, phase: 6, done: true, started: true }))
      const done = screen.getByTestId("hero-iq-done")
      expect(screen.getAllByRole("button", { name: "Start over" })).toHaveLength(2)
      fireEvent.click(within(done).getByRole("button", { name: "Start over" }))
      expect(probe().iq).toEqual({ phase: 0, answers: {}, busy: false, insight: null, done: false, started: true })
      expect(probe().funnel.stage).toBe("ready")
      expect(screen.queryByTestId("hero-iq-done")).toBeNull()
      expect(screen.queryByRole("button", { name: "Start exitIQ" })).toBeNull()
      expect(screen.getByText("exitIQ · Question 1 of 7")).toBeInTheDocument()
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(QUESTIONS[0]!.q)
      expect(screen.getAllByRole("button", { name: "Start over" })).toHaveLength(1)
    })

    it("a visitor arriving with answers but no start flag lands in the run at their question", () => {
      const answers: ExitIqAnswers = { type: "field", rev: "1-2" }
      mountSeeded(seeded({ stage: "ready" }, { answers, phase: 2, started: false }))
      expect(screen.queryByRole("button", { name: "Start exitIQ" })).toBeNull()
      expect(screen.queryByText("Is the business ready to sell?")).toBeNull()
      expect(screen.getByText("exitIQ · Question 3 of 7")).toBeInTheDocument()
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(QUESTIONS[2]!.q)
      expect(screen.getByRole("progressbar", { name: "Your progress" })).toHaveAttribute("aria-valuenow", "2")
      expect(screen.queryByTestId("hero-iq-done")).toBeNull()
    })

    it("a visitor arriving with a finished run sees its result at once, at the fit floor for the worst answers", () => {
      mountSeeded(seeded({ stage: "ready" }, { answers: WORST_ANSWERS, phase: 6, done: true, started: true }))
      const result = scoreExitIq(WORST_ANSWERS)
      expect(result.state).toBe("Outside Our Current Full-Representation Fit")
      expect(result.findings[0]!.t).toBe("Books and tax returns need a closer look")
      const done = screen.getByTestId("hero-iq-done")
      expect(within(done).getByText("Outside Our Current Full-Representation Fit")).toBeInTheDocument()
      expect(within(done).getByText("Books and tax returns need a closer look.")).toBeInTheDocument()
      expect(within(done).getByRole("link", { name: "See my findings and 90-day plan" })).toHaveAttribute(
        "href",
        "/score"
      )
      expect(screen.queryByTestId("exitiq-question")).toBeNull()
      expect(screen.queryByRole("button", { name: "Start exitIQ" })).toBeNull()
    })

    it("the header's Start over leaves the run for the route panel and keeps the answers for the return", () => {
      mount()
      fireEvent.click(option("ready"))
      fireEvent.click(screen.getByRole("button", { name: "Start exitIQ" }))
      answer(QUESTIONS[0]!.chips[2]!.l)
      expect(screen.getByText("exitIQ · Question 2 of 7")).toBeInTheDocument()
      fireEvent.click(within(header()).getByRole("button", { name: "Start over" }))
      expect(probe().funnel.stage).toBe("route")
      expect(probe().iq).toEqual(expect.objectContaining({ phase: 1, answers: { type: "prof" }, started: true }))
      expect(screen.queryByTestId("hero-ready")).toBeNull()
      fireEvent.click(option("ready"))
      expect(screen.queryByRole("button", { name: "Start exitIQ" })).toBeNull()
      expect(screen.getByText("exitIQ · Question 2 of 7")).toBeInTheDocument()
    })
  })

  describe("instrument field", () => {
    it("mounts the canvas as the console's inert backdrop and hands its ref to the field", () => {
      mount()
      const console = screen.getByTestId("hero-console")
      const canvas = console.firstElementChild as HTMLCanvasElement
      expect(canvas.tagName).toBe("CANVAS")
      expect(canvas).toHaveAttribute("aria-hidden", "true")
      expect(canvas).toHaveClass("absolute", "inset-0")
      expect(field.ref?.current).toBe(canvas)
      expect(console.children).toHaveLength(2)
      expect(console.children[1]!).toHaveClass("relative")
      expect(field.pulse).not.toHaveBeenCalled()
    })

    it("idles at the route stage's intensity", () => {
      mount()
      expect(field.targets.at(-1)).toBe(0.1)
      expect(new Set(field.targets)).toEqual(new Set([0.1]))
    })

    it("drives the field to the offer stage's 0.5", () => {
      mountSeeded(seeded({ stage: "offer" }))
      expect(field.targets.at(-1)).toBe(0.5)
    })

    it("brightens along the sell path as the visitor answers", () => {
      mount()
      fireEvent.click(option("sell"))
      expect(field.targets.at(-1)).toBe(0.35)
      fireEvent.click(screen.getByRole("button", { name: "Now or within 6 months" }))
      expect(field.targets.at(-1)).toBe(0.55)
      fireEvent.click(screen.getByRole("button", { name: "$1M to $3M" }))
      expect(field.targets.at(-1)).toBe(0.85)
      fireEvent.click(within(header()).getByRole("button", { name: "Start over" }))
      expect(field.targets.at(-1)).toBe(0.1)
      expect(field.pulse).not.toHaveBeenCalled()
    })

    it("on the ready stage follows the exitIQ confidence, floored at 0.25 before any answer", () => {
      mount()
      fireEvent.click(option("ready"))
      expect(scoreExitIq({}).conf).toBe(0)
      expect(field.targets.at(-1)).toBe(0.25)
      fireEvent.click(screen.getByRole("button", { name: "Start exitIQ" }))
      expect(field.targets.at(-1)).toBe(0.25)
      fireEvent.click(screen.getByRole("button", { name: "Home or field services" }))
      const one = scoreExitIq({ type: "field" }).conf
      expect(one).toBeCloseTo(0.5068, 4)
      expect(field.targets.at(-1)).toBe(one)
      advance(IQ_ADVANCE_MS)
      expect(field.targets.at(-1)).toBe(one)
    })

    it("holds the floor when the confidence falls under it", () => {
      const worst = scoreExitIq(WORST_ANSWERS).conf
      expect(worst).toBeCloseTo(0.0976, 4)
      expect(worst).toBeLessThan(0.25)
      mountSeeded(seeded({ stage: "ready" }, { answers: WORST_ANSWERS, phase: 6, done: true, started: true }))
      expect(field.targets.at(-1)).toBe(0.25)
    })

    it("pulses once per new answer: not on start, back, a changed answer, or a restart", () => {
      mount()
      fireEvent.click(option("ready"))
      fireEvent.click(screen.getByRole("button", { name: "Start exitIQ" }))
      expect(field.pulse).not.toHaveBeenCalled()
      fireEvent.click(screen.getByRole("button", { name: QUESTIONS[0]!.chips[0]!.l }))
      expect(field.pulse).toHaveBeenCalledTimes(1)
      advance(IQ_ADVANCE_MS)
      expect(field.pulse).toHaveBeenCalledTimes(1)
      fireEvent.click(screen.getByRole("button", { name: "Change my last answer" }))
      expect(probe().iq.phase).toBe(0)
      expect(field.pulse).toHaveBeenCalledTimes(1)
      // Replacing the first answer leaves the count of answered questions at one: no new flare.
      answer(QUESTIONS[0]!.chips[1]!.l)
      expect(probe().iq.answers).toEqual({ type: QUESTIONS[0]!.chips[1]!.v })
      expect(field.pulse).toHaveBeenCalledTimes(1)
      answer(QUESTIONS[1]!.chips[0]!.l)
      expect(field.pulse).toHaveBeenCalledTimes(2)
      for (const q of QUESTIONS.slice(2)) answer(q.chips[0]!.l)
      expect(field.pulse).toHaveBeenCalledTimes(QUESTION_COUNT)
      expect(screen.getByTestId("hero-iq-done")).toBeInTheDocument()
      fireEvent.click(within(screen.getByTestId("hero-iq-done")).getByRole("button", { name: "Start over" }))
      expect(field.pulse).toHaveBeenCalledTimes(QUESTION_COUNT)
      answer(QUESTIONS[0]!.chips[0]!.l)
      expect(field.pulse).toHaveBeenCalledTimes(QUESTION_COUNT + 1)
    })

    it("flares once when saved answers hydrate, and not again while they rest", () => {
      mountSeeded(seeded({ stage: "ready" }, { answers: FIRST_CHIP_ANSWERS, phase: 6, done: true, started: true }))
      expect(field.pulse).toHaveBeenCalledTimes(1)
      advance(HERO_BOOT_MS)
      fireEvent.click(within(header()).getByRole("button", { name: "Start over" }))
      fireEvent.click(option("ready"))
      expect(field.pulse).toHaveBeenCalledTimes(1)
    })
  })

  describe("graph pane", () => {
    it("renders the market graph in the right pane, which hides below 620px", () => {
      mount()
      const svg = graph()
      expect(svg.tagName).toBe("svg")
      expect(svg).toHaveAttribute("aria-label", "Diagram of a private buyer process around one business")
      const pane = svg.parentElement!
      // The svg fills the pane absolutely, so the pane's own box and its phone rule are the behaviour.
      expect(pane).toHaveClass("relative", "min-h-[230px]", "max-[620px]:hidden")
      expect(Array.from(pane.children)).toEqual([svg])
      expect(screen.getByTestId("hero-console")).toContainElement(pane)
    })

    it("takes the funnel's boot, path, and tick: rings fade in after the boot, hover lights the offer, a choice steps the offer node", () => {
      mount()
      expect(ringOpacities()).toEqual(["0", "0", "0"])
      advance(HERO_BOOT_MS - 1)
      expect(ringOpacities()).toEqual(["0", "0", "0"])
      advance(1)
      expect(probe().funnel.boot).toBe(false)
      expect(ringOpacities()).toEqual(["0.9", "0.9", "0.9"])
      expect(priceOpacity()).toBe("0")
      fireEvent.mouseEnter(option("offer"))
      expect(ringOpacities()).toEqual(["0.07", "0.07", "0.07"])
      expect(priceOpacity()).toBe("1")
      fireEvent.mouseEnter(option("sell"))
      const nodeLabels = () =>
        Array.from(graph().children)
          .slice(10, 22)
          .map((g) => g.querySelector("text")!.textContent)
      expect(nodeLabels().indexOf("OFFER")).toBe(6)
      fireEvent.click(option("sell"))
      expect(probe().funnel.tick).toBe(1)
      expect(nodeLabels().indexOf("OFFER")).toBe(5)
      expect(nodeLabels().filter((l) => l === "OFFER")).toHaveLength(1)
    })
  })

  describe("legacy look", () => {
    it("keeps the first build's console: ground surface, 22px radius, the deep shadow, mono caps header, serif question", () => {
      mount()
      const console = screen.getByTestId("hero-console")
      // `console-legacy` scopes the first build's focus ring, pretty headings and link hover to the card; the 16px / 1.5
      // body is the first build's, so every em-relative measure inside matches it.
      expect(console).toHaveClass(
        "console-legacy",
        "bg-ground",
        "rounded-[22px]",
        "text-[16px]",
        "leading-[1.5]",
        "shadow-[0_40px_90px_rgba(8,30,22,.35),inset_0_1px_0_rgba(255,255,255,.06)]"
      )
      // The body keeps the first build's 300px at the tablet breakpoint and the 256px floor below it.
      const body = console.querySelector(".grid") as HTMLElement
      expect(body).toHaveClass("min-h-[256px]", "tab:min-h-[300px]", "flex-1")
      expect(classes(console)).not.toContain("shadow-product")
      expect(classes(console)).not.toContain("rounded-lg")
    })

    it("sets every panel's question in the display face", () => {
      mount()
      fireEvent.click(option("sell"))
      expect(screen.getByRole("heading", { level: 2 })).toHaveClass("font-display", "text-d1", "font-normal")
      fireEvent.click(screen.getByRole("button", { name: "Now or within 6 months" }))
      expect(screen.getByRole("heading", { level: 2 })).toHaveClass("font-display")
      fireEvent.click(within(header()).getByRole("button", { name: "Start over" }))
      fireEvent.click(option("offer"))
      expect(screen.getByRole("heading", { level: 2 })).toHaveClass("font-display")
      fireEvent.click(within(header()).getByRole("button", { name: "Start over" }))
      fireEvent.click(option("ready"))
      expect(screen.getByRole("heading", { level: 2 })).toHaveClass("font-display")
    })
  })
})
