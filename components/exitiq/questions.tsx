"use client"

import React from "react"
import {
  EMPLOYEE_OPTIONS,
  HOT_STATES,
  INDUSTRIES,
  REVENUE_RANGES,
  SDE_RANGES,
  US_STATES,
  YEAR_OPTIONS,
} from "@/lib/exitiq/data"
import { ProcessingDots, ScanLine } from "./ui"

// ── Helpers ───────────────────────────────────────────────────────────────────
function hexToRgb(hex: string): string {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!r || !r[1] || !r[2] || !r[3]) return "167,229,211"
  return `${parseInt(r[1], 16)},${parseInt(r[2], 16)},${parseInt(r[3], 16)}`
}

// ── Step label ────────────────────────────────────────────────────────────────
function StepLabel({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", gap: 5, flex: 1 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 2,
              borderRadius: 9999,
              background: i < current ? "#10b981" : i === current ? "rgba(16,185,129,.38)" : "var(--s1)",
              boxShadow: i < current ? "0 0 6px rgba(16,185,129,.55)" : "none",
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
        {current + 1} / {total}
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

// ── Q1: Industry chips ────────────────────────────────────────────────────────
function Q1Industry({ onAnswer, disabled }: { onAnswer: (v: string, e: React.MouseEvent) => void; disabled: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <QHead>What type of business do you own?</QHead>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {INDUSTRIES.map(({ label, color }, i) => (
          <button
            key={label}
            onClick={(e) => !disabled && onAnswer(label, e)}
            style={{
              padding: "10px 18px",
              background: "var(--s1)",
              border: "1px solid var(--b2)",
              borderRadius: 9999,
              color: "var(--t2)",
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "Inter, sans-serif",
              cursor: disabled ? "default" : "pointer",
              animation: `chipFloat .55s ${i * 70}ms cubic-bezier(.34,1.3,.64,1) both`,
              transition: "all .22s cubic-bezier(.34,1.56,.64,1)",
            }}
            onMouseEnter={(e) => {
              if (disabled) return
              const el = e.currentTarget
              el.style.background = `rgba(${hexToRgb(color)},.14)`
              el.style.borderColor = `rgba(${hexToRgb(color)},.5)`
              el.style.color = color
              el.style.transform = "translateY(-2px) scale(1.04)"
              el.style.boxShadow = `0 0 18px rgba(${hexToRgb(color)},.15)`
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
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "rgba(167,229,211,.7)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {currentOpt?.label}
          </div>
        </div>

        <div style={{ position: "relative", height: 40, display: "flex", alignItems: "center" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 4,
              borderRadius: 9999,
              background: "var(--s1)",
            }}
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

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {["1yr", "5yr", "10yr", "15yr", "25yr+"].map((l) => (
            <div key={l} style={{ fontSize: 10, color: "var(--t4)", fontFamily: "Inter, sans-serif" }}>
              {l}
            </div>
          ))}
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

// ── Q3: Revenue range cards ───────────────────────────────────────────────────
function Q3Revenue({ onAnswer, disabled }: { onAnswer: (v: string, e: React.MouseEvent) => void; disabled: boolean }) {
  const [hover, setHover] = React.useState<number | null>(null)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <QHead>What is your annual revenue?</QHead>
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

// ── Q4: SDE range cards + tooltip ─────────────────────────────────────────────
function Q4SDE({ onAnswer, disabled }: { onAnswer: (v: string, e: React.MouseEvent) => void; disabled: boolean }) {
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

// ── Q5: Employee dot cards ────────────────────────────────────────────────────
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
        <div
          style={{
            fontSize: 9,
            color: "var(--t4)",
            alignSelf: "center",
            marginLeft: 2,
            fontFamily: "Inter",
          }}
        >
          +{count - MAX}
        </div>
      )}
    </div>
  )
}

function Q5Employees({
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
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {EMPLOYEE_OPTIONS.map(({ label, dots, transferability }, i) => (
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
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
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--t4)",
                  textAlign: "right",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <div>Transferability</div>
                <div
                  style={{
                    color: hover === i ? "#a8c8e8" : "var(--t2)",
                    fontWeight: 500,
                    marginTop: 2,
                  }}
                >
                  {Math.round(transferability * 100)}%
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Q6: State searchable dropdown ─────────────────────────────────────────────
function Q6State({
  onAnswer,
  disabled,
}: {
  onAnswer: (v: string, e: React.MouseEvent<HTMLButtonElement>) => void
  disabled: boolean
}) {
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const filtered = US_STATES.filter((s) => s.toLowerCase().startsWith(query.toLowerCase()))
  const isHot = (s: string) => HOT_STATES.includes(s)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <QHead>What state is your business in?</QHead>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          placeholder="Search state…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          style={{
            width: "100%",
            height: 48,
            padding: "0 16px",
            borderRadius: 12,
            background: "var(--inp-bg)",
            border: "1px solid var(--inp-border)",
            color: "var(--t1)",
            fontSize: 15,
            fontFamily: "Inter, sans-serif",
            outline: "none",
            transition: "border .2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(167,229,211,.35)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--inp-border)")}
        />
        {open && filtered.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              zIndex: 50,
              background: "var(--dd-bg)",
              backdropFilter: "blur(24px)",
              border: "1px solid var(--b2)",
              borderRadius: 12,
              maxHeight: 220,
              overflowY: "auto",
              boxShadow: "0 12px 40px rgba(0,0,0,.3)",
              animation: "slideUp .25s ease",
            }}
          >
            {filtered.map((s) => (
              <button
                key={s}
                onClick={(e) => {
                  if (!disabled) {
                    setQuery(s)
                    setOpen(false)
                    onAnswer(s, e)
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "10px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--b3)",
                  color: "var(--t2)",
                  fontSize: 14,
                  fontFamily: "Inter, sans-serif",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background .15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(167,229,211,.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span>{s}</span>
                {isHot(s) && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: ".8px",
                      color: "#10b981",
                      textTransform: "uppercase",
                    }}
                  >
                    Active market
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Next unlock hints ─────────────────────────────────────────────────────────
const NEXT_UNLOCK_HINTS = [
  { step: 0, unlocks: "Buyer match + broker fee baseline" },
  { step: 1, unlocks: "Buyer confidence score + stability signal" },
  { step: 2, unlocks: "Broker fee exposure + valuation baseline" },
  { step: 3, unlocks: "Preliminary valuation range + SDE multiple" },
  { step: 4, unlocks: "Transferability score + deal risk scan" },
  { step: 5, unlocks: "Geographic market signal + full preview" },
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
      <span
        style={{
          fontSize: 11,
          color: "var(--t3)",
          fontFamily: "Inter, sans-serif",
          lineHeight: 1.5,
        }}
      >
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
  const components = [Q1Industry, Q2Years, Q3Revenue, Q4SDE, Q5Employees, Q6State]
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
        <StepLabel current={step} total={6} />
        <Component onAnswer={onAnswer} disabled={disabled} />
        {processing && <ProcessingDots />}
      </div>
      {!disabled && !processing && <NextUnlockHint step={step} />}
    </div>
  )
}
