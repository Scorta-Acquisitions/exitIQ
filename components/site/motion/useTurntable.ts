import { type RefObject, useEffect, useRef } from "react"
import { prefersReducedMotion } from "@/components/site/motion/reducedMotion"
import { damp, FRAME_MS, pointerUnit, turntableDrift, turntableElapsedFor } from "@/lib/site/motion"

/** Seeks finer than this are not worth a decode. */
const MIN_STEP = 1 / 240

/** One full turn of the object, and how hard the pointer pulls progress toward itself. */
const PERIOD_MS = 14000
const RATE = 0.1

/**
 * Drives a turntable film: while `frameRef` is on screen, a frame loop drifts progress from 0 to 1 and back
 * over `PERIOD_MS` (the object slowly turns on its own), and a pointer over the frame takes the wheel (progress
 * follows the pointer's position across the frame, eased at `RATE`). Calls `seek(progress)` only when the
 * value moved. When the pointer leaves, the drift resumes from where it left the object. Touch pointers are
 * ignored (the drift carries the object) and reduced motion runs nothing, so the poster stands.
 */
export function useTurntable(frameRef: RefObject<HTMLElement | null>, seek: (progress: number) => void) {
  const callback = useRef(seek)
  callback.current = seek

  useEffect(() => {
    const el = frameRef.current
    if (!el || prefersReducedMotion()) return
    const st = { raf: 0, active: false, pointer: null as number | null, cur: 0, sent: -1, t0: 0, lastNow: 0 }

    const frame = (now: number) => {
      st.raf = 0
      if (!st.active) return
      if (!st.t0) st.t0 = now
      const dt = st.lastNow ? now - st.lastNow : FRAME_MS
      st.lastNow = now
      const target = st.pointer ?? turntableDrift(now - st.t0, PERIOD_MS)
      st.cur = damp(st.cur, target, RATE, dt)
      if (Math.abs(st.cur - st.sent) >= MIN_STEP) {
        st.sent = st.cur
        callback.current(st.cur)
      }
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
      threshold: 0.1,
    })
    io.observe(el)

    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return
      st.pointer = pointerUnit(e.clientX, e.clientY, el.getBoundingClientRect()).u
    }
    const leave = () => {
      st.pointer = null
      // Rebase the drift so it continues from where the pointer left the object, rising.
      st.t0 = performance.now() - turntableElapsedFor(st.cur, PERIOD_MS)
    }
    el.addEventListener("pointermove", move)
    el.addEventListener("pointerleave", leave)
    return () => {
      io.disconnect()
      stop()
      el.removeEventListener("pointermove", move)
      el.removeEventListener("pointerleave", leave)
    }
  }, [frameRef])
}
