// use client: staggers newly lit ticks against the previous render, which takes a ref that survives renders
"use client"

import { usePrevious } from "@/components/site/motion/usePrevious"
import { cn } from "@/lib/site/cn"
import { staggerDelay } from "@/lib/site/motion"

/**
 * Transition delay for the tick at `index` when `filled` moves from `prevFilled`. Ticks that were already lit
 * (`index < prevFilled`) and ticks that stay unlit (`index >= filled`) take no delay; each tick newly lit since
 * the previous render waits one arrival stagger longer than the one before it (60ms, capped at 300). A decrease
 * (Start over) lights nothing new, so every tick answers "0ms" and the ticks go dark together.
 */
function tickDelay(index: number, prevFilled: number, filled: number): string {
  if (index < prevFilled || index >= filled) return "0ms"
  return `${staggerDelay(index - prevFilled)}ms`
}

/**
 * Progress ticks: `filled` in the accent, `current` half-lit, the rest dim. When several ticks light in one
 * render (a run of answers), each newly lit tick starts its colour transition 60ms after the one before it,
 * capped at 300ms, so the fill reads as one drawn motion. The previous `filled` is remembered in a ref that is
 * updated after each render: the first render and any decrease apply no stagger.
 */
export function ProgressTicks({
  total,
  filled,
  current,
  label,
}: {
  total: number
  filled: number
  current?: number
  label?: string
}) {
  // The value of `filled` at the last committed render; equals `filled` on mount so nothing staggers then.
  const prevFilled = usePrevious(filled)

  return (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={filled}
      className="flex gap-[5px]"
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          style={{ transitionDelay: tickDelay(i, prevFilled, filled) }}
          className={cn(
            "ease-e1 rounded-pill h-[2px] w-4 transition-[background-color] duration-500",
            i < filled ? "bg-accent" : i === current ? "bg-accent/45" : "bg-fg/15"
          )}
        />
      ))}
    </span>
  )
}
