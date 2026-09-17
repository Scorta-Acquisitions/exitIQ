import { type RefObject, useEffect, useState } from "react"
import { prefersReducedMotion } from "@/components/site/motion/reducedMotion"

/**
 * The beat an instrument keeps while the visitor rests: a counter that advances every `ms` while `ref` is
 * on screen and the tab is visible, and stops otherwise. Never runs under reduced motion or when disabled.
 */
export function useIdleTick(ref: RefObject<HTMLElement | null>, ms: number, enabled = true): number {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled || ms <= 0 || prefersReducedMotion()) return
    let timer = 0
    let onScreen = false
    const start = () => {
      if (timer || !onScreen || document.visibilityState === "hidden") return
      timer = window.setInterval(() => setTick((t) => t + 1), ms)
    }
    const stop = () => {
      window.clearInterval(timer)
      timer = 0
    }
    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((e) => e.isIntersecting)
        if (onScreen) start()
        else stop()
      },
      { threshold: 0.2 }
    )
    io.observe(el)
    const onVisibility = () => (document.visibilityState === "hidden" ? stop() : start())
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      io.disconnect()
      stop()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [ref, ms, enabled])
  return tick
}
