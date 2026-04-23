"use client"

import { useEffect, useState } from "react"
import type { RadarDimension } from "@/lib/assessment/scoring"

interface RadarChartProps {
  dimensions: RadarDimension[]
  size?: number
}

export function RadarChart({ dimensions, size = 280 }: RadarChartProps) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200)
    return () => clearTimeout(t)
  }, [])

  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38
  const labelR = size * 0.48

  const points = dimensions.map((_, i) => {
    const angle = (i * 72 - 90) * (Math.PI / 180)
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  })

  const labelPoints = dimensions.map((_, i) => {
    const angle = (i * 72 - 90) * (Math.PI / 180)
    return { x: cx + labelR * Math.cos(angle), y: cy + labelR * Math.sin(angle) }
  })

  const dataPoints = dimensions.map((dim, i) => {
    const v = animated ? dim.score / 100 : 0
    const angle = (i * 72 - 90) * (Math.PI / 180)
    const rv = r * v
    return { x: cx + rv * Math.cos(angle), y: cy + rv * Math.sin(angle) }
  })

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ") + " Z"

  const getLabelAnchor = (x: number) => {
    if (x < cx - 10) return "end"
    if (x > cx + 10) return "start"
    return "middle"
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={points
              .map((p) => {
                const dx = (p.x - cx) * scale
                const dy = (p.y - cy) * scale
                return `${(cx + dx).toFixed(2)},${(cy + dy).toFixed(2)}`
              })
              .join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        {points.map((p, i) => (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        ))}

        {/* Data fill */}
        <path
          d={toPath(dataPoints)}
          fill="rgba(132,231,165,0.18)"
          stroke="#84e7a5"
          strokeWidth="2"
          style={{ transition: "d 800ms cubic-bezier(0.22,1,0.36,1)" }}
        />

        {/* Data dots */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={animated ? 4 : 0}
            fill="#84e7a5"
            style={{ transition: "r 400ms ease 600ms" }}
          />
        ))}

        {/* Labels */}
        {labelPoints.map((p, i) => {
          const dim = dimensions[i]!
          return (
            <g key={i}>
              <text
                x={p.x}
                y={p.y - 4}
                textAnchor={getLabelAnchor(p.x)}
                fontSize="11"
                fontWeight="600"
                fill="rgba(255,255,255,0.7)"
                fontFamily="var(--font-dm-sans, sans-serif)"
              >
                {dim.name.split(" ")[0]}
              </text>
              <text
                x={p.x}
                y={p.y + 9}
                textAnchor={getLabelAnchor(p.x)}
                fontSize="11"
                fontWeight="700"
                fill="#84e7a5"
                fontFamily="var(--font-space-mono, monospace)"
              >
                {dim.score}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
        {dimensions.map((dim) => (
          <div
            key={dim.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "1584px",
              padding: "4px 10px",
            }}
          >
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#84e7a5", flexShrink: 0 }} />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{dim.name}</span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#84e7a5",
                fontFamily: "var(--font-space-mono, monospace)",
              }}
            >
              {dim.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
