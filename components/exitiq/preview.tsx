// use client: uses useState for radar chart draw sequence and form field state in EmailGateModal
"use client"

import React from "react"
import { workflowTraceClient } from "@/lib/debug/workflow-trace-client"
import type { Derived, SdeMarginCheck } from "@/lib/exitiq/calculations"
import { computeBuyerMatchLikelihoods, fmtMoney } from "@/lib/exitiq/calculations"
import { RADAR_AXES } from "@/lib/exitiq/data"
import { RadarChart } from "./radar"
import { ScanLine } from "./ui"

// ── Signal types & helpers ─────────────────────────────────────────────────────
type Status = "bull" | "neutral" | "risk"

// Strip a trailing plural "s" from the last word so a list-style buyerLead
// ("RIA consolidators") reads as an adjective phrase ("RIA consolidator profile").
// Leaves words ending in "ss", "us", or "is" alone, and no-ops on empty input.
function singularizePhrase(phrase: string): string {
  const trimmed = phrase.trim()
  if (!trimmed) return ""
  const words = trimmed.split(/\s+/)
  const lastIdx = words.length - 1
  const last = words[lastIdx]!
  if (/[a-z]s$/.test(last) && !/(ss|us|is)$/i.test(last)) {
    words[lastIdx] = last.slice(0, -1)
  }
  return words.join(" ")
}

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
// Shared implementation lives in ./radar.tsx — preview imports it above.

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

// ── Exit Readiness Score hero ─────────────────────────────────────────────────
function ExitReadinessHero({
  score,
  grade,
  industry,
}: {
  score: number
  grade: "A" | "B" | "C" | "D" | "—"
  industry: string
}) {
  const hasScore = score > 0

  // Colour ramp: A=mint, B=sky-blue, C=amber, D=peach-red
  const gradeColor =
    grade === "A" ? "#10b981"
    : grade === "B" ? "#60a5fa"
    : grade === "C" ? "#fbbf24"
    : grade === "D" ? "#f87171"
    : "var(--t4)"

  const gradeGlow =
    grade === "A" ? "rgba(16,185,129,.35)"
    : grade === "B" ? "rgba(96,165,250,.35)"
    : grade === "C" ? "rgba(251,191,36,.35)"
    : grade === "D" ? "rgba(248,113,113,.35)"
    : "transparent"

  const gradeLabel =
    grade === "A" ? "Market-ready"
    : grade === "B" ? "Mostly ready"
    : grade === "C" ? "Needs prep"
    : grade === "D" ? "Significant gaps"
    : "Calculating…"

  // Log the exit readiness score the seller is about to see immediately before the email gate.
  // Fires only when the score actually resolves (score > 0) and re-fires on any recalculation.
  // Correlated with the post-gate report composite via the next persistSession call.
  React.useEffect(() => {
    if (!hasScore) return
    workflowTraceClient({
      phase: "client.pre_gate_exit_readiness_shown",
      origin: "preview.ExitReadinessHero",
      detail: {
        exitReadinessScore: score,
        exitReadinessGrade: grade,
        industry,
        gradeLabel,
      },
    })
  }, [score, grade, industry, hasScore, gradeLabel])

  // SVG arc: radius 54, circumference = 2π×54 ≈ 339.3. Offset to leave a gap at the bottom.
  // We use 75% of the full circle (270°), starting from the left (225° in SVG coords).
  const R = 54
  const CIRC = 2 * Math.PI * R
  const ARC_FRACTION = 0.75           // 270° sweep
  const arcLen = CIRC * ARC_FRACTION  // the drawn portion
  // dashoffset = arcLen × (1 - score/100) fills proportionally from the start
  const fillLen = arcLen * (score / 100)
  const dashOffset = arcLen - fillLen

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        animation: "slideUp .6s cubic-bezier(.34,1.1,.64,1) both",
      }}
    >
      {/* Live pill */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#10b981",
            boxShadow: "0 0 10px rgba(16,185,129,.9)",
            animation: "liveBlink 2s infinite",
            flexShrink: 0,
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
          ExitIQ Preview · {industry}
        </div>
      </div>

      {/* Score + arc row */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* Arc gauge */}
        <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0 }}>
          <svg width={130} height={130} viewBox="0 0 130 130" style={{ overflow: "visible" }}>
            {/* Track arc */}
            <circle
              cx={65}
              cy={65}
              r={R}
              fill="none"
              stroke="var(--b3)"
              strokeWidth={10}
              strokeDasharray={`${arcLen} ${CIRC}`}
              strokeDashoffset={-(CIRC - arcLen) / 2 - CIRC * 0.125}
              strokeLinecap="round"
            />
            {/* Fill arc */}
            {hasScore && (
              <circle
                cx={65}
                cy={65}
                r={R}
                fill="none"
                stroke={gradeColor}
                strokeWidth={10}
                strokeDasharray={`${fillLen} ${CIRC}`}
                strokeDashoffset={-(CIRC - arcLen) / 2 - CIRC * 0.125}
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 6px ${gradeGlow})`,
                  transition: "stroke-dasharray .9s cubic-bezier(.34,1.1,.64,1)",
                }}
              />
            )}
          </svg>
          {/* Centre text */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              paddingBottom: 8,
            }}
          >
            <div
              style={{
                fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                fontSize: hasScore ? 32 : 22,
                fontWeight: 300,
                color: hasScore ? gradeColor : "var(--t4)",
                letterSpacing: "-1px",
                lineHeight: 1,
                animation: hasScore ? "numRoll .8s ease" : undefined,
              }}
            >
              {hasScore ? `${score}%` : "—"}
            </div>
            <div
              style={{
                fontSize: 8.5,
                fontWeight: 700,
                letterSpacing: ".8px",
                textTransform: "uppercase",
                color: "var(--t4)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              readiness
            </div>
          </div>
        </div>

        {/* Right: headline + grade badge + descriptor */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
              fontSize: 26,
              fontWeight: 300,
              color: "var(--t1)",
              letterSpacing: "-.35px",
              lineHeight: 1.18,
              marginBottom: 8,
            }}
          >
            {hasScore ? "Your exit readiness score." : "Your valuation signal is forming."}
          </div>

          {/* Grade badge + label */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: `${gradeColor}18`,
                border: `1.5px solid ${gradeColor}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: hasScore ? `0 0 12px ${gradeGlow}` : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                  fontSize: 20,
                  fontWeight: 400,
                  color: gradeColor,
                  lineHeight: 1,
                }}
              >
                {grade}
              </span>
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--t2)",
                  fontFamily: "Inter, sans-serif",
                  lineHeight: 1.3,
                }}
              >
                {gradeLabel}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--t4)",
                  fontFamily: "Inter, sans-serif",
                  marginTop: 2,
                }}
              >
                Based on {RADAR_AXES.length} weighted dimensions
              </div>
            </div>
          </div>

          <p
            style={{
              fontSize: 12.5,
              color: "var(--t3)",
              lineHeight: 1.62,
              fontFamily: "Inter, sans-serif",
              margin: 0,
            }}
          >
            All {RADAR_AXES.length} axes scored — unlock your full diagnostic, buyer objection map, and 90-day exit plan below.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── SDE / Revenue margin sanity banner ───────────────────────────────────────
function SdeMarginBanner({ check }: { check: SdeMarginCheck }) {
  const isRed = check.status === "red"
  const isYellow = check.status === "yellow"
  const isGreen = check.status === "green"

  const colors = isRed
    ? { bg: "rgba(239,68,68,.07)", border: "rgba(239,68,68,.22)", icon: "#ef4444", badge: "rgba(239,68,68,.15)", badgeBorder: "rgba(239,68,68,.3)", badgeText: "rgba(252,165,165,.9)", text: "rgba(252,165,165,.8)" }
    : isYellow
      ? { bg: "rgba(251,191,36,.06)", border: "rgba(251,191,36,.22)", icon: "#fbbf24", badge: "rgba(251,191,36,.12)", badgeBorder: "rgba(251,191,36,.28)", badgeText: "rgba(253,230,138,.9)", text: "rgba(253,230,138,.75)" }
      : { bg: "rgba(16,185,129,.05)", border: "rgba(16,185,129,.18)", icon: "#10b981", badge: "rgba(16,185,129,.1)", badgeBorder: "rgba(16,185,129,.25)", badgeText: "rgba(167,229,211,.9)", text: "rgba(167,229,211,.7)" }

  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: "13px 15px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        animation: "slideUp .45s cubic-bezier(.34,1.2,.64,1) both",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Icon */}
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: colors.badge,
              border: `1px solid ${colors.badgeBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {isGreen ? (
              <svg width={11} height={11} viewBox="0 0 11 11" fill="none">
                <path d="M2 5.5L4.5 8L9 3" stroke={colors.icon} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : isYellow ? (
              <svg width={11} height={11} viewBox="0 0 11 11" fill="none">
                <path d="M5.5 2v4M5.5 8.5v.5" stroke={colors.icon} strokeWidth={1.5} strokeLinecap="round" />
              </svg>
            ) : (
              <svg width={11} height={11} viewBox="0 0 11 11" fill="none">
                <path d="M5.5 2v4M5.5 8.5v.5" stroke={colors.icon} strokeWidth={1.5} strokeLinecap="round" />
              </svg>
            )}
          </div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: ".8px",
              textTransform: "uppercase",
              color: "var(--t4)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            SDE / Revenue Check
          </div>
        </div>
        {/* Margin + status badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
              fontSize: 15,
              fontWeight: 400,
              color: colors.icon,
              letterSpacing: "-.1px",
            }}
          >
            {check.pct}
          </span>
          <span
            style={{
              fontSize: 8.5,
              fontWeight: 700,
              letterSpacing: ".7px",
              textTransform: "uppercase",
              color: colors.badgeText,
              background: colors.badge,
              border: `1px solid ${colors.badgeBorder}`,
              borderRadius: 9999,
              padding: "2px 7px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {check.headline}
          </span>
        </div>
      </div>
      {/* Message */}
      <div
        style={{
          fontSize: 11.5,
          color: "var(--t3)",
          lineHeight: 1.6,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {check.message}
        {(isRed || isYellow) && (
          <span style={{ color: colors.text, fontWeight: 500 }}> Review your revenue and SDE figures before going to market.</span>
        )}
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
  const { valuationRange, brokerFee, radarScores, confidence, exitReadinessScore, exitReadinessGrade } = derived
  const industry = answers.industry ?? "your business"
  const estimatedDims = radarScores.filter((s) => s > 0).length

  // Top archetype from the same scoring used by the right-rail Buyer Archetype Match,
  // so the two tiles stay in lock-step.
  const buyerMatches = computeBuyerMatchLikelihoods(answers)
  const topBuyer = buyerMatches.reduce((best, m) => (m.likelihood > best.likelihood ? m : best), buyerMatches[0]!)
  const buyerLeadPhrase = singularizePhrase(derived.industry?.buyerLead ?? "")

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
      {/* ── Exit Readiness Score hero ── */}
      <ExitReadinessHero
        score={exitReadinessScore}
        grade={exitReadinessGrade}
        industry={industry}
      />

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
          {valuationRange ? (
            <>
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
            </>
          ) : (
            <div style={{ fontSize: 13, color: "var(--t5)", fontFamily: "Inter, sans-serif" }}>
              Add revenue to estimate
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
            {topBuyer?.persona ?? "Multiple buyer types"}
          </div>
          <div style={{ fontSize: 10, color: "var(--t4)", fontFamily: "Inter, sans-serif", marginTop: 3 }}>
            {buyerLeadPhrase ? `${buyerLeadPhrase} profile` : "Mixed buyer profile"}
            {topBuyer ? ` · ${topBuyer.likelihood}% match` : ""}
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

      {/* SDE / Revenue margin sanity check — only shown when both revenue + SDE answered */}
      {derived.sdeMarginCheck && (
        <>
          <SectionDivider label="Margin check" />
          <SdeMarginBanner check={derived.sdeMarginCheck} />
        </>
      )}

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
