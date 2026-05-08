// use client: uses useState for radar chart draw sequence and form field state in EmailGateModal
"use client"

import React from "react"
import type { Derived } from "@/lib/exitiq/calculations"
import { computeBuyerMatchLikelihoods, fmtMoney } from "@/lib/exitiq/calculations"
import { RADAR_AXES } from "@/lib/exitiq/data"
import { ScanLine } from "./ui"

// ── Signal types & helpers ─────────────────────────────────────────────────────
type Status = "bull" | "neutral" | "risk"

function statusColors(s: Status) {
  if (s === "bull")
    return {
      bg: "rgba(167,229,211,.06)",
      border: "rgba(167,229,211,.2)",
      color: "#a7e5d3",
      dot: "#10b981",
      label: "Strength",
    }
  if (s === "risk")
    return {
      bg: "rgba(244,197,168,.07)",
      border: "rgba(244,197,168,.22)",
      color: "#f4c5a8",
      dot: "#e8865a",
      label: "Risk flag",
    }
  return { bg: "var(--s2)", border: "var(--b3)", color: "var(--t3)", dot: "var(--t4)", label: "Neutral" }
}

function docReadinessSignal(v: string): { label: string; status: Status; pill: string } {
  const m: Record<string, { label: string; status: Status; pill: string }> = {
    excellent: { label: "3yr Returns + Clean P&Ls", status: "bull", pill: "📋 Deal-ready" },
    good: { label: "Most Records, Some Gaps", status: "bull", pill: "📋 Good" },
    fair: { label: "Scattered / Disorganized", status: "risk", pill: "📋 Needs Prep" },
    poor: { label: "Not Prepared", status: "risk", pill: "📋 Not Ready" },
  }
  return m[v] ?? { label: "Not provided", status: "neutral", pill: "📋 —" }
}

function teamSignal(v: string): { label: string; status: Status; pill: string } {
  if (!v) return { label: "Not provided", status: "neutral", pill: "👥 —" }
  if (v === "Just me") return { label: "Solo operator", status: "risk", pill: "👥 Key-man risk" }
  if (v === "2 – 5") return { label: "Small team (2–5)", status: "neutral", pill: "👥 Transition risk" }
  if (v === "6 – 15") return { label: "Established team (6–15)", status: "neutral", pill: "👥 Manageable depth" }
  if (v === "16 – 50") return { label: "Deep team (16–50)", status: "bull", pill: "👥 Scales without owner" }
  return { label: "Enterprise team (50+)", status: "bull", pill: "👥 Scales without owner" }
}

function recurSignal(v: string): { label: string; status: Status; pill: string } {
  const m: Record<string, { label: string; status: Status; pill: string }> = {
    high: { label: "75%+ Recurring", status: "bull", pill: "🔁 Strong" },
    medium_high: { label: "50–75% Recurring", status: "bull", pill: "🔁 Moderate-strong" },
    medium: { label: "25–50% Recurring", status: "neutral", pill: "🔁 Moderate" },
    low: { label: "Under 25% Recurring", status: "risk", pill: "🔁 Low" },
  }
  return m[v] ?? { label: "Not provided", status: "neutral", pill: "🔁 —" }
}

function concSignal(v: string): { label: string; status: Status } {
  const m: Record<string, { label: string; status: Status }> = {
    diversified: { label: "Well Diversified", status: "bull" },
    moderate: { label: "Moderate (10–25%)", status: "neutral" },
    concentrated: { label: "Concentrated (25–50%)", status: "risk" },
    high_risk: { label: "High Risk (50%+)", status: "risk" },
  }
  return m[v] ?? { label: "Not provided", status: "neutral" }
}

function facilitySignal(v: string): { label: string; status: Status } {
  const m: Record<string, { label: string; status: Status }> = {
    owns: { label: "Owns Property", status: "bull" },
    long_lease: { label: "Lease 7+ Years", status: "bull" },
    short_lease: { label: "Lease < 7 Years", status: "risk" },
    no_location: { label: "Mobile / Remote", status: "neutral" },
  }
  return m[v] ?? { label: "Not provided", status: "neutral" }
}

function keyManSig(v: string): { label: string; status: Status } {
  const m: Record<string, { label: string; status: Status }> = {
    "5": { label: "Fully Independent (5/5)", status: "bull" },
    "4": { label: "Mostly Independent (4/5)", status: "bull" },
    "3": { label: "Shared Control (3/5)", status: "neutral" },
    "2": { label: "Owner-Centric (2/5)", status: "risk" },
    "1": { label: "Key-Man Risk (1/5)", status: "risk" },
  }
  return m[v] ?? { label: "Not provided", status: "neutral" }
}

function buildHeadline(answers: Record<string, string>): string {
  const ind = answers.industry ?? "Your business"
  const sde = answers.sde
  const emp = answers.employees
  const yrs = answers.years?.replace(" years", "").replace(" – ", "–")
  let s = `${ind} business`
  if (sde) s += ` generating ${sde} SDE`
  if (emp && emp !== "Just me") s += ` with a ${emp.replace(" – ", "–")}-person team`
  else if (emp === "Just me") s += `, founder-operated`
  if (yrs) s += `, ${yrs}-year operating history`
  return s + "."
}

const RADAR_STRENGTH_DESC: Record<string, string> = {
  "Fin. Docs":
    "Your financial documentation is deal-ready — 3 years of clean tax returns and organized P&Ls are what SBA lenders and buyers need to move fast. This eliminates the most common diligence bottleneck and supports a compressed, competitive process.",
  "Owner Dep.":
    "Business operations show meaningful independence from owner involvement — a primary driver of premium multiples across all buyer types in the lower-middle market. Sophisticated acquirers pay a genuine premium for this transferable profile.",
  "Rev. Quality":
    "Your recurring revenue base is a top-tier signal. Buyers price predictable cash flows at a meaningful premium over transactional peers — this directly expands your multiple ceiling, draws competing bids, and makes your business easier to finance at acquisition.",
  "Cust. Conc.":
    "A diversified customer base eliminates the most common single-buyer discount. No customer concentration risk means your revenue is more defensible in diligence, and buyers have full confidence in post-close continuity of the cash flow.",
  Longevity:
    "A long operating history proves resilience through economic cycles. Buyers treat decade-plus track records as a fundamental de-risking signal — it supports premium multiples, cleaner deal structures, and more favorable SBA financing terms.",
  "Ops Depth":
    "Strong team depth and operational infrastructure significantly reduce transition risk. This headcount and independence profile commands premium multiples over owner-operated peers and accelerates buyer confidence through the diligence process.",
  Positioning:
    "Your vertical and geographic positioning attracts premium buyers. Strong industry multiples and active M&A buyer density in your region support competitive offer dynamics and shorter time-to-close relative to lower-demand segments.",
}

const RADAR_RISK_DESC: Record<string, string> = {
  "Fin. Docs":
    "Financial documentation gaps will trigger buyer scrutiny in diligence. Clean, normalized financials with documented add-backs are the #1 deal facilitator — and the #1 deal killer when missing. This is the highest-ROI action before going to market.",
  "Owner Dep.":
    "Owner dependency is flagged at a level buyers will scrutinize. They will model transition risk carefully and apply a discount accordingly. A documented handover plan with demonstrated team depth is essential to protecting your multiple.",
  "Rev. Quality":
    "Predominantly transactional revenue compresses multiples compared to recurring-model peers. Buyers discount for revenue unpredictability and financing difficulty — even partial restructuring toward retainer or contract models can materially improve your range.",
  "Cust. Conc.":
    "Customer concentration will be flagged in diligence. Buyers apply multiple discounts and often require earnouts tied to customer retention post-close. Long-tenure relationship history and documented contracts are your strongest counter-arguments.",
  Longevity:
    "A shorter operating history requires a strong growth narrative. Buyers will weight trajectory over historical revenue — consistent growth data, documented processes, and a compelling forward story are critical to protecting your multiple.",
  "Ops Depth":
    "Limited team depth raises transition risk concerns. Buyers will model what happens post-close carefully and price in the continuity risk. Documenting processes, cross-training team members, and reducing single-person dependencies are the fastest fixes.",
  Positioning:
    "Your industry multiple tier or geographic market presents valuation headwinds. Targeted buyer outreach and a strong positioning narrative become more important in lower-demand segments to generate competitive offers rather than a single below-market bid.",
}

function getStrengths(answers: Record<string, string>, radarScores: number[], industryLabel: string) {
  const maxIdx = radarScores.reduce((best, s, i) => (s > (radarScores[best] ?? 0) ? i : best), 0)
  const axisName = RADAR_AXES[maxIdx] ?? "Valuation"
  const s1 = { title: axisName, desc: RADAR_STRENGTH_DESC[axisName] ?? "" }

  let s2 = { title: "", desc: "" }
  if (answers.recurringRev === "high") {
    s2 = {
      title: "Recurring Revenue Engine",
      desc: "Over 75% recurring or contracted revenue is the highest-value profile in the market. Buyers pay a meaningful premium for predictable cash flows — this directly expands your multiple ceiling, draws competing bids, and makes your business far easier to finance at acquisition.",
    }
  } else if (answers.recurringRev === "medium_high") {
    s2 = {
      title: "Strong Recurring Revenue Base",
      desc: "50–75% recurring revenue signals the stability buyers prize above almost everything else. Your blended multiple is materially higher than comparable transactional businesses at this revenue tier — and it significantly widens the pool of qualified, bankable acquirers.",
    }
  } else if (answers.employees === "16 – 50" || answers.employees === "50+") {
    const emp = (answers.employees ?? "").replace(" – ", "–")
    s2 = {
      title: "Deep Operational Team",
      desc: `A ${emp}-person team significantly reduces transition risk and post-close continuity concerns. Buyers view this headcount as a genuine strength — it commands premium multiples versus owner-operated peers and dramatically accelerates buyer confidence through the diligence process.`,
    }
  } else if (answers.facilityType === "owns") {
    s2 = {
      title: "Owned Real Estate Asset",
      desc: "Owning the property adds tangible asset value and removes lease risk entirely — both are meaningful factors in buyer valuation and SBA lender underwriting. Property ownership signals stability and can directly expand your qualified buyer pool.",
    }
  } else if (answers.docReadiness === "excellent" || answers.docReadiness === "good") {
    s2 = {
      title: "Deal-Ready Financial Records",
      desc: "Clean, auditable financials are the #1 deal facilitator. Buyers move faster and lenders approve more confidently when records are organized — this directly compresses deal timelines, reduces re-trade risk, and eliminates the most common reason deals collapse in diligence.",
    }
  } else if (answers.years === "10+ years") {
    s2 = {
      title: "Decade-Plus Track Record",
      desc: "Ten or more years of operating history proves resilience through economic cycles. Buyers treat long operating histories as a fundamental de-risking signal — it supports premium multiples, cleaner deal structures, and more favorable SBA financing terms that expand your buyer pool.",
    }
  } else {
    s2 = {
      title: `${industryLabel} Market Demand`,
      desc: "Your industry is experiencing active M&A interest with multiple buyer types competing for qualified deals. This competitive buyer environment supports more favorable exit terms, higher offer certainty, and typically reduces time-to-close versus less active market segments.",
    }
  }
  return [s1, s2]
}

function getRisks(answers: Record<string, string>, radarScores: number[]) {
  let r1 = { title: "", desc: "" }
  if (answers.keyMan === "1") {
    r1 = {
      title: "Critical Owner Dependency",
      desc: "Everything runs through you — buyers will apply a significant multiple discount and require extended transition periods or performance-based earnouts tied to your post-close involvement. This is the single most common reason deals compress or collapse at the finish line. Begin documenting institutional knowledge immediately.",
    }
  } else if (answers.keyMan === "2") {
    r1 = {
      title: "Elevated Key-Man Risk",
      desc: "Most key relationships and decisions flow through you. Buyers will carefully model what happens post-close and price in the risk with a discount and structured earnout. Documenting your client relationships, processes, and institutional knowledge is the fastest path to multiple improvement before going to market.",
    }
  } else {
    const nonZero = radarScores.map((s, i) => ({ s, i })).filter((x) => x.s > 0)
    const minItem = nonZero.reduce((a, b) => (b.s < a.s ? b : a), nonZero[0] ?? { s: 0, i: 2 })
    const axisName = RADAR_AXES[minItem.i] ?? "Financials"
    r1 = { title: `${axisName} Gap`, desc: RADAR_RISK_DESC[axisName] ?? "" }
  }

  let r2 = { title: "", desc: "" }
  if (answers.customerConc === "high_risk") {
    r2 = {
      title: "Critical Customer Concentration",
      desc: "50%+ of revenue from a single customer is the #2 concern for buyers after owner dependency. Expect meaningful multiple discounting — typically 0.5–1× — and complex earnout structures tied to customer retention post-close. Buyer due diligence will focus heavily here and may kill deals that aren't pre-addressed.",
    }
  } else if (answers.customerConc === "concentrated") {
    r2 = {
      title: "Customer Concentration Flag",
      desc: "25–50% from your top customer will be flagged in diligence. Buyers will apply multiple discounts and often require earnouts tied to that customer's retention. Long-tenure relationship history and documented contracts are your strongest counter-arguments — have them prepared before your first buyer call.",
    }
  } else if (answers.docReadiness === "poor") {
    r2 = {
      title: "Financial Records Not Ready",
      desc: "No organized financial documentation will stall or kill most deals. Buyers and SBA lenders require 3 years of clean tax returns and P&L statements before they can proceed — this is the single highest-ROI action before going to market.",
    }
  } else if (answers.docReadiness === "fair") {
    r2 = {
      title: "Disorganized Financial Records",
      desc: "Scattered records will require significant CPA prep time and extend your deal timeline. Buyers use documentation gaps as leverage in negotiations — organize and normalize your financials before your first buyer conversation.",
    }
  } else if (answers.facilityType === "short_lease") {
    r2 = {
      title: "Lease Expiration Risk",
      desc: "A lease expiring within 7 years is a significant SBA and buyer red flag. Lenders will hesitate and buyers will discount the offer or require lease contingencies. Negotiate a 7–10 year extension before listing to protect your multiple.",
    }
  } else if (answers.recurringRev === "low") {
    r2 = {
      title: "Transactional Revenue Risk",
      desc: "Predominantly transactional revenue compresses multiples compared to recurring-model peers by a meaningful margin. Buyers discount for revenue unpredictability and financing difficulty — even partial restructuring toward retainer, subscription, or contract models before listing can materially improve your multiple range and buyer pool.",
    }
  } else {
    r2 = {
      title: "Financial Documentation Gap",
      desc: "Clean, normalized financials with clearly documented add-backs are the #1 deal facilitator. Gaps in financial documentation are the most common trigger for re-trades, price reductions, and failed deals at the LOI stage — addressing this before your first buyer conversation is non-negotiable for a premium exit.",
    }
  }
  return [r1, r2]
}

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

// ── Signal card ───────────────────────────────────────────────────────────────
function SignalCard({
  label,
  value,
  status,
  delay = 0,
}: {
  label: string
  value: string
  status: Status
  delay?: number
}) {
  const c = statusColors(status)
  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 10,
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 5,
        animation: `slideUp .45s ${delay}ms cubic-bezier(.34,1.2,.64,1) both`,
      }}
    >
      <div
        style={{
          fontSize: 8.5,
          fontWeight: 700,
          letterSpacing: ".9px",
          textTransform: "uppercase",
          color: "var(--t5)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: c.color,
          fontFamily: "Inter, sans-serif",
          lineHeight: 1.3,
        }}
      >
        {value || "—"}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: c.dot,
            flexShrink: 0,
          }}
        />
        <div style={{ fontSize: 8.5, color: "var(--t5)", fontFamily: "Inter, sans-serif" }}>{c.label}</div>
      </div>
    </div>
  )
}

// ── Insight card (strength or risk) ──────────────────────────────────────────
function InsightCard({
  type,
  title,
  desc,
  delay = 0,
}: {
  type: "strength" | "risk"
  title: string
  desc: string
  delay?: number
}) {
  const isBull = type === "strength"
  return (
    <div
      style={{
        background: isBull ? "rgba(16,185,129,.06)" : "rgba(244,197,168,.07)",
        border: `1px solid ${isBull ? "rgba(16,185,129,.18)" : "rgba(244,197,168,.2)"}`,
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 9,
        animation: `slideUp .5s ${delay}ms cubic-bezier(.34,1.2,.64,1) both`,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: isBull ? "rgba(16,185,129,.12)" : "rgba(244,197,168,.12)",
            border: `1px solid ${isBull ? "rgba(16,185,129,.28)" : "rgba(244,197,168,.28)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 1,
          }}
        >
          {isBull ? (
            <svg width={13} height={13} viewBox="0 0 13 13" fill="none">
              <path
                d="M2 7L5 10L11 4"
                stroke="#10b981"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width={13} height={13} viewBox="0 0 13 13" fill="none">
              <path d="M6.5 2.5v5M6.5 10v.5" stroke="#f4c5a8" strokeWidth={1.6} strokeLinecap="round" />
            </svg>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: ".8px",
              textTransform: "uppercase",
              color: isBull ? "rgba(16,185,129,.6)" : "rgba(244,197,168,.6)",
              fontFamily: "Inter, sans-serif",
              marginBottom: 3,
            }}
          >
            {isBull ? "Top Strength" : "Key Risk to Address"}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--t1)",
              fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
              letterSpacing: "-.1px",
              lineHeight: 1.25,
            }}
          >
            {title}
          </div>
        </div>
      </div>
      <div
        style={{
          fontSize: 12.5,
          color: "var(--t3)",
          lineHeight: 1.7,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {desc}
      </div>
    </div>
  )
}

// ── Driver pill ───────────────────────────────────────────────────────────────
function DriverPill({ emoji, label, value, status }: { emoji: string; label: string; value: string; status: Status }) {
  const c = statusColors(status)
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 12px",
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 9999,
        flex: "1 1 0",
        minWidth: 0,
      }}
    >
      <span style={{ fontSize: 13, flexShrink: 0 }}>{emoji}</span>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: ".7px",
            textTransform: "uppercase",
            color: "var(--t5)",
            fontFamily: "Inter, sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: c.color,
            fontFamily: "Inter, sans-serif",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  )
}

// ── Unlock list (two-tier) ────────────────────────────────────────────────────
function UnlockList() {
  const tier1 = [
    {
      icon: "◈",
      title: "Valuation breakdown",
      sub: "SDE add-backs, normalization, and full multiple justification",
    },
    {
      icon: "◉",
      title: "SBA lender readiness score (0–100)",
      sub: "Pass/fail criteria, financing eligibility, and deal bankability signal",
    },
    {
      icon: "◎",
      title: "Buyer objection map",
      sub: "Top 3 concerns buyers will raise in diligence — and how to pre-address each",
    },
    {
      icon: "→",
      title: "90-day exit readiness plan",
      sub: "30/60/90 action items to maximize your multiple before you list",
    },
  ]

  const tier2 = [
    { title: "Buyer outreach list", sub: "12–20 pre-qualified buyers matched to your profile" },
    { title: "Lender coordination & SBA packaging", sub: "Financing setup, term sheet review, lender intros" },
    { title: "LOI review + diligence support", sub: "Deal structuring, rep & warranty guidance, close support" },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Tier 1 */}
      <div
        style={{
          padding: "16px 18px",
          background: "rgba(16,185,129,.05)",
          border: "1px solid rgba(16,185,129,.15)",
          borderRadius: 14,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".8px",
            textTransform: "uppercase",
            color: "rgba(16,185,129,.7)",
            fontFamily: "Inter, sans-serif",
            marginBottom: 12,
          }}
        >
          Your full report includes:
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tier1.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                animation: `slideUp .4s ${i * 65}ms ease both`,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: "rgba(16,185,129,.1)",
                  border: "1px solid rgba(16,185,129,.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 10,
                  color: "#10b981",
                  fontFamily: "Inter, sans-serif",
                  marginTop: 1,
                }}
              >
                {item.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: "var(--t2)",
                    fontFamily: "Inter, sans-serif",
                    lineHeight: 1.4,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--t4)",
                    fontFamily: "Inter, sans-serif",
                    marginTop: 2,
                    lineHeight: 1.45,
                  }}
                >
                  {item.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tier 2 */}
      <div
        style={{
          padding: "14px 18px",
          background: "var(--s2)",
          border: "1px solid var(--b3)",
          borderRadius: 14,
          opacity: 0.7,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 11,
          }}
        >
          <svg width={13} height={13} viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
            <rect x={1.5} y={5.5} width={10} height={7} rx={1.5} fill="var(--t3)" />
            <path d="M4 5.5V4a2.5 2.5 0 0 1 5 0v1.5" stroke="var(--t3)" strokeWidth={1.1} fill="none" />
          </svg>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".8px",
              textTransform: "uppercase",
              color: "var(--t4)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Unlocks with full engagement:
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {tier2.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: "var(--s1)",
                  border: "1px solid var(--b3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <svg width={10} height={10} viewBox="0 0 10 10" fill="none">
                  <rect x={1} y={4} width={8} height={5.5} rx={1.2} fill="var(--t5)" />
                  <path d="M3 4V3a2 2 0 0 1 4 0v1" stroke="var(--t5)" strokeWidth={1} fill="none" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: "var(--t3)",
                    fontFamily: "Inter, sans-serif",
                    lineHeight: 1.4,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--t5)",
                    fontFamily: "Inter, sans-serif",
                    marginTop: 2,
                    lineHeight: 1.45,
                  }}
                >
                  {item.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Answers summary ───────────────────────────────────────────────────────────
const QUESTION_META: { key: string; label: string; format: (v: string) => string }[] = [
  { key: "industry", label: "Industry", format: (v) => v || "—" },
  { key: "years", label: "Years in business", format: (v) => v || "—" },
  {
    key: "facilityType",
    label: "Facility situation",
    format: (v) =>
      ((
        ({
          owns: "Own the property",
          long_lease: "Lease 7+ years remaining",
          short_lease: "Lease expiring < 7 years",
          no_location: "Mobile / remote / no location",
        }) as Record<string, string>
      )[v] ??
        v) ||
      "—",
  },
  { key: "revenue", label: "Annual revenue", format: (v) => v || "—" },
  { key: "sde", label: "Annual SDE", format: (v) => v || "—" },
  {
    key: "docReadiness",
    label: "Doc readiness",
    format: (v) =>
      ((
        ({
          excellent: "3yr returns + clean P&Ls ready",
          good: "Most records, some gaps",
          fair: "Scattered / disorganized",
          poor: "Box of receipts / unprepared",
        }) as Record<string, string>
      )[v] ??
        v) ||
      "—",
  },
  {
    key: "customerConc",
    label: "Customer concentration",
    format: (v) =>
      ((
        ({
          diversified: "Top customer <10%",
          moderate: "10–25% from top",
          concentrated: "25–50% from top",
          high_risk: "50%+ from top",
        }) as Record<string, string>
      )[v] ??
        v) ||
      "—",
  },
  { key: "employees", label: "Team size", format: (v) => v || "—" },
  {
    key: "keyMan",
    label: "Key-man independence",
    format: (v) =>
      ((
        ({
          "1": "1/5 — Everything through me",
          "2": "2/5 — Most key relationships mine",
          "3": "3/5 — Shared control",
          "4": "4/5 — Mostly independent",
          "5": "5/5 — Fully independent",
        }) as Record<string, string>
      )[v] ??
        v) ||
      "—",
  },
  {
    key: "recurringRev",
    label: "Recurring revenue",
    format: (v) =>
      ((
        ({
          high: "Over 75% recurring",
          medium_high: "50–75% recurring",
          medium: "25–50% recurring",
          low: "Under 25% recurring",
        }) as Record<string, string>
      )[v] ??
        v) ||
      "—",
  },
]

function AnswersSummary({ answers }: { answers: Record<string, string> }) {
  const answered = QUESTION_META.filter((q) => !!answers[q.key])
  if (answered.length === 0) return null

  return (
    <div
      style={{
        background: "var(--s2)",
        border: "1px solid var(--b3)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "11px 16px",
          borderBottom: "1px solid var(--b3)",
          display: "flex",
          alignItems: "center",
          gap: 7,
        }}
      >
        <svg width={11} height={11} viewBox="0 0 11 11" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}>
          <circle cx={5.5} cy={5.5} r={4.5} stroke="var(--t3)" strokeWidth={1} />
          <path d="M3.5 5.5h4M5.5 3.5v4" stroke="var(--t3)" strokeWidth={1} strokeLinecap="round" />
        </svg>
        <div
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: ".8px",
            textTransform: "uppercase",
            color: "var(--t4)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Your responses — {answered.length} of {QUESTION_META.length} answered
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {answered.map((q, i) => (
          <div
            key={q.key}
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 12,
              padding: "9px 16px",
              borderBottom: i < answered.length - 1 ? "1px solid var(--b3)" : "none",
              animation: `slideUp .35s ${i * 40}ms ease both`,
            }}
          >
            <div
              style={{
                fontSize: 11.5,
                color: "var(--t4)",
                fontFamily: "Inter, sans-serif",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              {q.label}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "var(--t2)",
                fontFamily: "Inter, sans-serif",
                textAlign: "right",
              }}
            >
              {q.format(answers[q.key] ?? "")}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────
function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 1, background: "var(--b3)" }} />
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: ".9px",
          textTransform: "uppercase",
          color: "var(--t5)",
          fontFamily: "Inter, sans-serif",
          flexShrink: 0,
        }}
      >
        {label}
      </div>
      <div style={{ flex: 1, height: 1, background: "var(--b3)" }} />
    </div>
  )
}

// ── Unlock CTA ────────────────────────────────────────────────────────────────
function UnlockCTA({
  onUnlock,
  label = "Unlock my preliminary ExitIQ report — free →",
  subtext = "Takes 30 seconds. No broker call required.",
}: {
  onUnlock: () => void
  label?: string
  subtext?: string
}) {
  return (
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
        {label}
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
      <div style={{ textAlign: "center", fontSize: 12, color: "var(--t4)", fontFamily: "Inter, sans-serif" }}>
        {subtext}
      </div>
    </div>
  )
}

// ── Bottom Unlock CTA — editorial close, visually distinct from top pill ──────
function BottomUnlockCTA({ onUnlock, label = "Unlock my full report →" }: { onUnlock: () => void; label?: string }) {
  const unlocks = [
    "Buyer objection map — addressed before your first call",
    "90-day exit prep plan — specific to this profile",
    "SBA financing snapshot — know who can actually buy",
  ]
  return (
    <div
      style={{
        border: "1px solid rgba(167,229,211,.18)",
        borderRadius: 16,
        padding: "22px 22px 18px",
        background: "rgba(16,185,129,.04)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg,transparent 25%,rgba(167,229,211,.04) 50%,transparent 75%)",
          animation: "shimmer 4s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      <div>
        <h3
          style={{
            fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
            fontSize: 21,
            fontWeight: 300,
            color: "var(--t1)",
            letterSpacing: "-.25px",
            lineHeight: 1.22,
            margin: "0 0 6px",
          }}
        >
          Buyers will see all of this before you see their offer.
        </h3>
        <p
          style={{
            fontSize: 12.5,
            color: "var(--t3)",
            lineHeight: 1.62,
            fontFamily: "Inter, sans-serif",
            margin: 0,
          }}
        >
          Every gap in your full report is a negotiating lever against you. See it first.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {unlocks.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "#10b981",
                flexShrink: 0,
                opacity: 0.75,
              }}
            />
            <span
              style={{
                fontSize: 11.5,
                color: "var(--t3)",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.45,
              }}
            >
              {item}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button
          onClick={onUnlock}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 9999,
            position: "relative",
            overflow: "hidden",
            background: "transparent",
            color: "#a7e5d3",
            fontSize: 13.5,
            fontWeight: 500,
            border: "1px solid rgba(167,229,211,.38)",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            letterSpacing: "-.05px",
            transition: "all .22s cubic-bezier(.34,1.4,.64,1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(167,229,211,.08)"
            e.currentTarget.style.borderColor = "rgba(167,229,211,.6)"
            e.currentTarget.style.boxShadow = "0 0 22px rgba(167,229,211,.1)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent"
            e.currentTarget.style.borderColor = "rgba(167,229,211,.38)"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          {label}
        </button>
        <div
          style={{
            fontSize: 10.5,
            color: "var(--t4)",
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.55,
            flexShrink: 0,
            textAlign: "right",
          }}
        >
          Free.
          <br />
          30 seconds.
        </div>
      </div>
    </div>
  )
}

// ── GateTeaserCard — shown at step 10 BEFORE email submission ────────────────
interface GateTeaserCardProps {
  derived: Derived
  answers: Record<string, string>
  onUnlock: () => void
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

export function GateTeaserCard({ derived, answers, onUnlock }: GateTeaserCardProps) {
  const { valuationRange, brokerFee, radarScores, confidence } = derived
  const industry = answers.industry ?? "your business"
  const estimatedDims = radarScores.filter((s) => s > 0).length

  return (
    <div
      key="gate-teaser"
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
          Based on {industry.toLowerCase()} market data. All {RADAR_AXES.length} axes scored — unlock your full
          diagnostic below.
        </p>
      </div>

      <UnlockCTA onUnlock={onUnlock} />

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
            $900K – $1.6M
          </div>
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
                {brokerFee.midText}
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
                Traditional broker estimate · Double Lehman
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
            Full report unlocks buyer risk scan
          </div>
        </div>
      </div>

      {/* Radar + locked rows */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <RadarChart scores={radarScores.map((s) => s / 10)} blurred={false} />
          <div
            style={{
              fontSize: 10,
              color: "rgba(167,229,211,.6)",
              fontFamily: "Inter, sans-serif",
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {estimatedDims} of {RADAR_AXES.length} axes scored
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

      <SectionDivider label="Your responses" />

      <AnswersSummary answers={answers} />

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

      <BottomUnlockCTA onUnlock={onUnlock} label="Unlock my full report →" />
    </div>
  )
}

// ── Buyer archetype section ───────────────────────────────────────────────────
const ARCHETYPE_COLORS = ["#10b981", "#a7e5d3", "#c8b8e0"] as const
const ARCHETYPE_ICONS = ["◉", "◎", "◈"] as const

function BuyerArchetypeSection({ answers }: { answers: Record<string, string> }) {
  const matches = computeBuyerMatchLikelihoods(answers)
  const maxLikelihood = Math.max(...matches.map((m) => m.likelihood))

  return (
    <div
      style={{
        background: "var(--s2)",
        border: "1px solid var(--b3)",
        borderRadius: 14,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        animation: "slideUp .45s cubic-bezier(.34,1.2,.64,1) both",
      }}
    >
      <div
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: ".8px",
          textTransform: "uppercase",
          color: "var(--t4)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Who Is Most Likely to Buy Your Business
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {matches.map(({ persona, likelihood, keyReasons }, i) => {
          const color = ARCHETYPE_COLORS[i] ?? "#a7e5d3"
          const icon = ARCHETYPE_ICONS[i] ?? "◉"
          const isTop = likelihood === maxLikelihood
          return (
            <div key={persona} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ color, fontSize: 12, lineHeight: 1 }}>{icon}</span>
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: isTop ? 600 : 400,
                      color: isTop ? color : "var(--t2)",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {persona}
                  </span>
                  {isTop && (
                    <span
                      style={{
                        fontSize: 8.5,
                        fontWeight: 700,
                        letterSpacing: ".6px",
                        textTransform: "uppercase",
                        color,
                        background: `${color}18`,
                        border: `1px solid ${color}38`,
                        borderRadius: 9999,
                        padding: "2px 7px",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      Best match
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color,
                    fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                    letterSpacing: "-.1px",
                    opacity: isTop ? 1 : 0.7,
                  }}
                >
                  {likelihood}%
                </span>
              </div>

              {/* Likelihood bar */}
              <div style={{ height: 4, borderRadius: 2, background: "var(--b3)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${likelihood}%`,
                    background: color,
                    borderRadius: 2,
                    opacity: isTop ? 0.85 : 0.45,
                    transition: "width .7s cubic-bezier(.34,1.2,.64,1)",
                  }}
                />
              </div>

              {/* Key reasons */}
              {keyReasons.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {keyReasons.map((reason) => (
                    <span
                      key={reason}
                      style={{
                        fontSize: 10,
                        color: "var(--t4)",
                        background: "var(--s1)",
                        border: "1px solid var(--b3)",
                        borderRadius: 9999,
                        padding: "2px 8px",
                        fontFamily: "Inter, sans-serif",
                        lineHeight: 1.5,
                      }}
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div
        style={{
          fontSize: 10.5,
          color: "var(--t5)",
          fontFamily: "Inter, sans-serif",
          lineHeight: 1.55,
          borderTop: "1px solid var(--b3)",
          paddingTop: 10,
        }}
      >
        Likelihoods are softmax-normalized across all three archetypes based on your profile signals.
      </div>
    </div>
  )
}

// ── PreviewCard ───────────────────────────────────────────────────────────────
interface TeaserData {
  headline?: string
  multipleContext?: string
  buyerPoolPrimary?: string
  strength1Title?: string
  strength1Desc?: string
  strength2Title?: string
  strength2Desc?: string
  risk1Title?: string
  risk1Desc?: string
  risk2Title?: string
  risk2Desc?: string
  revenueTrendSignal?: string
  teamSignal?: string
  recurringSignal?: string
  brokerFeeNarrative?: string
}

interface PreviewCardProps {
  derived: Derived
  answers: Record<string, string>
  onUnlock: () => void
  teaserData?: TeaserData | null
}

export function PreviewCard({ derived, answers, onUnlock, teaserData }: PreviewCardProps) {
  const { valuationRange, brokerFee, radarScores, confidence, industry, multiple } = derived

  const industryLabel = answers.industry ?? "Your business"
  // Headline: prefer AI-generated, fall back to computed
  const headline = teaserData?.headline ?? buildHeadline(answers)

  const doc = docReadinessSignal(answers.docReadiness ?? "")
  const team = teamSignal(answers.employees ?? "")
  const recur = recurSignal(answers.recurringRev ?? "")
  const conc = concSignal(answers.customerConc ?? "")
  const facility = facilitySignal(answers.facilityType ?? "")
  const km = keyManSig(answers.keyMan ?? "")

  const industryMultRange = industry ? `${industry.multiple[0]}–${industry.multiple[1]}×` : "—"

  // Strengths and risks: prefer AI-generated content, fall back to computed
  const computedStrengths = getStrengths(answers, radarScores, industryLabel)
  const computedRisks = getRisks(answers, radarScores)

  const strengths: { title: string; desc: string }[] = teaserData?.strength1Title
    ? [
        { title: teaserData.strength1Title ?? "", desc: teaserData.strength1Desc ?? "" },
        { title: teaserData.strength2Title ?? "", desc: teaserData.strength2Desc ?? "" },
      ]
    : computedStrengths

  const risks: { title: string; desc: string }[] = teaserData?.risk1Title
    ? [
        { title: teaserData.risk1Title ?? "", desc: teaserData.risk1Desc ?? "" },
        { title: teaserData.risk2Title ?? "", desc: teaserData.risk2Desc ?? "" },
      ]
    : computedRisks

  // Driver pill labels: prefer AI signals
  const docPillLabel = teaserData?.revenueTrendSignal ?? doc.pill.replace(/^[^ ]+ /, "")
  const teamPillLabel = teaserData?.teamSignal ?? team.pill.replace("👥 ", "")
  const recurPillLabel = teaserData?.recurringSignal ?? recur.pill.replace("🔁 ", "")

  // Buyer pool: prefer AI
  const buyerPoolText = teaserData?.buyerPoolPrimary ?? industry?.buyerLead ?? "Multiple buyer types"

  // Multiple context: prefer AI
  const multipleContextText =
    teaserData?.multipleContext ??
    (multiple ? `${multiple} SDE multiple · ${industryLabel} benchmark ${industryMultRange}` : null)

  const estimatedDims = radarScores.filter((s) => s > 0).length

  return (
    <div
      key="preview"
      className="glass-panel"
      style={{
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 22,
        animation: "slideUp .7s cubic-bezier(.34,1.1,.64,1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── SECTION 1: Report Header ─────────────────────────────────────────── */}
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
              fontWeight: 700,
              letterSpacing: ".96px",
              textTransform: "uppercase",
              color: "rgba(16,185,129,.8)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            ExitIQ Teaser Report
          </div>
        </div>
        <h2
          style={{
            fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
            fontSize: 24,
            fontWeight: 300,
            color: "var(--t1)",
            letterSpacing: "-.35px",
            lineHeight: 1.22,
            margin: 0,
          }}
        >
          {headline}
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--t3)",
            marginTop: 8,
            lineHeight: 1.65,
            fontFamily: "Inter, sans-serif",
          }}
        >
          Preliminary signal only — {estimatedDims} of {RADAR_AXES.length} diagnostic dimensions estimated. Full report
          unlocks 4 proprietary scores, a buyer objection map, and your 90-day exit prep plan.
        </p>
      </div>

      <UnlockCTA
        onUnlock={onUnlock}
        label="Get my full report — free →"
        subtext="No broker call. No sales pitch. Straight signal."
      />

      <SectionDivider label="Valuation signal" />

      {/* ── SECTION 2: Valuation Signal ──────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Top row: Est. valuation (full width) */}
        <div
          style={{
            background: "var(--s2)",
            border: "1px solid var(--b3)",
            borderRadius: 12,
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".96px",
                textTransform: "uppercase",
                color: "var(--t4)",
                fontFamily: "Inter, sans-serif",
                marginBottom: 6,
              }}
            >
              Est. Valuation Range
            </div>
            {valuationRange ? (
              <div
                style={{
                  fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                  fontSize: 26,
                  fontWeight: 300,
                  color: "var(--t1)",
                  letterSpacing: "-.2px",
                  animation: "numRoll .7s ease",
                  lineHeight: 1,
                }}
              >
                {valuationRange.text}
              </div>
            ) : (
              <div style={{ fontSize: 14, color: "var(--t5)", fontFamily: "Inter, sans-serif" }}>
                Add revenue + SDE to unlock
              </div>
            )}
            {multipleContextText && (
              <div
                style={{
                  fontSize: 11,
                  color: "#10b981",
                  fontWeight: 500,
                  marginTop: 5,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {multipleContextText}
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 4,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".7px",
                textTransform: "uppercase",
                color: "var(--t4)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Confidence
            </div>
            <div
              style={{
                fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                fontSize: 22,
                fontWeight: 300,
                color: "#10b981",
                letterSpacing: "-.15px",
              }}
            >
              {confidence}%
            </div>
            <div style={{ fontSize: 10, color: "var(--t4)", fontFamily: "Inter, sans-serif" }}>calibrated</div>
          </div>
        </div>

        {/* Bottom row: Likely buyer pool | Readiness signal */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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
                fontWeight: 700,
                letterSpacing: ".96px",
                textTransform: "uppercase",
                color: "rgba(167,229,211,.5)",
                fontFamily: "Inter, sans-serif",
                marginBottom: 6,
              }}
            >
              Likely buyer pool
            </div>
            <div style={{ fontSize: 12.5, color: "var(--t2)", fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>
              {buyerPoolText}
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
                fontWeight: 700,
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
                fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                fontSize: 20,
                fontWeight: 300,
                color: "var(--t1)",
                letterSpacing: "-.1px",
              }}
            >
              {confidence}% calibrated
            </div>
            <div style={{ fontSize: 10.5, color: "var(--t4)", fontFamily: "Inter, sans-serif", marginTop: 4 }}>
              {RADAR_AXES.length - estimatedDims} more signals improve accuracy
            </div>
          </div>
        </div>

        {/* Valuation Drivers — 3 pills */}
        <div
          style={{
            background: "var(--s2)",
            border: "1px solid var(--b3)",
            borderRadius: 12,
            padding: "13px 15px",
          }}
        >
          <div
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: ".8px",
              textTransform: "uppercase",
              color: "var(--t4)",
              fontFamily: "Inter, sans-serif",
              marginBottom: 10,
            }}
          >
            Valuation Drivers — What&apos;s Moving Your Number
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <DriverPill emoji="📋" label="Doc readiness" value={docPillLabel} status={doc.status} />
            <DriverPill emoji="👥" label="Team depth" value={teamPillLabel} status={team.status} />
            <DriverPill emoji="🔁" label="Recurring rev" value={recurPillLabel} status={recur.status} />
          </div>
        </div>
      </div>

      <SectionDivider label="Business diagnostics" />

      {/* ── SECTION 3: Business Signals Grid ─────────────────────────────────── */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {/* Left: 2×3 signal grid */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 7,
          }}
        >
          <SignalCard label="Doc Readiness" value={doc.label} status={doc.status} delay={0} />
          <SignalCard label="Customer Risk" value={conc.label} status={conc.status} delay={55} />
          <SignalCard label="Facility" value={facility.label} status={facility.status} delay={110} />
          <SignalCard label="Recurring Rev" value={recur.label} status={recur.status} delay={165} />
          <SignalCard label="Independence" value={km.label} status={km.status} delay={220} />
          <SignalCard
            label="Industry Multiple"
            value={industry ? industryMultRange : "—"}
            status={industry ? "neutral" : "neutral"}
            delay={275}
          />
        </div>

        {/* Right: blurred radar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <RadarChart scores={radarScores.map((s) => s / 10)} blurred={true} />
          <div
            style={{
              fontSize: 9.5,
              color: "var(--t4)",
              fontFamily: "Inter, sans-serif",
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {estimatedDims} of {RADAR_AXES.length} axes estimated
          </div>
        </div>
      </div>

      <SectionDivider label="Buyer archetype match" />

      {/* ── SECTION 3b: Buyer Archetype Likelihoods ──────────────────────────── */}
      <BuyerArchetypeSection answers={answers} />

      <SectionDivider label="Strengths & risks" />

      {/* ── SECTION 4: Strengths & Risks ─────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {strengths.map((s, i) => (
          <InsightCard key={i} type="strength" title={s.title} desc={s.desc} delay={i * 80} />
        ))}
        {risks.map((r, i) => (
          <InsightCard key={i} type="risk" title={r.title} desc={r.desc} delay={i * 80 + 160} />
        ))}
      </div>

      <SectionDivider label="Fee exposure" />

      {/* ── SECTION 5: Broker Fee Callout ────────────────────────────────────── */}
      <div
        style={{
          background: "rgba(244,197,168,.07)",
          border: "1px solid rgba(244,197,168,.2)",
          borderRadius: 14,
          padding: "18px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,.025) 50%,transparent 70%)",
            animation: "shimmer 3.5s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".96px",
            textTransform: "uppercase",
            color: "rgba(244,197,168,.5)",
            fontFamily: "Inter, sans-serif",
            marginBottom: 8,
          }}
        >
          Traditional Broker Fee{brokerFee ? ` (~${brokerFee.blendedPct}% blended)` : ""}
        </div>
        {brokerFee ? (
          <>
            <div
              style={{
                fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                fontSize: 30,
                fontWeight: 300,
                color: "#f4c5a8",
                letterSpacing: "-.25px",
                animation: "numRoll .7s ease",
                lineHeight: 1,
                marginBottom: 10,
              }}
            >
              {brokerFee.midText}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--t3)",
                lineHeight: 1.65,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {teaserData?.brokerFeeNarrative ? (
                <span style={{ color: "#a7e5d3", fontWeight: 500 }}>{teaserData.brokerFeeNarrative}</span>
              ) : (
                <>
                  Scorta replaces this with a hybrid model: $5–10K retainer + 2.5–4% capped success fee —{" "}
                  <span style={{ color: "#a7e5d3", fontWeight: 500 }}>
                    sellers keep most of that {fmtMoney(brokerFee.midFee)} at close.
                  </span>{" "}
                  No listing commission. No exit tax at the finish line.
                </>
              )}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 13, color: "var(--t4)", fontFamily: "Inter, sans-serif" }}>
            Add revenue to estimate your broker fee exposure
          </div>
        )}
      </div>

      {/* Pain callout */}
      <div
        style={{
          background: "var(--s2)",
          border: "1px solid var(--b3)",
          borderRadius: 12,
          padding: "13px 16px",
          fontSize: 13,
          color: "var(--t3)",
          lineHeight: 1.65,
          fontFamily: "Inter, sans-serif",
        }}
      >
        Most owners only discover their real buyer objections{" "}
        <span style={{ color: "var(--t2)", fontWeight: 500 }}>after their first buyer call</span> — when it&apos;s too
        late to fix them. ExitIQ surfaces every risk before you list, so you control the narrative.
      </div>

      <SectionDivider label="What unlocks" />

      {/* ── SECTION 6: Future Unlocks ─────────────────────────────────────────── */}
      <UnlockList />

      {/* ── SECTION 7: CTA ───────────────────────────────────────────────────── */}
      <BottomUnlockCTA onUnlock={onUnlock} label="Get my full report →" />
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
            Unlock your ExitIQ Report.
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
