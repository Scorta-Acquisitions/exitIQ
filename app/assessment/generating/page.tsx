"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { loadSession, markComplete } from "@/lib/assessment/session"

const STEPS = [
  "Analyzing financial profile…",
  "Scoring operational independence…",
  "Calculating market positioning…",
  "Computing buyer accessibility…",
  "Generating your Exit IQ Report…",
]

export default function GeneratingPage() {
  const router = useRouter()
  const [stepIdx, setStepIdx] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const session = loadSession()
    if (!session.stage4) {
      router.replace("/")
      return
    }

    let current = 0
    const interval = setInterval(() => {
      current++
      if (current < STEPS.length) {
        setStepIdx(current)
      } else {
        clearInterval(interval)
        markComplete()
        setDone(true)
        const sessionId = session.sessionId ?? "local"
        setTimeout(() => {
          router.push(`/report/${sessionId}`)
        }, 600)
      }
    }, 900)

    return () => clearInterval(interval)
  }, [router])

  return (
    <div style={{
      minHeight: "100vh",
      background: "#02492a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "48px" }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%", background: "#84e7a5",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "11px", fontWeight: 700, color: "#02492a",
        }}>IQ</div>
        <span style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>Exit IQ</span>
      </div>

      {/* Spinner */}
      <div style={{ marginBottom: "36px" }}>
        {done ? (
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            background: "rgba(132,231,165,0.15)", border: "2px solid #84e7a5",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "28px",
          }}>✓</div>
        ) : (
          <svg width="64" height="64" viewBox="0 0 64 64" className="animate-spin-slow">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
            <circle
              cx="32" cy="32" r="28" fill="none" stroke="#84e7a5" strokeWidth="4"
              strokeDasharray="175" strokeDashoffset="120" strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* Steps */}
      <div style={{ maxWidth: "360px", width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>
        {STEPS.map((label, i) => {
          const completed = i < stepIdx
          const active = i === stepIdx && !done
          const upcoming = i > stepIdx && !done
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                opacity: upcoming ? 0.3 : 1,
                transition: "opacity 300ms ease",
              }}
            >
              <div style={{
                width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                background: completed || done ? "#84e7a5" : active ? "rgba(132,231,165,0.2)" : "rgba(255,255,255,0.08)",
                border: `2px solid ${completed || done ? "#84e7a5" : active ? "#84e7a5" : "rgba(255,255,255,0.15)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "10px", color: "#02492a", fontWeight: 700,
                transition: "all 400ms ease",
              }}>
                {(completed || done) && "✓"}
              </div>
              <span style={{
                fontSize: "14px",
                fontWeight: active ? 600 : 400,
                color: completed || done ? "#84e7a5" : active ? "#fff" : "rgba(255,255,255,0.4)",
                transition: "all 300ms ease",
              }}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
