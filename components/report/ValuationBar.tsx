"use client"

import { findIndustry } from "@/lib/assessment/industries"
import { fmt, getValuationRange } from "@/lib/assessment/scoring"
import type { Stage1Answers } from "@/lib/assessment/session"

interface ValuationBarProps {
  s1: Partial<Stage1Answers>
  askingPrice?: string
}

export function ValuationBar({ s1, askingPrice }: ValuationBarProps) {
  const [low, high] = getValuationRange(s1)
  const mid = Math.round((low + high) / 2)
  const industry = findIndustry(s1.industry ?? "other")

  const SDE_MIDPOINTS: Record<string, number> = {
    under_250: 125000,
    "250_500": 375000,
    "500_1m": 750000,
    "1m_2m": 1500000,
    "2m_5m": 3500000,
    "5m_10m": 7500000,
  }
  const sdeMid = SDE_MIDPOINTS[s1.sde ?? "500_1m"] ?? 750000
  const revMid = SDE_MIDPOINTS[s1.revenue ?? "500_1m"] ?? 750000

  const methods = [
    {
      label: "SDE Multiple",
      range: [sdeMid * industry.sdeMultiple[0], sdeMid * industry.sdeMultiple[1]] as [number, number],
      note: `${industry.sdeMultiple[0]}–${industry.sdeMultiple[1]}x SDE`,
      color: "#84e7a5",
    },
    {
      label: "Revenue Multiple",
      range: [revMid * industry.revenueMultiple[0], revMid * industry.revenueMultiple[1]] as [number, number],
      note: `${industry.revenueMultiple[0]}–${industry.revenueMultiple[1]}x Revenue`,
      color: "#fbbd41",
    },
    {
      label: "Blended Estimate",
      range: [low, high] as [number, number],
      note: "Average of two methods",
      color: "#c1b0ff",
    },
  ]

  const barMax = high * 1.3
  const numericAsk = askingPrice
    ? parseFloat(askingPrice.replace(/[^0-9.]/g, "")) *
      (askingPrice.toLowerCase().includes("m") ? 1000000 : askingPrice.toLowerCase().includes("k") ? 1000 : 1)
    : null

  const validAsk = numericAsk && !isNaN(numericAsk) && numericAsk > 0 ? numericAsk : null

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Main range display */}
      <div
        style={{
          background: "rgba(132,231,165,0.08)",
          border: "1.5px solid rgba(132,231,165,0.2)",
          borderRadius: "16px",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "6px",
          }}
        >
          Estimated Value Range
        </div>
        <div
          style={{
            fontSize: "clamp(28px, 5vw, 40px)",
            fontWeight: 700,
            color: "#84e7a5",
            fontFamily: "var(--font-space-mono, monospace)",
            letterSpacing: "-1px",
            marginBottom: "4px",
          }}
        >
          {fmt(low)} – {fmt(high)}
        </div>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
          Midpoint: {fmt(mid)} · {industry.label.split("(")[0]!.trim()} industry
        </div>
      </div>

      {/* 3 method breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          }}
        >
          Valuation Methods
        </div>
        {methods.map((method) => {
          const leftPct = (method.range[0] / barMax) * 100
          const widthPct = ((method.range[1] - method.range[0]) / barMax) * 100
          return (
            <div key={method.label} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{method.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{method.note}</span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: method.color,
                      fontFamily: "var(--font-space-mono, monospace)",
                    }}
                  >
                    {fmt(method.range[0])} – {fmt(method.range[1])}
                  </span>
                </div>
              </div>
              {/* Bar track */}
              <div
                style={{
                  position: "relative",
                  height: "8px",
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    height: "100%",
                    background: method.color,
                    borderRadius: "4px",
                    opacity: 0.7,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Asking price pin */}
      {validAsk && (
        <div
          style={{
            background: validAsk <= high * 1.1 ? "rgba(132,231,165,0.08)" : "rgba(251,189,65,0.08)",
            border: `1.5px solid ${validAsk <= high * 1.1 ? "rgba(132,231,165,0.2)" : "rgba(251,189,65,0.3)"}`,
            borderRadius: "12px",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: "2px" }}>
              Your Asking Price
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: validAsk <= high * 1.1 ? "#84e7a5" : "#fbbd41",
                fontFamily: "var(--font-space-mono, monospace)",
              }}
            >
              {fmt(validAsk)}
            </div>
          </div>
          <div
            style={{
              background: validAsk <= high * 1.1 ? "rgba(132,231,165,0.12)" : "rgba(251,189,65,0.12)",
              borderRadius: "1584px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 600,
              color: validAsk <= high * 1.1 ? "#84e7a5" : "#fbbd41",
            }}
          >
            {validAsk <= high ? "Within range" : validAsk <= high * 1.25 ? "Slightly above" : "Above market"}
          </div>
        </div>
      )}
    </div>
  )
}
