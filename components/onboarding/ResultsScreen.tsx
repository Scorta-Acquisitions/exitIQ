"use client"

import { useEffect, useState } from "react"
import { ScoreCircle } from "@/components/onboarding/ScoreCircle"
import { fmt, getScoreLabel, getSuggestedTimeline, getValuationRange } from "@/components/onboarding/scoring"
import type { Answers } from "@/components/onboarding/types"

const MONO = "var(--font-space-mono, 'Space Mono'), monospace"

interface ResultsScreenProps {
  answers: Answers
  score: number
}

export function ResultsScreen({ answers, score }: ResultsScreenProps) {
  const scoreInfo = getScoreLabel(score)
  const [low, high] = getValuationRange(answers)
  const brokerFee = Math.round(((low + high) / 2) * 0.1)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    setTimeout(() => setShown(true), 100)
  }, [])

  const flags = [
    answers.years?.value === "over_10" || answers.years?.value === "5_10"
      ? { type: "pass", text: "Strong operating history — reduces buyer risk" }
      : { type: "warn", text: "Less than 5 years operating — may affect multiple" },
    answers.industry?.value === "home_services" || answers.industry?.value === "healthcare"
      ? { type: "pass", text: "Resilient industry with strong buyer demand" }
      : { type: "info", text: "Market conditions vary by sub-sector" },
    answers.timeline?.value === "asap" || answers.timeline?.value === "6mo"
      ? { type: "pass", text: "Timeline aligns with market conditions" }
      : { type: "info", text: "Planning ahead gives you leverage to optimize" },
    { type: "pass", text: "No broker fee — save " + fmt(brokerFee) + " on avg." },
  ]

  return (
    <div style={{ overflowY: "auto", height: "100%", paddingBottom: "80px" }}>
      {/* Score section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "60px 32px 48px",
          opacity: shown ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            marginBottom: "24px",
          }}
        >
          Your Exit IQ Score
        </div>

        <ScoreCircle score={score} color={scoreInfo.color} />

        <div className="animate-score-reveal" style={{ marginTop: "20px", textAlign: "center" }}>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "-0.8px",
              color: scoreInfo.color,
              marginBottom: "6px",
            }}
          >
            {scoreInfo.label}
          </div>
          <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", maxWidth: "380px", lineHeight: 1.6 }}>
            {scoreInfo.desc}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Valuation range */}
        <div
          className="animate-slide-up"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            padding: "28px",
            animationDelay: "0.4s",
            animationFillMode: "both",
            opacity: 0,
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
              marginBottom: "12px",
            }}
          >
            Estimated Valuation Range
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "6px" }}>
            <div
              style={{ fontSize: "38px", fontWeight: 700, fontFamily: MONO, letterSpacing: "-1.5px", color: "#fff" }}
            >
              {fmt(low)}
            </div>
            <div style={{ fontSize: "20px", color: "rgba(255,255,255,0.4)" }}>—</div>
            <div
              style={{ fontSize: "38px", fontWeight: 700, fontFamily: MONO, letterSpacing: "-1.5px", color: "#fff" }}
            >
              {fmt(high)}
            </div>
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>
            Based on revenue tier, industry, and operating history. Full analysis included in your report.
          </div>
          {/* Range bar */}
          <div style={{ marginTop: "20px", position: "relative" }}>
            <div
              style={{
                height: "6px",
                borderRadius: "3px",
                background: "rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "70%",
                  background: "linear-gradient(90deg, rgba(132,231,165,0.4) 0%, #84e7a5 100%)",
                  borderRadius: "3px",
                  marginLeft: "15%",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "6px",
                fontSize: "11px",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              <span>Conservative</span>
              <span>Optimistic</span>
            </div>
          </div>
        </div>

        {/* 2-col stats */}
        <div
          className="animate-slide-up"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            animationDelay: "0.55s",
            animationFillMode: "both",
            opacity: 0,
          }}
        >
          <div style={{ background: "#fbbd41", borderRadius: "16px", padding: "22px" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "#9d6a09",
                marginBottom: "8px",
              }}
            >
              Est. Broker Fee Saved
            </div>
            <div style={{ fontSize: "28px", fontWeight: 700, fontFamily: MONO, letterSpacing: "-1px", color: "#000" }}>
              {fmt(brokerFee)}
            </div>
            <div style={{ fontSize: "12px", color: "#9d6a09", marginTop: "4px" }}>vs. 10% traditional commission</div>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "22px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)",
                marginBottom: "8px",
              }}
            >
              Suggested Timeline
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "#fff" }}>
              {getSuggestedTimeline(answers.timeline?.value)}
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>
              To prepare and close
            </div>
          </div>
        </div>

        {/* AI flags */}
        <div
          className="animate-slide-up"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "24px",
            animationDelay: "0.7s",
            animationFillMode: "both",
            opacity: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                background: "#84e7a5",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 700,
                color: "#02492a",
              }}
            >
              ✦
            </div>
            <div style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.5px", color: "#84e7a5" }}>
              AI Deal Analysis
            </div>
          </div>
          {flags.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
                padding: "9px 0",
                borderBottom: i < flags.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  marginTop: "1px",
                  background: f.type === "pass" ? "#02492a" : f.type === "warn" ? "#9d6a09" : "rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  color: f.type === "pass" ? "#84e7a5" : "#fbbd41",
                }}
              >
                {f.type === "pass" ? "✓" : f.type === "warn" ? "!" : "·"}
              </div>
              <span style={{ fontSize: "13px", lineHeight: 1.55, color: "rgba(255,255,255,0.75)" }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Next steps */}
        <div
          className="animate-slide-up"
          style={{
            background: "rgba(132,231,165,0.08)",
            border: "1px solid rgba(132,231,165,0.2)",
            borderRadius: "20px",
            padding: "28px",
            animationDelay: "0.85s",
            animationFillMode: "both",
            opacity: 0,
          }}
        >
          <div style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.3px", marginBottom: "16px" }}>
            Your next steps
          </div>
          {[
            { num: "01", label: "Upload your financials", sub: "P&L, tax returns, and asset list — takes 5 minutes" },
            { num: "02", label: "Complete seller interview", sub: "AI-guided questions that become your listing" },
            { num: "03", label: "Review your AI-prepared listing", sub: "Approve and publish to verified buyers" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "14px",
                padding: "12px 0",
                borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  fontFamily: MONO,
                  color: "#84e7a5",
                  opacity: 0.5,
                  minWidth: "24px",
                  marginTop: "2px",
                }}
              >
                {s.num}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "2px" }}>{s.label}</div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div
          className="animate-slide-up"
          style={{
            display: "flex",
            gap: "12px",
            paddingTop: "8px",
            flexWrap: "wrap",
            animationDelay: "1s",
            animationFillMode: "both",
            opacity: 0,
          }}
        >
          <button
            style={{
              flex: 1,
              minWidth: "200px",
              padding: "15px 24px",
              background: "#84e7a5",
              color: "#02492a",
              border: "none",
              borderRadius: "1584px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 150ms ease",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "rotateZ(-3deg) translateY(-2px)"
              e.currentTarget.style.boxShadow = "rgb(0,0,0) -5px 5px"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = ""
              e.currentTarget.style.boxShadow = ""
            }}
          >
            Create my Scorta account →
          </button>
          <button
            style={{
              padding: "15px 24px",
              background: "transparent",
              color: "rgba(255,255,255,0.6)",
              border: "1.5px solid rgba(255,255,255,0.15)",
              borderRadius: "1584px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 150ms ease",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
          >
            Email my report
          </button>
        </div>

        {/* Fine print */}
        <div
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.25)",
            textAlign: "center",
            lineHeight: 1.6,
            paddingTop: "4px",
          }}
        >
          Valuation ranges are estimates based on market data. Not financial advice.
          <br />
          Full analysis requires document verification. No broker commission — ever.
        </div>
      </div>
    </div>
  )
}
