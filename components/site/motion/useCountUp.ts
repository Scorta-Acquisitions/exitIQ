import { type RefObject, useEffect } from "react"
import { prefersReducedMotion } from "@/components/site/motion/reducedMotion"
import { belowFold, countAt } from "@/lib/site/motion"

/** How long the count runs: the one duration every figure on the site counts over. */
const COUNT_UP_MS = 700

/**
 * Counts the element's text from zero to `target` once, the first time it scrolls into view, over
 * `COUNT_UP_MS` (a DOM write per frame, never React state). The server markup carries the final value, so
 * nothing depends on JavaScript; an element already on screen at mount, or a visitor who prefers reduced
 * motion, simply keeps it.
 */
export function useCountUp(
  ref: RefObject<HTMLElement | null>,
  target: number,
  { format }: { format: (n: number) => string }
) {
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    if (!belowFold(el.getBoundingClientRect().top, window.innerHeight || 0)) return
    let raf = 0
    let start = 0
    const frame = (now: number) => {
      if (!start) start = now
      const p = Math.min(1, (now - start) / COUNT_UP_MS)
      el.textContent = format(countAt(p, target))
      if (p < 1) raf = requestAnimationFrame(frame)
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        el.textContent = format(0)
        raf = requestAnimationFrame(frame)
      },
      { threshold: 0.5 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [ref, target, format])
}
