"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { computeTag, SELLING_TIMELINE_OPTIONS } from "@/lib/assessment/segmentation"
import { saveGate } from "@/lib/assessment/session"

interface EmailGateModalProps {
  onClose: () => void
}

export function EmailGateModal({ onClose }: EmailGateModalProps) {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  const [timeline, setTimeline] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, _setError] = useState("")

  const valid = firstName.trim().length > 0 && email.includes("@") && timeline !== ""

  const handleSubmit = () => {
    if (!valid) return
    setSubmitting(true)
    const tag = computeTag(timeline)
    saveGate({ firstName: firstName.trim(), email: email.trim(), sellingTimeline: timeline, tag })
    setTimeout(() => {
      router.push("/assessment/stage-2")
    }, 300)
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "36px 32px",
          maxWidth: "440px",
          width: "100%",
          boxShadow: "rgba(0,0,0,0.2) 0 24px 60px",
          animation: "slideUp 0.35s cubic-bezier(0.22,1,0.36,1) forwards",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "#02492a", borderRadius: "1584px", padding: "4px 12px 4px 8px",
            marginBottom: "16px",
          }}>
            <div style={{
              width: "16px", height: "16px", borderRadius: "50%", background: "#84e7a5",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "8px", fontWeight: 700, color: "#02492a",
            }}>IQ</div>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#84e7a5", letterSpacing: "0.5px" }}>Exit IQ</span>
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", margin: "0 0 6px" }}>
            Where should we send your report?
          </h2>
          <p style={{ fontSize: "14px", color: "#9f9b93", margin: 0, lineHeight: 1.5 }}>
            Your full Exit IQ Report will be ready in seconds —
            valuation range, risk flags, and a 90-day action plan.
          </p>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#55534e", display: "block", marginBottom: "6px" }}>
              First name
            </label>
            <input
              type="text"
              placeholder="Jane"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={{
                width: "100%", padding: "12px 14px", fontSize: "15px",
                border: "1.5px solid #dad4c8", borderRadius: "10px",
                background: "#faf9f7", outline: "none", fontFamily: "inherit",
                color: "#1a1917", transition: "border-color 150ms", boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#02492a")}
              onBlur={(e) => (e.target.style.borderColor = "#dad4c8")}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#55534e", display: "block", marginBottom: "6px" }}>
              Email address
            </label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%", padding: "12px 14px", fontSize: "15px",
                border: "1.5px solid #dad4c8", borderRadius: "10px",
                background: "#faf9f7", outline: "none", fontFamily: "inherit",
                color: "#1a1917", transition: "border-color 150ms", boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#02492a")}
              onBlur={(e) => (e.target.style.borderColor = "#dad4c8")}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#55534e", display: "block", marginBottom: "6px" }}>
              Selling timeline
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                style={{
                  width: "100%", padding: "12px 40px 12px 14px", fontSize: "15px",
                  border: "1.5px solid #dad4c8", borderRadius: "10px",
                  background: "#faf9f7", outline: "none", fontFamily: "inherit",
                  color: timeline ? "#1a1917" : "#9f9b93",
                  appearance: "none", WebkitAppearance: "none",
                  cursor: "pointer", transition: "border-color 150ms", boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#02492a")}
                onBlur={(e) => (e.target.style.borderColor = "#dad4c8")}
              >
                <option value="" disabled>When are you looking to sell?</option>
                {SELLING_TIMELINE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div style={{
                position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                pointerEvents: "none", color: "#9f9b93", fontSize: "11px",
              }}>▼</div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ fontSize: "13px", color: "#d32f2f", marginTop: "10px" }}>{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!valid || submitting}
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "14px",
            fontSize: "15px",
            fontWeight: 700,
            background: valid ? "#02492a" : "#eee9df",
            color: valid ? "#84e7a5" : "#9f9b93",
            border: "none",
            borderRadius: "10px",
            cursor: valid ? "pointer" : "default",
            fontFamily: "inherit",
            transition: "all 150ms",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
          onMouseEnter={(e) => {
            if (valid) {
              e.currentTarget.style.transform = "rotateZ(-2deg) translateY(-2px)"
              e.currentTarget.style.boxShadow = "rgb(0,0,0) -4px 4px"
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = ""
            e.currentTarget.style.boxShadow = ""
          }}
        >
          {submitting ? "Starting assessment…" : "Continue to full assessment →"}
        </button>

        <div style={{ fontSize: "11px", color: "#9f9b93", textAlign: "center", marginTop: "12px" }}>
          Free. No credit card. No broker calls.
        </div>
      </div>
    </div>
  )
}
