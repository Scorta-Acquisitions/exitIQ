"use client"

import React from "react"
import {
  CUSTOMER_CONC_OPTIONS,
  DOC_READINESS_OPTIONS,
  EMPLOYEE_OPTIONS,
  FACILITY_TYPE_OPTIONS,
  INDUSTRY_MULTIPLES,
  KEY_MAN_OPTIONS,
  RECURRING_REV_OPTIONS,
  REVENUE_RANGES,
  SDE_RANGES,
  YEAR_OPTIONS,
} from "@/lib/exitiq/data"
import { ProcessingDots, ScanLine } from "./ui"

// ── Phase info ────────────────────────────────────────────────────────────────
const PHASES = [
  { phase: 1, label: "Business Identity", start: 0, end: 2, total: 3 },
  { phase: 2, label: "Financial Snapshot", start: 3, end: 6, total: 4 },
  { phase: 3, label: "Operational Profile", start: 7, end: 9, total: 3 },
] as const

function getPhaseInfo(step: number) {
  const info = PHASES.find((p) => step >= p.start && step <= p.end) ?? PHASES[0]!
  return { ...info, stepInPhase: step - info.start }
}

// ── Step label with phase context ─────────────────────────────────────────────
function StepLabel({ step }: { step: number }) {
  const { phase, label, total, stepInPhase } = getPhaseInfo(step)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Phase pills */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {PHASES.map((p) => (
          <div
            key={p.phase}
            style={{
              height: 20,
              padding: "0 9px",
              borderRadius: 9999,
              background:
                p.phase < phase ? "rgba(16,185,129,.18)" : p.phase === phase ? "rgba(16,185,129,.12)" : "var(--s1)",
              border: `1px solid ${p.phase <= phase ? "rgba(16,185,129,.35)" : "var(--b3)"}`,
              display: "flex",
              alignItems: "center",
              gap: 5,
              transition: "all .4s ease",
            }}
          >
            {p.phase < phase && (
              <svg width={8} height={8} viewBox="0 0 8 8" fill="none">
                <path
                  d="M1.5 4l2 2 3-3"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: ".7px",
                textTransform: "uppercase",
                color:
                  p.phase < phase ? "rgba(16,185,129,.7)" : p.phase === phase ? "rgba(16,185,129,.9)" : "var(--t4)",
                fontFamily: "Inter, sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {p.label}
            </span>
          </div>
        ))}
      </div>

      {/* Within-phase progress bars */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 5, flex: 1 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 2,
                borderRadius: 9999,
                background: i < stepInPhase ? "#10b981" : i === stepInPhase ? "rgba(16,185,129,.38)" : "var(--s1)",
                boxShadow: i < stepInPhase ? "0 0 6px rgba(16,185,129,.55)" : "none",
                transition: "background .6s ease, box-shadow .6s ease",
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "var(--t4)",
            fontFamily: "Inter, sans-serif",
            whiteSpace: "nowrap",
            marginLeft: 4,
          }}
        >
          {label} {stepInPhase + 1}/{total}
        </div>
      </div>
    </div>
  )
}

function QHead({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
        fontSize: 22,
        fontWeight: 300,
        color: "var(--t1)",
        lineHeight: 1.28,
        letterSpacing: "-.2px",
      }}
    >
      {children}
    </div>
  )
}

function QSub({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 13,
        color: "var(--t3)",
        fontFamily: "Inter, sans-serif",
        lineHeight: 1.5,
        marginTop: -10,
      }}
    >
      {children}
    </div>
  )
}

// ── Radio card list (reusable) ────────────────────────────────────────────────
function RadioCardList({
  options,
  onAnswer,
  disabled,
  accentColor = "#10b981",
  accentRgb = "16,185,129",
}: {
  options: { value: string; label: string; sub?: string }[]
  onAnswer: (v: string, e: React.MouseEvent) => void
  disabled: boolean
  accentColor?: string
  accentRgb?: string
}) {
  const [hover, setHover] = React.useState<string | null>(null)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {options.map(({ value, label, sub }, i) => (
        <button
          key={value}
          onClick={(e) => !disabled && onAnswer(value, e)}
          onMouseEnter={() => setHover(value)}
          onMouseLeave={() => setHover(null)}
          style={{
            padding: "14px 18px",
            textAlign: "left",
            cursor: disabled ? "default" : "pointer",
            background: hover === value ? `rgba(${accentRgb},.09)` : "var(--s2)",
            border: `1px solid ${hover === value ? `rgba(${accentRgb},.38)` : "var(--b3)"}`,
            borderRadius: 12,
            transition: "all .22s cubic-bezier(.34,1.4,.64,1)",
            animation: `chipFloat .5s ${i * 60}ms cubic-bezier(.34,1.3,.64,1) both`,
            transform: hover === value ? "translateX(4px)" : "none",
          }}
        >
          <div
            style={{
              fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
              fontSize: 18,
              fontWeight: 300,
              color: hover === value ? accentColor : "var(--t1)",
              letterSpacing: "-.2px",
              transition: "color .2s",
            }}
          >
            {label}
          </div>
          {sub && (
            <div
              style={{
                fontSize: 11,
                color: hover === value ? `rgba(${accentRgb},.65)` : "var(--t4)",
                marginTop: 3,
                fontFamily: "Inter, sans-serif",
                transition: "color .2s",
              }}
            >
              {sub}
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

// ── Q1: Industry chips ────────────────────────────────────────────────────────
function Q1Industry({ onAnswer, disabled }: { onAnswer: (v: string, e: React.MouseEvent) => void; disabled: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <QHead>What type of business do you own?</QHead>
      <QSub>Select the category that best fits — we use this to benchmark your buyer market and multiple range.</QSub>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {Object.keys(INDUSTRY_MULTIPLES).map((label, i) => (
          <button
            key={label}
            onClick={(e) => !disabled && onAnswer(label, e)}
            style={{
              padding: "10px 18px",
              background: "var(--s1)",
              border: "1px solid var(--b2)",
              borderRadius: 9999,
              color: "var(--t2)",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "Inter, sans-serif",
              cursor: disabled ? "default" : "pointer",
              animation: `chipFloat .55s ${i * 50}ms cubic-bezier(.34,1.3,.64,1) both`,
              transition: "all .22s cubic-bezier(.34,1.56,.64,1)",
            }}
            onMouseEnter={(e) => {
              if (disabled) return
              const el = e.currentTarget
              el.style.background = "rgba(16,185,129,.14)"
              el.style.borderColor = "rgba(16,185,129,.5)"
              el.style.color = "#10b981"
              el.style.transform = "translateY(-2px) scale(1.04)"
              el.style.boxShadow = "0 0 18px rgba(16,185,129,.15)"
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.background = "var(--s1)"
              el.style.borderColor = "var(--b2)"
              el.style.color = "var(--t2)"
              el.style.transform = "none"
              el.style.boxShadow = "none"
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Q2: Years slider ──────────────────────────────────────────────────────────
function Q2Years({ onAnswer, disabled }: { onAnswer: (v: string, e: React.MouseEvent) => void; disabled: boolean }) {
  const [val, setVal] = React.useState(5)
  const yearIdx = val <= 1 ? 0 : val <= 5 ? 1 : val <= 10 ? 2 : 3
  const currentOpt = YEAR_OPTIONS[yearIdx]
  const pct = (val - 1) / 24

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <QHead>How long have you been in business?</QHead>
      <QSub>
        Longevity is one of the strongest buyer confidence signals — it shows the business can survive cycles.
      </QSub>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div
            style={{
              fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
              fontSize: 36,
              fontWeight: 300,
              color: "var(--t1)",
              letterSpacing: "-.5px",
            }}
          >
            {val === 25 ? "25+ years" : `${val} ${val === 1 ? "year" : "years"}`}
          </div>
          <div
            style={{ fontSize: 12, fontWeight: 500, color: "rgba(167,229,211,.7)", fontFamily: "Inter, sans-serif" }}
          >
            {currentOpt?.label}
          </div>
        </div>

        <div style={{ position: "relative", height: 40, display: "flex", alignItems: "center" }}>
          <div
            style={{ position: "absolute", left: 0, right: 0, height: 4, borderRadius: 9999, background: "var(--s1)" }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              width: `${pct * 100}%`,
              height: 4,
              borderRadius: 9999,
              background: "linear-gradient(90deg,#a7e5d3,#10b981)",
              boxShadow: "0 0 10px rgba(16,185,129,.5)",
              transition: "width .15s ease",
            }}
          />
          <input
            type="range"
            min={1}
            max={25}
            value={val}
            onChange={(e) => setVal(Number(e.target.value))}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              width: "100%",
              margin: 0,
              opacity: 0,
              cursor: "pointer",
              height: 40,
              zIndex: 2,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: `calc(${pct * 100}% - 10px)`,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "var(--btn-bg)",
              boxShadow: "0 0 14px rgba(16,185,129,.55), 0 2px 8px rgba(0,0,0,.35)",
              transition: "left .15s ease",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        </div>

        <div style={{ position: "relative", height: 16 }}>
          {([1, 5, 10, 15, 25] as const).map((yr, i) => {
            const pctTick = (yr - 1) / 24
            const label = yr === 25 ? "25yr+" : `${yr}yr`
            const transform = i === 0 ? "translateX(0%)" : i === 4 ? "translateX(-100%)" : "translateX(-50%)"
            return (
              <div
                key={yr}
                style={{
                  position: "absolute",
                  left: `${pctTick * 100}%`,
                  fontSize: 10,
                  color: "var(--t4)",
                  fontFamily: "Inter, sans-serif",
                  transform,
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </div>
            )
          })}
        </div>
      </div>

      <button
        onClick={(e) => !disabled && currentOpt && onAnswer(currentOpt.label, e)}
        disabled={disabled}
        style={{
          alignSelf: "flex-start",
          height: 40,
          padding: "0 24px",
          background: "var(--s1)",
          border: "1px solid var(--b1)",
          borderRadius: 9999,
          color: "var(--t2)",
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "Inter, sans-serif",
          cursor: disabled ? "default" : "pointer",
          transition: "all .2s",
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.background = "rgba(167,229,211,.15)"
            e.currentTarget.style.borderColor = "rgba(167,229,211,.4)"
            e.currentTarget.style.color = "#a7e5d3"
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--s1)"
          e.currentTarget.style.borderColor = "var(--b1)"
          e.currentTarget.style.color = "var(--t2)"
        }}
      >
        Confirm → {currentOpt?.label}
      </button>
    </div>
  )
}

// ── Q3: Facility type ─────────────────────────────────────────────────────────
function Q3FacilityType({
  onAnswer,
  disabled,
}: {
  onAnswer: (v: string, e: React.MouseEvent) => void
  disabled: boolean
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <QHead>What is your facility situation?</QHead>
      <QSub>
        Lease terms and property ownership are scrutinized in SBA pre-screens and buyer due diligence — they directly
        affect your deal structure options.
      </QSub>
      <RadioCardList
        options={FACILITY_TYPE_OPTIONS}
        onAnswer={onAnswer}
        disabled={disabled}
        accentColor="#10b981"
        accentRgb="16,185,129"
      />
    </div>
  )
}

// ── Q4: Revenue range cards ───────────────────────────────────────────────────
function Q4Revenue({ onAnswer, disabled }: { onAnswer: (v: string, e: React.MouseEvent) => void; disabled: boolean }) {
  const [hover, setHover] = React.useState<number | null>(null)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <QHead>What is your annual revenue?</QHead>
      <QSub>Your revenue tier determines which buyer types are actively competing for businesses like yours.</QSub>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {REVENUE_RANGES.map(({ label }, i) => (
          <button
            key={label}
            onClick={(e) => !disabled && onAnswer(label, e)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{
              padding: "14px 16px",
              textAlign: "left",
              cursor: disabled ? "default" : "pointer",
              background: hover === i ? "rgba(16,185,129,.1)" : "var(--s2)",
              border: `1px solid ${hover === i ? "rgba(16,185,129,.45)" : "var(--b3)"}`,
              borderRadius: 12,
              transition: "all .22s cubic-bezier(.34,1.4,.64,1)",
              animation: `chipFloat .5s ${i * 60}ms cubic-bezier(.34,1.3,.64,1) both`,
              transform: hover === i ? "translateY(-2px) scale(1.02)" : "none",
              boxShadow: hover === i ? "0 0 20px rgba(16,185,129,.12)" : "none",
            }}
          >
            <div
              style={{
                fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                fontSize: 18,
                fontWeight: 300,
                color: hover === i ? "#10b981" : "var(--t1)",
                letterSpacing: "-.2px",
                transition: "color .2s",
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: 11, color: "var(--t4)", marginTop: 3, fontFamily: "Inter, sans-serif" }}>
              annual revenue
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Q5: SDE range cards + tooltip ─────────────────────────────────────────────
function Q5SDE({ onAnswer, disabled }: { onAnswer: (v: string, e: React.MouseEvent) => void; disabled: boolean }) {
  const [hover, setHover] = React.useState<number | null>(null)
  const [showTip, setShowTip] = React.useState(false)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <QHead>What is your annual SDE?</QHead>
        <button
          onClick={() => setShowTip((t) => !t)}
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "var(--s1)",
            border: "1px solid var(--b2)",
            color: "var(--t3)",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontFamily: "Inter, sans-serif",
          }}
        >
          ?
        </button>
      </div>

      {showTip && (
        <div
          style={{
            background: "var(--s2)",
            border: "1px solid var(--b3)",
            borderRadius: 12,
            padding: "14px 16px",
            fontSize: 13,
            color: "var(--t2)",
            lineHeight: 1.6,
            fontFamily: "Inter, sans-serif",
            animation: "slideUp .3s ease",
          }}
        >
          <strong style={{ color: "var(--t1)", display: "block", marginBottom: 4 }}>
            Seller&rsquo;s Discretionary Earnings (SDE)
          </strong>
          SDE is your net profit plus owner compensation, personal expenses run through the business, and one-time
          costs. It represents the true economic benefit of owning the business — and is the primary metric buyers use
          to calculate your valuation.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {SDE_RANGES.map(({ label }, i) => (
          <button
            key={label}
            onClick={(e) => !disabled && onAnswer(label, e)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{
              padding: "14px 16px",
              textAlign: "left",
              cursor: disabled ? "default" : "pointer",
              background: hover === i ? "rgba(200,184,224,.1)" : "var(--s2)",
              border: `1px solid ${hover === i ? "rgba(200,184,224,.4)" : "var(--b3)"}`,
              borderRadius: 12,
              transition: "all .22s cubic-bezier(.34,1.4,.64,1)",
              animation: `chipFloat .5s ${i * 65}ms cubic-bezier(.34,1.3,.64,1) both`,
              transform: hover === i ? "translateY(-2px) scale(1.02)" : "none",
              boxShadow: hover === i ? "0 0 20px rgba(200,184,224,.12)" : "none",
            }}
          >
            <div
              style={{
                fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                fontSize: 18,
                fontWeight: 300,
                color: hover === i ? "#c8b8e0" : "var(--t1)",
                letterSpacing: "-.2px",
                transition: "color .2s",
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: 11, color: "var(--t4)", marginTop: 3, fontFamily: "Inter, sans-serif" }}>
              seller&rsquo;s discretionary earnings
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Q6: Documentation readiness ──────────────────────────────────────────────
function Q6DocReadiness({
  onAnswer,
  disabled,
}: {
  onAnswer: (v: string, e: React.MouseEvent) => void
  disabled: boolean
}) {
  const scoreLabels: Record<string, string> = { excellent: "10 / 10", good: "7 / 10", fair: "4 / 10", poor: "1 / 10" }
  const scoreColors: Record<string, string> = {
    excellent: "#10b981",
    good: "#a7e5d3",
    fair: "#eab308",
    poor: "#ef4444",
  }
  const [hover, setHover] = React.useState<string | null>(null)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <QHead>How prepared are your financial records for a buyer or lender review?</QHead>
      <QSub>
        Financial documentation is the #1 deal facilitator — and the #1 deal killer when missing. Be honest.
      </QSub>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {DOC_READINESS_OPTIONS.map(({ value, label, sub }, i) => (
          <button
            key={value}
            onClick={(e) => !disabled && onAnswer(value, e)}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(null)}
            style={{
              padding: "14px 18px",
              textAlign: "left",
              cursor: disabled ? "default" : "pointer",
              background: hover === value ? "rgba(16,185,129,.09)" : "var(--s2)",
              border: `1px solid ${hover === value ? "rgba(16,185,129,.38)" : "var(--b3)"}`,
              borderRadius: 12,
              transition: "all .22s cubic-bezier(.34,1.4,.64,1)",
              animation: `chipFloat .5s ${i * 60}ms cubic-bezier(.34,1.3,.64,1) both`,
              transform: hover === value ? "translateX(4px)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                  fontSize: 17,
                  fontWeight: 300,
                  color: hover === value ? "#10b981" : "var(--t1)",
                  letterSpacing: "-.2px",
                  transition: "color .2s",
                }}
              >
                {label}
              </div>
              {sub && (
                <div
                  style={{
                    fontSize: 11,
                    color: hover === value ? "rgba(16,185,129,.65)" : "var(--t4)",
                    marginTop: 3,
                    fontFamily: "Inter, sans-serif",
                    transition: "color .2s",
                  }}
                >
                  {sub}
                </div>
              )}
            </div>
            <div
              style={{
                flexShrink: 0,
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                color: scoreColors[value] ?? "var(--t4)",
                opacity: hover === value ? 1 : 0.6,
                transition: "opacity .2s",
              }}
            >
              {scoreLabels[value]}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Q7: Customer concentration ────────────────────────────────────────────────
function Q7CustomerConc({
  onAnswer,
  disabled,
}: {
  onAnswer: (v: string, e: React.MouseEvent) => void
  disabled: boolean
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <QHead>What percentage of revenue comes from your top customer?</QHead>
      <QSub>High customer concentration is the #2 concern for most buyers — after owner dependency.</QSub>
      <RadioCardList
        options={CUSTOMER_CONC_OPTIONS}
        onAnswer={onAnswer}
        disabled={disabled}
        accentColor="#a7e5d3"
        accentRgb="167,229,211"
      />
    </div>
  )
}

// ── Q8: Employee dot cards ────────────────────────────────────────────────────
function EmployeeDots({ count, color }: { count: number; color?: string }) {
  const MAX = 25
  const shown = Math.min(count, MAX)
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 6 }}>
      {Array.from({ length: shown }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: color ?? "rgba(167,229,211,.7)",
            boxShadow: "0 0 4px rgba(167,229,211,.5)",
            animation: `chipFloat .4s ${i * 20}ms cubic-bezier(.34,1.4,.64,1) both`,
          }}
        />
      ))}
      {count > MAX && (
        <div style={{ fontSize: 9, color: "var(--t4)", alignSelf: "center", marginLeft: 2, fontFamily: "Inter" }}>
          +{count - MAX}
        </div>
      )}
    </div>
  )
}

function Q8Employees({
  onAnswer,
  disabled,
}: {
  onAnswer: (v: string, e: React.MouseEvent) => void
  disabled: boolean
}) {
  const [hover, setHover] = React.useState<number | null>(null)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <QHead>How many employees do you have?</QHead>
      <QSub>Team size affects transferability and the type of buyer who can realistically operate your business.</QSub>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {EMPLOYEE_OPTIONS.map(({ label, dots }, i) => (
          <button
            key={label}
            onClick={(e) => !disabled && onAnswer(label, e)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{
              padding: "14px 18px",
              textAlign: "left",
              cursor: disabled ? "default" : "pointer",
              background: hover === i ? "rgba(168,200,232,.08)" : "var(--s2)",
              border: `1px solid ${hover === i ? "rgba(168,200,232,.38)" : "var(--b3)"}`,
              borderRadius: 12,
              transition: "all .22s cubic-bezier(.34,1.4,.64,1)",
              animation: `chipFloat .5s ${i * 55}ms cubic-bezier(.34,1.3,.64,1) both`,
              transform: hover === i ? "translateX(4px)" : "none",
            }}
          >
            <div
              style={{
                fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                fontSize: 20,
                fontWeight: 300,
                color: hover === i ? "#a8c8e8" : "var(--t1)",
                letterSpacing: "-.2px",
                transition: "color .2s",
              }}
            >
              {label}
            </div>
            <EmployeeDots count={dots} color={hover === i ? "#a8c8e8" : undefined} />
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Q9: Key-man dependency ────────────────────────────────────────────────────
function Q9KeyMan({ onAnswer, disabled }: { onAnswer: (v: string, e: React.MouseEvent) => void; disabled: boolean }) {
  const [hover, setHover] = React.useState<string | null>(null)

  const scaleColors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#10b981"]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <QHead>If you stepped away for 3 months, what would happen?</QHead>
      <QSub>This measures operational independence — the single biggest driver of buyer confidence and multiple.</QSub>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {KEY_MAN_OPTIONS.map(({ value, label, sub }, i) => (
          <button
            key={value}
            onClick={(e) => !disabled && onAnswer(value, e)}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(null)}
            style={{
              padding: "13px 18px",
              textAlign: "left",
              cursor: disabled ? "default" : "pointer",
              background:
                hover === value
                  ? `rgba(${scaleColors[i] === "#10b981" ? "16,185,129" : "168,168,168"},.08)`
                  : "var(--s2)",
              border: `1px solid ${hover === value ? `${scaleColors[i]}55` : "var(--b3)"}`,
              borderRadius: 12,
              transition: "all .22s cubic-bezier(.34,1.4,.64,1)",
              animation: `chipFloat .5s ${i * 55}ms cubic-bezier(.34,1.3,.64,1) both`,
              transform: hover === value ? "translateX(4px)" : "none",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: hover === value ? scaleColors[i] : "var(--s1)",
                border: `1.5px solid ${scaleColors[i] ?? "#888"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 12,
                fontWeight: 700,
                color: hover === value ? "#fff" : scaleColors[i],
                transition: "all .2s",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {value}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
                  fontSize: 17,
                  fontWeight: 300,
                  color: hover === value ? scaleColors[i] : "var(--t1)",
                  letterSpacing: "-.1px",
                  transition: "color .2s",
                }}
              >
                {label.replace(/^\d+ — /, "")}
              </div>
              {sub && (
                <div style={{ fontSize: 11, color: "var(--t4)", marginTop: 2, fontFamily: "Inter, sans-serif" }}>
                  {sub}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Q10: Recurring revenue ────────────────────────────────────────────────────
function Q10RecurringRev({
  onAnswer,
  disabled,
}: {
  onAnswer: (v: string, e: React.MouseEvent) => void
  disabled: boolean
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <QHead>What percentage of your revenue is recurring or contracted?</QHead>
      <QSub>
        Predictable revenue is one of the highest value-add attributes in M&A — it directly expands your multiple.
      </QSub>
      <RadioCardList
        options={RECURRING_REV_OPTIONS}
        onAnswer={onAnswer}
        disabled={disabled}
        accentColor="#a7e5d3"
        accentRgb="167,229,211"
      />
    </div>
  )
}

// ── Next unlock hints ─────────────────────────────────────────────────────────
const NEXT_UNLOCK_HINTS = [
  { step: 0, unlocks: "Buyer pool match + industry multiple range" },
  { step: 1, unlocks: "Buyer confidence score + stability signal" },
  { step: 2, unlocks: "Facility & lease risk signal + SBA pre-screen flag" },
  { step: 3, unlocks: "Broker fee exposure + revenue-based baseline" },
  { step: 4, unlocks: "Preliminary valuation range + SDE multiple" },
  { step: 5, unlocks: "Deal readiness score + documentation adjustment" },
  { step: 6, unlocks: "Customer risk scan + concentration adjustment" },
  { step: 7, unlocks: "Transferability score + team depth signal" },
  { step: 8, unlocks: "Operational independence premium" },
  { step: 9, unlocks: "Full tightened range + preview report" },
]

function NextUnlockHint({ step }: { step: number }) {
  const hint = NEXT_UNLOCK_HINTS[step]
  if (!hint) return null
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 14px",
        background: "rgba(16,185,129,.05)",
        border: "1px solid rgba(16,185,129,.13)",
        borderRadius: 10,
        animation: "fadeIn .5s ease",
      }}
    >
      <div
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "#10b981",
          flexShrink: 0,
          boxShadow: "0 0 6px rgba(16,185,129,.7)",
          animation: "liveBlink 2s ease-in-out infinite",
        }}
      />
      <span style={{ fontSize: 11, color: "var(--t3)", fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>
        <span style={{ color: "rgba(16,185,129,.7)", fontWeight: 500 }}>Next unlock: </span>
        {hint.unlocks}
      </span>
    </div>
  )
}

// ── Master QuestionPanel ──────────────────────────────────────────────────────
interface QuestionPanelProps {
  step: number
  onAnswer: (v: string, e: React.MouseEvent) => void
  processing: boolean
  disabled: boolean
}

export function QuestionPanel({ step, onAnswer, processing, disabled }: QuestionPanelProps) {
  const components = [
    Q1Industry,
    Q2Years,
    Q3FacilityType,
    Q4Revenue,
    Q5SDE,
    Q6DocReadiness,
    Q7CustomerConc,
    Q8Employees,
    Q9KeyMan,
    Q10RecurringRev,
  ]
  const Component = components[step]
  if (!Component) return null

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        key={`q-${step}`}
        className="glass-panel"
        style={{
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 22,
          animation: "slideUp .55s cubic-bezier(.34,1.2,.64,1)",
          opacity: disabled && !processing ? 0.55 : 1,
          transition: "opacity .3s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <ScanLine />
        <StepLabel step={step} />
        <Component onAnswer={onAnswer} disabled={disabled} />
        {processing && <ProcessingDots />}
      </div>
      {!disabled && !processing && <NextUnlockHint step={step} />}
    </div>
  )
}
