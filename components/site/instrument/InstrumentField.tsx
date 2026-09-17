// use client: the field is a WebGL canvas painted from a requestAnimationFrame loop
"use client"

import { useEffect, useRef } from "react"
import { useInstrumentField } from "@/components/site/instrument/useInstrumentField"
import { cn } from "@/lib/site/cn"

/**
 * The generative layer inside an instrument card: a canvas filling its positioned parent, painted by
 * `useInstrumentField`. `target` (0..1) is the level the field eases toward; a change of `pulseKey`
 * flares it once (mount does not). Decorative only: hidden from assistive technology and inert to the
 * pointer; the hook listens on the positioned parent instead, so the material can lean toward the cursor.
 * `data-target` exposes the current level for tests.
 */
export function InstrumentField({
  target,
  pulseKey,
  className,
  testId,
}: {
  target: number
  pulseKey: number
  className?: string
  testId?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const pulse = useInstrumentField(ref, target)

  const lastPulse = useRef(pulseKey)
  useEffect(() => {
    if (lastPulse.current === pulseKey) return
    lastPulse.current = pulseKey
    pulse()
  }, [pulseKey, pulse])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      data-testid={testId ?? "instrument-field"}
      data-target={target.toFixed(2)}
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  )
}
