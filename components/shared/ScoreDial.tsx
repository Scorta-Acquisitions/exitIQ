"use client"

/**
 * Animated score dial — an SVG arc that sweeps 0 → value once per mount.
 *
 * Shared (Execution Plan §2): DealIQ's Screen Score renders it first; the
 * sell-side Scorta Score (DEMO P1.1) inherits it. Accent and band thresholds
 * arrive via props, so neither product's palette or bands leak into the other.
 * `prefers-reduced-motion` renders the final state with no sweep.
 */

import React from "react"

const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

const SWEEP_MS = 900

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function ScoreDial({
  value,
  max = 100,
  size = 152,
  strokeWidth = 10,
  accentColor,
  trackColor = "var(--b2)",
  label,
}: {
  /** Final score, 0..max. */
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  /** CSS color for the arc and the number. */
  accentColor: string
  trackColor?: string
  /** Accessible label, e.g. "Screen score 58 of 100". */
  label: string
}) {
  const clamped = Math.max(0, Math.min(max, value))
  const [display, setDisplay] = React.useState(0)

  // One sweep per mount — not per re-render. The rAF loop drives both the arc
  // and the number so they can never disagree mid-animation.
  React.useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(clamped)
      return
    }
    let raf = 0
    let start: number | undefined
    const step = (ts: number) => {
      if (start === undefined) start = ts
      const t = Math.min(1, (ts - start) / SWEEP_MS)
      setDisplay(clamped * easeOutCubic(t))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // Deliberately mount-only: the dial animates once, not on re-render.
  }, [])

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const share = max === 0 ? 0 : display / max

  return (
    <div role="img" aria-label={label} style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          opacity={0.45}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={accentColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - share)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        <span style={{ fontFamily: mono, fontSize: size * 0.26, fontWeight: 600, color: accentColor, lineHeight: 1 }}>
          {Math.round(display)}
        </span>
        <span style={{ fontFamily: mono, fontSize: size * 0.075, color: "var(--t3)", letterSpacing: ".08em" }}>
          / {max}
        </span>
      </div>
    </div>
  )
}
