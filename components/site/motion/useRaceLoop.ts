import { type RefObject, useEffect, useRef } from "react"
import { prefersReducedMotion } from "@/components/site/motion/reducedMotion"
import { RACE, RACE_FINAL, type RaceFrame, raceFrame } from "@/lib/site/motion"

/**
 * Runs the speed race while `ref` is on screen: every frame calls `onFrame(raceFrame(elapsed))`, where the
 * clock only advances while the loop runs, so a visitor who scrolls away and back sees the race resume
 * where it paused. Under reduced motion the loop never starts and `onFrame(RACE_FINAL)` is called once.
 */
export function useRaceLoop(ref: RefObject<HTMLElement | null>, onFrame: (frame: RaceFrame) => void) {
  const callback = useRef(onFrame)
  callback.current = onFrame

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) {
      callback.current(RACE_FINAL)
      return
    }
    const st = { raf: 0, active: false, elapsed: 0, lastNow: 0 }
    const frame = (now: number) => {
      st.raf = 0
      if (!st.active) return
      if (st.lastNow) st.elapsed += now - st.lastNow
      st.lastNow = now
      callback.current(raceFrame(st.elapsed, RACE))
      st.raf = requestAnimationFrame(frame)
    }
    const start = () => {
      if (st.active) return
      st.active = true
      st.lastNow = 0
      if (!st.raf) st.raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      st.active = false
      cancelAnimationFrame(st.raf)
      st.raf = 0
    }
    const io = new IntersectionObserver((entries) => (entries.some((e) => e.isIntersecting) ? start() : stop()), {
      threshold: 0.2,
    })
    io.observe(el)
    return () => {
      io.disconnect()
      stop()
    }
  }, [ref])
}
