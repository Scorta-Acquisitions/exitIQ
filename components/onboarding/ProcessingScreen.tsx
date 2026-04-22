"use client"

import { useEffect, useState } from "react"

const STEPS = [
  "Analyzing revenue benchmarks…",
  "Applying industry multiples…",
  "Assessing deal readiness…",
  "Generating Exit IQ report…",
]

interface ProcessingScreenProps {
  onDone: () => void
}

export function ProcessingScreen({ onDone }: ProcessingScreenProps) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      i++
      if (i < STEPS.length) {
        setStep(i)
      } else {
        clearInterval(timer)
        setTimeout(onDone, 600)
      }
    }, 900)
    return () => clearInterval(timer)
  }, [onDone])

  return (
    <div
      className="animate-fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: "32px",
      }}
    >
      {/* Spinner */}
      <div style={{ position: "relative", width: "80px", height: "80px" }}>
        <svg width="80" height="80" className="animate-spin-slow">
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(132,231,165,0.15)" strokeWidth="4" />
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="#84e7a5"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="60 150"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 700,
            color: "#84e7a5",
            letterSpacing: "0.5px",
          }}
        >
          IQ
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "8px" }}>
          Calculating your Exit IQ
        </div>
        <div
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.5)",
            minHeight: "22px",
            transition: "opacity 300ms",
          }}
        >
          {STEPS[step]}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "280px" }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                flexShrink: 0,
                background: i <= step ? "#84e7a5" : "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 400ms ease",
                fontSize: "10px",
                color: "#02492a",
                fontWeight: 700,
              }}
            >
              {i <= step ? "✓" : ""}
            </div>
            <span
              style={{
                fontSize: "13px",
                color: i <= step ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)",
                transition: "color 400ms",
              }}
            >
              {s}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
