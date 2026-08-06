import Link from "next/link"
import type { ReactNode } from "react"

import { VerticalChip } from "@/components/scorta/OperatorDealsStation"
import { type DealSnapshot, getStationProgress, VERTICAL_ACCENT } from "@/lib/operatorDeals"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

/**
 * A lightweight per-deal snapshot for the operator console — real headline
 * numbers plus an honest readout of which stations this deal has reached vs.
 * not, rather than a full 12-station rebuild for every fictional deal (see
 * `lib/operatorDeals.ts`'s `getDealSnapshot`/`getStationProgress`). Server
 * component — no live-fleet simulation, no `AgentFleetContext`, no
 * `lib/agentActivity.ts` — those are hand-authored specifically for the one
 * live deal and don't generalize to fictional seed data.
 */
export function DealSnapshotStation({ deal }: { deal: DealSnapshot }) {
  const accent = VERTICAL_ACCENT[deal.vertical]
  const progress = getStationProgress(deal.stage)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
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
            Deal Snapshot
          </div>
          <div style={{ height: 1, width: 22, background: "var(--div)" }} />
          <VerticalChip vertical={deal.vertical} />
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
          {deal.businessName}
        </h1>
        <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.6, fontFamily: inter }}>
          {deal.industry} · currently at {deal.stage} · Day {deal.elapsedDays}
        </p>
      </header>

      <KpiRow deal={deal} accentColor={accent.accent} />

      <section
        style={{
          padding: "14px 18px",
          borderRadius: 14,
          background: "rgba(184,106,62,.06)",
          border: "1px solid var(--peach-edge, rgba(184,106,62,.18))",
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: ".5px",
            textTransform: "uppercase",
            color: "var(--peach, #b86a3e)",
            marginBottom: 5,
          }}
        >
          Current blocker
        </div>
        <div style={{ fontSize: 13.5, color: "var(--t2)", fontFamily: inter, lineHeight: 1.55 }}>{deal.blocker}</div>
      </section>

      <NextStepsSection nextSteps={deal.nextSteps} />

      <StationProgressSection reached={progress.reached} notReached={progress.notReached} />

      <div>
        <Link
          href="/deals"
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--t2)",
            textDecoration: "none",
          }}
        >
          ← Back to Deal Portfolio
        </Link>
      </div>
    </div>
  )
}

function KpiRow({ deal, accentColor }: { deal: DealSnapshot; accentColor: string }) {
  const cards: ReadonlyArray<{ label: string; value: string }> = [
    { label: "Revenue", value: deal.financials.revenueDisplay },
    { label: "SDE", value: deal.financials.sdeDisplay },
    { label: "Valuation range", value: `${deal.financials.valuationLowDisplay}–${deal.financials.valuationHighDisplay}` },
    { label: "Applied multiple", value: `${deal.financials.appliedMultiple}×` },
    { label: "Score", value: `${deal.score.overall}/100 · ${deal.score.grade}` },
  ]

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 12,
      }}
    >
      {cards.map((c) => (
        <div
          key={c.label}
          style={{
            padding: "14px 16px",
            borderRadius: 14,
            background: "rgba(255,255,255,.85)",
            border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
            borderTop: `3px solid ${accentColor}`,
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 9.5,
              fontWeight: 600,
              letterSpacing: ".5px",
              textTransform: "uppercase",
              color: "var(--t3)",
              marginBottom: 5,
            }}
          >
            {c.label}
          </div>
          <div style={{ fontFamily: garamond, fontSize: 20, fontWeight: 500, color: "var(--t1)" }}>{c.value}</div>
        </div>
      ))}
    </section>
  )
}

function NextStepsSection({ nextSteps }: { nextSteps: DealSnapshot["nextSteps"] }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <SectionLabel>Next steps</SectionLabel>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          borderRadius: 14,
          border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
          background: "rgba(255,255,255,.82)",
          overflow: "hidden",
        }}
      >
        {nextSteps.map((step, i) => (
          <div
            key={step.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 16px",
              borderTop: i === 0 ? "none" : "1px solid var(--glass-edge, rgba(0,0,0,.06))",
            }}
          >
            <StepDot done={step.done} />
            <span
              style={{
                fontSize: 13,
                fontFamily: inter,
                color: step.done ? "var(--t3)" : "var(--t1)",
                textDecoration: step.done ? "line-through" : "none",
              }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function StepDot({ done }: { done: boolean }) {
  if (done) {
    return (
      <div
        aria-hidden
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "var(--mint, #2c8c70)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width={9} height={9} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 5.2L4.2 7.4 8 3.2" />
        </svg>
      </div>
    )
  }
  return (
    <div
      aria-hidden
      style={{
        width: 16,
        height: 16,
        borderRadius: "50%",
        border: "1px dashed var(--t4)",
        flexShrink: 0,
      }}
    />
  )
}

function StationProgressSection({
  reached,
  notReached,
}: {
  reached: ReturnType<typeof getStationProgress>["reached"]
  notReached: ReturnType<typeof getStationProgress>["notReached"]
}) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <SectionLabel>Station progress</SectionLabel>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          borderRadius: 14,
          border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
          background: "rgba(255,255,255,.82)",
          overflow: "hidden",
        }}
      >
        {reached.map((station, i) => (
          <div
            key={station.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 16px",
              borderTop: i === 0 ? "none" : "1px solid var(--glass-edge, rgba(0,0,0,.06))",
            }}
          >
            <div
              aria-hidden
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "var(--mint, #2c8c70)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width={9} height={9} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 5.2L4.2 7.4 8 3.2" />
              </svg>
            </div>
            <span style={{ fontSize: 13, fontFamily: inter, fontWeight: 500, color: "var(--t1)" }}>{station.label}</span>
            <span style={{ fontSize: 11, fontFamily: mono, color: "var(--t3)" }}>{station.agent}</span>
          </div>
        ))}
        {notReached.map((station, i) => (
          <div
            key={station.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 16px",
              borderTop: reached.length + i === 0 ? "none" : "1px solid var(--glass-edge, rgba(0,0,0,.06))",
            }}
          >
            <div
              aria-hidden
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                border: "1px dashed var(--t4)",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, fontFamily: inter, color: "var(--t3)" }}>{station.label}</span>
            <span style={{ fontSize: 11.5, color: "var(--t3)", fontFamily: inter, marginLeft: "auto" }}>
              {station.prereq ? `Unlocks once ${station.prereq}.` : "Not yet reached."}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
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
      {children}
    </div>
  )
}
