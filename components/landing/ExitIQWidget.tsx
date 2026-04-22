"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const REVENUE_OPTIONS_SELLER = ["Under $250K", "$250K – $500K", "$500K – $1M", "$1M – $5M", "Over $5M"]
const REVENUE_OPTIONS_BUYER = ["Under $500K", "$500K – $1M", "$1M – $3M", "$3M – $10M", "Over $10M"]

export function ExitIQWidget() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [role, setRole] = useState<string | null>(null)
  const [revenue, setRevenue] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward")
  const [exiting, setExiting] = useState(false)

  const go = (nextStep: number, direction: "forward" | "back" = "forward") => {
    setExiting(true)
    setAnimDir(direction)
    setTimeout(() => {
      setStep(nextStep)
      setExiting(false)
    }, 220)
  }

  const revenueOptions = role === "seller" ? REVENUE_OPTIONS_SELLER : REVENUE_OPTIONS_BUYER

  const handleComplete = () => {
    if (!email.includes("@")) return
    const params = new URLSearchParams({ role: role ?? "", revenue: revenue ?? "", email })
    router.push(`/onboarding?${params.toString()}`)
  }

  const stepStyles = {
    opacity: exiting ? 0 : 1,
    transform: exiting ? (animDir === "forward" ? "translateY(-10px)" : "translateY(10px)") : "translateY(0)",
    transition: "opacity 200ms ease, transform 200ms ease",
  }

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "20px",
        padding: "32px 32px 28px",
        border: "1px solid #dad4c8",
        boxShadow: "rgba(0,0,0,0.12) 0 8px 40px, rgba(0,0,0,0.04) 0 1px 1px inset",
        width: "100%",
        maxWidth: "480px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ExitIQ badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: "#02492a",
          borderRadius: "1584px",
          padding: "4px 12px 4px 8px",
          marginBottom: "22px",
        }}
      >
        <div
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: "#84e7a5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "9px",
            fontWeight: 700,
            color: "#02492a",
          }}
        >
          IQ
        </div>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#84e7a5", letterSpacing: "0.5px" }}>Exit IQ</span>
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: "5px", marginBottom: "24px" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: "3px",
              flex: 1,
              borderRadius: "2px",
              background: i <= step ? "#02492a" : "#eee9df",
              transition: "background 300ms ease",
            }}
          />
        ))}
      </div>

      {/* Step content */}
      <div style={stepStyles}>
        {step === 0 && (
          <div>
            <div style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "6px" }}>
              What brings you to Scorta?
            </div>
            <div style={{ fontSize: "14px", color: "#9f9b93", marginBottom: "20px", lineHeight: 1.5 }}>
              We&apos;ll tailor your experience.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { id: "seller", label: "I want to sell my business", sub: "Get an AI exit analysis", icon: "→" },
                { id: "buyer", label: "I want to buy a business", sub: "Browse AI-vetted listings", icon: "→" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setRole(opt.id)
                    go(1)
                  }}
                  style={{
                    background: role === opt.id ? "#02492a" : "#faf9f7",
                    border: `1.5px solid ${role === opt.id ? "#02492a" : "#dad4c8"}`,
                    borderRadius: "12px",
                    padding: "14px 16px",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 150ms ease",
                    color: role === opt.id ? "#fff" : "#000",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    if (role !== opt.id) {
                      e.currentTarget.style.borderColor = "#02492a"
                      e.currentTarget.style.background = "#f0faf5"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (role !== opt.id) {
                      e.currentTarget.style.borderColor = "#dad4c8"
                      e.currentTarget.style.background = "#faf9f7"
                    }
                  }}
                >
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 600 }}>{opt.label}</div>
                    <div style={{ fontSize: "12px", opacity: 0.7, marginTop: "2px" }}>{opt.sub}</div>
                  </div>
                  <div style={{ fontSize: "16px", opacity: 0.5 }}>{opt.icon}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <button
              onClick={() => go(0, "back")}
              style={{
                background: "none",
                border: "none",
                color: "#9f9b93",
                fontSize: "13px",
                fontWeight: 500,
                padding: 0,
                marginBottom: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontFamily: "inherit",
              }}
            >
              ← Back
            </button>
            <div style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "6px" }}>
              {role === "seller" ? "What's your annual revenue?" : "What's your target budget?"}
            </div>
            <div style={{ fontSize: "14px", color: "#9f9b93", marginBottom: "18px" }}>
              Helps us find the right match.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {revenueOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setRevenue(opt)
                    go(2)
                  }}
                  style={{
                    background: revenue === opt ? "#02492a" : "#faf9f7",
                    border: `1.5px solid ${revenue === opt ? "#02492a" : "#dad4c8"}`,
                    borderRadius: "10px",
                    padding: "12px 10px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: revenue === opt ? "#fff" : "#000",
                    cursor: "pointer",
                    transition: "all 150ms",
                    textAlign: "center",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    if (revenue !== opt) {
                      e.currentTarget.style.borderColor = "#02492a"
                      e.currentTarget.style.background = "#f0faf5"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (revenue !== opt) {
                      e.currentTarget.style.borderColor = "#dad4c8"
                      e.currentTarget.style.background = "#faf9f7"
                    }
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <button
              onClick={() => go(1, "back")}
              style={{
                background: "none",
                border: "none",
                color: "#9f9b93",
                fontSize: "13px",
                fontWeight: 500,
                padding: 0,
                marginBottom: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontFamily: "inherit",
              }}
            >
              ← Back
            </button>
            <div style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "6px" }}>
              Where should we send your results?
            </div>
            <div style={{ fontSize: "14px", color: "#9f9b93", marginBottom: "20px" }}>
              Your Exit IQ report will be ready in seconds.
            </div>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComplete()}
              style={{
                width: "100%",
                padding: "13px 16px",
                fontSize: "15px",
                border: "1.5px solid #dad4c8",
                borderRadius: "10px",
                background: "#faf9f7",
                outline: "none",
                marginBottom: "12px",
                fontFamily: "inherit",
                color: "#000",
                transition: "border-color 150ms",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#02492a")}
              onBlur={(e) => (e.target.style.borderColor = "#dad4c8")}
            />
            <button
              onClick={handleComplete}
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "15px",
                fontWeight: 600,
                background: email.includes("@") ? "#02492a" : "#eee9df",
                color: email.includes("@") ? "#fff" : "#9f9b93",
                border: "none",
                borderRadius: "10px",
                cursor: email.includes("@") ? "pointer" : "default",
                transition: "all 150ms",
                fontFamily: "inherit",
              }}
            >
              Get my Exit IQ Score →
            </button>
            <div
              style={{ fontSize: "11px", color: "#9f9b93", textAlign: "center", marginTop: "10px" }}
            >
              Free. No credit card. No broker calls.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
