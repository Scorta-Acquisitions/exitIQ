// use client: uses useState for radar chart draw sequence and form field state in EmailGateModal
"use client"

import React from "react"
import type { Derived } from "@/lib/exitiq/calculations"
import { RADAR_AXES } from "@/lib/exitiq/data"
import { ScanLine } from "./ui"

// ── Radar chart ───────────────────────────────────────────────────────────────
function RadarChart({ scores, blurred }: { scores: number[]; blurred: boolean }) {
  const [drawn, setDrawn] = React.useState(false)
  const [polyVisible, setPolyVisible] = React.useState(false)
  const W = 200,
    CX = 100,
    CY = 100,
    R = 70,
    N = RADAR_AXES.length

  React.useEffect(() => {
    const t1 = setTimeout(() => setDrawn(true), 300)
    const t2 = setTimeout(() => setPolyVisible(true), 1100)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  const angleOf = (i: number) => (Math.PI * 2 * i) / N - Math.PI / 2
  const pointFor = (score: number, i: number): [number, number] => {
    const a = angleOf(i)
    const r = R * Math.max(score, 0.05)
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)]
  }

  const polyPoints = scores.map((s, i) => pointFor(s, i).join(",")).join(" ")
  const axisLines = RADAR_AXES.map((_, i) => {
    const [x, y] = pointFor(1, i)
    return { x, y, delay: i * 110 }
  })
  const estimatedCount = scores.filter((s) => s > 0).length

  return (
    <div style={{ position: "relative", width: W, height: W, flexShrink: 0 }}>
      <svg width={W} height={W} viewBox={`0 0 ${W} ${W}`}>
        {[0.25, 0.5, 0.75, 1].map((r, i) => (
          <polygon
            key={i}
            points={Array.from({ length: N }, (_, j) => pointFor(r, j).join(",")).join(" ")}
            fill="none"
            stroke="var(--div)"
            strokeWidth={1}
          />
        ))}
        {axisLines.map(({ x, y, delay }, i) => (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={x}
            y2={y}
            stroke="var(--b3)"
            strokeWidth={1}
            style={{
              strokeDasharray: R,
              strokeDashoffset: drawn ? 0 : R,
              transition: `stroke-dashoffset .55s ${delay}ms ease`,
            }}
          />
        ))}
        {polyVisible && (
          <polygon
            points={polyPoints}
            fill="rgba(167,229,211,.1)"
            stroke="rgba(167,229,211,.55)"
            strokeWidth={1.5}
            style={{
              filter: "drop-shadow(0 0 5px rgba(167,229,211,.4))",
              animation: "fadeIn .5s ease",
            }}
          />
        )}
        {polyVisible &&
          scores.map((s, i) => {
            const [x, y] = pointFor(s, i)
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={3}
                fill={s > 0 ? "#a7e5d3" : "var(--s1)"}
                style={{
                  filter: s > 0 ? "drop-shadow(0 0 4px rgba(167,229,211,.8))" : "none",
                  animation: `fadeIn .4s ${i * 55}ms ease both`,
                }}
              />
            )
          })}
        {RADAR_AXES.map((label, i) => {
          const [x, y] = pointFor(1.26, i)
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={7.5}
              fontWeight={600}
              fill="var(--t4)"
              fontFamily="Inter, sans-serif"
              letterSpacing=".4"
            >
              {label.toUpperCase()}
            </text>
          )
        })}
      </svg>

      {blurred && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            backdropFilter: "blur(9px)",
            WebkitBackdropFilter: "blur(9px)",
            background: "rgba(0,0,0,.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn .5s ease",
            overflow: "hidden",
          }}
        >
          {/* Shimmer sweeps the full square */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,.06) 50%,transparent 70%)",
              animation: "shimmer 3.2s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              position: "relative",
            }}
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <rect x={4} y={11} width={16} height={11} rx={2.5} fill="var(--s1)" stroke="var(--t3)" strokeWidth={1} />
              <path d="M8 11V7.5a4 4 0 0 1 8 0V11" stroke="var(--t3)" strokeWidth={1.3} fill="none" />
              <circle cx={12} cy={16.5} r={1.8} fill="var(--t3)" />
            </svg>
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: ".9px",
                textTransform: "uppercase",
                color: "var(--t4)",
                fontFamily: "Inter, sans-serif",
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              Full score
              <br />
              locked
            </div>
            <div
              style={{
                fontSize: 9,
                color: "rgba(167,229,211,.55)",
                fontWeight: 500,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {estimatedCount} of {N} estimated
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LockedRow({ label, sub, delay = 0 }: { label: string; sub?: string; delay?: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        borderRadius: 10,
        background: "var(--s2)",
        border: "1px solid var(--b3)",
        animation: `slideUp .5s ${delay}ms cubic-bezier(.34,1.2,.64,1) both`,
        position: "relative",
        overflow: "hidden",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <svg width={13} height={13} viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, opacity: 0.38 }}>
          <rect x={1.5} y={5.5} width={10} height={7} rx={1.5} fill="var(--t3)" />
          <path d="M4 5.5V4a2.5 2.5 0 0 1 5 0v1.5" stroke="var(--t3)" strokeWidth={1.1} fill="none" />
        </svg>
        <div>
          <div style={{ fontSize: 12, color: "var(--t2)", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
            {label}
          </div>
          {sub && (
            <div style={{ fontSize: 10, color: "var(--t4)", fontFamily: "Inter, sans-serif", marginTop: 1 }}>{sub}</div>
          )}
        </div>
      </div>
      <div
        style={{
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: ".7px",
          textTransform: "uppercase",
          color: "var(--t4)",
          fontFamily: "Inter, sans-serif",
          flexShrink: 0,
        }}
      >
        Locked
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,.025) 50%,transparent 70%)",
          animation: "shimmer 3.2s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
    </div>
  )
}

function UnlockList() {
  const items = [
    "Why buyers may discount your business",
    "Your 90-day value improvement plan",
    "SBA buyer financing snapshot",
    "Broker-free sale roadmap",
  ]
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "16px 18px",
        background: "rgba(16,185,129,.05)",
        border: "1px solid rgba(16,185,129,.15)",
        borderRadius: 14,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: ".8px",
          textTransform: "uppercase",
          color: "rgba(16,185,129,.7)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Your full report unlocks:
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "flex-start", gap: 8, animation: `slideUp .4s ${i * 70}ms ease both` }}
        >
          <svg width={13} height={13} viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
            <rect x={1.5} y={5.5} width={10} height={7} rx={1.5} fill="rgba(16,185,129,.2)" />
            <path d="M4 5.5V4a2.5 2.5 0 0 1 5 0v1.5" stroke="rgba(16,185,129,.55)" strokeWidth={1.1} fill="none" />
          </svg>
          <span style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.55, fontFamily: "Inter, sans-serif" }}>
            {item}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── PreviewCard ───────────────────────────────────────────────────────────────
interface PreviewCardProps {
  derived: Derived
  answers: Record<string, string>
  onUnlock: () => void
}

export function PreviewCard({ derived, answers, onUnlock }: PreviewCardProps) {
  const { valuationRange, brokerFee, radarScores, confidence } = derived
  const industry = answers.industry ?? "your business"
  const riskCount = 3

  return (
    <div
      key="preview"
      className="glass-panel"
      style={{
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        animation: "slideUp .7s cubic-bezier(.34,1.1,.64,1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 10px rgba(16,185,129,.9)",
              animation: "liveBlink 2s infinite",
            }}
          />
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".96px",
              textTransform: "uppercase",
              color: "rgba(16,185,129,.8)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            ExitIQ Preview
          </div>
        </div>
        <h2
          style={{
            fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
            fontSize: 26,
            fontWeight: 300,
            color: "var(--t1)",
            letterSpacing: "-.35px",
            lineHeight: 1.18,
            margin: 0,
          }}
        >
          Your valuation signal is forming.
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--t3)",
            marginTop: 7,
            lineHeight: 1.65,
            fontFamily: "Inter, sans-serif",
          }}
        >
          Based on {industry.toLowerCase()} market data. {riskCount} major risk areas are still locked in your full
          report.
        </p>
      </div>

      {/* Key metrics grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div
          style={{
            background: "var(--s2)",
            border: "1px solid var(--b3)",
            borderRadius: 12,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".96px",
              textTransform: "uppercase",
              color: "var(--t4)",
              fontFamily: "Inter, sans-serif",
              marginBottom: 6,
            }}
          >
            Est. valuation range
          </div>
          {valuationRange ? (
            <div
              style={{
                fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                fontSize: 17,
                fontWeight: 300,
                color: "var(--t1)",
                letterSpacing: "-.15px",
                animation: "numRoll .7s ease",
              }}
            >
              {valuationRange.text}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "var(--t5)", fontFamily: "Inter, sans-serif" }}>
              Add revenue + SDE to unlock
            </div>
          )}
          {derived.multiple && (
            <div
              style={{
                fontSize: 10,
                color: "#10b981",
                fontWeight: 500,
                marginTop: 3,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {derived.multiple} SDE multiple
            </div>
          )}
        </div>

        <div
          style={{
            background: "rgba(244,197,168,.07)",
            border: "1px solid rgba(244,197,168,.18)",
            borderRadius: 12,
            padding: "14px 16px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".96px",
              textTransform: "uppercase",
              color: "rgba(244,197,168,.55)",
              fontFamily: "Inter, sans-serif",
              marginBottom: 6,
            }}
          >
            Broker fee exposure
          </div>
          {brokerFee ? (
            <>
              <div
                style={{
                  fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                  fontSize: 17,
                  fontWeight: 300,
                  color: "#f4c5a8",
                  letterSpacing: "-.15px",
                  animation: "numRoll .7s ease",
                }}
              >
                {brokerFee.text}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(244,197,168,.45)",
                  marginTop: 3,
                  fontFamily: "Inter, sans-serif",
                  lineHeight: 1.5,
                }}
              >
                Before you pay this, see what buyers will question.
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "var(--t5)", fontFamily: "Inter, sans-serif" }}>
              Add revenue to estimate
            </div>
          )}
        </div>

        <div
          style={{
            background: "rgba(167,229,211,.05)",
            border: "1px solid rgba(167,229,211,.12)",
            borderRadius: 12,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".96px",
              textTransform: "uppercase",
              color: "rgba(167,229,211,.5)",
              fontFamily: "Inter, sans-serif",
              marginBottom: 6,
            }}
          >
            Likely buyer pool
          </div>
          <div style={{ fontSize: 13, color: "var(--t2)", fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>
            {derived.industry?.buyerLead ?? "Multiple buyer types"}
          </div>
          <div style={{ fontSize: 10, color: "var(--t4)", fontFamily: "Inter, sans-serif", marginTop: 3 }}>
            Also: SBA-backed operator, local strategic
          </div>
        </div>

        <div
          style={{
            background: "rgba(200,184,224,.05)",
            border: "1px solid rgba(200,184,224,.12)",
            borderRadius: 12,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".96px",
              textTransform: "uppercase",
              color: "rgba(200,184,224,.5)",
              fontFamily: "Inter, sans-serif",
              marginBottom: 6,
            }}
          >
            Readiness signal
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 300,
              fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
              color: "var(--t1)",
              letterSpacing: "-.1px",
            }}
          >
            {confidence}% calibrated
          </div>
          <div style={{ fontSize: 10, color: "var(--t4)", marginTop: 3, fontFamily: "Inter, sans-serif" }}>
            {riskCount} risk areas still locked
          </div>
        </div>
      </div>

      {/* Radar + locked rows */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <RadarChart scores={radarScores} blurred={true} />
          <div
            style={{
              fontSize: 10,
              color: "var(--t4)",
              fontFamily: "Inter, sans-serif",
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {radarScores.filter((s) => s > 0).length} of {RADAR_AXES.length} dimensions estimated
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".96px",
              textTransform: "uppercase",
              color: "var(--t4)",
              fontFamily: "Inter, sans-serif",
              marginBottom: 2,
            }}
          >
            Locked in your full report
          </div>
          <LockedRow
            label="Buyer objections likely to lower your price"
            sub="Owner dependency, customer concentration, docs"
            delay={0}
          />
          <LockedRow label="90-day value improvement plan" sub="Specific actions to raise your multiple" delay={80} />
          <LockedRow
            label="SBA buyer financing snapshot"
            sub="Whether your business qualifies for SBA loans"
            delay={160}
          />
          <LockedRow label="Broker-free sale roadmap" sub="Step-by-step guidance from listing to close" delay={240} />
        </div>
      </div>

      {/* Pain callout */}
      <div
        style={{
          background: "var(--s2)",
          border: "1px solid var(--b3)",
          borderRadius: 12,
          padding: "12px 16px",
          fontSize: 13,
          color: "var(--t3)",
          lineHeight: 1.65,
          fontFamily: "Inter, sans-serif",
        }}
      >
        Most owners only learn these issues after talking to buyers. ExitIQ surfaces them before you list.
      </div>

      <UnlockList />

      {/* CTA */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={onUnlock}
          style={{
            height: 50,
            borderRadius: 9999,
            position: "relative",
            overflow: "hidden",
            background: "var(--btn-bg)",
            color: "var(--btn-fg)",
            fontSize: 15,
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            letterSpacing: "-.1px",
            transition: "all .22s cubic-bezier(.34,1.4,.64,1)",
            boxShadow: "0 0 40px rgba(0,0,0,.12)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.025)"
            e.currentTarget.style.boxShadow = "0 0 55px rgba(0,0,0,.18)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)"
            e.currentTarget.style.boxShadow = "0 0 40px rgba(0,0,0,.12)"
          }}
        >
          Unlock my preliminary valuation report →
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(105deg,transparent 35%,rgba(255,255,255,.15) 50%,transparent 65%)",
              animation: "shimmer 2.8s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
        </button>
        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--t4)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Takes 2 minutes. No broker call required.
        </div>
      </div>
    </div>
  )
}

// ── EmailGateModal ────────────────────────────────────────────────────────────
interface EmailGateModalProps {
  derived: Derived
  onClose: () => void
  onSubmit: (data: { firstName: string; email: string; timeline: string }) => void
}

export function EmailGateModal({ derived, onClose, onSubmit }: EmailGateModalProps) {
  const [firstName, setFirstName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [timeline, setTimeline] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  const timelines = ["Just curious", "6–12 months", "1–2 years", "3+ years", "Already selling"]
  const canSubmit = firstName.trim() && email.includes("@") && timeline

  const handleSubmit = () => {
    if (!canSubmit || submitting || !timeline) return
    setSubmitting(true)
    setTimeout(() => onSubmit({ firstName, email, timeline }), 800)
  }

  const inpStyle: React.CSSProperties = {
    width: "100%",
    height: 46,
    padding: "0 16px",
    borderRadius: 10,
    background: "var(--inp-bg)",
    border: "1px solid var(--inp-border)",
    color: "var(--t1)",
    fontSize: 14,
    fontFamily: "Inter, sans-serif",
    outline: "none",
    transition: "border .2s",
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,.55)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          animation: "fadeIn .35s ease",
        }}
      />
      <div
        className="glass-panel"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 480,
          padding: 36,
          display: "flex",
          flexDirection: "column",
          gap: 22,
          animation: "slideUp .55s cubic-bezier(.34,1.2,.64,1)",
          overflow: "hidden",
        }}
      >
        <ScanLine speed={4.5} />

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(167,229,211,.1)",
              border: "1px solid rgba(167,229,211,.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
              <rect
                x={2}
                y={8}
                width={14}
                height={9}
                rx={2}
                fill="rgba(167,229,211,.2)"
                stroke="rgba(167,229,211,.5)"
                strokeWidth={1}
              />
              <path d="M5.5 8V5.5a3.5 3.5 0 0 1 7 0V8" stroke="rgba(167,229,211,.5)" strokeWidth={1.3} fill="none" />
              <circle cx={9} cy={12.5} r={1.5} fill="#a7e5d3" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: ".96px",
                textTransform: "uppercase",
                color: "rgba(167,229,211,.65)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Unlock report
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--t3)",
                fontFamily: "Inter, sans-serif",
                marginTop: 1,
              }}
            >
              Next: buyer risk scan + 90-day plan
            </div>
          </div>
        </div>

        <div>
          <h3
            style={{
              fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
              fontSize: 26,
              fontWeight: 300,
              color: "var(--t1)",
              letterSpacing: "-.3px",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Unlock your full ExitIQ Report.
          </h3>
          <p
            style={{
              fontSize: 13,
              color: "var(--t3)",
              marginTop: 8,
              lineHeight: 1.65,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Get your valuation breakdown, buyer risk scan, and personalized 90-day exit prep plan.
          </p>
        </div>

        {derived.valuationRange && (
          <div
            style={{
              background: "rgba(16,185,129,.06)",
              border: "1px solid rgba(16,185,129,.18)",
              borderRadius: 12,
              padding: "11px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 12, color: "var(--t3)", fontFamily: "Inter, sans-serif" }}>
              Your preliminary valuation range
            </div>
            <div
              style={{
                fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                fontSize: 20,
                fontWeight: 300,
                color: "#10b981",
                letterSpacing: "-.2px",
              }}
            >
              {derived.valuationRange.text}
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={inpStyle}
            onFocus={(e) => (e.target.style.borderColor = "rgba(167,229,211,.4)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--inp-border)")}
          />
          <input
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inpStyle}
            onFocus={(e) => (e.target.style.borderColor = "rgba(167,229,211,.4)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--inp-border)")}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              fontSize: 11,
              color: "var(--t3)",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
            }}
          >
            When are you thinking about selling?
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {timelines.map((t) => (
              <button
                key={t}
                onClick={() => setTimeline(t)}
                style={{
                  padding: "7px 13px",
                  borderRadius: 9999,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  transition: "all .18s ease",
                  background: timeline === t ? "rgba(167,229,211,.15)" : "var(--s1)",
                  border: `1px solid ${timeline === t ? "rgba(167,229,211,.42)" : "var(--b3)"}`,
                  color: timeline === t ? "#a7e5d3" : "var(--t3)",
                  boxShadow: timeline === t ? "0 0 12px rgba(167,229,211,.1)" : "none",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              height: 48,
              borderRadius: 9999,
              fontSize: 15,
              fontWeight: 500,
              cursor: canSubmit ? "pointer" : "default",
              fontFamily: "Inter, sans-serif",
              border: "none",
              transition: "all .22s ease",
              position: "relative",
              overflow: "hidden",
              background: canSubmit ? "var(--btn-bg)" : "var(--s1)",
              color: canSubmit ? "var(--btn-fg)" : "var(--t4)",
              boxShadow: canSubmit ? "0 0 30px rgba(0,0,0,.1)" : "none",
            }}
            onMouseEnter={(e) => {
              if (canSubmit) e.currentTarget.style.transform = "scale(1.02)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)"
            }}
          >
            {submitting ? "Unlocking…" : "Continue to full assessment →"}
            {canSubmit && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(105deg,transparent 35%,rgba(255,255,255,.15) 50%,transparent 65%)",
                  animation: "shimmer 2.6s ease-in-out infinite",
                  pointerEvents: "none",
                }}
              />
            )}
          </button>
          <div
            style={{
              fontSize: 11,
              color: "var(--t4)",
              textAlign: "center",
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.5,
            }}
          >
            No broker call required. Your report is based on the information you provide.
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--s1)",
            border: "1px solid var(--b3)",
            color: "var(--t3)",
            cursor: "pointer",
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    </div>
  )
}
