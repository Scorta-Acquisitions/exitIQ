"use client"

import { findIndustry } from "@/lib/assessment/industries"
import { fmt, getTeaserRange } from "@/lib/assessment/scoring"
import type { Stage1Answers } from "@/lib/assessment/session"

interface TeaserCardProps {
  s1: Partial<Stage1Answers>
  onUnlock: () => void
}

const PENTAGON_LABELS = ["Financial", "Operational", "Market", "Deal Ready", "Buyer Access"]
const LOCKED_VALUES = [0.45, 0.35, 0.55, 0.30, 0.40]

function LockedPentagon() {
  const cx = 80
  const cy = 80
  const r = 58

  const points = PENTAGON_LABELS.map((_, i) => {
    const angle = (i * 72 - 90) * (Math.PI / 180)
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  })

  const lockedPoints = LOCKED_VALUES.map((v, i) => {
    const angle = (i * 72 - 90) * (Math.PI / 180)
    const rv = r * v
    return { x: cx + rv * Math.cos(angle), y: cy + rv * Math.sin(angle) }
  })

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z"

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={points.map((p) => {
              const dx = (p.x - cx) * scale
              const dy = (p.y - cy) * scale
              return `${(cx + dx).toFixed(1)},${(cy + dy).toFixed(1)}`
            }).join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
        ))}
        {/* Axes */}
        {points.map((p, i) => (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        ))}
        {/* Locked blurred fill */}
        <path d={toPath(lockedPoints)} fill="rgba(132,231,165,0.15)" stroke="rgba(132,231,165,0.3)" strokeWidth="1.5" />
      </svg>
      {/* Lock overlay */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(3px)",
      }}>
        <div style={{ fontSize: "20px" }}>🔒</div>
        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", marginTop: "4px", textAlign: "center", lineHeight: 1.3 }}>
          Unlock after<br />email
        </div>
      </div>
    </div>
  )
}

export function TeaserCard({ s1, onUnlock }: TeaserCardProps) {
  const [low, high] = getTeaserRange(s1)
  const industry = findIndustry(s1.industry ?? "other")
  const multipleRange = `${industry.sdeMultiple[0]}–${industry.sdeMultiple[1]}x`

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }} className="animate-fade-in">
      {/* Teaser header */}
      <div style={{
        background: "#f0faf5",
        border: "1.5px solid #02492a",
        borderBottom: "none",
        borderRadius: "14px 14px 0 0",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}>
        <div style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: "#02492a", animation: "pulseAnim 2s infinite",
        }} />
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#02492a", letterSpacing: "0.3px" }}>
          Preliminary Estimate
        </span>
      </div>

      {/* Main content */}
      <div style={{
        background: "#02492a",
        borderRadius: "0 0 14px 14px",
        border: "1.5px solid #02492a",
        borderTop: "none",
        padding: "20px",
        display: "flex",
        gap: "20px",
        alignItems: "center",
      }}>
        {/* Left: numbers */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>
            Estimated Range
          </div>
          <div style={{
            fontSize: "22px", fontWeight: 700, color: "#84e7a5",
            fontFamily: "var(--font-space-mono, monospace)", marginBottom: "4px", letterSpacing: "-0.5px",
          }}>
            {fmt(low)} – {fmt(high)}
          </div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginBottom: "14px" }}>
            Range widens after full assessment
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{
              background: "rgba(132,231,165,0.12)", border: "1px solid rgba(132,231,165,0.25)",
              borderRadius: "1584px", padding: "4px 10px",
              fontSize: "11px", fontWeight: 600, color: "#84e7a5",
            }}>
              {industry.label.split("(")[0]!.trim()}: {multipleRange} SDE
            </div>
          </div>
          <button
            onClick={onUnlock}
            style={{
              marginTop: "14px",
              background: "#84e7a5",
              color: "#02492a",
              border: "none",
              borderRadius: "1584px",
              padding: "10px 20px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 150ms ease",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "rotateZ(-3deg) translateY(-2px)"
              e.currentTarget.style.boxShadow = "rgb(0,0,0) -4px 4px"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = ""
              e.currentTarget.style.boxShadow = ""
            }}
          >
            <span>Get Full Report</span>
            <span>→</span>
          </button>
        </div>

        {/* Right: locked pentagon */}
        <LockedPentagon />
      </div>

      <div style={{ fontSize: "10px", color: "#9f9b93", textAlign: "center", marginTop: "8px" }}>
        Unlock your full Exit IQ Report — free, no broker calls
      </div>
    </div>
  )
}
