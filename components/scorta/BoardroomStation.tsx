"use client"

import { useRouter } from "next/navigation"
import React from "react"

import type { PERSONA as PersonaShape } from "@/lib/persona"

import { useAgentFleet } from "./AgentFleetContext"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

// ── Timing (same family as IngestionStation / RecastStation T = {…}) ────────
const T = {
  cardStaggerMs: 600, // delay between each persona card appearing
  reasoningCycleMs: 600, // cadence of status lines inside each card
  reasoningTotalMs: 2400, // 4 lines × 600ms — must run to full 2.4s
  flipMs: 200, // verdict reveal transition
  surfaceRevealMs: 360,
  approveSpinnerMs: 700,
  dispatchStaggerMs: 200, // gap between each work-order card flip
  auditHoldMs: 520,
  loiTipMs: 2200,
}

type Persona = typeof PersonaShape
type ApprovePhase = "idle" | "dispatching" | "dispatched"
type PersonaKey = "sba" | "search" | "micro"

// ── Persona data (hard-coded from station-agent6.md spec) ───────────────────
type Verdict = "proceed" | "conditional" | "no"
type Severity = "deal_breaker" | "high" | "medium" | "low"

type Objection = {
  severity: Severity
  text: string
  assignment: string
  workOrderRef: number | null // index into WORK_ORDERS, or null if no agent
}

type PersonaPanel = {
  key: PersonaKey
  name: string
  typeLabel: string
  summary: string
  accent: string
  accentSoft: string
  accentEdge: string
  reasoning: ReadonlyArray<string>
  verdict: Verdict
  conditionSummary: string
  conditionFull: string
  offerRange: string
  structure: string
  sellerNote: string
  condition: string
  readKey: string
  readValue: string
  readBody: string
  objections: ReadonlyArray<Objection>
}

const PANELS: ReadonlyArray<PersonaPanel> = [
  {
    key: "sba",
    name: "SBA-Backed Operator",
    typeLabel: "First-Time Buyer · SBA 7(a) Financing",
    summary:
      "Evaluates deals through debt service coverage and operator replaceability. Needs a business that runs without the seller in 90 days.",
    accent: "var(--mint, #2c8c70)",
    accentSoft: "rgba(44,140,112,.10)",
    accentEdge: "rgba(44,140,112,.28)",
    reasoning: [
      "Reviewing DSCR against SBA 7(a) threshold...",
      "Evaluating operator replaceability post-close...",
      "Assessing add-back defensibility...",
      "Forming LOI conditions...",
    ],
    verdict: "conditional",
    conditionSummary: "Conditional on SOP documentation for 5 tasks",
    conditionFull:
      "Would proceed once the 5 owner-dependent operational tasks have documented SOPs in place. Lender will require these before close.",
    offerRange: "$1.55M – $1.70M",
    structure: "SBA 7(a) · $106K buyer down",
    sellerNote: "None required",
    condition: "SOP docs before close",
    readKey: "DSCR Read",
    readValue: "4.4× — Strong",
    readBody: "No lender concern on the debt service. Multiple of cash flow comfortably clears underwriting floor.",
    objections: [
      {
        severity: "deal_breaker",
        text: "Owner-dependency score 38/100 — lender will require documented SOPs for post-close operations.",
        assignment: "Owner-Dependency Agent",
        workOrderRef: 0,
      },
      {
        severity: "high",
        text: "Only 1 of 11 staff tenured 3+ yrs — key-person risk post-close.",
        assignment: "Owner-Dependency Agent",
        workOrderRef: 0,
      },
      {
        severity: "medium",
        text: "Personal travel add-back ($9K) may require receipt documentation for lender review.",
        assignment: "Recast Agent",
        workOrderRef: 2,
      },
      {
        severity: "low",
        text: "Marketing spend trending up 58% over 3 yrs — buyer will want attribution.",
        assignment: "No agent assigned",
        workOrderRef: null,
      },
    ],
  },
  {
    key: "search",
    name: "Search Fund Buyer",
    typeLabel: "Searcher · Self-Funded Acquisition",
    summary:
      "Thesis-driven buyer focused on recurring revenue quality and management transition clarity. Will not proceed without contracted revenue visibility.",
    accent: "var(--sky, #4a7ba8)",
    accentSoft: "rgba(74,123,168,.10)",
    accentEdge: "rgba(74,123,168,.26)",
    reasoning: [
      "Evaluating recurring revenue quality...",
      "Analyzing customer concentration risk...",
      "Reviewing management transition timeline...",
      "Forming LOI conditions...",
    ],
    verdict: "conditional",
    conditionSummary: "Conditional on 3-year NJ Transit contract",
    conditionFull:
      "Will not proceed without a 3-year NJ Transit Corporate Catering contract extension and a documented management transition plan.",
    offerRange: "$1.45M – $1.65M",
    structure: "SBA 7(a) or seller-financed",
    sellerNote: "$150K – $200K preferred",
    condition: "NJ Transit 3-yr contract + mgmt transition plan",
    readKey: "Recurring Rev Read",
    readValue: "38% — Thin",
    readBody: "The NJ Transit account is the thesis. Lock it before LOI or the recurring story collapses.",
    objections: [
      {
        severity: "deal_breaker",
        text: "NJ Transit contract unconfirmed beyond current term — recurring revenue thesis depends on it.",
        assignment: "Concentration Agent",
        workOrderRef: 1,
      },
      {
        severity: "deal_breaker",
        text: "No management layer below owner — search fund requires operable business on day 1.",
        assignment: "Owner-Dependency Agent",
        workOrderRef: 0,
      },
      {
        severity: "high",
        text: "Recurring revenue at 38% — below search fund threshold of 50%+.",
        assignment: "No agent assigned (structural)",
        workOrderRef: null,
      },
      {
        severity: "medium",
        text: "No documented transition plan for catering sales relationships.",
        assignment: "Owner-Dependency Agent",
        workOrderRef: 0,
      },
    ],
  },
  {
    key: "micro",
    name: "Micro-PE Buyer",
    typeLabel: "Independent Sponsor · Platform Acquisition",
    summary:
      "Asset and brand-driven. Models deals as platforms for add-on acquisitions. Comfortable with seller notes and earnouts.",
    accent: "var(--peach, #b86a3e)",
    accentSoft: "rgba(184,106,62,.10)",
    accentEdge: "rgba(184,106,62,.28)",
    reasoning: [
      "Assessing platform acquisition fit...",
      "Reviewing property and asset base...",
      "Modeling seller note structure...",
      "Forming LOI conditions...",
    ],
    verdict: "proceed",
    conditionSummary: "Proceed — prefers seller note $175K – $229K",
    conditionFull:
      "Ready to issue LOI. Prefers a seller note in the $175K – $229K range (10–15% of deal) to align long-term incentives.",
    offerRange: "$1.65M – $1.85M",
    structure: "Cash + seller note",
    sellerNote: "$175K – $229K (10–15% of deal)",
    condition: "None hard — prefers faster close",
    readKey: "Asset Read",
    readValue: "Property + brand + 15-yr ops",
    readBody:
      "Property ownership is a balance sheet asset. 15-year brand + facility = platform fit for add-on acquisitions.",
    objections: [
      {
        severity: "high",
        text: "0 documented SOPs — platform integration requires process documentation.",
        assignment: "Owner-Dependency Agent",
        workOrderRef: 0,
      },
      {
        severity: "high",
        text: "Single-location operation limits near-term add-on potential.",
        assignment: "No agent assigned (structural)",
        workOrderRef: null,
      },
      {
        severity: "medium",
        text: "Seller note preference ($175K – $229K) needs seller confirmation.",
        assignment: "Human: deal lead to confirm",
        workOrderRef: null,
      },
      {
        severity: "low",
        text: "Customer concentration moderate — within threshold but monitor.",
        assignment: "Concentration Agent",
        workOrderRef: 1,
      },
    ],
  },
]

// ── Work orders (hard-coded from spec) ──────────────────────────────────────
type WorkOrder = {
  agent: string
  agentKey: string
  priority: "CRITICAL" | "HIGH" | "MEDIUM"
  priorityTone: "crit" | "high" | "med"
  task: string
  triggeredBy: string
  unlock: string
  triggerSource: ReadonlyArray<{ panel: PersonaKey; severity: Severity; text: string }>
}

const WORK_ORDERS: ReadonlyArray<WorkOrder> = [
  {
    agent: "Owner-Dependency Agent",
    agentKey: "owner_dep",
    priority: "CRITICAL",
    priorityTone: "crit",
    task: "Document the 5 owner-dependent operational tasks flagged by the SBA-Backed Operator and Search Fund personas. Generate SOP templates for each task. Target: raise Transferability score from 38/100 to 62/100.",
    triggeredBy: "SBA-Backed Operator (deal-breaker) + Search Fund (deal-breaker) + Micro-PE (high)",
    unlock: "+$450,000",
    triggerSource: [
      { panel: "sba", severity: "deal_breaker", text: "Owner-dependency score 38/100" },
      { panel: "search", severity: "deal_breaker", text: "No management layer below owner" },
      { panel: "micro", severity: "high", text: "0 documented SOPs" },
    ],
  },
  {
    agent: "Concentration Agent",
    agentKey: "concentration",
    priority: "HIGH",
    priorityTone: "high",
    task: "Draft a contract extension proposal for the NJ Transit Corporate Catering account. Target: 3-year renewal. Confirm contract status and document tenure for lender package.",
    triggeredBy: "Search Fund (deal-breaker)",
    unlock: "Unlocks Search Fund LOI pathway",
    triggerSource: [
      { panel: "search", severity: "deal_breaker", text: "NJ Transit contract unconfirmed beyond current term" },
    ],
  },
  {
    agent: "Recast Agent",
    agentKey: "recast",
    priority: "MEDIUM",
    priorityTone: "med",
    task: "Harden the personal travel add-back narrative ($9K/yr) with receipt-level documentation guidance. Update lender package narrative to pre-empt SBA underwriter challenge.",
    triggeredBy: "SBA-Backed Operator (medium)",
    unlock: "Reduces lender friction",
    triggerSource: [
      { panel: "sba", severity: "medium", text: "Personal travel add-back ($9K) may require receipt documentation" },
    ],
  },
  {
    agent: "Outreach Agent",
    agentKey: "outreach",
    priority: "HIGH",
    priorityTone: "high",
    task: "Prioritize SBA-Backed Operator and Micro-PE buyer profiles for initial outreach. Search Fund outreach held pending NJ Transit contract confirmation. Generate personalized sequences for each target profile.",
    triggeredBy: "Boardroom buyer segment recommendations",
    unlock: "Opens two of three LOI pathways",
    triggerSource: [
      { panel: "sba", severity: "deal_breaker", text: "Buyer segment priority" },
      { panel: "micro", severity: "high", text: "Buyer segment priority" },
    ],
  },
]

const DISPATCH_LINES: ReadonlyArray<string> = [
  "Dispatching Owner-Dependency Agent...",
  "Dispatching Recast Agent...",
  "Dispatching Concentration Agent...",
  "Dispatching Outreach Agent...",
]

// ── Component ────────────────────────────────────────────────────────────────
export function BoardroomStation({ persona }: { persona: Persona }) {
  const router = useRouter()
  const { setDispatched } = useAgentFleet()

  // Convening sequence state
  const [visibleCount, setVisibleCount] = React.useState(0) // 0..3 — how many cards have appeared
  const [reasoningIdx, setReasoningIdx] = React.useState(0) // 0..3 — which reasoning line per panel
  const [verdictsRevealed, setVerdictsRevealed] = React.useState(false)
  const [workOrdersVisible, setWorkOrdersVisible] = React.useState(false)
  const [approveVisible, setApproveVisible] = React.useState(false)

  // Approve / dispatch state
  const [approvePhase, setApprovePhase] = React.useState<ApprovePhase>("idle")
  const [dispatchLineIdx, setDispatchLineIdx] = React.useState(0)
  const [dispatchedCount, setDispatchedCount] = React.useState(0) // 0..4
  const [approvedAt, setApprovedAt] = React.useState<{ date: string; time: string } | null>(null)

  // LOI tooltip
  const [loiTipShown, setLoiTipShown] = React.useState(false)
  const loiTipTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Convening: stagger card appearance, then run reasoning, then flip ─────
  React.useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = []
    // Stagger card appearances at 0 / 600 / 1200 ms
    for (let i = 1; i <= 3; i++) {
      timers.push(setTimeout(() => setVisibleCount(i), T.cardStaggerMs * i))
    }
    // Reasoning starts after all 3 visible (at 1800ms)
    const reasoningStart = T.cardStaggerMs * 3
    for (let i = 1; i < 4; i++) {
      timers.push(setTimeout(() => setReasoningIdx(i), reasoningStart + T.reasoningCycleMs * i))
    }
    // Verdict reveal — at reasoningStart + reasoningTotalMs
    const flipAt = reasoningStart + T.reasoningTotalMs
    timers.push(setTimeout(() => setVerdictsRevealed(true), flipAt))
    // Work orders + approval gate slide in after the flip
    timers.push(setTimeout(() => setWorkOrdersVisible(true), flipAt + T.flipMs + 280))
    timers.push(setTimeout(() => setApproveVisible(true), flipAt + T.flipMs + 480))
    // Card 0 visible immediately
    setVisibleCount(1)
    return () => timers.forEach(clearTimeout)
  }, [])

  // ── Dispatch handler ──────────────────────────────────────────────────────
  function onDispatch() {
    if (approvePhase !== "idle") return
    setApprovePhase("dispatching")
    setDispatched(true)

    // Cycle dispatch lines during the spinner
    const lineGap = T.approveSpinnerMs / DISPATCH_LINES.length
    for (let i = 1; i < DISPATCH_LINES.length; i++) {
      setTimeout(() => setDispatchLineIdx(i), lineGap * i)
    }

    setTimeout(() => {
      setApprovePhase("dispatched")
      // Flip work orders one at a time
      for (let i = 1; i <= WORK_ORDERS.length; i++) {
        setTimeout(() => setDispatchedCount(i), T.dispatchStaggerMs * i)
      }
      const now = new Date()
      const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
      const auditAt = T.dispatchStaggerMs * WORK_ORDERS.length + 240
      setTimeout(() => setApprovedAt({ date, time }), auditAt)
      setTimeout(() => router.push("/dashboard"), auditAt + T.auditHoldMs)
    }, T.approveSpinnerMs)
  }

  function onReviewLoi() {
    setLoiTipShown(true)
    if (loiTipTimerRef.current) clearTimeout(loiTipTimerRef.current)
    loiTipTimerRef.current = setTimeout(() => setLoiTipShown(false), T.loiTipMs)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <ScopedStyles />
      <StationHeader convening={!verdictsRevealed} persona={persona} />

      <PersonaGrid
        visibleCount={visibleCount}
        reasoningIdx={reasoningIdx}
        verdictsRevealed={verdictsRevealed}
      />

      <WorkOrdersPanel
        visible={workOrdersVisible}
        dispatchedCount={dispatchedCount}
        approvePhase={approvePhase}
      />

      <DispatchGate
        visible={approveVisible}
        persona={persona}
        phase={approvePhase}
        dispatchLineIdx={dispatchLineIdx}
        approvedAt={approvedAt}
        onDispatch={onDispatch}
        onReviewLoi={onReviewLoi}
        loiTipShown={loiTipShown}
      />
    </div>
  )
}

// ── Station header ────────────────────────────────────────────────────────────
function StationHeader({ convening, persona }: { convening: boolean; persona: Persona }) {
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
          Station 06b · /boardroom
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
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Boardroom · Investment Committee
          {convening && (
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--mint, #2c8c70)",
                boxShadow: "0 0 6px var(--mint, #2c8c70)",
                animation: "boardBlink 1.1s ease-in-out infinite",
              }}
            />
          )}
        </div>
      </div>
      <h1
        style={{
          fontFamily: garamond,
          fontWeight: 400,
          fontSize: 42,
          lineHeight: 1.05,
          letterSpacing: "-.8px",
          color: "var(--t1)",
          marginTop: 4,
        }}
      >
        Boardroom
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
        Three buyer agents are reviewing {persona.identity.businessName} in parallel — each reasoning from a
        distinct buyer worldview, each producing a verdict, a deal structure, and a ranked objection list. Their
        objections become work orders for the downstream agent fleet.
      </p>
    </header>
  )
}

// ── Persona grid ──────────────────────────────────────────────────────────────
function PersonaGrid({
  visibleCount,
  reasoningIdx,
  verdictsRevealed,
}: {
  visibleCount: number
  reasoningIdx: number
  verdictsRevealed: boolean
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 16,
        alignItems: "stretch",
      }}
    >
      {PANELS.map((p, idx) => (
        <PersonaPanelView
          key={p.key}
          panel={p}
          visible={visibleCount > idx}
          reasoningIdx={reasoningIdx}
          revealed={verdictsRevealed}
        />
      ))}
    </div>
  )
}

function PersonaPanelView({
  panel,
  visible,
  reasoningIdx,
  revealed,
}: {
  panel: PersonaPanel
  visible: boolean
  reasoningIdx: number
  revealed: boolean
}) {
  return (
    <article
      aria-hidden={!visible}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minHeight: revealed ? 720 : 280,
        padding: "22px 22px 20px",
        borderRadius: 16,
        background: "rgba(248,245,238,.90)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderTop: `3px solid ${panel.accent}`,
        boxShadow:
          "0 1px 0 rgba(255,255,255,.78) inset, 0 -1px 0 rgba(0,0,0,.05) inset, 0 16px 40px rgba(12,10,9,.07)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 320ms ease-out, transform 320ms ease-out",
      }}
    >
      <PanelHeader panel={panel} />
      {!revealed && <ReasoningSurface panel={panel} reasoningIdx={reasoningIdx} />}
      {revealed && <VerdictSurface panel={panel} />}
    </article>
  )
}

function PanelHeader({ panel }: { panel: PersonaPanel }) {
  return (
    <header style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
      <h2
        style={{
          fontFamily: garamond,
          fontSize: 24,
          fontWeight: 500,
          color: "var(--t1)",
          letterSpacing: "-.4px",
          lineHeight: 1.1,
        }}
      >
        {panel.name}
      </h2>
      <div
        style={{
          fontFamily: inter,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "1.1px",
          textTransform: "uppercase",
          color: panel.accent,
        }}
      >
        {panel.typeLabel}
      </div>
      <p
        style={{
          fontSize: 12.5,
          color: "var(--t2)",
          lineHeight: 1.55,
          fontFamily: inter,
          marginTop: 4,
        }}
      >
        {panel.summary}
      </p>
    </header>
  )
}

// ── Reasoning surface (during convening) ─────────────────────────────────────
function ReasoningSurface({ panel, reasoningIdx }: { panel: PersonaPanel; reasoningIdx: number }) {
  return (
    <div
      style={{
        marginTop: 4,
        paddingTop: 14,
        borderTop: "1px solid var(--div, rgba(12,10,9,.07))",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        flex: 1,
        justifyContent: "flex-start",
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: ".7px",
          textTransform: "uppercase",
          color: panel.accent,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: panel.accent,
            boxShadow: `0 0 6px ${panel.accent}`,
            animation: "boardBlink 1.1s ease-in-out infinite",
          }}
        />
        Analyzing
      </div>
      <div
        key={reasoningIdx}
        style={{
          fontFamily: mono,
          fontSize: 11.5,
          color: "var(--t1)",
          lineHeight: 1.55,
          minHeight: 32,
          animation: "boardLineIn .28s ease-out",
        }}
      >
        {panel.reasoning[reasoningIdx]}
      </div>
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          gap: 5,
          paddingTop: 14,
        }}
      >
        {panel.reasoning.map((_, i) => (
          <span
            key={i}
            aria-hidden
            style={{
              flex: 1,
              height: 3,
              borderRadius: 9999,
              background: i <= reasoningIdx ? panel.accent : "rgba(12,10,9,.10)",
              transition: "background 240ms ease-out",
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Verdict surface (after flip) ────────────────────────────────────────────
function VerdictSurface({ panel }: { panel: PersonaPanel }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        flex: 1,
        animation: `boardFlipIn ${T.flipMs}ms ease-out`,
      }}
    >
      <VerdictStrip panel={panel} />
      <ValuationBlock panel={panel} />
      <ObjectionStack panel={panel} />
    </div>
  )
}

function VerdictStrip({ panel }: { panel: PersonaPanel }) {
  const [hover, setHover] = React.useState(false)
  const v = VERDICT_META[panel.verdict]
  return (
    <div
      style={{
        paddingTop: 14,
        paddingBottom: 14,
        borderTop: "1px solid var(--div, rgba(12,10,9,.07))",
        position: "relative",
      }}
    >
      <button
        type="button"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        style={{
          all: "unset",
          width: "100%",
          padding: "12px 14px",
          borderRadius: 12,
          background: v.bg,
          border: `1px solid ${v.edge}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: panel.verdict === "conditional" ? "help" : "default",
        }}
        aria-label={`${v.label} verdict`}
      >
        <span
          aria-hidden
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: v.dot,
            boxShadow: `0 0 8px ${v.dot}`,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: garamond,
            fontSize: 22,
            fontWeight: 500,
            color: v.text,
            letterSpacing: "-.3px",
            lineHeight: 1,
            flex: 1,
          }}
        >
          {v.label}
        </span>
      </button>
      <div
        style={{
          fontSize: 12,
          color: "var(--t2)",
          fontFamily: inter,
          marginTop: 8,
          lineHeight: 1.5,
          minHeight: 36,
        }}
      >
        {hover && panel.verdict === "conditional" ? panel.conditionFull : panel.conditionSummary}
      </div>
    </div>
  )
}

const VERDICT_META: Record<
  Verdict,
  { label: string; bg: string; edge: string; dot: string; text: string }
> = {
  proceed: {
    label: "● Proceed to LOI",
    bg: "rgba(44,140,112,.10)",
    edge: "rgba(44,140,112,.30)",
    dot: "var(--mint, #2c8c70)",
    text: "var(--mint, #2c8c70)",
  },
  conditional: {
    label: "◐ Conditional",
    bg: "rgba(184,106,62,.10)",
    edge: "rgba(184,106,62,.30)",
    dot: "var(--peach, #b86a3e)",
    text: "var(--peach, #b86a3e)",
  },
  no: {
    label: "○ Would Not Proceed",
    bg: "rgba(196,78,44,.10)",
    edge: "rgba(196,78,44,.32)",
    dot: "var(--crit, #c44e2c)",
    text: "var(--crit, #c44e2c)",
  },
}

function ValuationBlock({ panel }: { panel: PersonaPanel }) {
  return (
    <div
      style={{
        paddingTop: 16,
        paddingBottom: 18,
        borderTop: "1px solid var(--div, rgba(12,10,9,.07))",
        display: "flex",
        flexDirection: "column",
        gap: 9,
      }}
    >
      <SectionLabel>Valuation & Deal Structure</SectionLabel>
      <DealRow label="Offer Range" value={panel.offerRange} anchor />
      <DealRow label="Structure" value={panel.structure} />
      <DealRow label="Seller Note" value={panel.sellerNote} />
      <DealRow label="Condition" value={panel.condition} muted />
      <div
        style={{
          marginTop: 8,
          padding: "10px 12px",
          borderRadius: 10,
          background: panel.accentSoft,
          border: `1px solid ${panel.accentEdge}`,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 9.5,
            fontWeight: 600,
            letterSpacing: ".7px",
            textTransform: "uppercase",
            color: panel.accent,
            marginBottom: 4,
          }}
        >
          {panel.readKey} · {panel.readValue}
        </div>
        <div style={{ fontSize: 12, color: "var(--t1)", lineHeight: 1.5, fontFamily: inter }}>
          {panel.readBody}
        </div>
      </div>
    </div>
  )
}

function DealRow({
  label,
  value,
  anchor,
  muted,
}: {
  label: string
  value: string
  anchor?: boolean
  muted?: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <span
        style={{
          fontFamily: inter,
          fontSize: 11.5,
          color: "var(--t3)",
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: anchor ? garamond : inter,
          fontSize: anchor ? 17 : 12.5,
          fontWeight: anchor ? 500 : 500,
          color: muted ? "var(--t2)" : "var(--t1)",
          letterSpacing: anchor ? "-.2px" : 0,
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  )
}

function ObjectionStack({ panel }: { panel: PersonaPanel }) {
  return (
    <div
      style={{
        paddingTop: 16,
        paddingBottom: 4,
        borderTop: "1px solid var(--div, rgba(12,10,9,.07))",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        flex: 1,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <SectionLabel>Objections — Ranked by Severity</SectionLabel>
        <div style={{ fontSize: 11, color: "var(--t3)", lineHeight: 1.45, fontFamily: inter }}>
          Deal-breakers flagged for immediate remediation. Negotiation points surfaced for awareness.
        </div>
      </div>
      <SeverityLegend />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {panel.objections.map((o, i) => (
          <ObjectionRow key={i} objection={o} />
        ))}
      </div>
    </div>
  )
}

function ObjectionRow({ objection }: { objection: Objection }) {
  const [hover, setHover] = React.useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        padding: "10px 12px",
        borderRadius: 10,
        background: "rgba(255,255,255,.55)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.06))",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        transform: hover ? "translateY(-1px)" : "translateY(0)",
        boxShadow: hover ? "0 6px 14px rgba(12,10,9,.07)" : "none",
        transition: "transform 180ms ease-out, box-shadow 180ms ease-out",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <SeverityChip severity={objection.severity} />
      </div>
      <div style={{ fontSize: 12.5, color: "var(--t1)", lineHeight: 1.5, fontFamily: inter }}>
        {objection.text}
      </div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontFamily: mono,
          fontSize: 10.5,
          color: hover && objection.workOrderRef !== null ? "var(--mint, #2c8c70)" : "var(--t3)",
          letterSpacing: ".3px",
          transition: "color 180ms ease-out",
        }}
      >
        <span aria-hidden>→</span>
        {objection.assignment}
      </div>
      {hover && objection.workOrderRef !== null && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            left: "50%",
            bottom: "calc(100% + 8px)",
            transform: "translateX(-50%)",
            padding: "8px 11px",
            borderRadius: 10,
            background: "rgba(12,10,9,.94)",
            color: "rgba(245,245,245,.95)",
            fontSize: 11,
            lineHeight: 1.4,
            fontFamily: inter,
            whiteSpace: "nowrap",
            boxShadow: "0 10px 30px rgba(0,0,0,.22)",
            animation: "boardLineIn .22s ease-out",
            zIndex: 30,
          }}
        >
          Generated Work Order {objection.workOrderRef + 1} → {objection.assignment}.
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid rgba(12,10,9,.94)",
            }}
          />
        </span>
      )}
    </div>
  )
}

const SEVERITY_META: Record<
  Severity,
  { label: string; bg: string; edge: string; color: string; dot: string }
> = {
  deal_breaker: {
    label: "Deal-Breaker",
    bg: "rgba(196,78,44,.10)",
    edge: "rgba(196,78,44,.34)",
    color: "var(--crit, #c44e2c)",
    dot: "var(--crit, #c44e2c)",
  },
  high: {
    label: "High",
    bg: "rgba(184,106,62,.10)",
    edge: "rgba(184,106,62,.30)",
    color: "var(--peach, #b86a3e)",
    dot: "var(--peach, #b86a3e)",
  },
  medium: {
    label: "Medium",
    bg: "rgba(74,123,168,.10)",
    edge: "rgba(74,123,168,.28)",
    color: "var(--sky, #4a7ba8)",
    dot: "var(--sky, #4a7ba8)",
  },
  low: {
    label: "Low",
    bg: "rgba(12,10,9,.05)",
    edge: "transparent",
    color: "var(--t2)",
    dot: "var(--t3)",
  },
}

function SeverityChip({ severity }: { severity: Severity }) {
  const m = SEVERITY_META[severity]
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 8px",
        borderRadius: 9999,
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: ".7px",
        textTransform: "uppercase",
        fontFamily: inter,
        color: m.color,
        background: m.bg,
        border: m.edge === "transparent" ? "1px solid transparent" : `1px solid ${m.edge}`,
      }}
    >
      <span aria-hidden style={{ width: 5, height: 5, borderRadius: "50%", background: m.dot }} />
      {m.label}
    </span>
  )
}

function SeverityLegend() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        paddingBottom: 2,
      }}
    >
      {(Object.keys(SEVERITY_META) as Severity[]).map((s) => (
        <SeverityChip key={s} severity={s} />
      ))}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: inter,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "1.1px",
        textTransform: "uppercase",
        color: "var(--t3)",
      }}
    >
      {children}
    </div>
  )
}

// ── Work orders panel ─────────────────────────────────────────────────────────
function WorkOrdersPanel({
  visible,
  dispatchedCount,
  approvePhase,
}: {
  visible: boolean
  dispatchedCount: number
  approvePhase: ApprovePhase
}) {
  return (
    <section
      aria-hidden={!visible}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: `opacity ${T.surfaceRevealMs}ms ease-out, transform ${T.surfaceRevealMs}ms ease-out`,
        display: visible ? "flex" : "none",
        flexDirection: "column",
        gap: 14,
        padding: "22px 24px 22px",
        borderRadius: 18,
        background: "rgba(12,10,9,.92)",
        color: "rgba(245,245,245,.95)",
        border: "1px solid rgba(255,255,255,.06)",
        boxShadow: "0 18px 44px rgba(12,10,9,.18)",
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: ".7px",
            textTransform: "uppercase",
            color: "rgba(167,229,211,.95)",
          }}
        >
          Boardroom Output · Agent Work Orders
        </div>
        <p
          style={{
            fontSize: 12.5,
            color: "rgba(245,245,245,.62)",
            lineHeight: 1.55,
            fontFamily: inter,
            maxWidth: 760,
          }}
        >
          The following tasks have been generated from Boardroom objections. Each is assigned to the correct
          agent. Approve to dispatch the fleet.
        </p>
      </header>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {WORK_ORDERS.map((wo, i) => (
          <WorkOrderCard
            key={i}
            order={wo}
            index={i}
            dispatched={dispatchedCount > i}
            justFlipped={dispatchedCount === i + 1}
            phase={approvePhase}
          />
        ))}
      </div>
    </section>
  )
}

function WorkOrderCard({
  order,
  index,
  dispatched,
  justFlipped,
  phase,
}: {
  order: WorkOrder
  index: number
  dispatched: boolean
  justFlipped: boolean
  phase: ApprovePhase
}) {
  const [hover, setHover] = React.useState(false)
  const priorityMeta = PRIORITY_META[order.priorityTone]
  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        padding: "16px 18px 14px",
        borderRadius: 14,
        background: dispatched ? "rgba(44,140,112,.10)" : "rgba(245,245,245,.04)",
        border: dispatched
          ? "1px solid rgba(44,140,112,.36)"
          : "1px solid rgba(255,255,255,.08)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "background 260ms ease-out, border-color 260ms ease-out",
        animation: justFlipped ? "boardWoFlash 600ms ease-out" : undefined,
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 9.5,
              fontWeight: 600,
              letterSpacing: ".7px",
              textTransform: "uppercase",
              color: "rgba(167,229,211,.7)",
            }}
          >
            Work Order {index + 1}
          </div>
          <div
            style={{
              fontFamily: garamond,
              fontSize: 19,
              fontWeight: 500,
              color: "rgba(245,245,245,.97)",
              letterSpacing: "-.3px",
              lineHeight: 1.15,
            }}
          >
            {order.agent}
          </div>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 9px",
            borderRadius: 9999,
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: ".7px",
            textTransform: "uppercase",
            fontFamily: inter,
            color: priorityMeta.color,
            background: priorityMeta.bg,
            border: `1px solid ${priorityMeta.edge}`,
          }}
        >
          {order.priority}
        </span>
      </header>
      <p
        style={{
          fontSize: 12.5,
          color: "rgba(245,245,245,.78)",
          lineHeight: 1.6,
          fontFamily: inter,
        }}
      >
        {order.task}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          paddingTop: 10,
          borderTop: "1px solid rgba(255,255,255,.07)",
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "rgba(167,229,211,.85)",
            letterSpacing: ".3px",
          }}
        >
          Unlock · {order.unlock}
        </div>
        <DispatchStatusChip
          dispatched={dispatched}
          phase={phase}
        />
      </div>
      {hover && phase === "idle" && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: "calc(100% + 8px)",
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(245,245,245,.96)",
            color: "rgba(12,10,9,.92)",
            fontSize: 11.5,
            lineHeight: 1.5,
            fontFamily: inter,
            boxShadow: "0 12px 30px rgba(0,0,0,.22)",
            animation: "boardLineIn .22s ease-out",
            zIndex: 30,
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 9.5,
              fontWeight: 600,
              letterSpacing: ".7px",
              textTransform: "uppercase",
              color: "var(--mint, #2c8c70)",
              marginBottom: 4,
            }}
          >
            Triggered by
          </div>
          <div>{order.triggeredBy}</div>
        </span>
      )}
    </article>
  )
}

const PRIORITY_META: Record<
  WorkOrder["priorityTone"],
  { color: string; bg: string; edge: string }
> = {
  crit: {
    color: "rgba(255,168,140,.95)",
    bg: "rgba(196,78,44,.18)",
    edge: "rgba(196,78,44,.42)",
  },
  high: {
    color: "rgba(255,196,158,.95)",
    bg: "rgba(184,106,62,.18)",
    edge: "rgba(184,106,62,.42)",
  },
  med: {
    color: "rgba(170,200,232,.95)",
    bg: "rgba(74,123,168,.18)",
    edge: "rgba(74,123,168,.42)",
  },
}

function DispatchStatusChip({ dispatched, phase }: { dispatched: boolean; phase: ApprovePhase }) {
  if (dispatched) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 9px",
          borderRadius: 9999,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: ".6px",
          textTransform: "uppercase",
          fontFamily: inter,
          color: "rgba(167,229,211,.95)",
          background: "rgba(44,140,112,.22)",
          border: "1px solid rgba(44,140,112,.5)",
        }}
      >
        <svg
          width={10}
          height={10}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 6.4L4.6 9 10 3.4" />
        </svg>
        Dispatched
      </span>
    )
  }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 9px",
        borderRadius: 9999,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: ".6px",
        textTransform: "uppercase",
        fontFamily: inter,
        color: "rgba(245,245,245,.7)",
        background: "rgba(245,245,245,.06)",
        border: "1px solid rgba(245,245,245,.14)",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "rgba(167,229,211,.8)",
          boxShadow: "0 0 6px rgba(167,229,211,.8)",
          animation: phase === "idle" ? "boardBlink 1.6s ease-in-out infinite" : undefined,
        }}
      />
      Awaiting Dispatch
    </span>
  )
}

// ── Dispatch gate ────────────────────────────────────────────────────────────
function DispatchGate({
  visible,
  persona,
  phase,
  dispatchLineIdx,
  approvedAt,
  onDispatch,
  onReviewLoi,
  loiTipShown,
}: {
  visible: boolean
  persona: Persona
  phase: ApprovePhase
  dispatchLineIdx: number
  approvedAt: { date: string; time: string } | null
  onDispatch: () => void
  onReviewLoi: () => void
  loiTipShown: boolean
}) {
  return (
    <section
      aria-hidden={!visible}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: `opacity ${T.surfaceRevealMs}ms ease-out, transform ${T.surfaceRevealMs}ms ease-out`,
        display: visible ? "block" : "none",
        padding: "22px 26px 20px",
        background: "linear-gradient(180deg, rgba(44,140,112,.10) 0%, rgba(44,140,112,.04) 100%)",
        border: "1px solid var(--mint-edge, rgba(44,140,112,.28))",
        borderRadius: 16,
        boxShadow: "0 1px 0 rgba(255,255,255,.6) inset, 0 8px 24px rgba(44,140,112,.10)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div
          aria-hidden
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 40%, rgba(44,140,112,.95) 100%)",
            boxShadow: "0 0 10px rgba(44,140,112,.55)",
            animation: "boardCasePulse 3.2s ease-in-out infinite",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 260, fontFamily: inter }}>
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
            Case Manager Agent · awaiting your approval
          </div>
          <div style={{ fontSize: 14.5, color: "var(--t1)", lineHeight: 1.45, fontWeight: 600 }}>
            Authorize the agent fleet to execute the Boardroom&apos;s work orders.
          </div>
          <div style={{ fontSize: 12.5, color: "var(--t2)", lineHeight: 1.55, marginTop: 4 }}>
            CASE will dispatch four agents simultaneously. No buyer communication will be sent until the
            outreach strategy is separately approved. You can review each agent&apos;s output before it is
            published or shared.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
            position: "relative",
          }}
        >
          <div style={{ position: "relative" }}>
            <button
              onClick={onReviewLoi}
              disabled={phase !== "idle"}
              className="board-secondary"
              style={{
                height: 44,
                padding: "0 16px",
                borderRadius: 9999,
                background: "rgba(255,255,255,.85)",
                color: "var(--t1)",
                border: "1px solid var(--glass-edge, rgba(0,0,0,.10))",
                fontSize: 12.5,
                fontWeight: 600,
                fontFamily: inter,
                cursor: phase === "idle" ? "pointer" : "default",
                opacity: phase === "idle" ? 1 : 0.55,
                transition: "transform 180ms ease-out, box-shadow 180ms ease-out",
              }}
            >
              Review LOI structure logic
            </button>
            {loiTipShown && (
              <span
                role="tooltip"
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: "calc(100% + 8px)",
                  padding: "8px 11px",
                  borderRadius: 10,
                  background: "rgba(12,10,9,.92)",
                  color: "rgba(245,245,245,.95)",
                  fontSize: 11.5,
                  lineHeight: 1.4,
                  fontFamily: inter,
                  whiteSpace: "nowrap",
                  boxShadow: "0 10px 30px rgba(0,0,0,.18)",
                  animation: "boardLineIn .22s ease-out",
                  zIndex: 30,
                }}
              >
                Full LOI term logic available for deal lead review before any buyer communication reflects it.
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 18,
                    width: 0,
                    height: 0,
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderTop: "6px solid rgba(12,10,9,.92)",
                  }}
                />
              </span>
            )}
          </div>
          <button
            onClick={onDispatch}
            disabled={phase !== "idle"}
            className="board-primary"
            style={{
              height: 44,
              padding: "0 22px",
              borderRadius: 9999,
              background: phase === "dispatched" ? "var(--mint, #2c8c70)" : "var(--btn-bg)",
              color: phase === "dispatched" ? "#fff" : "var(--btn-fg)",
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: inter,
              letterSpacing: "-.1px",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              cursor: phase === "idle" ? "pointer" : "default",
              boxShadow: "0 6px 22px rgba(12,10,9,.18)",
              transition:
                "transform 180ms ease-out, box-shadow 180ms ease-out, background 180ms ease-out",
              minWidth: 280,
              justifyContent: "center",
            }}
          >
            {phase === "dispatching" && <Spinner light />}
            {phase === "dispatched" && (
              <svg
                width={12}
                height={12}
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.9}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 6.4L4.6 9 10 3.4" />
              </svg>
            )}
            <span key={dispatchLineIdx}>
              {phase === "dispatching"
                ? DISPATCH_LINES[dispatchLineIdx]
                : phase === "dispatched"
                ? "Fleet dispatched · routing to your command center"
                : "Dispatch Agent Fleet"}
            </span>
            {phase === "idle" && <span style={{ transform: "translateY(-1px)" }}>→</span>}
          </button>
        </div>
      </div>

      {approvedAt && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: "1px dashed var(--mint-edge, rgba(44,140,112,.28))",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: mono,
            fontSize: 11.5,
            color: "var(--mint, #2c8c70)",
            letterSpacing: ".3px",
            animation: "boardLineIn .28s ease-out",
          }}
        >
          <svg
            width={12}
            height={12}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.9}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 6.4L4.6 9 10 3.4" />
          </svg>
          <span>
            Boardroom work orders approved by {persona.identity.displayName} · {approvedAt.date} ·{" "}
            {approvedAt.time} · Agent fleet dispatched. No external communications authorized pending outreach
            review.
          </span>
        </div>
      )}
    </section>
  )
}

function Spinner({ light }: { light?: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        border: `2px solid ${light ? "rgba(245,245,245,.32)" : "rgba(12,10,9,.18)"}`,
        borderTopColor: light ? "var(--btn-fg)" : "var(--t1)",
        animation: "boardSpin .8s linear infinite",
        flexShrink: 0,
      }}
    />
  )
}

// ── Scoped styles ─────────────────────────────────────────────────────────────
function ScopedStyles() {
  return (
    <style>{`
      @keyframes boardCasePulse {
        0%, 100% { transform: scale(1);    opacity: 1;  }
        50%      { transform: scale(1.10); opacity: .9; }
      }
      @keyframes boardBlink {
        0%, 100% { opacity: 1;  }
        50%      { opacity: .3; }
      }
      @keyframes boardLineIn {
        from { opacity: 0; transform: translateY(3px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes boardFlipIn {
        from { opacity: 0; transform: translateY(4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes boardWoFlash {
        0%   { box-shadow: 0 0 0 0 rgba(44,140,112,.55); }
        50%  { box-shadow: 0 0 0 8px rgba(44,140,112,.18); }
        100% { box-shadow: 0 0 0 0 rgba(44,140,112,0); }
      }
      @keyframes boardSpin {
        to { transform: rotate(360deg); }
      }
      .board-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 28px rgba(12,10,9,.22);
      }
      .board-secondary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 22px rgba(12,10,9,.10);
      }
    `}</style>
  )
}
