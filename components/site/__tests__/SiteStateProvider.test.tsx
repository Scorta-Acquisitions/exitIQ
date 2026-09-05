import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { SiteStateProvider, useAdvisor, useSiteState } from "@/components/site/providers/SiteStateProvider"
import { INITIAL_SITE_STATE, persistableState, type SiteAction, type SiteState } from "@/lib/site/state/reducer"

const STORAGE_KEY = "heirloom.site.v1"

const nav = vi.hoisted(() => ({ pathname: "/" }))
vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}))

/** Exposes the provider's state as text and offers buttons that dispatch fixed actions. */
function Probe({ actions = {} }: { actions?: Record<string, SiteAction> }) {
  const { state, dispatch } = useSiteState()
  const { advisor, openAdvisor, closeAdvisor } = useAdvisor()
  return (
    <div>
      <output data-testid="iq">{JSON.stringify(state.iq)}</output>
      <output data-testid="funnel">{JSON.stringify(state.funnel)}</output>
      <output data-testid="advisor">{JSON.stringify(advisor)}</output>
      <button type="button" onClick={openAdvisor}>
        open advisor
      </button>
      <button type="button" onClick={closeAdvisor}>
        close advisor
      </button>
      {Object.entries(actions).map(([label, action]) => (
        <button key={label} type="button" onClick={() => dispatch(action)}>
          {label}
        </button>
      ))}
    </div>
  )
}

function readIq() {
  return JSON.parse(screen.getByTestId("iq").textContent ?? "null") as SiteState["iq"]
}
function readFunnel() {
  return JSON.parse(screen.getByTestId("funnel").textContent ?? "null") as SiteState["funnel"]
}
function readAdvisor() {
  return JSON.parse(screen.getByTestId("advisor").textContent ?? "null") as SiteState["advisor"]
}
function readStored(): unknown {
  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  return raw === null ? null : JSON.parse(raw)
}

function renderProvider(ui = <Probe />) {
  return render(<SiteStateProvider>{ui}</SiteStateProvider>)
}

const SAVED: SiteState = {
  iq: {
    phase: 3,
    answers: { type: "recurring", rev: "3-5", trend: "up" },
    busy: false,
    insight: null,
    done: false,
    started: true,
  },
  funnel: { stage: "ready", path: "ready", tick: 5, boot: true, sellTiming: null, sellRevenue: null },
  advisor: { ...INITIAL_SITE_STATE.advisor, answers: { care: "team" }, note: "Call after 3pm" },
}

describe("<SiteStateProvider />", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    nav.pathname = "/"
    window.sessionStorage.clear()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe("hydration", () => {
    it("starts from the initial state when nothing is stored", () => {
      renderProvider()
      expect(readIq()).toEqual(INITIAL_SITE_STATE.iq)
      expect(readFunnel()).toEqual(INITIAL_SITE_STATE.funnel)
      expect(readAdvisor()).toEqual(INITIAL_SITE_STATE.advisor)
    })

    it("restores answers, phase, funnel, and advisor note from the heirloom.site.v1 key", () => {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persistableState(SAVED)))
      renderProvider()
      expect(readIq()).toEqual(SAVED.iq)
      expect(readFunnel()).toEqual(SAVED.funnel)
      expect(readAdvisor()).toEqual({ ...SAVED.advisor, open: false, busy: false })
    })

    it("ignores state stored under a different key", () => {
      window.sessionStorage.setItem("heirloom.site.v0", JSON.stringify(persistableState(SAVED)))
      renderProvider()
      expect(readIq()).toEqual(INITIAL_SITE_STATE.iq)
    })

    it("does not restore an in-flight busy flag or an open dialog from storage", () => {
      const raw = {
        iq: { ...SAVED.iq, busy: true },
        funnel: SAVED.funnel,
        advisor: { ...SAVED.advisor, open: true, busy: true },
      }
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(raw))
      renderProvider()
      expect(readIq().busy).toBe(false)
      expect(readIq().answers).toEqual(SAVED.iq.answers)
      expect(readAdvisor().open).toBe(false)
      expect(readAdvisor().busy).toBe(false)
    })

    it("ignores corrupt JSON in storage without throwing and overwrites it with a valid record", () => {
      window.sessionStorage.setItem(STORAGE_KEY, "{not json")
      expect(() => renderProvider()).not.toThrow()
      expect(readIq()).toEqual(INITIAL_SITE_STATE.iq)
      expect(readStored()).toEqual(persistableState(INITIAL_SITE_STATE))
    })

    it.each([
      ["a JSON string", JSON.stringify("hello")],
      ["a JSON number", "42"],
      ["JSON null", "null"],
      ["an empty string", ""],
    ])("ignores %s in storage", (_label, raw) => {
      window.sessionStorage.setItem(STORAGE_KEY, raw)
      expect(() => renderProvider()).not.toThrow()
      expect(readIq()).toEqual(INITIAL_SITE_STATE.iq)
      expect(readFunnel()).toEqual(INITIAL_SITE_STATE.funnel)
    })

    it("keeps working when sessionStorage itself throws on access", () => {
      const original = Object.getOwnPropertyDescriptor(window, "sessionStorage")
      Object.defineProperty(window, "sessionStorage", {
        configurable: true,
        get() {
          throw new Error("SecurityError: storage is disabled")
        },
      })
      try {
        expect(() =>
          renderProvider(<Probe actions={{ answer: { type: "iq/answer", value: "field" } }} />)
        ).not.toThrow()
        expect(readIq()).toEqual(INITIAL_SITE_STATE.iq)
        fireEvent.click(screen.getByRole("button", { name: "answer" }))
        expect(readIq().answers).toEqual({ type: "field" })
      } finally {
        if (original) Object.defineProperty(window, "sessionStorage", original)
      }
    })
  })

  describe("persistence", () => {
    it("writes the persistable slice to storage on mount", () => {
      renderProvider()
      expect(readStored()).toEqual(persistableState(INITIAL_SITE_STATE))
    })

    it("saves every exitIQ answer to storage with the busy flag cleared", () => {
      renderProvider(<Probe actions={{ answer: { type: "iq/answer", value: "dist" } }} />)
      fireEvent.click(screen.getByRole("button", { name: "answer" }))
      expect(readIq().busy).toBe(true)
      const stored = readStored() as SiteState
      expect(Object.keys(stored).sort()).toEqual(["advisor", "funnel", "iq"])
      expect(stored.iq.answers).toEqual({ type: "dist" })
      expect(stored.iq.busy).toBe(false)
      expect(stored.iq.started).toBe(true)
      expect(stored.iq.insight).toBe(
        "Inventory, working capital, suppliers, and equipment can become material deal terms."
      )
      expect(stored.funnel.tick).toBe(1)
    })

    it("persists a stage change and its remembered timing", () => {
      renderProvider(<Probe actions={{ stage: { type: "funnel/stage", stage: "sellQ2", sellTiming: "mid" } }} />)
      fireEvent.click(screen.getByRole("button", { name: "stage" }))
      const stored = readStored() as SiteState
      expect(stored.funnel.stage).toBe("sellQ2")
      expect(stored.funnel.path).toBe("sell")
      expect(stored.funnel.sellTiming).toBe("mid")
    })

    it("round-trips: a second provider mounted later sees the first one's answers", () => {
      const first = renderProvider(<Probe actions={{ answer: { type: "iq/answer", value: "prof" } }} />)
      fireEvent.click(screen.getByRole("button", { name: "answer" }))
      first.unmount()
      renderProvider()
      expect(readIq().answers).toEqual({ type: "prof" })
      expect(readIq().busy).toBe(false)
    })
  })

  describe("timers", () => {
    it("advances an answered exitIQ question after 380 ms and not before", () => {
      renderProvider(<Probe actions={{ answer: { type: "iq/answer", value: "field" } }} />)
      fireEvent.click(screen.getByRole("button", { name: "answer" }))
      act(() => {
        vi.advanceTimersByTime(379)
      })
      expect(readIq().phase).toBe(0)
      expect(readIq().busy).toBe(true)
      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(readIq().phase).toBe(1)
      expect(readIq().busy).toBe(false)
    })

    it("advances an answered advisor question after 480 ms and not before", () => {
      renderProvider(<Probe actions={{ answer: { type: "advisor/answer", id: "topic", value: "sell" } }} />)
      fireEvent.click(screen.getByRole("button", { name: "open advisor" }))
      fireEvent.click(screen.getByRole("button", { name: "answer" }))
      act(() => {
        vi.advanceTimersByTime(479)
      })
      expect(readAdvisor().step).toBe(0)
      expect(readAdvisor().busy).toBe(true)
      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(readAdvisor().step).toBe(1)
      expect(readAdvisor().busy).toBe(false)
    })

    it("ends the hero boot animation 400 ms after mount", () => {
      renderProvider()
      act(() => {
        vi.advanceTimersByTime(399)
      })
      expect(readFunnel().boot).toBe(true)
      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(readFunnel().boot).toBe(false)
    })
  })

  describe("hooks outside the provider", () => {
    it("useSiteState throws a clear error", () => {
      vi.spyOn(console, "error").mockImplementation(() => {})
      function Bare() {
        useSiteState()
        return null
      }
      expect(() => render(<Bare />)).toThrow("useSiteState must be used inside <SiteStateProvider>")
    })

    it("useAdvisor throws the same error", () => {
      vi.spyOn(console, "error").mockImplementation(() => {})
      function Bare() {
        useAdvisor()
        return null
      }
      expect(() => render(<Bare />)).toThrow("useSiteState must be used inside <SiteStateProvider>")
    })
  })

  describe("useAdvisor().openAdvisor", () => {
    it("on /score with exitIQ answers prefills the topic as 'Value and timing' plus the business type and revenue", () => {
      nav.pathname = "/score"
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persistableState(SAVED)))
      renderProvider()
      fireEvent.click(screen.getByRole("button", { name: "open advisor" }))
      const a = readAdvisor()
      expect(a.open).toBe(true)
      expect(a.answers).toEqual({ topic: "value", type: "recurring", rev: "3-5", care: "team" })
      expect(a.labels).toEqual({ topic: "Value and timing", type: "Recurring commercial services", rev: "$3M to $5M" })
      expect(a.prefilled).toEqual({ topic: true, type: true, rev: true })
      expect(a.step).toBe(3)
      expect(a.ack).toBe("Your earlier answers carried over. One question left before booking.")
    })

    it("on the home page with the same answers does not prefill a topic", () => {
      nav.pathname = "/"
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(persistableState({ ...SAVED, funnel: INITIAL_SITE_STATE.funnel }))
      )
      renderProvider()
      fireEvent.click(screen.getByRole("button", { name: "open advisor" }))
      const a = readAdvisor()
      expect(a.answers.topic).toBeUndefined()
      expect(a.answers.type).toBe("recurring")
      expect(a.step).toBe(0)
    })

    it("on /score with no answers yet does not prefill a topic", () => {
      nav.pathname = "/score"
      renderProvider()
      fireEvent.click(screen.getByRole("button", { name: "open advisor" }))
      const a = readAdvisor()
      expect(a.open).toBe(true)
      expect(a.answers).toEqual({})
      expect(a.step).toBe(0)
      expect(a.ack).toBeNull()
    })

    it("prefills the topic from the hero funnel when the visitor chose the offer path", () => {
      renderProvider(<Probe actions={{ offer: { type: "funnel/stage", stage: "offer" } }} />)
      fireEvent.click(screen.getByRole("button", { name: "offer" }))
      fireEvent.click(screen.getByRole("button", { name: "open advisor" }))
      expect(readAdvisor().answers).toEqual({ topic: "offer" })
      expect(readAdvisor().labels.topic).toBe("An offer or buyer I already have")
    })

    it("closeAdvisor closes the dialog and keeps the prefilled answers", () => {
      renderProvider(<Probe actions={{ offer: { type: "funnel/stage", stage: "offer" } }} />)
      fireEvent.click(screen.getByRole("button", { name: "offer" }))
      fireEvent.click(screen.getByRole("button", { name: "open advisor" }))
      fireEvent.click(screen.getByRole("button", { name: "close advisor" }))
      expect(readAdvisor().open).toBe(false)
      expect(readAdvisor().answers).toEqual({ topic: "offer" })
    })
  })
})
