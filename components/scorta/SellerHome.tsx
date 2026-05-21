"use client"

import Link from "next/link"
import React from "react"

import { useAgentFleet } from "@/components/scorta/AgentFleetContext"
import { CaseHero } from "@/components/scorta/CaseHero"
import {
  AGENT_DEFS,
  type AgentKey,
  type AgentRouteState,
  type AgentStatus,
  getAgentState,
} from "@/lib/agentActivity"
import type { PERSONA as PersonaShape } from "@/lib/persona"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

type Persona = typeof PersonaShape

export function SellerHome({ persona }: { persona: Persona }) {
  const [ready, setReady] = React.useState(false)
  const { dispatched } = useAgentFleet()
  React.useEffect(() => {
    const t = setTimeout(() => setReady(true), 480)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {dispatched ? (
        <>
          <DealInMotionBanner persona={persona} />
          <CommandCenter persona={persona} />
          <CaseActionsStrip />
          <KpiRow persona={persona} ready={ready} />
        </>
      ) : (
        <>
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
        </>
      )}

      <RiskStrip persona={persona} />

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr .9fr", gap: 22 }}>
        <ExitIqRecap persona={persona} />
        <NextStepsCard persona={persona} />
      </div>
    </div>
  )
}

// ── Deal-in-motion banner (post-dispatch only) ──────────────────────────────
function DealInMotionBanner({ persona }: { persona: Persona }) {
  const activeCount = AGENT_DEFS.filter(
    (d) => getAgentState(d.key, "/dashboard", true).status === "running",
  ).length
  return (
    <section
      style={{
        padding: "18px 22px",
        borderRadius: 18,
        background:
          "linear-gradient(180deg, rgba(44,140,112,.18) 0%, rgba(44,140,112,.05) 100%)",
        border: "1px solid var(--mint-edge, rgba(44,140,112,.36))",
        boxShadow:
          "0 1px 0 rgba(255,255,255,.7) inset, 0 14px 32px rgba(44,140,112,.16), 0 3px 8px rgba(20,15,8,.06)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        flexWrap: "wrap",
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
          boxShadow: "0 0 10px rgba(44,140,112,.55)",
          animation: "casePulse 3.2s ease-in-out infinite",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 220 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "var(--mint, #2c8c70)",
            fontWeight: 600,
            letterSpacing: ".7px",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Deal in motion · {activeCount} agents active
        </div>
        <div style={{ fontFamily: garamond, fontSize: 22, color: "var(--t1)", letterSpacing: "-.3px" }}>
          Welcome back, {persona.identity.firstName}.
        </div>
        <div style={{ fontSize: 13, color: "var(--t2)", marginTop: 3, lineHeight: 1.5, fontFamily: inter }}>
          The fleet is dispatched and working on your exit. Here&apos;s where each agent is right now.
        </div>
      </div>
      <Link
        href="/boardroom"
        className="scorta-rail-link"
        style={{
          fontSize: 11.5,
          fontWeight: 600,
          color: "var(--t1)",
          textDecoration: "none",
          padding: "8px 14px",
          borderRadius: 9999,
          border: "1px solid var(--glass-edge, rgba(0,0,0,.10))",
          background: "rgba(255,255,255,.85)",
          whiteSpace: "nowrap",
          transition: "background 180ms ease-out, border-color 180ms ease-out, transform 180ms ease-out",
        }}
      >
        Open Boardroom →
      </Link>
      <style>{`
        @keyframes casePulse {
          0%, 100% { transform: scale(1);    opacity: 1;  }
          50%      { transform: scale(1.12); opacity: .9; }
        }
      `}</style>
    </section>
  )
}

// ── Command Center (post-dispatch only) ─────────────────────────────────────
const AGENT_LINKS: Record<AgentKey, { href: string; label: string }> = {
  owner_dep: { href: "/risk", label: "Open Risk Analysis →" },
  concentration: { href: "/risk", label: "Open Risk Analysis →" },
  recast: { href: "/recast", label: "Open Recast →" },
  outreach: { href: "/buyers", label: "Open Buyer Outreach →" },
}

const NEXT_STEP_LINKS: ReadonlyArray<{ matches: (action: string) => boolean; href: string; label: string }> = [
  { matches: (a) => /CIM/i.test(a), href: "/documents", label: "Review CIM" },
  { matches: (a) => /SOP|ops manual|owner-dependent/i.test(a), href: "/risk", label: "Open Risk Analysis" },
  { matches: (a) => /NDA|buyer/i.test(a), href: "/buyers", label: "Open Buyer Outreach" },
  { matches: (a) => /SDE|add-back|P&L/i.test(a), href: "/recast", label: "Open Recast" },
  { matches: (a) => /lender/i.test(a), href: "/lenders", label: "Open Lender Outreach" },
]

function CommandCenter({ persona }: { persona: Persona }) {
  const openSteps = persona.nextSteps.filter((s) => s.status !== "done").slice(0, 4)
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "1.5fr .9fr",
        gap: 22,
      }}
    >
      <div
        className="spotlight"
        style={{
          padding: "22px 24px 20px",
          borderRadius: 18,
          background: "rgba(255,255,255,.86)",
          border: "1px solid var(--mint-edge, rgba(44,140,112,.32))",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 10.5,
                color: "var(--mint, #2c8c70)",
                fontWeight: 700,
                letterSpacing: ".8px",
                textTransform: "uppercase",
              }}
            >
              Live · Agent Fleet Command Center
            </div>
            <div
              style={{
                fontFamily: garamond,
                fontSize: 22,
                color: "var(--t1)",
                marginTop: 4,
                letterSpacing: "-.3px",
              }}
            >
              Your agents are working on it.
            </div>
          </div>
          <span
            aria-hidden
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontFamily: mono,
              fontSize: 10.5,
              color: "var(--mint, #2c8c70)",
              fontWeight: 600,
              letterSpacing: ".6px",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--mint, #2c8c70)",
                boxShadow: "0 0 6px var(--mint, #2c8c70)",
                animation: "liveBlink 1.8s ease-in-out infinite",
              }}
            />
            Live
          </span>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {AGENT_DEFS.map((def) => {
            const state = getAgentState(def.key, "/dashboard", true)
            const link = AGENT_LINKS[def.key]
            return (
              <AgentCard
                key={def.key}
                name={def.name}
                state={state}
                fallbackTask={state.status === "waiting" ? def.initialTask : (def.runningLines[0] ?? def.initialTask)}
                href={link.href}
                ctaLabel={link.label}
              />
            )
          })}
        </div>
      </div>

      <div
        style={{
          padding: "20px 22px 18px",
          borderRadius: 16,
          background: "rgba(255,255,255,.78)",
          border: "1px solid var(--glass-edge, rgba(0,0,0,.06))",
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "var(--t3)",
            fontWeight: 600,
            letterSpacing: ".7px",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Next steps for you
        </div>
        <div
          style={{
            fontFamily: garamond,
            fontSize: 19,
            color: "var(--t1)",
            letterSpacing: "-.2px",
            marginBottom: 14,
          }}
        >
          Where {persona.identity.firstName} is needed.
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
          {openSteps.map((step, i) => {
            const link = NEXT_STEP_LINKS.find((l) => l.matches(step.action))
            return (
              <li
                key={`${step.action}-${i}`}
                style={{
                  padding: "11px 12px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,.7)",
                  border: "1px solid var(--glass-edge, rgba(0,0,0,.06))",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 11,
                }}
              >
                <StepDot status={step.status} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: ".7px",
                      textTransform: "uppercase",
                      color: priorityColor(step.priority),
                      marginBottom: 3,
                      fontFamily: inter,
                    }}
                  >
                    {step.priority}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--t1)", lineHeight: 1.4, fontWeight: 500 }}>
                    {step.action}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 3, fontFamily: inter }}>
                    {step.impact}
                  </div>
                  {link && (
                    <Link
                      href={link.href}
                      style={{
                        display: "inline-block",
                        marginTop: 7,
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: "var(--t1)",
                        textDecoration: "none",
                        borderBottom: "1px solid var(--glass-edge, rgba(0,0,0,.18))",
                      }}
                    >
                      {link.label} →
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function AgentCard({
  name,
  state,
  fallbackTask,
  href,
  ctaLabel,
}: {
  name: string
  state: AgentRouteState
  fallbackTask: string
  href: string
  ctaLabel: string
}) {
  const task = state.task ?? fallbackTask
  return (
    <article
      style={{
        padding: "13px 14px 12px",
        borderRadius: 12,
        background: state.amber ? "rgba(184,106,62,.06)" : "rgba(255,255,255,.7)",
        border: state.amber
          ? "1px solid var(--peach-edge, rgba(184,106,62,.28))"
          : "1px solid var(--glass-edge, rgba(0,0,0,.06))",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <AgentStatusIndicator status={state.status} amber={state.amber} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--t1)",
              lineHeight: 1.2,
              fontFamily: inter,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 9.5,
              color: state.amber ? "var(--peach, #b86a3e)" : "var(--mint, #2c8c70)",
              letterSpacing: ".5px",
              textTransform: "uppercase",
              fontWeight: 600,
              marginTop: 2,
            }}
          >
            {state.status}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.45, fontFamily: inter }}>{task}</div>
      <Link
        href={href}
        style={{
          fontSize: 11.5,
          fontWeight: 600,
          color: "var(--t1)",
          textDecoration: "none",
          borderBottom: "1px solid var(--glass-edge, rgba(0,0,0,.18))",
          alignSelf: "flex-start",
        }}
      >
        {ctaLabel}
      </Link>
    </article>
  )
}

function AgentStatusIndicator({ status, amber }: { status: AgentStatus; amber: boolean }) {
  const color = amber ? "var(--peach, #b86a3e)" : "var(--mint, #2c8c70)"
  if (status === "complete") {
    return (
      <div
        aria-hidden
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: color,
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
  if (status === "waiting") {
    return (
      <div
        aria-hidden
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
  return (
    <div
      aria-hidden
      style={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: amber ? "rgba(184,106,62,.16)" : "rgba(44,140,112,.16)",
        border: `1px solid ${amber ? "var(--peach-edge, rgba(184,106,62,.28))" : "var(--mint-edge, rgba(44,140,112,.28))"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 6px ${color}`,
          animation: "liveBlink 1.8s ease-in-out infinite",
        }}
      />
    </div>
  )
}

function StepDot({ status }: { status: "ready" | "in_progress" | "not_started" | "done" }) {
  if (status === "in_progress") {
    return (
      <div
        aria-hidden
        style={{
          width: 11,
          height: 11,
          borderRadius: "50%",
          background: "var(--mint, #2c8c70)",
          boxShadow: "0 0 6px var(--mint, #2c8c70)",
          marginTop: 4,
          flexShrink: 0,
          animation: "liveBlink 1.8s ease-in-out infinite",
        }}
      />
    )
  }
  return (
    <div
      aria-hidden
      style={{
        width: 11,
        height: 11,
        borderRadius: "50%",
        border: "1px solid var(--t4)",
        background: status === "ready" ? "rgba(44,140,112,.16)" : "transparent",
        marginTop: 4,
        flexShrink: 0,
      }}
    />
  )
}

function priorityColor(priority: "critical" | "high" | "active") {
  switch (priority) {
    case "critical":
      return "var(--crit, #c44e2c)"
    case "active":
      return "var(--mint, #2c8c70)"
    default:
      return "var(--t3)"
  }
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
            Hand CASE more context, or ask him anything about your exit.
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

      <Link
        href="/documents?from=sell"
        className="case-action case-action-sell cta-glow"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 9,
          padding: "11px 18px",
          borderRadius: 9999,
          background: "linear-gradient(180deg, var(--mint, #2c8c70) 0%, var(--mint-deep, #1d7d62) 100%)",
          color: "#fff",
          fontFamily: inter,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "-.05px",
          textDecoration: "none",
          transition: "transform 180ms ease-out, box-shadow 180ms ease-out",
          whiteSpace: "nowrap",
        }}
      >
        <SellIcon />
        <span>Ready to Sell?</span>
        <span
          style={{
            padding: "1px 7px",
            borderRadius: 9999,
            background: "rgba(255,255,255,.18)",
            color: "rgba(255,255,255,.95)",
            fontFamily: mono,
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: ".6px",
          }}
        >
          → CIM
        </span>
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
        .case-action-sell:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 26px rgba(44,140,112,.42);
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

function SellIcon() {
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
      <path d="M2.5 6.5l4 4 5-7.5" />
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
            padding: "22px 22px 18px",
            background: "rgba(255,255,255,.82)",
            border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
            borderRadius: 16,
            boxShadow: "0 1px 0 rgba(255,255,255,.92) inset, 0 10px 28px rgba(20,15,8,.06)",
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
                    fontWeight: 500,
                    fontSize: 38,
                    letterSpacing: "-.9px",
                    color: "var(--t1)",
                    lineHeight: 1,
                  }}
                >
                  {c.value}
                </span>
                {c.suffix && (
                  <span style={{ fontSize: 14, color: "var(--t3)", fontFamily: inter }}>{c.suffix}</span>
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
          transform: translateY(-2px);
          border-color: var(--mint-edge, rgba(44,140,112,.32));
          box-shadow:
            0 1px 0 rgba(255,255,255,.92) inset,
            0 14px 34px rgba(20,15,8,.10),
            0 4px 10px rgba(44,140,112,.10);
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
