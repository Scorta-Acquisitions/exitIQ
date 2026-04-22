"use client"

import { useEffect, useState } from "react"

const MONO = "var(--font-space-mono, 'Space Mono'), monospace"

interface ScoreCircleProps {
  score: number
  color: string
}

export function ScoreCircle({ score, color }: ScoreCircleProps) {
  const [displayed, setDisplayed] = useState(0)
  const [animated, setAnimated] = useState(false)
  const R = 90
  const circumference = 2 * Math.PI * R
  const offset = circumference - (circumference * displayed) / 100

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimated(true)
      let start = 0
      const step = () => {
        start += 1.4
        if (start < score) {
          setDisplayed(Math.floor(start))
          requestAnimationFrame(step)
        } else {
          setDisplayed(score)
        }
      }
      requestAnimationFrame(step)
    }, 400)
    return () => clearTimeout(timeout)
  }, [score])

  return (
    <div style={{ position: "relative", width: "220px", height: "220px" }}>
      <svg width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="110" cy="110" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="110"
          cy="110"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? offset : circumference}
          style={{ transition: "stroke-dashoffset 1.8s cubic-bezier(0.22,1,0.36,1)" }}
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
        }}
      >
        <div
          className="animate-count-up"
          style={{
            fontSize: "52px",
            fontWeight: 700,
            fontFamily: MONO,
            color: "#fff",
            lineHeight: 1,
            letterSpacing: "-2px",
          }}
        >
          {displayed}
        </div>
        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>/ 100</div>
      </div>
    </div>
  )
}
