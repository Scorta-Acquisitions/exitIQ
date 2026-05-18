"use client"

import Link from "next/link"
import React from "react"

import { CaseHero } from "@/components/scorta/CaseHero"
import type { PERSONA as PersonaShape } from "@/lib/persona"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

type Persona = typeof PersonaShape

export function SellerHome({ persona }: { persona: Persona }) {
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => {
    const t = setTimeout(() => setReady(true), 480)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <CaseHero
        firstName={persona.identity.firstName}
        greeting={`Welcome, ${persona.identity.firstName}.`}
        subheading={`I've reviewed your ExitIQ answers and the locked report for ${persona.identity.businessName}.`}
        body={`Your ${persona.business.yearsOperating}-year operating history and SBA profile already support the upper end of your ${persona.financials.valuationLowDisplay}–${persona.financials.valuationHighDisplay} range. The lever holding the multiple at ${persona.financials.sdeMultipleLow}× instead of ${persona.financials.sdeMultipleHigh}× is owner-dependency — Transferability scored ${persona.risk.ownerDependencyScore}/100. The agent fleet has a three-step plan to close that gap.`}
        steps={[
          {
            title: "Tighten the books.",
            agent: "Ingestion Agent",
            body: `Reconcile 36 months of QuickBooks and Plaid activity into a defensible Year-3 SDE of ${persona.financials.normalizedSDEYear3Display}.`,
          },
          {
            title: "Document the owner role.",
            agent: "Owner-Dependency Agent",
            body: `Draft the one-page operations manual for your top five owner-dependent tasks. Unlock estimate: ${persona.risk.fixValueUnlockDisplay} on deal value.`,
          },
          {
            title: "Surface to qualified lenders.",
            agent: "Lender Ops Agent",
            body: `Package your file for three SBA-preferred lenders we've already shortlisted. DSCR clears at ${persona.sba.dscr}×.`,
          },
        ]}
        ctaLabel="Start with step 1"
        nextHref="/connect"
        nextLabel="Platform Connectors"
      />

      <CaseActionsStrip />

      <KpiRow persona={persona} ready={ready} />
      <RiskStrip persona={persona} />

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr .9fr", gap: 22 }}>
        <ExitIqRecap persona={persona} />
        <NextStepsCard persona={persona} />
      </div>
    </div>
  )
}

// ── Case actions strip ──────────────────────────────────────────────────────
function CaseActionsStrip() {
  return (
    <section
      style={{
        padding: "14px 18px",
        borderRadius: 14,
        background: "rgba(255,255,255,.72)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.06))",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flex: 1,
          minWidth: 220,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 40%, rgba(44,140,112,.95) 100%)",
            boxShadow: "0 0 8px rgba(44,140,112,.45)",
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".8px",
              textTransform: "uppercase",
              color: "var(--t3)",
              fontFamily: inter,
            }}
          >
            Work with CASE
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--t2)",
              marginTop: 2,
              lineHeight: 1.4,
              fontFamily: inter,
            }}
          >
            Hand CASE more context, or ask her anything about your exit.
          </div>
        </div>
      </div>

      <Link
        href="/upload"
        className="case-action case-action-primary"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 9,
          padding: "10px 16px",
          borderRadius: 9999,
          background: "var(--btn-bg)",
          color: "var(--btn-fg)",
          fontFamily: inter,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "-.05px",
          textDecoration: "none",
          boxShadow: "0 6px 18px rgba(12,10,9,.16)",
          transition: "transform 180ms ease-out, box-shadow 180ms ease-out",
          whiteSpace: "nowrap",
        }}
      >
        <UploadIcon />
        <span>Add business context</span>
        <span
          style={{
            padding: "1px 7px",
            borderRadius: 9999,
            background: "rgba(167,229,211,.22)",
            color: "rgba(220,255,240,.95)",
            fontFamily: mono,
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: ".6px",
          }}
        >
          +SCORE
        </span>
      </Link>

      <Link
        href="/case"
        className="case-action case-action-secondary"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 9,
          padding: "10px 16px",
          borderRadius: 9999,
          background: "rgba(255,255,255,.7)",
          color: "var(--t1)",
          fontFamily: inter,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "-.05px",
          textDecoration: "none",
          border: "1px solid var(--glass-edge, rgba(0,0,0,.10))",
          transition: "background 180ms ease-out, border-color 180ms ease-out, transform 180ms ease-out",
          whiteSpace: "nowrap",
        }}
      >
        <ChatIcon />
        <span>Talk to CASE</span>
      </Link>

      <style>{`
        .case-action-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 26px rgba(12,10,9,.22);
        }
        .case-action-secondary:hover {
          background: #fff;
          border-color: rgba(0,0,0,.18);
          transform: translateY(-1px);
        }
      `}</style>
    </section>
  )
}

function UploadIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 10V3" />
      <path d="M4 5.6L7 2.6l3 3" />
      <path d="M2.4 9.4v1.4A1.2 1.2 0 0 0 3.6 12h6.8a1.2 1.2 0 0 0 1.2-1.2V9.4" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 4.6A1.6 1.6 0 0 1 3.6 3h6.8A1.6 1.6 0 0 1 12 4.6v4.2A1.6 1.6 0 0 1 10.4 10.4H6.2L3.6 12.4V10.4A1.6 1.6 0 0 1 2 8.8z" />
    </svg>
  )
}

// ── KPI row ─────────────────────────────────────────────────────────────────
function KpiRow({ persona, ready }: { persona: Persona; ready: boolean }) {
  const { financials, exitIQ, sba } = persona
  const cards = [
    {
      eyebrow: "Exit IQ Score",
      value: `${exitIQ.score}`,
      suffix: `/100`,
      footnote: `Grade ${exitIQ.grade} · ${exitIQ.label}`,
    },
    {
      eyebrow: "Recommended Listing",
      value: financials.recommendedListingDisplay,
      suffix: "",
      footnote: `${financials.valuationLowDisplay} – ${financials.valuationHighDisplay} range · ${financials.appliedMultiple}× SDE`,
    },
    {
      eyebrow: "Normalized SDE",
      value: financials.sdeMidpointDisplay,
      suffix: "",
      footnote: `Year 3 normalized ${financials.normalizedSDEYear3Display} · revenue ${financials.revenueDisplay}`,
    },
    {
      eyebrow: "SBA 7(a) Status",
      value: sba.eligible ? "Eligible" : "Not eligible",
      suffix: "",
      footnote: `DSCR ${sba.dscr}× · ${sba.minDownPaymentDisplay} buyer down · ${sba.monthlyDebtServiceDisplay}/mo`,
    },
  ]

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 14,
      }}
    >
      {cards.map((c) => (
        <article
          key={c.eyebrow}
          className="scorta-kpi"
          style={{
            padding: "20px 20px 18px",
            background: "rgba(255,255,255,.72)",
            border: "1px solid var(--glass-edge, rgba(0,0,0,.06))",
            borderRadius: 16,
            transition: "transform 180ms ease-out, border-color 180ms ease-out, box-shadow 180ms ease-out",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "var(--t3)",
              marginBottom: 14,
              fontFamily: inter,
            }}
          >
            {c.eyebrow}
          </div>
          {!ready ? (
            <KpiSkeleton />
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span
                  style={{
                    fontFamily: garamond,
                    fontWeight: 400,
                    fontSize: 32,
                    letterSpacing: "-.7px",
                    color: "var(--t1)",
                    lineHeight: 1,
                  }}
                >
                  {c.value}
                </span>
                {c.suffix && (
                  <span style={{ fontSize: 13, color: "var(--t3)", fontFamily: inter }}>{c.suffix}</span>
                )}
              </div>
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 11,
                  borderTop: "1px solid var(--div)",
                  fontSize: 11.5,
                  color: "var(--t2)",
                  lineHeight: 1.5,
                  fontFamily: inter,
                }}
              >
                {c.footnote}
              </div>
            </>
          )}
        </article>
      ))}

      <style>{`
        .scorta-kpi:hover {
          transform: translateY(-1px);
          border-color: rgba(0,0,0,.10);
          box-shadow: 0 8px 24px rgba(12,10,9,.06);
        }
      `}</style>
    </section>
  )
}

function KpiSkeleton() {
  return (
    <div>
      <div
        style={{
          height: 28,
          width: "60%",
          borderRadius: 6,
          background: "linear-gradient(90deg, rgba(0,0,0,.05), rgba(0,0,0,.09), rgba(0,0,0,.05))",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.6s linear infinite",
        }}
      />
      <div
        style={{
          marginTop: 14,
          height: 10,
          width: "85%",
          borderRadius: 4,
          background: "rgba(0,0,0,.06)",
        }}
      />
    </div>
  )
}

// ── Risk strip ──────────────────────────────────────────────────────────────
function RiskStrip({ persona }: { persona: Persona }) {
  const { risk } = persona
  return (
    <section
      style={{
        padding: "14px 18px",
        borderRadius: 14,
        background: "rgba(196,78,44,.05)",
        border: "1px solid rgba(196,78,44,.16)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        fontFamily: inter,
      }}
    >
      <div
        style={{
          padding: "3px 9px",
          borderRadius: 9999,
          background: "rgba(196,78,44,.10)",
          color: "var(--crit, #c44e2c)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: ".6px",
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        {risk.keyPersonRiskLevel} risk
      </div>
      <div style={{ fontSize: 13, color: "var(--t1)", flex: 1, lineHeight: 1.5 }}>
        <strong>Owner-Dependency Agent</strong> flagged transferability at{" "}
        <strong>{risk.ownerDependencyScore}/100</strong> — {risk.staffTenuredCount} of{" "}
        {risk.staffTotal} staff tenured ≥ 3 yrs, {risk.sopsDocumented} documented SOPs. Closing
        this is worth <strong style={{ color: "var(--mint, #2c8c70)" }}>{risk.fixValueUnlockDisplay}</strong>{" "}
        in deal value.
      </div>
      <Link
        href="/risk"
        className="scorta-rail-link"
        style={{
          fontSize: 11.5,
          fontWeight: 600,
          color: "var(--t1)",
          textDecoration: "none",
          padding: "7px 12px",
          borderRadius: 9999,
          border: "1px solid var(--glass-edge, rgba(0,0,0,.10))",
          background: "rgba(255,255,255,.7)",
          transition: "background 180ms ease-out, border-color 180ms ease-out, transform 180ms ease-out",
          whiteSpace: "nowrap",
        }}
      >
        Open risk analysis →
      </Link>
      <style>{`
        .scorta-rail-link:hover { background: #fff; border-color: rgba(0,0,0,.18); transform: translateY(-1px); }
      `}</style>
    </section>
  )
}

// ── Exit IQ recap ───────────────────────────────────────────────────────────
function ExitIqRecap({ persona }: { persona: Persona }) {
  const { exitIQ, business, financials } = persona
  return (
    <section
      style={{
        padding: "22px 22px 18px",
        borderRadius: 16,
        background: "rgba(255,255,255,.72)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.06))",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "var(--t3)",
            fontFamily: inter,
          }}
        >
          From your ExitIQ assessment
        </div>
        <Link
          href={`/report/${exitIQ.sessionId}`}
          className="scorta-rail-link"
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: "var(--t1)",
            textDecoration: "none",
            padding: "6px 12px",
            borderRadius: 9999,
            border: "1px solid var(--glass-edge, rgba(0,0,0,.10))",
            background: "rgba(255,255,255,.7)",
            transition: "background 180ms ease-out, border-color 180ms ease-out, transform 180ms ease-out",
          }}
        >
          Re-open full report →
        </Link>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18 }}>
        <RecapStat label="Industry" value={business.industry} />
        <RecapStat label="Years operating" value={`${business.yearsOperating}`} />
        <RecapStat label="Employees" value={`${business.employees}`} sub={`${persona.risk.staffTenuredCount} tenured ≥ 3 yrs`} />
        <RecapStat label="Facility" value={business.facilityType} />
        <RecapStat
          label="Top customer share"
          value={`${financials.customerConcentrationTop}%`}
          sub={persona.risk.topAccountName}
        />
      </div>
    </section>
  )
}

function RecapStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "var(--t3)",
          fontFamily: inter,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: garamond,
          fontSize: 19,
          fontWeight: 400,
          color: "var(--t1)",
          lineHeight: 1.15,
          letterSpacing: "-.2px",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 3, fontFamily: inter }}>
          {sub}
        </div>
      )}
    </div>
  )
}

// ── Sellability Roadmap ─────────────────────────────────────────────────────
function NextStepsCard({ persona }: { persona: Persona }) {
  return (
    <section
      style={{
        padding: "22px 22px 18px",
        borderRadius: 16,
        background: "rgba(255,255,255,.72)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.06))",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "var(--t3)",
          fontFamily: inter,
          marginBottom: 14,
        }}
      >
        Sellability roadmap
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {persona.nextSteps.map((step, i) => (
          <li
            key={`${step.action}-${i}`}
            style={{
              padding: "11px 12px",
              borderRadius: 12,
              background: "rgba(255,255,255,.6)",
              border: "1px solid var(--glass-edge, rgba(0,0,0,.05))",
              display: "flex",
              alignItems: "flex-start",
              gap: 11,
            }}
          >
            <StatusDot status={step.status} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                <PriorityTag priority={step.priority} />
              </div>
              <div style={{ fontSize: 12.5, color: "var(--t1)", lineHeight: 1.4, fontWeight: 500 }}>
                {step.action}
              </div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 3, fontFamily: inter }}>
                {step.impact}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function StatusDot({ status }: { status: "done" | "not_started" | "in_progress" | "ready" }) {
  if (status === "done") {
    return (
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "var(--mint, #2c8c70)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width={10} height={10} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 5.2L4.2 7.4 8 3.2" />
        </svg>
      </div>
    )
  }
  if (status === "in_progress") {
    return (
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: "2px solid var(--sky, #4a7ba8)",
          borderTopColor: "transparent",
          flexShrink: 0,
          animation: "spin 1.6s linear infinite",
        }}
      />
    )
  }
  if (status === "ready") {
    return (
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "var(--lav-soft, rgba(107,93,176,.12))",
          border: "1px solid var(--lav-edge, rgba(107,93,176,.26))",
          color: "var(--lav, #6b5db0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--lav, #6b5db0)" }} />
      </div>
    )
  }
  return (
    <div
      style={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        border: "1px dashed var(--t4)",
        flexShrink: 0,
      }}
    />
  )
}

function PriorityTag({ priority }: { priority: "critical" | "high" | "active" }) {
  const map = {
    critical: { label: "Critical", color: "var(--crit, #c44e2c)", bg: "rgba(196,78,44,.10)" },
    high: { label: "High", color: "var(--peach, #b86a3e)", bg: "var(--peach-soft, rgba(184,106,62,.10))" },
    active: { label: "Active", color: "var(--mint, #2c8c70)", bg: "var(--mint-soft, rgba(44,140,112,.10))" },
  } as const
  const v = map[priority]
  return (
    <span
      style={{
        padding: "1px 8px",
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: ".6px",
        textTransform: "uppercase",
        color: v.color,
        background: v.bg,
        borderRadius: 9999,
        fontFamily: inter,
      }}
    >
      {v.label}
    </span>
  )
}
