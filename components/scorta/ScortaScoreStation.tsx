"use client"

import Link from "next/link"
import React from "react"

import type { PERSONA as PersonaShape } from "@/lib/persona"
import {
  getPointsToCertified,
  getScortaSubScores,
  SCORTA_CERTIFIED_THRESHOLD,
  type ScortaSubScore,
} from "@/lib/scortaScore"

import { REMEDIATION_TASKS } from "./RiskStation"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

type Persona = typeof PersonaShape

// Accent per pillar — cycles the 4 tokens already in styles/tailwind.css.
// Transferability reuses peach on purpose: it's the same accent
// RiskStation's TransferabilityDonut uses for this exact number.
const SUB_SCORE_ACCENT: Record<ScortaSubScore["key"], string> = {
  financial: "var(--mint, #2c8c70)",
  ownerIndependence: "var(--lav, #6b5db0)",
  customerConcentration: "var(--sky, #4a7ba8)",
  sbaLendability: "var(--mint, #2c8c70)",
  operationalCleanliness: "var(--sky, #4a7ba8)",
  marketPosition: "var(--lav, #6b5db0)",
  transferability: "var(--peach, #b86a3e)",
}

const METHODOLOGY_COPY: Record<ScortaSubScore["key"], string> = {
  financial:
    "How defensible the reported earnings are — revenue trend, margin stability, and how much of SDE survives normalization. Sourced from the Recast Agent's add-back work.",
  ownerIndependence:
    "How much of the day-to-day operation depends on the owner personally — sales relationships, vendor negotiation, cash handling, scheduling. Derived from the Owner-Dependency Agent's assessment.",
  customerConcentration:
    "How exposed revenue is to a single customer relationship. Derived from the Concentration Agent's top-account share finding.",
  sbaLendability:
    "Whether an SBA lender can underwrite this deal today — eligibility plus how much headroom the debt-service coverage ratio has above the lender's floor.",
  operationalCleanliness:
    "Whether the business has documented SOPs, clean contracts, and records a buyer's attorney and lender can diligence quickly.",
  marketPosition:
    "Competitive standing, demand durability, and how replaceable the business is within its local market.",
  transferability:
    "Whether a new owner could run this business without the current owner's involvement. The current primary drag on the composite — closing the gap here has the largest effect on the overall score.",
}

export function ScortaScoreStation({ persona }: { persona: Persona }) {
  const subScores = getScortaSubScores()
  const overall = persona.scorta.overall
  const pointsToCertified = getPointsToCertified(overall)
  const totalSopLift = REMEDIATION_TASKS.reduce((acc, t) => acc + t.scoreLift, 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <ScopedStyles />
      <StationHeader />
      <CaseIntroBanner persona={persona} pointsToCertified={pointsToCertified} />

      <section
        style={{
          padding: "28px 30px 26px",
          background: "rgba(255,255,255,.82)",
          border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
          borderTop: "3px solid var(--mint, #2c8c70)",
          borderRadius: 18,
          boxShadow:
            "0 1px 0 rgba(255,255,255,.92) inset, 0 -1px 0 rgba(0,0,0,.04) inset, 0 16px 40px rgba(12,10,9,.06)",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <header style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 10.5,
              color: "var(--mint, #2c8c70)",
              fontWeight: 600,
              letterSpacing: ".7px",
              textTransform: "uppercase",
            }}
          >
            Case Manager Agent · Output
          </div>
          <h2
            style={{
              fontFamily: garamond,
              fontSize: 30,
              fontWeight: 400,
              color: "var(--t1)",
              letterSpacing: "-.5px",
              lineHeight: 1.1,
            }}
          >
            Your Scorta Score
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--t2)", fontFamily: inter, lineHeight: 1.55, maxWidth: 760 }}>
            A methodology-transparent, letter-graded readiness score built from 7 pillars — the same
            protocol an SBA lender or CPA can reference by name. Expand the methodology below to see
            exactly how each pillar is scored.
          </p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 320px) minmax(0, 1fr)", gap: 22 }}>
          <ScoreDial overall={overall} certified={SCORTA_CERTIFIED_THRESHOLD} label={persona.scorta.label} />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <CertifiedGapCard
              overall={overall}
              pointsToCertified={pointsToCertified}
              totalSopLift={totalSopLift}
            />
            <SubScoreGrid subScores={subScores} />
          </div>
        </div>
      </section>

      <SopTaskList pointsToCertified={pointsToCertified} totalSopLift={totalSopLift} />

      <MethodologyDrawer subScores={subScores} />
    </div>
  )
}

// ── Station header ──────────────────────────────────────────────────────────
function StationHeader() {
  return (
    <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: "var(--t3)",
            fontWeight: 500,
            letterSpacing: ".7px",
            textTransform: "uppercase",
          }}
        >
          Station 07 · /score
        </div>
        <div style={{ height: 1, width: 22, background: "var(--div)" }} />
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "var(--t2)",
            fontFamily: inter,
          }}
        >
          Case Manager Agent
        </div>
      </div>
      <h1
        style={{
          fontFamily: garamond,
          fontWeight: 400,
          fontSize: 38,
          lineHeight: 1.08,
          letterSpacing: "-.6px",
          color: "var(--t1)",
          marginTop: 4,
        }}
      >
        Scorta Score
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--t2)",
          lineHeight: 1.6,
          maxWidth: 720,
          fontFamily: inter,
        }}
      >
        The FICO / Carfax analog for a Main Street exit: a public, methodology-transparent
        certification of pre-market readiness, built from 7 sub-scores rather than a single opaque
        number.
      </p>
    </header>
  )
}

// ── CASE intro banner ───────────────────────────────────────────────────────
function CaseIntroBanner({ persona, pointsToCertified }: { persona: Persona; pointsToCertified: number }) {
  const businessFirst = persona.identity.shortName
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 13,
        padding: "14px 16px",
        borderRadius: 14,
        background: "rgba(255,255,255,.7)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        boxShadow: "0 1px 0 rgba(255,255,255,.92) inset",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          flexShrink: 0,
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 40%, rgba(44,140,112,.95) 100%)",
          boxShadow: "0 0 8px rgba(44,140,112,.45)",
          marginTop: 1,
          animation: "scoreCasePulse 3.2s ease-in-out infinite",
        }}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "var(--t2)",
            fontWeight: 500,
            letterSpacing: ".7px",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          CASE · Case Manager
        </div>
        <div style={{ fontSize: 13.5, color: "var(--t1)", lineHeight: 1.55, fontFamily: inter }}>
          Scorta Score: {persona.scorta.overall}/100. {businessFirst} is a {persona.scorta.label}. The{" "}
          {pointsToCertified} points between you and Scorta Certified ({SCORTA_CERTIFIED_THRESHOLD}
          /100) are almost entirely owned by Transferability. Complete the 5 SOP tasks below and
          you're at {SCORTA_CERTIFIED_THRESHOLD}.
        </div>
      </div>
    </div>
  )
}

// ── Score dial ───────────────────────────────────────────────────────────
function polarPoint(cx: number, cy: number, r: number, fraction: number) {
  const angle = fraction * 2 * Math.PI
  return { x: cx + r * Math.sin(angle), y: cy - r * Math.cos(angle) }
}

function ScoreDial({ overall, certified, label }: { overall: number; certified: number; label: string }) {
  const radius = 78
  const circumference = 2 * Math.PI * radius
  const scoreOffset = circumference - (overall / 100) * circumference
  const cx = 100
  const cy = 100
  const tickInner = polarPoint(cx, cy, radius - 11, certified / 100)
  const tickOuter = polarPoint(cx, cy, radius + 11, certified / 100)

  return (
    <div
      style={{
        padding: "20px 18px 18px",
        background: "rgba(44,140,112,.05)",
        border: "1px solid var(--mint-edge, rgba(44,140,112,.20))",
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div style={{ position: "relative", width: 200, height: 200 }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx={cx} cy={cy} r={radius} stroke="rgba(12,10,9,.08)" strokeWidth="14" fill="none" />
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke="var(--mint, #2c8c70)"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={scoreOffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ animation: "scoreDonutDraw 900ms ease-out" }}
          />
          <line
            x1={tickInner.x}
            y1={tickInner.y}
            x2={tickOuter.x}
            y2={tickOuter.y}
            stroke="var(--t2, #6f6963)"
            strokeWidth="2.5"
            strokeDasharray="1.5 2"
            strokeLinecap="round"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <div
            style={{
              fontFamily: garamond,
              fontSize: 56,
              fontWeight: 400,
              color: "var(--mint, #2c8c70)",
              letterSpacing: "-1.5px",
              lineHeight: 1,
            }}
          >
            {overall}
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".7px",
              textTransform: "uppercase",
              color: "var(--t3)",
            }}
          >
            / 100 Scorta Score
          </div>
        </div>
      </div>
      <div
        style={{
          fontFamily: garamond,
          fontSize: 17,
          fontWeight: 500,
          color: "var(--t1)",
          letterSpacing: "-.2px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          width: "100%",
          paddingTop: 12,
          borderTop: "1px dashed var(--mint-edge, rgba(44,140,112,.28))",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <DialLegendRow dotColor="var(--mint, #2c8c70)" label="Today" value={`${overall} / 100`} />
        <DialLegendRow
          dotColor="var(--t3, #6f6963)"
          label="Scorta Certified threshold"
          value={`${certified} / 100`}
          dashed
        />
      </div>
    </div>
  )
}

function DialLegendRow({
  dotColor,
  label,
  value,
  dashed,
}: {
  dotColor: string
  label: string
  value: string
  dashed?: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        fontFamily: inter,
        fontSize: 12,
        color: "var(--t2)",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <span
          aria-hidden
          style={{
            width: 9,
            height: 9,
            borderRadius: dashed ? 2 : "50%",
            background: dashed ? "transparent" : dotColor,
            border: dashed ? `1.5px dashed ${dotColor}` : "none",
          }}
        />
        {label}
      </span>
      <span style={{ fontFamily: mono, fontSize: 11.5, color: "var(--t1)", fontWeight: 600 }}>{value}</span>
    </div>
  )
}

// ── Certified gap card ──────────────────────────────────────────────────────
function CertifiedGapCard({
  overall,
  pointsToCertified,
  totalSopLift,
}: {
  overall: number
  pointsToCertified: number
  totalSopLift: number
}) {
  return (
    <div
      style={{
        padding: "18px 20px",
        background: "linear-gradient(180deg, rgba(44,140,112,.10) 0%, rgba(44,140,112,.04) 100%)",
        border: "1px solid var(--mint-edge, rgba(44,140,112,.28))",
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: ".7px",
          textTransform: "uppercase",
          color: "var(--mint, #2c8c70)",
        }}
      >
        {pointsToCertified} points to Scorta Certified
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        <GapMetric
          eyebrow="Scorta Score"
          value={`${overall} → ${SCORTA_CERTIFIED_THRESHOLD}`}
          sub={`+${pointsToCertified} points`}
          accent
        />
        <GapMetric eyebrow="Primary driver" value="Transferability" sub={`38 → 62 (+${totalSopLift} pts)`} />
        <GapMetric eyebrow="Path" value="5 SOP tasks" sub="agent-assisted · ~6 weeks" />
      </div>
      <Link
        href="/risk"
        className="score-cta"
        style={{
          alignSelf: "flex-start",
          fontSize: 12.5,
          fontWeight: 600,
          color: "var(--mint, #2c8c70)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        Review the 5 SOP tasks on Risk Analysis <span aria-hidden>→</span>
      </Link>
    </div>
  )
}

function GapMetric({
  eyebrow,
  value,
  sub,
  accent,
}: {
  eyebrow: string
  value: string
  sub: string
  accent?: boolean
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          fontFamily: inter,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: ".9px",
          textTransform: "uppercase",
          color: "var(--t3)",
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          fontFamily: garamond,
          fontSize: accent ? 22 : 19,
          fontWeight: 500,
          color: accent ? "var(--mint, #2c8c70)" : "var(--t1)",
          letterSpacing: "-.3px",
          lineHeight: 1.05,
        }}
      >
        {value}
      </div>
      <div style={{ fontFamily: inter, fontSize: 11.5, color: "var(--t3)", lineHeight: 1.4 }}>{sub}</div>
    </div>
  )
}

// ── Sub-score grid ───────────────────────────────────────────────────────────
function SubScoreGrid({ subScores }: { subScores: ReadonlyArray<ScortaSubScore> }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 10,
      }}
    >
      {subScores.map((s) => (
        <SubScoreCard key={s.key} subScore={s} />
      ))}
    </div>
  )
}

function SubScoreCard({ subScore }: { subScore: ScortaSubScore }) {
  const accent = SUB_SCORE_ACCENT[subScore.key]
  return (
    <div
      style={{
        padding: "12px 14px",
        background: "rgba(255,255,255,.7)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div
          style={{
            fontFamily: inter,
            fontSize: 11.5,
            fontWeight: 600,
            color: "var(--t2)",
            lineHeight: 1.3,
          }}
        >
          {subScore.label}
        </div>
        <div
          style={{
            fontFamily: garamond,
            fontSize: 19,
            fontWeight: 500,
            color: "var(--t1)",
            letterSpacing: "-.3px",
            flexShrink: 0,
          }}
        >
          {subScore.value}
        </div>
      </div>
      <div
        style={{
          height: 5,
          borderRadius: 9999,
          background: "rgba(12,10,9,.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${subScore.value}%`,
            background: accent,
            borderRadius: 9999,
            transition: "width 700ms ease-out",
          }}
        />
      </div>
    </div>
  )
}

// ── SOP task list — deep links to /risk ─────────────────────────────────────
function SopTaskList({ pointsToCertified, totalSopLift }: { pointsToCertified: number; totalSopLift: number }) {
  return (
    <section
      style={{
        padding: "22px 26px 20px",
        background: "rgba(255,255,255,.82)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderTop: "3px solid var(--peach, #b86a3e)",
        borderRadius: 18,
        boxShadow:
          "0 1px 0 rgba(255,255,255,.92) inset, 0 -1px 0 rgba(0,0,0,.04) inset, 0 12px 32px rgba(12,10,9,.06)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "var(--peach, #b86a3e)",
            fontWeight: 600,
            letterSpacing: ".7px",
            textTransform: "uppercase",
          }}
        >
          Owner-Dependency Agent · 5 outstanding tasks
        </div>
        <h2
          style={{
            fontFamily: garamond,
            fontSize: 24,
            fontWeight: 400,
            color: "var(--t1)",
            letterSpacing: "-.4px",
            lineHeight: 1.15,
          }}
        >
          Close the {pointsToCertified}-point gap
        </h2>
        <p style={{ fontSize: 13, color: "var(--t2)", fontFamily: inter, lineHeight: 1.55, maxWidth: 760 }}>
          These are the same 5 tasks the Owner-Dependency Agent scored on the Risk Analysis station —
          completing all 5 lifts Transferability by {totalSopLift} points, which is nearly all of the
          gap to Scorta Certified.
        </p>
      </header>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {REMEDIATION_TASKS.map((task, i) => (
          <Link
            key={task.title}
            href="/risk"
            className="score-task-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 14px",
              background: "rgba(255,255,255,.7)",
              border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
              borderRadius: 12,
              textDecoration: "none",
              transition: "transform 180ms ease-out, box-shadow 180ms ease-out",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "rgba(184,106,62,.10)",
                border: "1px solid var(--peach-edge, rgba(184,106,62,.28))",
                color: "var(--peach, #b86a3e)",
                fontFamily: mono,
                fontSize: 11,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <div
              style={{
                flex: 1,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--t1)",
                fontFamily: inter,
                lineHeight: 1.4,
              }}
            >
              {task.title}
            </div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 11,
                color: "var(--peach, #b86a3e)",
                fontWeight: 600,
                padding: "4px 9px",
                background: "rgba(184,106,62,.08)",
                border: "1px solid var(--peach-edge, rgba(184,106,62,.22))",
                borderRadius: 9999,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              +{task.scoreLift} pts
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ── Methodology drawer ───────────────────────────────────────────────────────
function MethodologyDrawer({ subScores }: { subScores: ReadonlyArray<ScortaSubScore> }) {
  const [open, setOpen] = React.useState(false)
  return (
    <section
      style={{
        background: "rgba(255,255,255,.82)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderRadius: 18,
        boxShadow:
          "0 1px 0 rgba(255,255,255,.92) inset, 0 -1px 0 rgba(0,0,0,.04) inset, 0 12px 32px rgba(12,10,9,.05)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="score-methodology-toggle"
        aria-expanded={open}
        style={{
          all: "unset",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 14,
          width: "100%",
          padding: "20px 26px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 10.5,
              color: "var(--t3)",
              fontWeight: 600,
              letterSpacing: ".7px",
              textTransform: "uppercase",
            }}
          >
            Methodology
          </div>
          <div
            style={{
              fontFamily: garamond,
              fontSize: 20,
              fontWeight: 400,
              color: "var(--t1)",
              letterSpacing: "-.3px",
            }}
          >
            How the Scorta Score is calculated
          </div>
        </div>
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 26,
            height: 26,
            color: "var(--t2)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 240ms ease-out",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5l4 4 4-4" />
          </svg>
        </span>
      </button>

      {open && (
        <div
          style={{
            padding: "0 26px 26px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            animation: "scoreFadeIn .28s ease-out",
          }}
        >
          <p style={{ fontSize: 13, color: "var(--t2)", fontFamily: inter, lineHeight: 1.6, maxWidth: 780 }}>
            The Scorta Score is a public, methodology-transparent, letter-graded certification of
            pre-market readiness — built from 7 pillars, the same 7 an SBA lender or CPA can reference
            by name. It is a <strong>weighted composite, not a simple average</strong>: pillars that
            most directly drive SBA lending risk and buyer confidence — Transferability chief among
            them — carry more weight than topline financial performance. That weighting is exactly why
            closing the Transferability gap (the 5 SOP tasks) moves the overall score almost the full
            13 points to Scorta Certified, even though Transferability is only one of seven inputs.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {subScores.map((s) => (
              <div key={s.key} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span
                    style={{
                      fontFamily: garamond,
                      fontSize: 16,
                      fontWeight: 500,
                      color: "var(--t1)",
                      letterSpacing: "-.2px",
                    }}
                  >
                    {s.label}
                  </span>
                  <span style={{ fontFamily: mono, fontSize: 12, color: "var(--t2)", fontWeight: 600 }}>
                    {s.value}/100
                  </span>
                </div>
                <p style={{ fontSize: 12.5, color: "var(--t2)", fontFamily: inter, lineHeight: 1.55, maxWidth: 760, margin: 0 }}>
                  {METHODOLOGY_COPY[s.key]}
                </p>
                <div style={{ fontFamily: mono, fontSize: 10.5, color: "var(--t3)", letterSpacing: ".2px" }}>
                  Source: {s.source}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

// ── Scoped styles ────────────────────────────────────────────────────────────
function ScopedStyles() {
  return (
    <style>{`
      @keyframes scoreCasePulse {
        0%, 100% { transform: scale(1);    opacity: 1;  }
        50%      { transform: scale(1.12); opacity: .9; }
      }
      @keyframes scoreDonutDraw {
        from { stroke-dashoffset: ${2 * Math.PI * 78}; }
      }
      @keyframes scoreFadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .score-cta:hover { text-decoration: underline; }
      .score-task-row:hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 18px rgba(12,10,9,.07);
      }
      .score-methodology-toggle:hover {
        background: rgba(12,10,9,.02);
      }
    `}</style>
  )
}
