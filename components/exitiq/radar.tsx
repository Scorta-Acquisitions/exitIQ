"use client"

import React from "react"
import { RADAR_AXES } from "@/lib/exitiq/data"

// Shared 7-axis radar chart used by both the pre-gate preview teaser and the
// post-gate report hero. `scores` are normalized to 0–1.
export function RadarChart({
  scores,
  blurred = false,
  labels = RADAR_AXES,
  size = 200,
  axisLabelRadius = 1.26,
  axisLabelFontSize = 7.5,
  centerContent,
  activeAxis = null,
  onAxisHover,
  onAxisClick,
}: {
  scores: number[]
  blurred?: boolean
  labels?: string[]
  size?: number
  axisLabelRadius?: number
  axisLabelFontSize?: number
  centerContent?: React.ReactNode
  activeAxis?: number | null
  onAxisHover?: (i: number | null) => void
  onAxisClick?: (i: number) => void
}) {
  const [drawn, setDrawn] = React.useState(false)
  const [polyVisible, setPolyVisible] = React.useState(false)
  const W = size
  const CX = size / 2
  const CY = size / 2
  const R = size * 0.35
  const N = labels.length

  React.useEffect(() => {
    const t1 = setTimeout(() => setDrawn(true), 300)
    const t2 = setTimeout(() => setPolyVisible(true), 1100)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  const angleOf = (i: number) => (Math.PI * 2 * i) / N - Math.PI / 2
  const pointFor = (score: number, i: number): [number, number] => {
    const a = angleOf(i)
    const r = R * Math.max(score, 0.05)
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)]
  }

  const polyPoints = scores.map((s, i) => pointFor(s, i).join(",")).join(" ")
  const axisLines = labels.map((_, i) => {
    const [x, y] = pointFor(1, i)
    return { x, y, delay: i * 110 }
  })
  const estimatedCount = scores.filter((s) => s > 0).length
  const interactive = !!(onAxisHover || onAxisClick)

  return (
    <div style={{ position: "relative", width: W, height: W, flexShrink: 0 }}>
      <svg width={W} height={W} viewBox={`0 0 ${W} ${W}`}>
        {[0.25, 0.5, 0.75, 1].map((r, i) => (
          <polygon
            key={i}
            points={Array.from({ length: N }, (_, j) => pointFor(r, j).join(",")).join(" ")}
            fill="none"
            stroke="var(--div)"
            strokeWidth={1}
          />
        ))}
        {axisLines.map(({ x, y, delay }, i) => (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={x}
            y2={y}
            stroke="var(--b3)"
            strokeWidth={1}
            style={{
              strokeDasharray: R,
              strokeDashoffset: drawn ? 0 : R,
              transition: `stroke-dashoffset .55s ${delay}ms ease`,
            }}
          />
        ))}
        {polyVisible && (
          <polygon
            points={polyPoints}
            fill="rgba(167,229,211,.1)"
            stroke="rgba(167,229,211,.55)"
            strokeWidth={1.5}
            style={{
              filter: "drop-shadow(0 0 5px rgba(167,229,211,.4))",
              animation: "fadeIn .5s ease",
            }}
          />
        )}
        {polyVisible &&
          scores.map((s, i) => {
            const [x, y] = pointFor(s, i)
            const isActive = activeAxis === i
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={isActive ? 4.5 : 3}
                fill={s > 0 ? "#a7e5d3" : "var(--s1)"}
                style={{
                  filter: s > 0 ? "drop-shadow(0 0 4px rgba(167,229,211,.8))" : "none",
                  animation: `fadeIn .4s ${i * 55}ms ease both`,
                  transition: "r .2s ease",
                }}
              />
            )
          })}
        {labels.map((label, i) => {
          const [x, y] = pointFor(axisLabelRadius, i)
          const isActive = activeAxis === i
          return (
            <g key={i}>
              {interactive && (
                <circle
                  cx={x}
                  cy={y}
                  r={axisLabelFontSize * 2.2}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => onAxisHover?.(i)}
                  onMouseLeave={() => onAxisHover?.(null)}
                  onClick={() => onAxisClick?.(i)}
                />
              )}
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={axisLabelFontSize}
                fontWeight={isActive ? 700 : 600}
                fill={isActive ? "var(--t1)" : "var(--t4)"}
                fontFamily="Inter, sans-serif"
                letterSpacing=".4"
                style={{ pointerEvents: "none", transition: "fill .2s ease, font-weight .2s ease" }}
              >
                {label.toUpperCase()}
              </text>
            </g>
          )
        })}
      </svg>

      {centerContent && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          {centerContent}
        </div>
      )}

      {blurred && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            backdropFilter: "blur(9px)",
            WebkitBackdropFilter: "blur(9px)",
            background: "rgba(0,0,0,.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn .5s ease",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,.06) 50%,transparent 70%)",
              animation: "shimmer 3.2s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              position: "relative",
            }}
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <rect x={4} y={11} width={16} height={11} rx={2.5} fill="var(--s1)" stroke="var(--t3)" strokeWidth={1} />
              <path d="M8 11V7.5a4 4 0 0 1 8 0V11" stroke="var(--t3)" strokeWidth={1.3} fill="none" />
              <circle cx={12} cy={16.5} r={1.8} fill="var(--t3)" />
            </svg>
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: ".9px",
                textTransform: "uppercase",
                color: "var(--t4)",
                fontFamily: "Inter, sans-serif",
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              Full score
              <br />
              locked
            </div>
            <div
              style={{
                fontSize: 9,
                color: "rgba(167,229,211,.55)",
                fontWeight: 500,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {estimatedCount} of {N} estimated
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
