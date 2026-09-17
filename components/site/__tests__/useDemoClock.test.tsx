import { act, fireEvent, render, screen } from "@testing-library/react"
import { useRef } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useDemoClock } from "@/components/site/motion/useDemoClock"
import { DEMO_HOLD_MS, type DemoScript } from "@/lib/site/demo/clock"
import {
  installSceneDrivers,
  pinViewport,
  restoreMatchMedia,
  type SceneDrivers,
  setRect,
  stubMatchMedia,
} from "./scene-test-utils"

/** A four-beat script a second long between beats, so the whole play runs 3s and the cycle 11s. */
const SCRIPT: DemoScript = {
  prefix: "fin",
  beats: [
    { id: "arrived", at: 0 },
    { id: "note", at: 1000 },
    { id: "register", at: 2000, say: "The payroll register is attached" },
    { id: "used", at: 3000 },
  ],
  still: "used",
  label: "Financial preparation, a worked example that plays itself",
}

let now = 10_000
let drivers: SceneDrivers

function Harness({ script = SCRIPT }: { script?: DemoScript }) {
  const ref = useRef<HTMLDivElement>(null)
  const { beat, cycle, state, announce, rootProps } = useDemoClock(ref, script)
  return (
    <div>
      <button data-testid="outside">outside</button>
      <div ref={ref} data-testid="demo" {...rootProps}>
        <span data-testid="read">{`${beat} ${cycle} ${state}`}</span>
        <span data-testid="announce">{announce ?? "-"}</span>
        <button data-testid="inside">inside</button>
      </div>
    </div>
  )
}

const root = () => screen.getByTestId("demo")
const reading = () => screen.getByTestId("read").textContent
const said = () => screen.getByTestId("announce").textContent

/** Let `ms` of wall clock pass and run the frame the loop has queued. */
function advance(ms: number) {
  now += ms
  act(() => drivers.flushFrames())
}

/** Put the demo on screen and take the loop's first reading, which costs the clock no time. */
function play() {
  act(() => drivers.intersect(root(), true))
  act(() => drivers.flushFrames())
}

beforeEach(() => {
  drivers = installSceneDrivers()
  now = 10_000
  vi.spyOn(performance, "now").mockImplementation(() => now)
  window.history.replaceState({}, "", "/")
})
afterEach(() => {
  drivers.restore()
  vi.restoreAllMocks()
  restoreMatchMedia()
  pinViewport(768)
  window.history.replaceState({}, "", "/")
})

describe("useDemoClock: the root", () => {
  it("names the demo as one group the keyboard can reach and marks its beat, cycle and state", () => {
    render(<Harness />)
    const el = root()
    expect(el).toHaveAttribute("role", "group")
    expect(el).toHaveAttribute("aria-label", "Financial preparation, a worked example that plays itself")
    expect(el).toHaveAttribute("tabindex", "0")
    expect(el).toHaveAttribute("data-beat", "arrived")
    expect(el).toHaveAttribute("data-cycle", "0")
    expect(el).toHaveAttribute("data-demo-state", "playing")
    expect(said()).toBe("-")
  })

  it("runs no frame until the section is on screen", () => {
    render(<Harness />)
    expect(drivers.pendingFrames()).toBe(0)
    advance(5000)
    expect(reading()).toBe("arrived 0 playing")
  })
})

describe("useDemoClock: the play", () => {
  it("steps through the beats in order, one frame loop, and rests on the last one", () => {
    render(<Harness />)
    play()
    expect(reading()).toBe("arrived 0 playing")
    expect(drivers.pendingFrames()).toBe(1)
    advance(999)
    expect(reading()).toBe("arrived 0 playing")
    advance(1)
    expect(root()).toHaveAttribute("data-beat", "note")
    advance(1000)
    expect(reading()).toBe("register 0 playing")
    advance(1000)
    expect(reading()).toBe("used 0 ended")
    expect(drivers.pendingFrames()).toBe(1)
  })

  it("holds the end state for eight seconds, then replays from the first beat as the next cycle", () => {
    render(<Harness />)
    play()
    advance(3000)
    expect(reading()).toBe("used 0 ended")
    advance(DEMO_HOLD_MS - 1)
    expect(reading()).toBe("used 0 ended")
    advance(1)
    expect(reading()).toBe("arrived 1 playing")
    expect(root()).toHaveAttribute("data-cycle", "1")
    advance(1000)
    expect(reading()).toBe("note 1 playing")
  })

  it("stops when the section leaves the screen and loses no time while it is away", () => {
    render(<Harness />)
    play()
    advance(1000)
    expect(reading()).toBe("note 0 playing")
    act(() => drivers.intersect(root(), false))
    expect(drivers.pendingFrames()).toBe(0)
    advance(9000)
    expect(reading()).toBe("note 0 playing")
    act(() => drivers.intersect(root(), true))
    act(() => drivers.flushFrames())
    advance(1000)
    expect(reading()).toBe("register 0 playing")
  })

  it("runs a panel too tall to reach three tenths of itself once it fills nine tenths of what it can", () => {
    // A 2000px panel in a 400px viewport can never show more than a fifth of itself, so the clock takes
    // 0.18 (nine tenths of that fifth) as on screen and 0.17 as not.
    pinViewport(400)
    render(<Harness />)
    setRect(root(), { top: 0, height: 2000 })
    act(() => drivers.intersect(root(), true, 0.17))
    expect(drivers.pendingFrames()).toBe(0)
    advance(1000)
    expect(reading()).toBe("arrived 0 playing")
    act(() => drivers.intersect(root(), true, 0.19))
    act(() => drivers.flushFrames())
    advance(1000)
    expect(reading()).toBe("note 0 playing")
  })

  it("stops while the tab is hidden and resumes where it stopped when it is shown again", () => {
    render(<Harness />)
    play()
    advance(1000)
    const visibility = vi.spyOn(document, "visibilityState", "get")
    visibility.mockReturnValue("hidden")
    act(() => document.dispatchEvent(new Event("visibilitychange")))
    expect(drivers.pendingFrames()).toBe(0)
    advance(60_000)
    expect(reading()).toBe("note 0 playing")
    visibility.mockReturnValue("visible")
    act(() => document.dispatchEvent(new Event("visibilitychange")))
    act(() => drivers.flushFrames())
    advance(1000)
    expect(reading()).toBe("register 0 playing")
  })
})

describe("useDemoClock: pauses", () => {
  it("pauses under the pointer and resumes from the same beat when it leaves", () => {
    render(<Harness />)
    play()
    advance(1000)
    fireEvent.pointerOver(root())
    expect(root()).toHaveAttribute("data-demo-state", "paused")
    expect(drivers.pendingFrames()).toBe(0)
    advance(30_000)
    expect(reading()).toBe("note 0 paused")
    fireEvent.pointerOut(root(), { relatedTarget: screen.getByTestId("outside") })
    expect(root()).toHaveAttribute("data-demo-state", "playing")
    act(() => drivers.flushFrames())
    advance(1000)
    expect(reading()).toBe("register 0 playing")
  })

  it("pauses while focus is within, keeps the pause as focus moves to its own control, and resumes on the way out", () => {
    render(<Harness />)
    play()
    advance(1000)
    act(() => root().focus())
    expect(reading()).toBe("note 0 paused")
    act(() => screen.getByTestId("inside").focus())
    expect(reading()).toBe("note 0 paused")
    expect(drivers.pendingFrames()).toBe(0)
    act(() => screen.getByTestId("outside").focus())
    expect(root()).toHaveAttribute("data-demo-state", "playing")
    act(() => drivers.flushFrames())
    advance(1000)
    expect(reading()).toBe("register 0 playing")
  })
})

describe("useDemoClock: the keyboard", () => {
  it("steps a beat at a time with the arrows and speaks where it landed", () => {
    render(<Harness />)
    play()
    act(() => root().focus())
    fireEvent.keyDown(root(), { key: "ArrowRight" })
    expect(reading()).toBe("note 0 paused")
    expect(said()).toBe("Step 2 of 4")
    fireEvent.keyDown(root(), { key: "ArrowRight" })
    expect(reading()).toBe("register 0 paused")
    expect(said()).toBe("The payroll register is attached")
    fireEvent.keyDown(root(), { key: "ArrowLeft" })
    expect(reading()).toBe("note 0 paused")
  })

  it("clamps a step at both ends of the script", () => {
    render(<Harness />)
    play()
    act(() => root().focus())
    fireEvent.keyDown(root(), { key: "ArrowLeft" })
    expect(reading()).toBe("arrived 0 paused")
    for (const _ of SCRIPT.beats) fireEvent.keyDown(root(), { key: "ArrowRight" })
    expect(reading()).toBe("used 0 paused")
    expect(said()).toBe("Step 4 of 4")
  })

  it("replays from the first beat on Home and jumps to the still on End, keeping the cycle", () => {
    render(<Harness />)
    play()
    advance(3000 + DEMO_HOLD_MS)
    expect(reading()).toBe("arrived 1 playing")
    act(() => root().focus())
    fireEvent.keyDown(root(), { key: "End" })
    expect(reading()).toBe("used 1 paused")
    expect(said()).toBe("Step 4 of 4")
    fireEvent.keyDown(root(), { key: "Home" })
    expect(reading()).toBe("arrived 1 paused")
    expect(said()).toBe("Step 1 of 4")
  })

  it("leaves every other key to the page, and says nothing without a step", () => {
    render(<Harness />)
    play()
    act(() => root().focus())
    const event = createKeyDown("ArrowDown")
    act(() => {
      root().dispatchEvent(event)
    })
    expect(event.defaultPrevented).toBe(false)
    expect(reading()).toBe("arrived 0 paused")
    expect(said()).toBe("-")
    const stepped = createKeyDown("ArrowRight")
    act(() => {
      root().dispatchEvent(stepped)
    })
    expect(stepped.defaultPrevented).toBe(true)
  })

  it("resumes the play from the beat it was stepped to once focus leaves", () => {
    render(<Harness />)
    play()
    act(() => root().focus())
    fireEvent.keyDown(root(), { key: "ArrowRight" })
    fireEvent.keyDown(root(), { key: "ArrowRight" })
    act(() => screen.getByTestId("outside").focus())
    act(() => drivers.flushFrames())
    advance(1000)
    expect(reading()).toBe("used 0 ended")
  })
})

/** A bubbling, cancelable keydown, so the test can read whether the demo took the key. */
function createKeyDown(key: string): KeyboardEvent {
  return new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })
}

describe("useDemoClock: the still", () => {
  it("renders the still beat with no observer and no frame loop under reduced motion", () => {
    stubMatchMedia(["prefers-reduced-motion"])
    render(<Harness />)
    expect(reading()).toBe("used 0 still")
    expect(root()).toHaveAttribute("data-demo-state", "still")
    expect(drivers.watchers(root())).toBe(0)
    expect(drivers.pendingFrames()).toBe(0)
    advance(30_000)
    expect(reading()).toBe("used 0 still")
  })

  it("still steps with the keyboard when it is frozen", () => {
    stubMatchMedia(["prefers-reduced-motion"])
    render(<Harness />)
    act(() => root().focus())
    fireEvent.keyDown(root(), { key: "ArrowLeft" })
    expect(reading()).toBe("register 0 still")
    expect(said()).toBe("The payroll register is attached")
    fireEvent.keyDown(root(), { key: "Home" })
    expect(reading()).toBe("arrived 0 still")
    expect(drivers.pendingFrames()).toBe(0)
  })

  it("freezes every demo on its still for ?demo=still and this one on a named beat", () => {
    window.history.replaceState({}, "", "/?demo=still")
    const stills = render(<Harness />)
    expect(reading()).toBe("used 0 still")
    stills.unmount()
    window.history.replaceState({}, "", "/?demo=priv:nda,fin:note")
    render(<Harness />)
    expect(reading()).toBe("note 0 still")
    expect(drivers.pendingFrames()).toBe(0)
  })

  it("plays on when the parameter names another demo, and a URL freeze outranks reduced motion", () => {
    window.history.replaceState({}, "", "/?demo=dec:offers")
    const playing = render(<Harness />)
    play()
    advance(1000)
    expect(reading()).toBe("note 0 playing")
    playing.unmount()
    stubMatchMedia(["prefers-reduced-motion"])
    window.history.replaceState({}, "", "/?demo=fin:register")
    render(<Harness />)
    expect(reading()).toBe("register 0 still")
  })
})

describe("useDemoClock: teardown", () => {
  it("cancels its frame and drops its observer on unmount", () => {
    const { unmount } = render(<Harness />)
    play()
    advance(1000)
    const el = root()
    expect(drivers.pendingFrames()).toBe(1)
    expect(drivers.watchers(el)).toBe(1)
    unmount()
    expect(drivers.pendingFrames()).toBe(0)
    expect(drivers.watchers(el)).toBe(0)
  })
})
