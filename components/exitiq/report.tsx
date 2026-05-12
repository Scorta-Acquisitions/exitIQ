"use client"

import React from "react"

import { workflowTraceClient } from "@/lib/debug/workflow-trace-client"

import { ScanLine } from "./ui"

// ── Phase config ──────────────────────────────────────────────────────────────

const PHASES = [
  {
    label: "Reading your financial signals",
    sub: "Parsing SDE band, revenue, and operating tenure",
    dur: 7000,
  },
  {
    label: "Modeling buyer pool",
    sub: "SBA-backed operators, search funds, strategic acquirers",
    dur: 8500,
  },
  {
    label: "Running three valuation methods",
    sub: "SDE multiple · Revenue multiple · Asset floor",
    dur: 7500,
  },
  {
    label: "Scoring transferability",
    sub: "Operational independence · documentation · longevity",
    dur: 7500,
  },
  {
    label: "Identifying risk drivers",
    sub: "Lease, owner dependency, customer concentration",
    dur: 6500,
  },
  {
    label: "Drafting your narrative",
    sub: "Composing executive summary and 90-day action plan",
    dur: 5000,
  },
]

const TOTAL_DUR = PHASES.reduce((s, p) => s + p.dur, 0)

// ── Label maps for ticker ─────────────────────────────────────────────────────

const REVENUE_LABELS: Record<string, string> = {
  under_250: "Under $250K",
  "250_500": "$250K–$500K",
  "500_1m": "$500K–$1M",
  "1m_2m": "$1M–$3M",
  "2m_5m": "$3M–$10M",
  "5m_10m": "$10M+",
}
const SDE_LABELS: Record<string, string> = {
  under_250: "Under $250K",
  "250_500": "$250K–$500K",
  "500_1m": "$500K–$1M",
  "1m_2m": "$1M–$2M",
  "2m_5m": "$2M–$5M",
  "5m_10m": "$5M+",
}
const EMPLOYEE_LABELS: Record<string, string> = {
  solo: "1 (solo)",
  "1_5": "2–5",
  "6_15": "6–15",
  "16_50": "16–50",
  "50plus": "50+",
}

// ── Spring hook ───────────────────────────────────────────────────────────────

function useSpring(target: number, k = 0.08, d = 0.78): number {
  const [v, setV] = React.useState(0)
  const ref = React.useRef({ cur: 0, vel: 0, raf: 0 })
  React.useEffect(() => {
    const tick = () => {
      const { cur, vel } = ref.current
      const nv = (vel + (target - cur) * k) * d
      const nc = cur + nv
      ref.current = { cur: nc, vel: nv, raf: 0 }
      setV(nc)
      if (Math.abs(target - nc) > 0.05) ref.current.raf = requestAnimationFrame(tick)
      else setV(target)
    }
    cancelAnimationFrame(ref.current.raf)
    ref.current.raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current.raf)
  }, [target])
  return v
}

// ── Liquid Orb (CSS-only) ─────────────────────────────────────────────────────

function LiquidOrb({ size = 160 }: { size?: number }) {
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        filter: "blur(.4px)",
        animation: "orbBreathe 5s ease-in-out infinite",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -30,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,.55) 0%, transparent 65%)",
          filter: "blur(14px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 32% 28%, rgba(255,255,255,.95) 0%, rgba(232,225,210,.85) 28%, rgba(190,176,210,.7) 55%, rgba(150,180,200,.55) 80%, transparent 100%)",
          boxShadow:
            "0 16px 40px rgba(0,0,0,.18), inset 0 -14px 28px rgba(150,140,180,.3), inset 0 14px 22px rgba(255,255,255,.6)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "14%",
          width: "46%",
          height: "42%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(184,140,210,.62) 0%, transparent 70%)",
          filter: "blur(10px)",
          animation: "orbDrift1 6s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "14%",
          right: "12%",
          width: "52%",
          height: "46%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(120,180,210,.55) 0%, transparent 70%)",
          filter: "blur(12px)",
          animation: "orbDrift2 7s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "42%",
          left: "46%",
          width: "30%",
          height: "28%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(244,197,168,.5) 0%, transparent 70%)",
          filter: "blur(9px)",
          animation: "orbDrift3 5.5s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "18%",
          width: "30%",
          height: "18%",
          borderRadius: "50%",
          background: "rgba(255,255,255,.85)",
          filter: "blur(3px)",
        }}
      />
    </div>
  )
}

// ── Phase line ────────────────────────────────────────────────────────────────

function PhaseLine({
  phase,
  active,
  done,
}: {
  phase: (typeof PHASES)[number]
  active: boolean
  done: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "8px 0",
        opacity: done ? 0.5 : active ? 1 : 0.25,
        transition: "opacity .5s ease",
      }}
    >
      <div style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2, position: "relative" }}>
        {done ? (
          <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
            <circle cx={9} cy={9} r={8} fill="#2c8c70" />
            <path
              d="M5 9.5l2.5 2.5L13 6.5"
              stroke="white"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        ) : active ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "2px solid rgba(44,140,112,.28)",
              borderTopColor: "#2c8c70",
              animation: "spin .9s linear infinite",
            }}
          />
        ) : (
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "rgba(12,10,9,.16)",
              margin: 5,
            }}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
            fontSize: 18,
            fontWeight: 300,
            color: active ? "var(--t1)" : done ? "var(--t2)" : "var(--t3)",
            letterSpacing: "-.3px",
            lineHeight: 1.25,
            transition: "color .4s ease",
          }}
        >
          {phase.label}
          {active && (
            <span
              style={{
                display: "inline-block",
                width: 7,
                height: 16,
                marginLeft: 4,
                background: "#2c8c70",
                verticalAlign: "middle",
                animation: "blink 1s steps(2) infinite",
              }}
            />
          )}
        </div>
        <div
          style={{
            fontSize: 11,
            color: active ? "var(--t3)" : "var(--t4)",
            marginTop: 2,
            fontFamily: "Inter, sans-serif",
            transition: "color .4s ease",
          }}
        >
          {phase.sub}
        </div>
      </div>
    </div>
  )
}

// ── Data ticker ───────────────────────────────────────────────────────────────

function DataTicker({ lines, idx }: { lines: string[]; idx: number }) {
  const visible = lines.slice(0, idx).slice(-5)
  return (
    <div
      className="glass-panel"
      style={{
        padding: "16px 18px",
        borderRadius: 14,
        alignSelf: "stretch",
        minHeight: 120,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "var(--t3)",
          marginBottom: 10,
          fontFamily: "Inter, sans-serif",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#2c8c70",
            animation: "pulseDot 1.4s ease-in-out infinite",
          }}
        />
        Live Signal Stream
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', var(--font-jetbrains-mono, monospace)",
          fontSize: 10,
          color: "var(--t3)",
          letterSpacing: ".2px",
          lineHeight: 1.9,
          minHeight: 60,
        }}
      >
        {visible.map((l, i, arr) => (
          <div
            key={`${idx}-${i}`}
            style={{
              opacity: 1 - (arr.length - 1 - i) * 0.18,
              animation: "fadeIn .5s ease",
            }}
          >
            <span style={{ color: "#2c8c70" }}>›</span> {l}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── CinematicLoader ───────────────────────────────────────────────────────────

export function CinematicLoader({
  sessionId,
  aiReady,
  onComplete,
  answers,
  name,
}: {
  sessionId: string
  aiReady: boolean
  onComplete: () => void
  answers: Record<string, string>
  name: string
}) {
  const [currentPhase, setCurrentPhase] = React.useState(0)
  const [progress, setProgress] = React.useState(0)
  const [tickerIdx, setTickerIdx] = React.useState(0)
  const [phasesComplete, setPhasesComplete] = React.useState(false)
  const pctDisplay = Math.round(useSpring(phasesComplete && !aiReady ? 99 : progress * 100))

  React.useEffect(() => {
    workflowTraceClient({
      phase: "client.cinematic_loader_mounted",
      sessionId,
      origin: "CinematicLoader",
      detail: { aiReadyInitial: aiReady },
    })
  }, [sessionId, aiReady])

  // Phase advancement
  React.useEffect(() => {
    let elapsed = 0
    const timers: ReturnType<typeof setTimeout>[] = []
    PHASES.forEach((p, i) => {
      elapsed += p.dur
      timers.push(setTimeout(() => setCurrentPhase(i + 1), elapsed))
    })
    timers.push(setTimeout(() => setPhasesComplete(true), elapsed))
    return () => timers.forEach(clearTimeout)
  }, [])

  // Progress bar + ticker
  React.useEffect(() => {
    const t0 = performance.now()
    let raf: number
    const tick = () => {
      const dt = performance.now() - t0
      setProgress(Math.min(dt / TOTAL_DUR, 1))
      setTickerIdx(Math.floor(dt / 400))
      if (dt < TOTAL_DUR) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Complete when both phases done and AI ready
  React.useEffect(() => {
    if (phasesComplete && aiReady) {
      workflowTraceClient({
        phase: "client.cinematic_loader_complete_happy_path",
        sessionId,
        origin: "CinematicLoader",
        detail: { phasesComplete, aiReady },
      })
      onComplete()
    }
  }, [phasesComplete, aiReady, onComplete, sessionId])

  // Failsafe: navigate after 90s even if the AI stream never resolves
  React.useEffect(() => {
    const t = setTimeout(() => {
      workflowTraceClient({
        phase: "client.cinematic_loader_complete_failsafe_90s",
        sessionId,
        origin: "CinematicLoader",
        detail: { phasesComplete, aiReady },
      })
      onComplete()
    }, 90_000)
    return () => clearTimeout(t)
  }, [onComplete, sessionId])

  // Build dynamic ticker lines from answers
  const tickerLines = React.useMemo(() => {
    const rev = REVENUE_LABELS[answers.revenue ?? ""] ?? answers.revenue ?? "unknown"
    const sde = SDE_LABELS[answers.sde ?? ""] ?? answers.sde ?? "unknown"
    const emp = EMPLOYEE_LABELS[answers.employees ?? ""] ?? answers.employees ?? "unknown"
    const yrs = answers.years ?? "unknown"
    const ind = answers.industry ?? "Other"
    return [
      `Loading profile: ${name}, ${ind}`,
      `Operating tenure: ${yrs}`,
      `Revenue band: ${rev} — normalizing`,
      `SDE band: ${sde} — computing midpoint`,
      `Employees: ${emp} — scoring independence`,
      `Facility: ${answers.facilityType ?? "not specified"} — lease signal check`,
      `Documentation: ${answers.docReadiness ?? "not specified"} — deal readiness`,
      `Pulling lower-middle-market comps (n=2,847)`,
      `Industry code: ${ind} — applying SDE multiples`,
      `Buyer archetype probabilities: operator 46% · SBA 29% · strategic 25%`,
      `SBA 7(a) eligibility check: running`,
      `Three-method valuation: converging`,
      `Operational independence: scoring`,
      `Risk flags: identifying lease · docs · owner dependency`,
      `Growth levers: mapping buyer upside`,
      `Deal structure: modeling optimal paths`,
      `Drafting executive summary…`,
      `Composing 90-day action plan…`,
      `Finalizing report…`,
      `Report ready.`,
    ]
  }, [answers, name])

  return (
    <div
      className="glass-panel"
      style={{
        padding: "32px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        position: "relative",
        overflow: "hidden",
        animation: "slideUp .7s cubic-bezier(.34,1.1,.64,1)",
      }}
    >
      <ScanLine speed={4} />

      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#2c8c70",
                boxShadow: "0 0 10px #2c8c70",
                animation: "liveBlink 1.6s ease-in-out infinite",
              }}
            />
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "1.1px",
                textTransform: "uppercase",
                color: "#2c8c70",
                fontFamily: "Inter, sans-serif",
              }}
            >
              ExitIQ Engine · Live Analysis
            </div>
          </div>
          <h2
            style={{
              fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
              fontSize: "clamp(26px, 3vw, 36px)",
              fontWeight: 300,
              color: "var(--t1)",
              letterSpacing: "-.7px",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Building your report…
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--t3)",
              marginTop: 8,
              lineHeight: 1.6,
              maxWidth: 440,
              fontFamily: "Inter, sans-serif",
            }}
          >
            We're modeling your business across {PHASES.length} dimensions using lower-middle-market comparables, SBA
            underwriting rules, and buyer-archetype data.
          </p>
        </div>

        {/* % counter */}
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 24 }}>
          <div
            style={{
              fontFamily: "'EB Garamond', var(--font-eb-garamond, serif)",
              fontSize: "clamp(52px, 6vw, 70px)",
              fontWeight: 300,
              color: "var(--t1)",
              letterSpacing: "-2px",
              lineHeight: 0.9,
            }}
          >
            {pctDisplay}
            <span style={{ fontSize: "clamp(28px, 3vw, 38px)", color: "var(--t3)" }}>%</span>
          </div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--t3)",
              marginTop: 4,
            }}
          >
            {phasesComplete && !aiReady ? "Finalizing…" : "Complete"}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "relative",
          height: 3,
          background: "var(--s1)",
          borderRadius: 9999,
          overflow: "hidden",
          marginBottom: 28,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${(phasesComplete && !aiReady ? 0.99 : progress) * 100}%`,
            background: "linear-gradient(90deg, #2c8c70, #5cb89a)",
            boxShadow: "0 0 10px rgba(44,140,112,.4)",
            transition: "width .15s linear",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "40%",
            left: `${(phasesComplete && !aiReady ? 0.99 : progress) * 100 - 20}%`,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,.75), transparent)",
            transition: "left .15s linear",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Body grid: orb + phases + ticker */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr 1fr",
          gap: 28,
          alignItems: "flex-start",
        }}
      >
        {/* Orb */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingTop: 4 }}>
          <LiquidOrb size={140} />
          <div
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--t4)",
              textAlign: "center",
            }}
          >
            Liquid Engine
          </div>
        </div>

        {/* Phase list */}
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--t3)",
              marginBottom: 8,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Analysis Pipeline
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {PHASES.map((p, i) => (
              <PhaseLine key={i} phase={p} active={i === currentPhase} done={i < currentPhase} />
            ))}
          </div>
        </div>

        {/* Ticker */}
        <DataTicker lines={tickerLines} idx={tickerIdx} />
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: "1px solid var(--b3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11,
          color: "var(--t4)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div>Typically 30–45 seconds. Do not close this window.</div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', var(--font-jetbrains-mono, monospace)",
            fontSize: 10,
          }}
        >
          scorta.exitiq · live
        </div>
      </div>
    </div>
  )
}
