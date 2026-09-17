import { type FocusEvent, type KeyboardEvent, type RefObject, useCallback, useEffect, useRef, useState } from "react"
import { prefersReducedMotion } from "@/components/site/motion/reducedMotion"
import {
  beatAnnouncement,
  DEMO_VISIBLE_RATIO,
  type DemoFrame,
  demoFrameAt,
  type DemoScript,
  demoStillFor,
  demoVisible,
  elapsedForIndex,
  indexOfBeat,
  sameDemoFrame,
  stepIndex,
} from "@/lib/site/demo/clock"

/**
 * What the demo is doing, written to `data-demo-state` so a test can read it without a timer: playing its
 * beats, paused under the pointer or the keyboard, resting on its end state, or frozen as a still.
 */
type DemoState = "playing" | "paused" | "ended" | "still"

/** Everything the demo's root element needs: the group's name, its deterministic marks, and its handlers. */
interface DemoRootProps {
  tabIndex: 0
  role: "group"
  "aria-label": string
  "data-beat": string
  "data-demo-state": DemoState
  "data-cycle": number
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  onPointerEnter: () => void
  onPointerLeave: () => void
  onFocus: () => void
  onBlur: (event: FocusEvent<HTMLElement>) => void
}

interface DemoClock {
  beat: string
  /** Plays finished before this one: 0 through the first play, 1 after the first replay. */
  cycle: number
  state: DemoState
  /** The beat to speak, set only by a keyboard step; the section renders it in a polite live region. */
  announce: string | null
  rootProps: DemoRootProps
}

/** The imperative face of the running clock, rebuilt by the effect and called by the root's handlers. */
interface DemoControls {
  hover: (inside: boolean) => void
  focus: (within: boolean) => void
  step: (delta: number) => void
  restart: () => void
  end: () => void
}

/**
 * Plays a demo script: one requestAnimationFrame per section, React state only when the beat, the cycle or
 * the state word changes.
 *
 * The clock advances only while at least `DEMO_VISIBLE_RATIO` of `ref` is on screen, the tab is visible and
 * nothing holds it. The pointer inside or focus within holds it (leaving resumes from where it stopped, with
 * no timer); the arrow keys step a beat at a time, Home replays from the first beat and End jumps to the
 * still. A play does not stop at the last beat: the demo rests there (`"ended"`, the section's idle band
 * walking) for `DEMO_HOLD_MS`, then replays from the first beat with the cycle one higher, so a visitor who
 * arrives late still sees the whole thing. Reduced motion, or a `?demo=` parameter naming this demo, freezes
 * it: no observer, no frame loop, `state="still"` on the named beat, and the keys still step.
 */
export function useDemoClock(ref: RefObject<HTMLElement | null>, script: DemoScript): DemoClock {
  // The server and the first client render agree on the first beat; the effect applies a still or the clock.
  const [frame, setFrame] = useState<DemoFrame>(() => demoFrameAt(0, script))
  const [state, setState] = useState<DemoState>("playing")
  const [announce, setAnnounce] = useState<string | null>(null)
  const controls = useRef<DemoControls | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // A URL freeze wins over reduced motion, so a screenshot can name any beat of a still demo.
    const forced = demoStillFor(window.location.search, script) ?? (prefersReducedMotion() ? script.still : null)
    const clock = {
      raf: 0,
      elapsed: forced ? elapsedForIndex(Math.max(0, indexOfBeat(forced, script)), script) : 0,
      lastNow: 0,
      onScreen: false,
      hovered: false,
      focused: false,
      hidden: document.visibilityState === "hidden",
    }
    // The render's own values, so the first `emit` publishes a still (or a resumed play) and nothing else.
    let live = demoFrameAt(0, script)
    let word: DemoState = "playing"

    const held = () => clock.hovered || clock.focused
    const running = () => !forced && clock.onScreen && !clock.hidden && !held()

    /** Publish the frame the clock stands on, and the word for what the demo is doing. */
    const emit = () => {
      const next = demoFrameAt(clock.elapsed, script)
      const nextWord: DemoState = forced ? "still" : held() ? "paused" : next.ended ? "ended" : "playing"
      if (!sameDemoFrame(next, live)) {
        live = next
        setFrame(next)
      }
      if (nextWord !== word) {
        word = nextWord
        setState(nextWord)
      }
    }

    const tick = (now: number) => {
      clock.raf = 0
      if (!running()) return
      // The first frame after a start only takes the clock's reading: a pause costs the demo no time.
      if (clock.lastNow) clock.elapsed += now - clock.lastNow
      clock.lastNow = now
      emit()
      clock.raf = requestAnimationFrame(tick)
    }

    const stop = () => {
      if (clock.raf) cancelAnimationFrame(clock.raf)
      clock.raf = 0
      clock.lastNow = 0
    }

    const sync = () => {
      if (running()) {
        if (!clock.raf) clock.raf = requestAnimationFrame(tick)
      } else {
        stop()
      }
      emit()
    }

    /** Stand the clock on a beat of the play it is in, and say where it landed. */
    const stepTo = (index: number) => {
      const at = demoFrameAt(clock.elapsed, script)
      clock.elapsed = elapsedForIndex(index, script, at.cycle)
      setAnnounce(beatAnnouncement(index, script))
      sync()
    }

    /** Move `delta` beats, clamped to the script so a step never falls off either end. */
    const step = (delta: number) => stepTo(stepIndex(demoFrameAt(clock.elapsed, script).index, delta, script))

    controls.current = {
      hover: (inside) => {
        clock.hovered = inside
        sync()
      },
      focus: (within) => {
        clock.focused = within
        sync()
      },
      step,
      // Home replays from the first beat of the play the demo is in, so the cycle count never runs backwards.
      restart: () => stepTo(0),
      end: () => stepTo(Math.max(0, indexOfBeat(script.still, script))),
    }

    const onVisibility = () => {
      clock.hidden = document.visibilityState === "hidden"
      sync()
    }

    if (forced) {
      sync()
      return () => {
        stop()
        controls.current = null
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        // The observer watches this one element, so the newest entry is always its own latest report.
        const entry = entries.at(-1)
        if (entry) {
          clock.onScreen = demoVisible(entry.intersectionRatio, el.getBoundingClientRect().height, window.innerHeight)
        }
        sync()
      },
      { threshold: [0, DEMO_VISIBLE_RATIO] }
    )
    io.observe(el)
    document.addEventListener("visibilitychange", onVisibility)
    sync()
    return () => {
      io.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      stop()
      controls.current = null
    }
  }, [ref, script])

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    const api = controls.current
    if (!api) return
    if (event.key === "ArrowRight") api.step(1)
    else if (event.key === "ArrowLeft") api.step(-1)
    else if (event.key === "Home") api.restart()
    else if (event.key === "End") api.end()
    else return
    // The demo owns these keys while it has focus, so the page never scrolls under a step.
    event.preventDefault()
  }, [])

  const onPointerEnter = useCallback(() => controls.current?.hover(true), [])
  const onPointerLeave = useCallback(() => controls.current?.hover(false), [])
  const onFocus = useCallback(() => controls.current?.focus(true), [])
  const onBlur = useCallback((event: FocusEvent<HTMLElement>) => {
    // Focus moving between the demo's own controls is not focus leaving it.
    if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget)) return
    controls.current?.focus(false)
  }, [])

  return {
    beat: frame.beat,
    cycle: frame.cycle,
    state,
    announce,
    rootProps: {
      tabIndex: 0,
      role: "group",
      "aria-label": script.label,
      "data-beat": frame.beat,
      "data-demo-state": state,
      "data-cycle": frame.cycle,
      onKeyDown,
      onPointerEnter,
      onPointerLeave,
      onFocus,
      onBlur,
    },
  }
}
