import { act, fireEvent, screen, within } from "@testing-library/react"
import type { RefObject } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ADVISOR_ERROR_COPY, ADVISOR_SENT_COPY } from "@/components/site/exitiq/ExitIqActions"
import { ExitIqRun } from "@/components/site/exitiq/ExitIqRun"
import { chipLabel, QUESTION_COUNT, QUESTIONS } from "@/lib/site/exitiq/questions"
import {
  advisorReviewBody,
  EMPTY_STATE_LABEL,
  type ExitIqAnswers,
  planText,
  RECOMMENDATION_DESCRIPTIONS,
  recommendationDescription,
  scoreExitIq,
} from "@/lib/site/exitiq/scoring"
import { padIndex } from "@/lib/site/format"
import { CONTACT } from "@/lib/site/routes"
import { INITIAL_SITE_STATE, type SiteState } from "@/lib/site/state/reducer"
import { setRect } from "./scene-test-utils"
import { renderWithSeededSite, renderWithSite } from "./test-utils"

const realInnerWidth = window.innerWidth

const mocks = vi.hoisted(() => ({
  copyText: vi.fn<(text: string) => Promise<boolean>>(),
  downloadTextFile: vi.fn<(filename: string, text: string) => boolean>(),
  openInNewTab: vi.fn<(url: string) => void>(),
  submitInquiry: vi.fn<(payload: unknown) => Promise<boolean>>(),
  pulse: vi.fn<() => void>(),
  useConsoleField: vi.fn<(ref: RefObject<HTMLCanvasElement | null>, target: number) => () => void>(),
}))

vi.mock("@/lib/site/mailto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/site/mailto")>()
  return {
    ...actual,
    copyText: (t: string) => mocks.copyText(t),
    downloadTextFile: (f: string, t: string) => mocks.downloadTextFile(f, t),
    openInNewTab: (u: string) => mocks.openInNewTab(u),
  }
})
vi.mock("@/lib/site/inquiry", () => ({ submitInquiry: (p: unknown) => mocks.submitInquiry(p) }))
// The WebGL field is a separate unit; here the run only has to wire it: the canvas, the target, the pulse.
vi.mock("@/components/site/exitiq/useConsoleField", () => ({
  useConsoleField: (ref: RefObject<HTMLCanvasElement | null>, target: number) => mocks.useConsoleField(ref, target),
}))

/**
 * A deliberately weak business: every answer contributes a finding, so the result panel has three
 * ranked findings, a five-step plan, and a review body longer than the 700-character booking-notes cap.
 */
const WEAK: Required<ExitIqAnswers> = {
  type: "prof",
  rev: "1-2",
  trend: "down",
  sde: "b",
  books: "diff",
  conc: "d",
  owner: "c",
}
const WEAK_RESULT = scoreExitIq(WEAK)

const ADVANCE_MS = 400

const MONO_CAPTION = ["text-d4", "font-mono", "text-[11.5px]", "tracking-[1.1px]", "uppercase"]
const FILAMENT_BAR = ["bg-filament", "shadow-[0_0_10px_rgba(76,226,126,.6)]"]
const SIGNAL_BAR = ["bg-signal", "shadow-[0_0_10px_rgba(143,224,178,.5)]"]

/** A visitor arriving on /score with a finished run already in the session. */
function doneState(answers: Required<ExitIqAnswers>): SiteState {
  return {
    ...INITIAL_SITE_STATE,
    iq: { phase: QUESTION_COUNT - 1, answers, busy: false, insight: null, done: true, started: true },
  }
}

function questionPanel() {
  return screen.getByRole("group", { name: "exitIQ readiness questions" })
}
function resultPanel() {
  return screen.getByRole("group", { name: "exitIQ recommendation and findings" })
}
function progress() {
  return screen.getByRole("progressbar", { name: "Your progress" })
}
function ticks() {
  return Array.from(progress().children) as HTMLElement[]
}
/** The three parts of one meter: the value beside its label, the lit bar, and the hint under it. */
function meter(label: string) {
  const labelEl = within(resultPanel()).getByText(label)
  const track = labelEl.parentElement!.nextElementSibling as HTMLElement
  return {
    value: labelEl.nextElementSibling as HTMLElement,
    bar: track.firstElementChild as HTMLElement,
    hint: track.nextElementSibling as HTMLElement,
  }
}
function fieldTarget() {
  const calls = mocks.useConsoleField.mock.calls
  return calls[calls.length - 1]![1]
}

/** Click the chip carrying `label` and wait out the "reading your answer" pause. */
async function answer(label: string) {
  fireEvent.click(within(questionPanel()).getByRole("button", { name: label }))
  await act(async () => {
    vi.advanceTimersByTime(ADVANCE_MS)
  })
}

async function answerAll(answers: Required<ExitIqAnswers>) {
  for (const q of QUESTIONS) {
    await answer(chipLabel(q.id, answers[q.id])!)
  }
}

describe("<ExitIqRun />", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mocks.copyText.mockReset().mockResolvedValue(true)
    mocks.downloadTextFile.mockReset().mockReturnValue(true)
    mocks.openInNewTab.mockReset()
    mocks.submitInquiry.mockReset().mockResolvedValue(true)
    mocks.pulse.mockReset()
    mocks.useConsoleField.mockReset().mockReturnValue(mocks.pulse)
  })
  afterEach(() => vi.useRealTimers())

  describe("the instrument card", () => {
    it("renders as the first build's near-black card: 22px radius, dark hairline, deep shadow, and the anchor id", () => {
      renderWithSite(<ExitIqRun />)
      const run = screen.getByTestId("exitiq-run")
      expect(run).toHaveAttribute("id", "exitiq-run")
      expect(run).toHaveClass("rounded-[22px]", "border", "border-dhair", "overflow-hidden", "relative")
      // Anchored like every other section (under the one bar), scoped to the first build's base rules, at its 16px body.
      expect(run).toHaveClass("console-legacy", "anchor-target", "text-[16px]", "leading-[1.5]")
      // The console's shadow, not the first build's 50% black: this card now rests on a light tile.
      expect(run).toHaveClass("shadow-[0_40px_90px_rgba(8,30,22,.35),inset_0_1px_0_rgba(255,255,255,.06)]")
    })

    it("paints the fractal field on a decorative full-bleed canvas beneath the content", () => {
      renderWithSite(<ExitIqRun />)
      const run = screen.getByTestId("exitiq-run")
      const [canvas, content] = Array.from(run.children) as HTMLElement[]
      expect(run.children).toHaveLength(2)
      expect(canvas!.tagName).toBe("CANVAS")
      expect(canvas).toHaveAttribute("aria-hidden", "true")
      expect(canvas!.className).toBe("bg-ground absolute inset-0 block h-full w-full")
      expect(content).toHaveClass("relative")
      expect(content).toContainElement(questionPanel())
      expect(content).toContainElement(resultPanel())
    })

    it("carries the mono uppercase wordmark alone at the left of the header and the progress ticks at its right: no live dot", () => {
      renderWithSite(<ExitIqRun />)
      const label = screen.getByText("exitIQ by Heirloom")
      expect(label).toHaveClass("text-d2", "font-mono", "text-[11.5px]", "tracking-[1px]", "uppercase")
      // The wordmark is the header's first child with nothing before it; the ticks are its only other child.
      expect(label.previousElementSibling).toBeNull()
      const header = label.parentElement!
      expect(header.firstElementChild).toBe(label)
      expect(header.children).toHaveLength(2)
      expect(header.lastElementChild).toBe(progress())
      expect(header.querySelector("[class*='h-[7px]']")).toBeNull()
      expect(header).toHaveClass(
        "border-dhair-2",
        "border-b",
        "flex",
        "items-center",
        "justify-between",
        "px-5",
        "py-3.5"
      )
      expect(header).toContainElement(progress())
      const bar = progress()
      expect(bar).toHaveAttribute("aria-valuemin", "0")
      expect(bar).toHaveAttribute("aria-valuemax", String(QUESTION_COUNT))
      expect(bar).toHaveAttribute("aria-valuenow", "0")
      expect(bar.children).toHaveLength(QUESTION_COUNT)
    })

    it("half-lights the first tick and leaves the rest dim before any answer", () => {
      renderWithSite(<ExitIqRun />)
      const all = ticks()
      expect(all[0]).toHaveClass("bg-filament/45")
      expect(all[0]).not.toHaveClass("bg-filament", "bg-dfull/14")
      for (const tick of all.slice(1)) expect(tick).toHaveClass("bg-dfull/14")
    })

    it("labels the result pane with SCORES and RECOMMENDATION as mono uppercase captions and a mono footnote", () => {
      renderWithSite(<ExitIqRun />)
      const panel = resultPanel()
      expect(panel).toHaveClass("border-dhair-2", "border-l", "relative", "overflow-hidden", "px-7", "py-[30px]")
      expect(within(panel).getByText("Scores")).toHaveClass(...MONO_CAPTION)
      expect(within(panel).getByText("Recommendation")).toHaveClass(...MONO_CAPTION)
      const footnote = within(panel).getByText("Records can change the result in either direction.")
      expect(footnote).toHaveClass("text-d4", "font-mono", "text-[11px]", "leading-[1.6]")
      expect(footnote.parentElement).toHaveClass("border-dhair-2", "border-t", "mt-[18px]", "pt-3.5")
    })

    it("names the three meters with their exact hints and lights financeability and transferability in filament, evidence in signal", () => {
      renderWithSite(<ExitIqRun />)
      const fin = meter("Financeability")
      const tra = meter("Transferability")
      const evi = meter("Evidence quality")
      expect(fin.hint).toHaveTextContent(
        "Could a lender reasonably finance a buyer using the earnings and risks described?"
      )
      expect(tra.hint).toHaveTextContent("Would the business continue to earn when you step away?")
      expect(evi.hint).toHaveTextContent(
        "How much of the current story could a buyer’s accountant verify from records?"
      )
      expect(fin.bar).toHaveClass(...FILAMENT_BAR)
      expect(tra.bar).toHaveClass(...FILAMENT_BAR)
      expect(evi.bar).toHaveClass(...SIGNAL_BAR)
      expect(evi.bar).not.toHaveClass(...FILAMENT_BAR)
      for (const m of [fin, tra, evi]) {
        expect(m.bar).toHaveClass("h-full", "transition-[width]", "duration-1000", "ease-e1")
        expect(m.bar.parentElement).toHaveClass("bg-dfull/10", "h-[3px]", "overflow-hidden", "rounded-full")
        expect(m.value).toHaveClass("tabular", "text-d1", "font-mono", "text-[13px]")
        expect(m.hint).toHaveClass("text-d4", "text-[11.5px]")
      }
    })
  })

  describe("the field", () => {
    it("hands the hook the canvas ref and a target of 0 before any answer, without a pulse", () => {
      renderWithSite(<ExitIqRun />)
      const canvas = screen.getByTestId("exitiq-run").querySelector("canvas")
      expect(mocks.useConsoleField).toHaveBeenCalled()
      const [ref, target] = mocks.useConsoleField.mock.calls.at(-1)!
      expect(ref.current).toBe(canvas)
      expect(target).toBe(0)
      expect(mocks.pulse).not.toHaveBeenCalled()
    })

    it("raises the target to the live composite confidence and pulses once per answer", async () => {
      renderWithSite(<ExitIqRun />)
      await answer("Home or field services")
      const partial = scoreExitIq({ type: "field" })
      expect(partial.conf).toBeCloseTo(0.5068, 4)
      expect(fieldTarget()).toBe(partial.conf)
      expect(mocks.pulse).toHaveBeenCalledTimes(1)
      await answer("Under $1M")
      expect(fieldTarget()).toBe(scoreExitIq({ type: "field", rev: "u1" }).conf)
      expect(mocks.pulse).toHaveBeenCalledTimes(2)
    })

    it("does not pulse when an answer is replaced or the visitor steps back, and not when the run is cleared", async () => {
      renderWithSite(<ExitIqRun />)
      await answer("Home or field services")
      await answer("Under $1M")
      expect(mocks.pulse).toHaveBeenCalledTimes(2)
      fireEvent.click(within(questionPanel()).getByRole("button", { name: "Change my last answer" }))
      expect(mocks.pulse).toHaveBeenCalledTimes(2)
      await answer("$3M to $5M")
      expect(mocks.pulse).toHaveBeenCalledTimes(2)
      expect(fieldTarget()).toBe(scoreExitIq({ type: "field", rev: "3-5" }).conf)
      fireEvent.click(within(questionPanel()).getByRole("button", { name: "Start over" }))
      expect(fieldTarget()).toBe(0)
      expect(mocks.pulse).toHaveBeenCalledTimes(2)
      await answer("Home or field services")
      expect(mocks.pulse).toHaveBeenCalledTimes(3)
    })

    it("settles on the finished confidence after seven answers and seven pulses", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      expect(WEAK_RESULT.conf).toBeCloseTo(0.2014, 4)
      expect(fieldTarget()).toBe(WEAK_RESULT.conf)
      expect(mocks.pulse).toHaveBeenCalledTimes(QUESTION_COUNT)
    })

    it("pulses once when a finished run is restored from the session", () => {
      renderWithSeededSite(<ExitIqRun />, doneState(WEAK))
      expect(fieldTarget()).toBe(WEAK_RESULT.conf)
      expect(mocks.pulse).toHaveBeenCalledTimes(1)
    })
  })

  describe("before any answer", () => {
    it("shows the first question with a 'Question 1 of 7' label and no back or restart controls", () => {
      renderWithSite(<ExitIqRun />)
      const panel = questionPanel()
      expect(panel).toHaveClass("px-7", "py-8")
      expect(within(panel).getByText(`Question 1 of ${QUESTION_COUNT}`)).toBeInTheDocument()
      expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent(QUESTIONS[0]!.q)
      expect(within(panel).queryByRole("button", { name: "Change my last answer" })).toBeNull()
      expect(within(panel).queryByRole("button", { name: "Start over" })).toBeNull()
      expect(screen.queryByTestId("exitiq-done")).toBeNull()
    })

    it("shows the empty recommendation in the serif with dashed meters at zero width and no description or plan", () => {
      renderWithSite(<ExitIqRun />)
      const panel = resultPanel()
      const state = screen.getByTestId("exitiq-state")
      expect(state).toHaveTextContent(EMPTY_STATE_LABEL)
      expect(state).toHaveClass("font-display", "text-d1", "text-[26px]", "leading-[1.2]")
      expect(recommendationDescription(EMPTY_STATE_LABEL)).toBe("")
      for (const description of Object.values(RECOMMENDATION_DESCRIPTIONS)) {
        expect(within(panel).queryByText(description)).toBeNull()
      }
      expect(within(panel).getAllByText("–")).toHaveLength(3)
      for (const label of ["Financeability", "Transferability", "Evidence quality"]) {
        const m = meter(label)
        expect(m.value).toHaveTextContent("–")
        expect(m.bar.style.width).toBe("0%")
      }
      expect(within(panel).queryByText("Your next 90 days")).toBeNull()
      expect(within(panel).queryByRole("button", { name: "Save my plan" })).toBeNull()
      expect(within(panel).queryByRole("button", { name: "Review my result with an advisor" })).toBeNull()
    })
  })

  describe("answering", () => {
    it("advances to question 2 only after the reading pause has elapsed, moving the half-lit tick along", async () => {
      renderWithSite(<ExitIqRun />)
      fireEvent.click(within(questionPanel()).getByRole("button", { name: "Home or field services" }))
      expect(within(questionPanel()).getByText(`Question 1 of ${QUESTION_COUNT}`)).toBeInTheDocument()
      await act(async () => {
        vi.advanceTimersByTime(ADVANCE_MS)
      })
      expect(within(questionPanel()).getByText(`Question 2 of ${QUESTION_COUNT}`)).toBeInTheDocument()
      expect(within(questionPanel()).getByRole("heading", { level: 2 })).toHaveTextContent(QUESTIONS[1]!.q)
      expect(progress()).toHaveAttribute("aria-valuenow", "1")
      const all = ticks()
      expect(all[0]).toHaveClass("bg-filament", "shadow-[0_0_7px_rgba(76,226,126,.55)]")
      expect(all[1]).toHaveClass("bg-filament/45")
      expect(all[2]).toHaveClass("bg-dfull/14")
    })

    it("shows 'Reading your answers...' while the final answer is being processed", async () => {
      renderWithSite(<ExitIqRun />)
      for (const q of QUESTIONS.slice(0, -1)) {
        await answer(chipLabel(q.id, WEAK[q.id])!)
      }
      const last = QUESTIONS[QUESTION_COUNT - 1]!
      fireEvent.click(within(questionPanel()).getByRole("button", { name: chipLabel(last.id, WEAK[last.id])! }))
      const live = within(questionPanel()).getByText("Reading your answers...")
      expect(live).toHaveAttribute("aria-live", "polite")
      expect(screen.queryByTestId("exitiq-done")).toBeNull()
      await act(async () => {
        vi.advanceTimersByTime(ADVANCE_MS)
      })
      expect(screen.getByTestId("exitiq-done")).toBeInTheDocument()
      expect(screen.queryByTestId("exitiq-question")).toBeNull()
    })

    it("updates the meters with the live scores and widths as answers arrive", async () => {
      renderWithSite(<ExitIqRun />)
      await answer("Home or field services")
      const partial = scoreExitIq({ type: "field" })
      expect([partial.fin, partial.tra, partial.evi]).toEqual([50, 52, 50])
      expect(meter("Financeability").value).toHaveTextContent("50")
      expect(meter("Financeability").bar.style.width).toBe("50%")
      expect(meter("Transferability").value).toHaveTextContent("52")
      expect(meter("Transferability").bar.style.width).toBe("52%")
      expect(meter("Evidence quality").value).toHaveTextContent("50")
      expect(meter("Evidence quality").bar.style.width).toBe("50%")
      expect(within(resultPanel()).queryByText("–")).toBeNull()
    })
  })

  describe("changing answers mid-run", () => {
    it("going back keeps the other answers and the progress count", async () => {
      renderWithSite(<ExitIqRun />)
      await answer("Home or field services")
      await answer("Under $1M")
      fireEvent.click(within(questionPanel()).getByRole("button", { name: "Change my last answer" }))
      fireEvent.click(within(questionPanel()).getByRole("button", { name: "Change my last answer" }))
      expect(within(questionPanel()).getByText(`Question 1 of ${QUESTION_COUNT}`)).toBeInTheDocument()
      expect(within(questionPanel()).getByRole("button", { name: "Home or field services" })).toHaveAttribute(
        "aria-pressed",
        "true"
      )
      expect(progress()).toHaveAttribute("aria-valuenow", "2")
      // Both answered ticks stay lit; the current tick is the first, already filled.
      expect(ticks()[0]).toHaveClass("bg-filament")
      expect(ticks()[1]).toHaveClass("bg-filament")
      expect(ticks()[2]).toHaveClass("bg-dfull/14")
      expect(within(questionPanel()).queryByRole("button", { name: "Change my last answer" })).toBeNull()
    })

    it("replacing an earlier answer overwrites it and moves forward again", async () => {
      renderWithSite(<ExitIqRun />)
      await answer("Home or field services")
      await answer("Under $1M")
      fireEvent.click(within(questionPanel()).getByRole("button", { name: "Change my last answer" }))
      await answer("$3M to $5M")
      expect(within(questionPanel()).getByText(`Question 3 of ${QUESTION_COUNT}`)).toBeInTheDocument()
      fireEvent.click(within(questionPanel()).getByRole("button", { name: "Change my last answer" }))
      expect(within(questionPanel()).getByRole("button", { name: "$3M to $5M" })).toHaveAttribute(
        "aria-pressed",
        "true"
      )
      expect(within(questionPanel()).getByRole("button", { name: "Under $1M" })).toHaveAttribute(
        "aria-pressed",
        "false"
      )
    })

    it("'Start over' mid-run clears every answer and returns to the empty result", async () => {
      renderWithSite(<ExitIqRun />)
      await answer("Home or field services")
      await answer("Under $1M")
      fireEvent.click(within(questionPanel()).getByRole("button", { name: "Start over" }))
      expect(within(questionPanel()).getByText(`Question 1 of ${QUESTION_COUNT}`)).toBeInTheDocument()
      expect(within(questionPanel()).getByRole("button", { name: "Home or field services" })).toHaveAttribute(
        "aria-pressed",
        "false"
      )
      expect(screen.getByTestId("exitiq-state")).toHaveTextContent(EMPTY_STATE_LABEL)
      expect(within(resultPanel()).getAllByText("–")).toHaveLength(3)
      expect(meter("Financeability").bar.style.width).toBe("0%")
      expect(progress()).toHaveAttribute("aria-valuenow", "0")
      expect(within(questionPanel()).queryByRole("button", { name: "Start over" })).toBeNull()
    })
  })

  describe("the finished result", () => {
    it("names the exact recommendation and its description for a weak business", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      expect(WEAK_RESULT.state).toBe("More Evidence Needed")
      expect(screen.getByTestId("exitiq-state")).toHaveTextContent("More Evidence Needed")
      const description = within(resultPanel()).getByText(RECOMMENDATION_DESCRIPTIONS["More Evidence Needed"])
      expect(description).toHaveClass("text-d3", "mt-2", "text-[12.5px]", "leading-[1.6]")
      expect(within(questionPanel()).getByText("Your result is ready.")).toHaveAttribute("aria-live", "polite")
      expect(within(questionPanel()).getByText("Your result is ready.")).toHaveClass("text-d4", "font-mono")
    })

    it("replaces the question with the findings pane: eyebrow, serif heading and the booking note", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      const done = screen.getByTestId("exitiq-done")
      expect(screen.queryByTestId("exitiq-question")).toBeNull()
      expect(within(done).getByText("Findings")).toHaveClass("eyebrow", "text-signal", "mb-3.5")
      const heading = within(done).getByRole("heading", { level: 2 })
      expect(heading).toHaveTextContent("What a buyer would question first")
      expect(heading).toHaveClass("font-display", "text-d1", "text-[clamp(25px,3vw,34px)]", "tracking-[-.5px]")
      expect(within(done).getByText("Book a call with Suyash. Your result goes into the booking notes.")).toHaveClass(
        "text-d2",
        "max-w-[520px]"
      )
    })

    it("lists the three highest-weight findings in rank order with their padded numbers", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      const done = screen.getByTestId("exitiq-done")
      const titles = WEAK_RESULT.findings.map((f) => f.t)
      expect(titles).toEqual([
        "Books and tax returns need a closer look",
        "One customer carries most of the revenue",
        "Revenue has declined",
      ])
      const rendered = titles.map((t) => within(done).getByText(t))
      rendered.forEach((el, i) => {
        expect(el.previousSibling).toHaveTextContent(padIndex(i + 1))
        expect(el.previousSibling).toHaveTextContent(`0${i + 1}`)
        expect(el.previousSibling).toHaveClass("text-filament", "font-mono", "text-[11px]")
        expect(el).toHaveClass("text-d1", "font-semibold")
        // The first build's 12px radius, spelled out: the current theme's scale has no xl step.
        expect(el.parentElement!.parentElement).toHaveClass("border-dhair", "rounded-[12px]", "border")
        if (i > 0) expect(rendered[i - 1]!.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      })
      for (const f of WEAK_RESULT.findings) expect(within(done).getByText(f.b)).toHaveClass("text-d2")
    })

    it("shows the five-step 90-day plan in order with the exact scores, widths, and every tick lit", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      const panel = resultPanel()
      expect(within(panel).getByText("Your next 90 days")).toHaveClass(...MONO_CAPTION)
      expect(WEAK_RESULT.plan).toHaveLength(5)
      const items = WEAK_RESULT.plan.map((p) => within(panel).getByText(p))
      items.forEach((el, i) => {
        expect(el.previousSibling).toHaveTextContent(padIndex(i + 1))
        expect(el.previousSibling).toHaveClass("text-filament", "font-mono")
        expect(el.parentElement).toHaveClass("grid", "grid-cols-[26px_1fr]", "border-b", "border-dfull/5")
      })
      expect(meter("Financeability").value).toHaveTextContent("18")
      expect(meter("Financeability").bar.style.width).toBe("18%")
      expect(meter("Transferability").value).toHaveTextContent("13")
      expect(meter("Transferability").bar.style.width).toBe("13%")
      expect(meter("Evidence quality").value).toHaveTextContent("34")
      expect(meter("Evidence quality").bar.style.width).toBe("34%")
      expect(progress()).toHaveAttribute("aria-valuenow", String(QUESTION_COUNT))
      for (const tick of ticks()) {
        expect(tick).toHaveClass("bg-filament")
        expect(tick).not.toHaveClass("bg-filament/45", "bg-dfull/14")
      }
    })

    it("offers the primary review pill as the pale xl cta and the plan's two pills as small dark ones", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      const cta = within(questionPanel()).getByRole("button", { name: "Review my result with an advisor" })
      expect(cta).toHaveAttribute("type", "button")
      expect(cta).toHaveClass("bg-cta", "font-semibold", "text-ground", "h-12", "px-6", "text-[15px]", "rounded-full")
      const save = within(resultPanel()).getByRole("button", { name: "Save my plan" })
      const review = within(resultPanel()).getByRole("button", { name: "Review my result with an advisor" })
      for (const pill of [save, review]) {
        expect(pill).toHaveClass("hover-green-dark", "border", "border-dhair", "font-mono", "h-[38px]", "px-4")
        expect(pill).toHaveClass("text-d1", "text-[11.5px]")
        expect(pill).not.toHaveClass("text-d2", "text-[13.5px]", "bg-cta")
      }
      expect(save.parentElement).toHaveClass("mt-3.5", "flex", "flex-wrap", "gap-2")
    })

    it("'Change answer N' jumps back to that question with the old answer selected", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      fireEvent.click(screen.getByRole("button", { name: "Change answer 5" }))
      expect(screen.queryByTestId("exitiq-done")).toBeNull()
      expect(within(questionPanel()).getByText(`Question 5 of ${QUESTION_COUNT}`)).toBeInTheDocument()
      expect(within(questionPanel()).getByRole("heading", { level: 2 })).toHaveTextContent(QUESTIONS[4]!.q)
      expect(within(questionPanel()).getByRole("button", { name: "Quite different" })).toHaveAttribute(
        "aria-pressed",
        "true"
      )
      expect(within(resultPanel()).queryByText("Your next 90 days")).toBeNull()
      // The result stays scored while a question is reopened: every tick is still filled, the fifth is not half-lit.
      expect(progress()).toHaveAttribute("aria-valuenow", String(QUESTION_COUNT))
      expect(ticks()[4]).toHaveClass("bg-filament")
      expect(ticks()[4]).not.toHaveClass("bg-filament/45")
    })

    it("re-answering the last question after 'Change answer 7' returns straight to an updated result", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      fireEvent.click(screen.getByRole("button", { name: "Change answer 7" }))
      await answer("The business would run normally")
      // An owner-independent business lifts transferability 13 → 43 and financeability 18 → 28; the composite
      // (34.5) stays under the 40 line, so the recommendation holds while the meters and the plan move.
      const updated = scoreExitIq({ ...WEAK, owner: "a" })
      expect([updated.fin, updated.tra, updated.evi]).toEqual([28, 43, 34])
      expect(updated.state).toBe("More Evidence Needed")
      expect(screen.getByTestId("exitiq-done")).toBeInTheDocument()
      expect(screen.getByTestId("exitiq-state")).toHaveTextContent("More Evidence Needed")
      expect(meter("Financeability").value).toHaveTextContent("28")
      expect(meter("Financeability").bar.style.width).toBe("28%")
      expect(meter("Transferability").value).toHaveTextContent("43")
      expect(meter("Transferability").bar.style.width).toBe("43%")
      const panel = resultPanel()
      expect(
        within(panel).queryByText("Give a second leader clear decision-making authority and document the role.")
      ).toBeNull()
      expect(
        within(panel).getByText("Document customer retention and repeat revenue for the last 36 months.")
      ).toBeInTheDocument()
      // Replacing an answer keeps the answered count at seven, so the field does not pulse again.
      expect(mocks.pulse).toHaveBeenCalledTimes(QUESTION_COUNT)
    })

    it("re-answering an earlier question walks forward through the remaining questions before the updated result", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      fireEvent.click(screen.getByRole("button", { name: "Change answer 5" }))
      await answer("They match")
      // Not done yet: the run resumes at question 6 with its earlier answer still selected and all seven ticks lit.
      expect(screen.queryByTestId("exitiq-done")).toBeNull()
      expect(within(questionPanel()).getByText(`Question 6 of ${QUESTION_COUNT}`)).toBeInTheDocument()
      expect(within(questionPanel()).getByRole("button", { name: "More than half" })).toHaveAttribute(
        "aria-pressed",
        "true"
      )
      expect(progress()).toHaveAttribute("aria-valuenow", String(QUESTION_COUNT))
      expect(within(resultPanel()).queryByText("Your next 90 days")).toBeNull()
      // The meters already reflect the new books answer while the run is still open.
      expect(meter("Evidence quality").value).toHaveTextContent("78")
      await answer("More than half")
      await answer("Work would slow down")
      // Matching books lift financeability 18 → 42 and evidence 34 → 78, carrying the composite over the 40 line.
      const updated = scoreExitIq({ ...WEAK, books: "same" })
      expect([updated.fin, updated.tra, updated.evi]).toEqual([42, 13, 78])
      expect(updated.state).toBe("Prepare First")
      expect(screen.getByTestId("exitiq-done")).toBeInTheDocument()
      expect(screen.getByTestId("exitiq-state")).toHaveTextContent("Prepare First")
      expect(within(resultPanel()).getByText(RECOMMENDATION_DESCRIPTIONS["Prepare First"])).toBeInTheDocument()
      expect(within(resultPanel()).queryByText(RECOMMENDATION_DESCRIPTIONS["More Evidence Needed"])).toBeNull()
      expect(meter("Financeability").value).toHaveTextContent("42")
      expect(meter("Financeability").bar.style.width).toBe("42%")
      expect(meter("Evidence quality").bar.style.width).toBe("78%")
      // The books finding (96) drops out; the ranked three are now concentration (94), decline (88), owner (64).
      const done = screen.getByTestId("exitiq-done")
      expect(updated.findings.map((f) => f.t)).toEqual([
        "One customer carries most of the revenue",
        "Revenue has declined",
        "The business slows without you",
      ])
      expect(within(done).queryByText("Books and tax returns need a closer look")).toBeNull()
      updated.findings.forEach((f, i) => {
        expect(within(done).getByText(f.t).previousSibling).toHaveTextContent(padIndex(i + 1))
      })
    })

    it("offers one mono 'Change answer' button per question, numbered", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      const buttons = screen.getAllByRole("button", { name: /^Change answer \d$/ })
      expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual(
        QUESTIONS.map((_, i) => `Change answer ${i + 1}`)
      )
      expect(buttons.map((b) => b.textContent)).toEqual(QUESTIONS.map((_, i) => String(i + 1)))
      for (const b of buttons) {
        expect(b).toHaveAttribute("type", "button")
        expect(b).toHaveClass(
          "hover-green-dark",
          "border-dhair",
          "text-d2",
          "h-8",
          "min-w-[34px]",
          "rounded-[8px]",
          "font-mono"
        )
      }
      expect(buttons[0]!.previousElementSibling).toHaveTextContent("Change an answer:")
      expect(buttons[0]!.previousElementSibling).toHaveClass("text-d4", "font-mono")
    })

    it("'Start over' from the result clears the run back to question 1 and the empty state", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      const restart = within(questionPanel()).getByRole("button", { name: "Start over" })
      expect(restart).toHaveClass("hover-green-dark", "border-dhair", "text-d3", "border-b", "font-mono")
      fireEvent.click(restart)
      expect(screen.queryByTestId("exitiq-done")).toBeNull()
      expect(within(questionPanel()).getByText(`Question 1 of ${QUESTION_COUNT}`)).toBeInTheDocument()
      expect(screen.getByTestId("exitiq-state")).toHaveTextContent(EMPTY_STATE_LABEL)
      expect(progress()).toHaveAttribute("aria-valuenow", "0")
      expect(within(resultPanel()).queryByText("Your next 90 days")).toBeNull()
    })

    it("restores a finished run from the session straight into the result", () => {
      renderWithSeededSite(<ExitIqRun />, doneState(WEAK))
      expect(screen.getByTestId("exitiq-done")).toBeInTheDocument()
      expect(screen.getByTestId("exitiq-state")).toHaveTextContent("More Evidence Needed")
      expect(progress()).toHaveAttribute("aria-valuenow", String(QUESTION_COUNT))
      expect(within(resultPanel()).getByText("Your next 90 days")).toBeInTheDocument()
      expect(meter("Financeability").value).toHaveTextContent("18")
    })
  })

  describe("on a phone, where the panes stack", () => {
    let scrollTo: ReturnType<typeof vi.spyOn>
    beforeEach(() => {
      scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {})
    })
    afterEach(() => {
      scrollTo.mockRestore()
      window.innerWidth = realInnerWidth
    })

    it("scrolls the finished result into view once, 80px under the top of the viewport", async () => {
      window.innerWidth = 800
      renderWithSite(<ExitIqRun />)
      setRect(resultPanel(), { top: 500, height: 400, width: 320 })
      await answerAll(WEAK)
      expect(screen.getByTestId("exitiq-done")).toBeInTheDocument()
      expect(scrollTo).toHaveBeenCalledTimes(1)
      expect(scrollTo).toHaveBeenCalledWith({ top: 500 + window.scrollY - 80, behavior: "smooth" })
      // Later re-renders of the finished state do not scroll again.
      fireEvent.click(screen.getByRole("button", { name: "Save my plan" }))
      await screen.findByText("Your plan was downloaded and copied.")
      expect(scrollTo).toHaveBeenCalledTimes(1)
    })

    it("scrolls again only after the run leaves and re-enters the finished state", async () => {
      window.innerWidth = 800
      renderWithSite(<ExitIqRun />)
      setRect(resultPanel(), { top: 500, height: 400, width: 320 })
      await answerAll(WEAK)
      expect(scrollTo).toHaveBeenCalledTimes(1)
      fireEvent.click(screen.getByRole("button", { name: "Change answer 7" }))
      expect(scrollTo).toHaveBeenCalledTimes(1)
      await answer("The business would run normally")
      expect(screen.getByTestId("exitiq-done")).toBeInTheDocument()
      expect(scrollTo).toHaveBeenCalledTimes(2)
    })

    it("does not scroll when the viewport is 900px or wider, where the result already sits beside the questions", async () => {
      window.innerWidth = 900
      renderWithSite(<ExitIqRun />)
      setRect(resultPanel(), { top: 500, height: 400, width: 320 })
      await answerAll(WEAK)
      expect(screen.getByTestId("exitiq-done")).toBeInTheDocument()
      expect(scrollTo).not.toHaveBeenCalled()
    })

    it("does not scroll before the run is finished, however narrow the viewport", async () => {
      window.innerWidth = 320
      renderWithSite(<ExitIqRun />)
      setRect(resultPanel(), { top: 500, height: 400, width: 320 })
      for (const q of QUESTIONS.slice(0, -1)) await answer(chipLabel(q.id, WEAK[q.id])!)
      expect(scrollTo).not.toHaveBeenCalled()
    })
  })

  describe("Save my plan", () => {
    it("copies and downloads the exact plan text under the fixed filename, then confirms", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      expect(screen.queryByText("Your plan was downloaded and copied.")).toBeNull()
      fireEvent.click(screen.getByRole("button", { name: "Save my plan" }))
      const expected = planText(WEAK_RESULT)
      expect(await screen.findByText("Your plan was downloaded and copied.")).toHaveClass("text-filament")
      expect(mocks.copyText).toHaveBeenCalledTimes(1)
      expect(mocks.copyText).toHaveBeenCalledWith(expected)
      expect(mocks.downloadTextFile).toHaveBeenCalledTimes(1)
      expect(mocks.downloadTextFile).toHaveBeenCalledWith("exitIQ-90-day-plan.txt", expected)
      expect(expected).toContain("Recommendation: More Evidence Needed")
      expect(expected).toContain("1. Books and tax returns need a closer look")
    })

    it("names the download alone when the browser refuses the clipboard", async () => {
      // The reachable failure: copyText resolves false and never rejects. The file is still the save.
      mocks.copyText.mockResolvedValueOnce(false)
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      fireEvent.click(screen.getByRole("button", { name: "Save my plan" }))
      expect(await screen.findByText("Your plan was downloaded.")).toHaveClass("text-filament")
      expect(screen.queryByText("Your plan was downloaded and copied.")).toBeNull()
      expect(mocks.downloadTextFile).toHaveBeenCalledWith("exitIQ-90-day-plan.txt", planText(WEAK_RESULT))
    })

    it("does not open a booking tab or send an inquiry when only saving the plan", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      fireEvent.click(screen.getByRole("button", { name: "Save my plan" }))
      await screen.findByText("Your plan was downloaded and copied.")
      expect(mocks.openInNewTab).not.toHaveBeenCalled()
      expect(mocks.submitInquiry).not.toHaveBeenCalled()
      expect(screen.queryByText(ADVISOR_SENT_COPY)).toBeNull()
    })
  })

  describe("Review my result with an advisor", () => {
    it("copies the review body, beacons an exitiq_review inquiry, and opens the booking page with truncated notes", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      fireEvent.click(within(questionPanel()).getByRole("button", { name: "Review my result with an advisor" }))
      const sent = await screen.findByText(ADVISOR_SENT_COPY)
      expect(sent).toHaveAttribute("aria-live", "polite")
      expect(sent).toHaveClass("text-filament")
      const body = advisorReviewBody(WEAK)
      expect(body.length).toBeGreaterThan(700)
      expect(mocks.copyText).toHaveBeenCalledWith(body)
      expect(mocks.submitInquiry).toHaveBeenCalledTimes(1)
      expect(mocks.submitInquiry).toHaveBeenCalledWith({ kind: "exitiq_review", body, source: "score" })
      expect(mocks.openInNewTab).toHaveBeenCalledTimes(1)
      expect(mocks.openInNewTab).toHaveBeenCalledWith(
        `${CONTACT.advisorCalendar}?notes=${encodeURIComponent(body.slice(0, 700))}`
      )
      expect(screen.queryByText(ADVISOR_ERROR_COPY)).toBeNull()
    })

    it("the result pane's dark pill sends the same review, carrying the recommendation, the three scores, and every answer label", async () => {
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      fireEvent.click(within(resultPanel()).getByRole("button", { name: "Review my result with an advisor" }))
      await screen.findByText(ADVISOR_SENT_COPY)
      expect(mocks.copyText).toHaveBeenCalledTimes(1)
      const body = mocks.copyText.mock.calls[0]![0]
      expect(body).toContain("Recommendation: More Evidence Needed")
      expect(body).toContain("Financeability: 18\nTransferability: 13\nEvidence quality: 34")
      for (const q of QUESTIONS) expect(body).toContain(`- ${q.q} ${chipLabel(q.id, WEAK[q.id])}`)
      expect(body).not.toContain("Skipped")
      expect(mocks.openInNewTab).toHaveBeenCalledTimes(1)
    })

    it("shows the error copy and skips the inquiry and booking tab when the handoff throws", async () => {
      // A throw drives the defensive catch; a refused clipboard resolves false (the recovery test below).
      mocks.copyText.mockRejectedValueOnce(new Error("clipboard denied"))
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      fireEvent.click(within(questionPanel()).getByRole("button", { name: "Review my result with an advisor" }))
      const error = await screen.findByText(ADVISOR_ERROR_COPY)
      expect(error).toHaveAttribute("aria-live", "polite")
      expect(error).toHaveClass("text-signal")
      expect(ADVISOR_ERROR_COPY).toBe("We could not open the booking page. Email suyash@heirloomadvisory.ai directly.")
      expect(screen.queryByText(ADVISOR_SENT_COPY)).toBeNull()
      expect(mocks.submitInquiry).not.toHaveBeenCalled()
      expect(mocks.openInNewTab).not.toHaveBeenCalled()
    })

    it("recovers from a refused clipboard when the next click succeeds", async () => {
      mocks.copyText.mockResolvedValueOnce(false)
      renderWithSite(<ExitIqRun />)
      await answerAll(WEAK)
      const button = within(questionPanel()).getByRole("button", { name: "Review my result with an advisor" })
      fireEvent.click(button)
      await screen.findByText(ADVISOR_ERROR_COPY)
      fireEvent.click(button)
      await screen.findByText(ADVISOR_SENT_COPY)
      expect(screen.queryByText(ADVISOR_ERROR_COPY)).toBeNull()
      expect(mocks.openInNewTab).toHaveBeenCalledTimes(1)
    })
  })
})
