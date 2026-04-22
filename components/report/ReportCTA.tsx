"use client"

import Link from "next/link"

import type { ScoreResult } from "@/lib/assessment/scoring"
import type { AssessmentSession } from "@/lib/assessment/session"

interface ReportCTAProps {
  score: ScoreResult
  session: Partial<AssessmentSession>
}

export function ReportCTA({ score, session }: ReportCTAProps) {
  const tag = session.gate?.tag
  const urgency = session.stage4?.urgency
  const firstName = session.gate?.firstName

  const isHot = tag === "hot_seller" || urgency === "asap" || urgency === "3_6mo"
  const isWarm = tag === "warm_explorer" || urgency === "6_12mo"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Primary CTA based on urgency */}
      {isHot && (
        <div style={{
          background: "linear-gradient(135deg, rgba(132,231,165,0.12) 0%, rgba(132,231,165,0.06) 100%)",
          border: "2px solid rgba(132,231,165,0.35)",
          borderRadius: "16px",
          padding: "28px",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "#84e7a5", borderRadius: "1584px", padding: "4px 12px",
            fontSize: "11px", fontWeight: 700, color: "#02492a", marginBottom: "16px",
          }}>
            ⚡ Ready to go to market
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.3px" }}>
            {firstName ? `${firstName}, your` : "Your"} business looks ready to list
          </h3>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: "0 0 20px" }}>
            Based on your Exit IQ score of {score.composite}, you have a strong foundation for going to market.
            Connect with a verified M&A advisor to validate your price and build your deal package.
          </p>
          <button
            style={{
              background: "#84e7a5", color: "#02492a", border: "none", borderRadius: "1584px",
              padding: "14px 28px", fontSize: "15px", fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit", transition: "all 150ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "rotateZ(-3deg) translateY(-3px)"
              e.currentTarget.style.boxShadow = "rgb(0,0,0) -5px 5px"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = ""
              e.currentTarget.style.boxShadow = ""
            }}
          >
            Talk to an M&amp;A Advisor →
          </button>
        </div>
      )}

      {/* Warm path */}
      {isWarm && !isHot && (
        <div style={{
          background: "rgba(251,189,65,0.06)",
          border: "1.5px solid rgba(251,189,65,0.25)",
          borderRadius: "16px",
          padding: "24px",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(251,189,65,0.15)", borderRadius: "1584px", padding: "4px 12px",
            fontSize: "11px", fontWeight: 700, color: "#fbbd41", marginBottom: "14px",
          }}>
            📅 6–12 month horizon
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.3px" }}>
            Use the checklist to build exit value now
          </h3>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: "0 0 18px" }}>
            Your 90-day action plan above targets the highest-ROI improvements.
            Get a free valuation review when you&apos;re ready to go to market.
          </p>
          <button
            style={{
              background: "#fbbd41", color: "#1a1917", border: "none", borderRadius: "1584px",
              padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit", transition: "all 150ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "rotateZ(-3deg) translateY(-2px)"
              e.currentTarget.style.boxShadow = "rgb(0,0,0) -4px 4px"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = ""
              e.currentTarget.style.boxShadow = ""
            }}
          >
            Get a Free Valuation Review →
          </button>
        </div>
      )}

      {/* Exploring path */}
      {!isHot && !isWarm && (
        <div style={{
          background: "rgba(193,176,255,0.06)",
          border: "1.5px solid rgba(193,176,255,0.2)",
          borderRadius: "16px",
          padding: "24px",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(193,176,255,0.12)", borderRadius: "1584px", padding: "4px 12px",
            fontSize: "11px", fontWeight: 700, color: "#c1b0ff", marginBottom: "14px",
          }}>
            🔭 Exploring options
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.3px" }}>
            Stay informed with Exit IQ updates
          </h3>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: "0 0 18px" }}>
            We&apos;ll send you market multiples and buyer demand signals for your industry —
            so you know exactly when the timing is right.
          </p>
          <button
            style={{
              background: "#c1b0ff", color: "#1a1917", border: "none", borderRadius: "1584px",
              padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit", transition: "all 150ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "rotateZ(-3deg) translateY(-2px)"
              e.currentTarget.style.boxShadow = "rgb(0,0,0) -4px 4px"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = ""
              e.currentTarget.style.boxShadow = ""
            }}
          >
            Get Market Updates →
          </button>
        </div>
      )}

      {/* Bottom row: restart or share */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", paddingTop: "8px" }}>
        <button
          onClick={() => window.print()}
          style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "1584px", padding: "10px 20px", fontSize: "13px", fontWeight: 500,
            color: "rgba(255,255,255,0.7)", cursor: "pointer", fontFamily: "inherit",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
        >
          Print / Save PDF
        </button>
        <Link
          href="/"
          style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "1584px", padding: "10px 20px", fontSize: "13px", fontWeight: 500,
            color: "rgba(255,255,255,0.7)", cursor: "pointer", fontFamily: "inherit",
            textDecoration: "none", transition: "all 150ms ease", display: "inline-block",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
        >
          Start Over
        </Link>
      </div>
    </div>
  )
}
