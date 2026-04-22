"use client"

import { useState } from "react"

interface NinetyDayChecklistProps {
  items: string[]
}

export function NinetyDayChecklist({ items }: NinetyDayChecklistProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const completedCount = checked.size
  const pct = Math.round((completedCount / items.length) * 100)

  return (
    <div>
      {/* Progress header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
          {completedCount}/{items.length} completed
        </span>
        <span style={{
          fontSize: "13px", fontWeight: 700, color: "#84e7a5",
          fontFamily: "var(--font-space-mono, monospace)",
        }}>{pct}%</span>
      </div>
      <div style={{
        height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px",
        marginBottom: "24px", overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%", background: "#84e7a5", borderRadius: "2px",
          transition: "width 400ms ease",
        }} />
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {items.map((item, i) => {
          const done = checked.has(i)
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              style={{
                display: "flex", alignItems: "flex-start", gap: "12px",
                background: done ? "rgba(132,231,165,0.06)" : "rgba(255,255,255,0.04)",
                border: `1.5px solid ${done ? "rgba(132,231,165,0.2)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "12px", padding: "14px 16px", cursor: "pointer",
                textAlign: "left", transition: "all 200ms ease", fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                if (!done) e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"
              }}
              onMouseLeave={(e) => {
                if (!done) e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
              }}
            >
              <div style={{
                width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0,
                background: done ? "#84e7a5" : "transparent",
                border: `2px solid ${done ? "#84e7a5" : "rgba(255,255,255,0.25)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 200ms ease", marginTop: "1px",
              }}>
                {done && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#02492a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div>
                <span style={{
                  fontSize: "14px", lineHeight: 1.5,
                  color: done ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.85)",
                  textDecoration: done ? "line-through" : "none",
                  transition: "all 200ms ease",
                }}>
                  {item}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
