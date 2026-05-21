"use client"

import { useRouter } from "next/navigation"
import React from "react"

import type { PERSONA as PersonaShape } from "@/lib/persona"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

// ── Timing (same family as Ingestion / Recast / Risk / Boardroom / Docs) ───
const T = {
  briefingStepMs: 360, // each line in the dual-thread briefing
  briefingLines: 3, // 3 lines per stream
  briefingTailMs: 240, // pause after both streams complete
  surfaceRevealMs: 360, // two-column surface slide-in
  submitSpinnerMs: 700, // lender column submit
  launchSpinnerMs: 520, // buyer launch sequence
  approveSpinnerMs: 700, // full approval gate spinner
  approveStaggerMs: 300, // per-card stagger after approval
  auditHoldMs: 520, // audit line hold after approval
  vdrTipMs: 2200, // VDR tooltip flash
  reviewTipMs: 2200, // review sequence tooltip flash
}

type Persona = typeof PersonaShape
type Phase = "briefing" | "ready"
type SubmitPhase = "idle" | "submitting" | "submitted"
type LaunchPhase = "idle" | "launching" | "launched"
type ApprovePhase = "idle" | "approving" | "approved"
type BuyerColumn = "identified" | "contacted" | "interested" | "nda"

export type OutreachMode = "lenders" | "buyers"

// ── Lender data (DEMO_PERSONA.md Section 7 + 11) ────────────────────────────
type Lender = {
  id: string
  name: string
  matchPct: number
  type: string
  note: string
  loanTermsLine1: string
  loanTermsLine2: string
  vdrGranted: boolean
}

const LENDERS: ReadonlyArray<Lender> = [
  {
    id: "northeast",
    name: "Northeast Community Bank",
    matchPct: 94,
    type: "NJ food service specialist · SBA preferred lender",
    note: "Highest match — local relationship lender, NJ food service specialization, SBA preferred status means faster commitment.",
    loanTermsLine1: "Up to $1.4M · 10-year term",
    loanTermsLine2: "prime + 2.75%",
    vdrGranted: true,
  },
  {
    id: "first_national",
    name: "First National Business Capital",
    matchPct: 87,
    type: "National SBA lender · 15-day commitment SLA",
    note: "Fast commitment timeline — 15-day SLA suitable for Chandan's 6–12 month exit window.",
    loanTermsLine1: "Up to $1.2M · 10-year term",
    loanTermsLine2: "prime + 3.0%",
    vdrGranted: false,
  },
  {
    id: "readycap",
    name: "ReadyCap Commercial",
    matchPct: 81,
    type: "SBA non-bank lender · flexible down payment",
    note: "Flexible down payment structure — useful if buyer needs sub-$106K entry point.",
    loanTermsLine1: "Up to $1.1M · 10-year term",
    loanTermsLine2: "prime + 3.25%",
    vdrGranted: false,
  },
]

// ── Buyer data (Boardroom personas + spec) ──────────────────────────────────
type BuyerType = "sba" | "micro_pe" | "search"

const BUYER_META: Record<BuyerType, { label: string; accent: string; soft: string; edge: string }> = {
  sba: {
    label: "SBA-Backed Operator",
    accent: "var(--mint, #2c8c70)",
    soft: "var(--mint-soft, rgba(44,140,112,.10))",
    edge: "var(--mint-edge, rgba(44,140,112,.28))",
  },
  micro_pe: {
    label: "Micro-PE Buyer",
    accent: "var(--peach, #b86a3e)",
    soft: "var(--peach-soft, rgba(184,106,62,.10))",
    edge: "var(--peach-edge, rgba(184,106,62,.28))",
  },
  search: {
    label: "Search Fund Buyer",
    accent: "var(--sky, #4a7ba8)",
    soft: "var(--sky-soft, rgba(74,123,168,.10))",
    edge: "var(--sky-edge, rgba(74,123,168,.26))",
  },
}

type SequenceTouch = { label: string; body: string }

type Buyer = {
  id: string
  name: string
  initial: string
  buyerType: BuyerType
  profile: string
  matchRationale: string
  sequence: ReadonlyArray<SequenceTouch>
  held: boolean
  holdReason?: string
  holdEstimate?: string
  agentNote: string
  initialColumn: BuyerColumn
}

const BUYERS: ReadonlyArray<Buyer> = [
  {
    id: "marcus",
    name: "Marcus Rivera",
    initial: "M",
    buyerType: "sba",
    profile:
      "First-time buyer · SBA 7(a) pre-qualified · restaurant operations background · NJ-based",
    matchRationale:
      "DSCR 4.4× strong for SBA. Boardroom: proceed to LOI conditional on SOPs.",
    sequence: [
      {
        label: "Touch 1",
        body: "Personalized intro — Palace's 15-year history, $962K SDE, SBA pre-qual status",
      },
      { label: "Touch 2", body: "CIM access invitation with NDA link" },
      { label: "Touch 3", body: "DSCR worksheet + lender intro" },
      { label: "Touch 4", body: "LOI structure conversation" },
    ],
    held: false,
    agentNote: "Sequence ready to launch. Awaiting authorization.",
    initialColumn: "identified",
  },
  {
    id: "david",
    name: "David Chen",
    initial: "D",
    buyerType: "micro_pe",
    profile:
      "Independent sponsor · platform acquisition focus · property + brand thesis · 2 prior deals",
    matchRationale:
      "Property ownership = balance sheet asset. Boardroom: proceed, seller note preferred.",
    sequence: [
      {
        label: "Touch 1",
        body: "Platform acquisition angle — Palace's property + 15-year brand as anchor asset",
      },
      {
        label: "Touch 2",
        body: "CIM access + deal structure memo (seller note $175K–$229K modeled)",
      },
      { label: "Touch 3", body: "Management transition discussion + LOI structure" },
    ],
    held: false,
    agentNote: "Sequence ready to launch. Awaiting authorization.",
    initialColumn: "identified",
  },
  {
    id: "search_fund",
    name: "Search Fund (Profile TBD)",
    initial: "S",
    buyerType: "search",
    profile: "Search Fund operator · single-target acquisition · contract-quality focus",
    matchRationale:
      "Held pending Concentration Agent's NJ Transit contract confirmation (Boardroom WO 2).",
    sequence: [
      {
        label: "Touch 1",
        body: "Intro contingent on NJ Transit 3-year contract confirmation",
      },
    ],
    held: true,
    holdReason:
      "NJ Transit contract confirmation required before Search Fund outreach. The Search Fund's deal-breaker objection (Boardroom WO 2) has not yet been resolved. Outreach Agent will auto-launch this sequence when the Concentration Agent confirms contract status.",
    holdEstimate:
      "When NJ Transit 3-year contract is confirmed → Search Fund sequence launches automatically",
    agentNote: "Sequence built · waiting on Concentration Agent.",
    initialColumn: "identified",
  },
]

const BRIEFING_LENDER: ReadonlyArray<string> = [
  "Loading approved P&L Recast...",
  "Matching lenders against deal profile...",
  "Ranking by match score...",
]

const BRIEFING_BUYER: ReadonlyArray<string> = [
  "Loading Boardroom buyer segment recommendations...",
  "Building SBA-Backed Operator sequence...",
  "Building Micro-PE sequence...",
]

const APPROVE_LINES: ReadonlyArray<string> = [
  "Authorizing Lender Ops Agent...",
  "Authorizing Outreach Agent...",
  "Logging approval...",
]

const DEAL_STRIP: ReadonlyArray<string> = [
  "Intake",
  "Connect",
  "Ingest",
  "Recast",
  "Risk",
  "Boardroom",
  "Score",
  "CIM",
  "VDR",
  "Lenders",
  "Buyers",
]

// ─────────────────────────────────────────────────────────────────────────────
export function OutreachStation({ persona, mode }: { persona: Persona; mode: OutreachMode }) {
  const router = useRouter()
  void router // reserved — this is a terminal station; no nav

  const [phase, setPhase] = React.useState<Phase>("briefing")
  const [briefingIdx, setBriefingIdx] = React.useState(0)
  const [surfaceVisible, setSurfaceVisible] = React.useState(false)

  // ── Lender state ─────────────────────────────────────────────────────────
  const [lenderSelected, setLenderSelected] = React.useState<Record<string, boolean>>(() => ({
    northeast: true,
    first_national: true,
    readycap: false,
  }))
  const [lenderSubmitted, setLenderSubmitted] = React.useState<Record<string, string>>({})
  const [submitPhase, setSubmitPhase] = React.useState<SubmitPhase>("idle")

  // ── Buyer state ──────────────────────────────────────────────────────────
  const [buyerColumn, setBuyerColumn] = React.useState<Record<string, BuyerColumn>>(() =>
    Object.fromEntries(BUYERS.map((b) => [b.id, b.initialColumn])) as Record<string, BuyerColumn>,
  )
  const [launchPhase, setLaunchPhase] = React.useState<Record<string, LaunchPhase>>({})
  const [launchedAt, setLaunchedAt] = React.useState<Record<string, string>>({})
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})
  const [overrideTipShown, setOverrideTipShown] = React.useState(false)
  const overrideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Full approval state ──────────────────────────────────────────────────
  const [approvePhase, setApprovePhase] = React.useState<ApprovePhase>("idle")
  const [approveLineIdx, setApproveLineIdx] = React.useState(0)
  const [approvedAt, setApprovedAt] = React.useState<{ date: string; time: string } | null>(null)
  const [reviewTipShown, setReviewTipShown] = React.useState(false)
  const reviewTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [vdrTipShown, setVdrTipShown] = React.useState(false)
  const vdrTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Briefing sequence ────────────────────────────────────────────────────
  React.useEffect(() => {
    if (phase !== "briefing") return
    const timers: Array<ReturnType<typeof setTimeout>> = []
    for (let i = 1; i < T.briefingLines; i++) {
      timers.push(setTimeout(() => setBriefingIdx(i), T.briefingStepMs * i))
    }
    timers.push(
      setTimeout(
        () => {
          setPhase("ready")
          setTimeout(() => setSurfaceVisible(true), 60)
        },
        T.briefingStepMs * T.briefingLines + T.briefingTailMs,
      ),
    )
    return () => timers.forEach(clearTimeout)
  }, [phase])

  function toggleLender(id: string) {
    if (lenderSubmitted[id]) return
    setLenderSelected((s) => ({ ...s, [id]: !s[id] }))
  }

  function nowTimestamp() {
    return new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  function onSubmitLenders() {
    if (submitPhase !== "idle") return
    const ids = Object.keys(lenderSelected).filter((id) => lenderSelected[id] && !lenderSubmitted[id])
    if (ids.length === 0) return
    setSubmitPhase("submitting")
    setTimeout(() => {
      const ts = nowTimestamp()
      const next: Record<string, string> = { ...lenderSubmitted }
      ids.forEach((id) => {
        next[id] = ts
      })
      setLenderSubmitted(next)
      setSubmitPhase("submitted")
      // Reset back to idle so subsequent submissions (if any) re-enable.
      setTimeout(() => setSubmitPhase("idle"), 280)
    }, T.submitSpinnerMs)
  }

  function onLaunchBuyer(id: string) {
    if (launchPhase[id] === "launching" || launchPhase[id] === "launched") return
    const buyer = BUYERS.find((b) => b.id === id)
    if (!buyer || buyer.held) return
    setLaunchPhase((s) => ({ ...s, [id]: "launching" }))
    setTimeout(() => {
      const ts = nowTimestamp()
      setLaunchedAt((s) => ({ ...s, [id]: ts }))
      setBuyerColumn((s) => ({ ...s, [id]: "contacted" }))
      setLaunchPhase((s) => ({ ...s, [id]: "launched" }))
    }, T.launchSpinnerMs)
  }

  function onOverrideHold() {
    setOverrideTipShown(true)
    if (overrideTimerRef.current) clearTimeout(overrideTimerRef.current)
    overrideTimerRef.current = setTimeout(() => setOverrideTipShown(false), 2400)
  }

  function onReviewPlan() {
    setReviewTipShown(true)
    if (reviewTimerRef.current) clearTimeout(reviewTimerRef.current)
    reviewTimerRef.current = setTimeout(() => setReviewTipShown(false), T.reviewTipMs)
  }

  function onVdrTip() {
    setVdrTipShown(true)
    if (vdrTimerRef.current) clearTimeout(vdrTimerRef.current)
    vdrTimerRef.current = setTimeout(() => setVdrTipShown(false), T.vdrTipMs)
  }

  function onAuthorizeAll() {
    if (approvePhase !== "idle") return
    setApprovePhase("approving")
    const lineGap = T.approveSpinnerMs / APPROVE_LINES.length
    for (let i = 1; i < APPROVE_LINES.length; i++) {
      setTimeout(() => setApproveLineIdx(i), lineGap * i)
    }
    setTimeout(() => {
      setApprovePhase("approved")
      // Submit any unsubmitted, currently-selected lenders.
      const ts = nowTimestamp()
      setLenderSubmitted((prev) => {
        const next = { ...prev }
        Object.keys(lenderSelected).forEach((id) => {
          if (lenderSelected[id] && !next[id]) next[id] = ts
        })
        return next
      })
      // Stagger launch of any unlaunched, non-held buyers in identified column.
      const launchable = BUYERS.filter(
        (b) => !b.held && (launchPhase[b.id] !== "launched") && buyerColumn[b.id] === "identified",
      )
      launchable.forEach((b, i) => {
        setTimeout(() => {
          setLaunchPhase((s) => ({ ...s, [b.id]: "launched" }))
          setLaunchedAt((s) => ({ ...s, [b.id]: ts }))
          setBuyerColumn((s) => ({ ...s, [b.id]: "contacted" }))
        }, T.approveStaggerMs * (i + 1))
      })
      const now = new Date()
      const date = now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      const time = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      setTimeout(
        () => setApprovedAt({ date, time }),
        T.approveStaggerMs * (launchable.length + 1) + 200,
      )
    }, T.approveSpinnerMs)
  }

  function toggleExpanded(id: string) {
    setExpanded((s) => ({ ...s, [id]: !s[id] }))
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <ScopedStyles />
      <StationHeader briefing={phase === "briefing"} mode={mode} />
      <CaseIntro persona={persona} mode={mode} />

      {phase === "briefing" ? (
        <BriefingSurface idx={briefingIdx} mode={mode} />
      ) : (
        <>
          <TwoColumnSurface
            visible={surfaceVisible}
            mode={mode}
            lenderSelected={lenderSelected}
            lenderSubmitted={lenderSubmitted}
            submitPhase={submitPhase}
            onToggleLender={toggleLender}
            onSubmitLenders={onSubmitLenders}
            onVdrTip={onVdrTip}
            vdrTipShown={vdrTipShown}
            buyerColumn={buyerColumn}
            launchPhase={launchPhase}
            launchedAt={launchedAt}
            expanded={expanded}
            onLaunchBuyer={onLaunchBuyer}
            onOverrideHold={onOverrideHold}
            overrideTipShown={overrideTipShown}
            toggleExpanded={toggleExpanded}
          />

          {approvePhase !== "approved" || !approvedAt ? (
            <ApprovalGate
              visible={surfaceVisible}
              persona={persona}
              mode={mode}
              phase={approvePhase}
              lineIdx={approveLineIdx}
              approvedAt={approvedAt}
              onAuthorize={onAuthorizeAll}
              onReviewPlan={onReviewPlan}
              reviewTipShown={reviewTipShown}
            />
          ) : (
            <PostApprovalBar
              persona={persona}
              mode={mode}
              approvedAt={approvedAt}
              lenderSubmittedCount={Object.keys(lenderSubmitted).length}
              activeSequenceCount={
                BUYERS.filter((b) => !b.held && launchPhase[b.id] === "launched").length
              }
            />
          )}

          {approvePhase === "approved" && approvedAt && <DealProgressStrip />}
        </>
      )}
    </div>
  )
}

// ── Station header ─────────────────────────────────────────────────────────
function StationHeader({ briefing, mode }: { briefing: boolean; mode: OutreachMode }) {
  const isLenders = mode === "lenders"
  const stationLabel = isLenders ? "Station 10 · /lenders" : "Station 11 · /buyers"
  const agentLabel = isLenders ? "Lender Ops Agent" : "Outreach Agent"
  const title = isLenders ? "Lender Outreach" : "Buyer Outreach"
  const blurb = isLenders
    ? "The Lender Ops Agent assembles your SBA 7(a) package and submits it to matched lenders. Every commitment routes back here for your review. Nothing leaves without your approval."
    : "The Outreach Agent runs personalized buyer sequences against Scorta's verified network. Every reply, NDA, and LOI routes back here for your review. Nothing leaves without your approval."
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
          {stationLabel}
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
          {agentLabel}
          {briefing && (
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--mint, #2c8c70)",
                boxShadow: "0 0 6px var(--mint, #2c8c70)",
                animation: "outreachBlink 1.1s ease-in-out infinite",
              }}
            />
          )}
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
        {title}
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--t2)",
          lineHeight: 1.6,
          maxWidth: 760,
          fontFamily: inter,
        }}
      >
        {blurb}
      </p>
    </header>
  )
}

// ── CASE intro ─────────────────────────────────────────────────────────────
function CaseIntro({ persona, mode }: { persona: Persona; mode: OutreachMode }) {
  void persona
  const body =
    mode === "lenders"
      ? "The Lender Ops Agent has matched three SBA lenders against Palace's approved financials. Northeast Community Bank is the top match with a 94% deal-profile fit. Review the package, choose which lenders to include, and authorize submission."
      : "The Outreach Agent has built sequences for two buyer profiles — SBA-Backed Operator and Micro-PE. Search Fund outreach is held pending the NJ Transit contract confirmation. Review the pipeline and authorize launch."
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
          animation: "outreachCasePulse 3.2s ease-in-out infinite",
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
          {body}
        </div>
      </div>
    </div>
  )
}

// ── Briefing surface (dual stream) ─────────────────────────────────────────
function BriefingSurface({ idx, mode }: { idx: number; mode: OutreachMode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        gap: 16,
        animation: "outreachFadeIn .32s ease-out",
      }}
    >
      {mode === "lenders" ? (
        <BriefingThread title="LENDER OPS AGENT" lines={BRIEFING_LENDER} idx={idx} />
      ) : (
        <BriefingThread title="OUTREACH AGENT" lines={BRIEFING_BUYER} idx={idx} />
      )}
    </div>
  )
}

function BriefingThread({
  title,
  lines,
  idx,
}: {
  title: string
  lines: ReadonlyArray<string>
  idx: number
}) {
  return (
    <div
      style={{
        padding: "16px 18px",
        borderRadius: 14,
        background: "rgba(12,10,9,.92)",
        border: "1px solid rgba(255,255,255,.06)",
        boxShadow: "0 12px 32px rgba(12,10,9,.18)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minHeight: 180,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          aria-hidden
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--mint, #2c8c70)",
            boxShadow: "0 0 6px var(--mint, #2c8c70)",
            animation: "outreachBlink 1.1s ease-in-out infinite",
          }}
        />
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "rgba(245,245,245,.7)",
            letterSpacing: ".7px",
          }}
        >
          {title} · running
        </div>
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        {lines.map((line, i) => {
          const isVisible = i <= idx
          const isCurrent = i === idx
          return (
            <li
              key={i}
              style={{
                fontFamily: mono,
                fontSize: 11.5,
                color: isCurrent ? "rgba(245,245,245,.95)" : "rgba(245,245,245,.55)",
                opacity: isVisible ? 1 : 0,
                transition: "opacity 200ms ease-out, color 200ms ease-out",
                lineHeight: 1.45,
              }}
            >
              {line}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ── Two-column main surface ────────────────────────────────────────────────
function TwoColumnSurface({
  visible,
  mode,
  lenderSelected,
  lenderSubmitted,
  submitPhase,
  onToggleLender,
  onSubmitLenders,
  onVdrTip,
  vdrTipShown,
  buyerColumn,
  launchPhase,
  launchedAt,
  expanded,
  onLaunchBuyer,
  onOverrideHold,
  overrideTipShown,
  toggleExpanded,
}: {
  visible: boolean
  mode: OutreachMode
  lenderSelected: Record<string, boolean>
  lenderSubmitted: Record<string, string>
  submitPhase: SubmitPhase
  onToggleLender: (id: string) => void
  onSubmitLenders: () => void
  onVdrTip: () => void
  vdrTipShown: boolean
  buyerColumn: Record<string, BuyerColumn>
  launchPhase: Record<string, LaunchPhase>
  launchedAt: Record<string, string>
  expanded: Record<string, boolean>
  onLaunchBuyer: (id: string) => void
  onOverrideHold: () => void
  overrideTipShown: boolean
  toggleExpanded: (id: string) => void
}) {
  return (
    <section
      aria-hidden={!visible}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: `opacity ${T.surfaceRevealMs}ms ease-out, transform ${T.surfaceRevealMs}ms ease-out`,
      }}
    >
      {mode === "lenders" ? (
        <LenderColumn
          lenderSelected={lenderSelected}
          lenderSubmitted={lenderSubmitted}
          submitPhase={submitPhase}
          onToggle={onToggleLender}
          onSubmit={onSubmitLenders}
          onVdrTip={onVdrTip}
          vdrTipShown={vdrTipShown}
        />
      ) : (
        <BuyerColumnPanel
          buyerColumn={buyerColumn}
          launchPhase={launchPhase}
          launchedAt={launchedAt}
          expanded={expanded}
          onLaunch={onLaunchBuyer}
          onOverride={onOverrideHold}
          overrideTipShown={overrideTipShown}
          toggleExpanded={toggleExpanded}
        />
      )}
    </section>
  )
}

// ── Lender column ──────────────────────────────────────────────────────────
function LenderColumn({
  lenderSelected,
  lenderSubmitted,
  submitPhase,
  onToggle,
  onSubmit,
  onVdrTip,
  vdrTipShown,
}: {
  lenderSelected: Record<string, boolean>
  lenderSubmitted: Record<string, string>
  submitPhase: SubmitPhase
  onToggle: (id: string) => void
  onSubmit: () => void
  onVdrTip: () => void
  vdrTipShown: boolean
}) {
  const selectedCount = Object.keys(lenderSelected).filter(
    (id) => lenderSelected[id] && !lenderSubmitted[id],
  ).length
  return (
    <article
      style={{
        padding: "20px 22px",
        borderRadius: 16,
        background: "rgba(248,245,238,.92)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        boxShadow:
          "0 1px 0 rgba(255,255,255,.78) inset, 0 16px 40px rgba(12,10,9,.06)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <ColumnHeader
        eyebrow="LENDER OPS AGENT · SBA 7(A) PACKAGE"
        statusChip={{ tone: "mint", label: "READY TO SUBMIT" }}
        boardroomRef="Lender package built from approved recast · DSCR 4.4× · SBA 7(a) eligible"
      />
      <PackageSummary onVdrTip={onVdrTip} vdrTipShown={vdrTipShown} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {LENDERS.map((lender) => (
          <LenderCard
            key={lender.id}
            lender={lender}
            selected={!!lenderSelected[lender.id]}
            submittedAt={lenderSubmitted[lender.id]}
            onToggle={() => onToggle(lender.id)}
          />
        ))}
      </div>
      <SubmitLenderBar
        selectedCount={selectedCount}
        phase={submitPhase}
        onSubmit={onSubmit}
      />
    </article>
  )
}

function ColumnHeader({
  eyebrow,
  statusChip,
  boardroomRef,
}: {
  eyebrow: string
  statusChip: { tone: "mint" | "amber"; label: string }
  boardroomRef: string
}) {
  const isAmber = statusChip.tone === "amber"
  return (
    <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "var(--t2)",
            fontWeight: 600,
            letterSpacing: ".7px",
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </div>
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
            color: isAmber ? "var(--peach, #b86a3e)" : "var(--mint, #2c8c70)",
            background: isAmber
              ? "var(--peach-soft, rgba(184,106,62,.10))"
              : "var(--mint-soft, rgba(44,140,112,.10))",
            border: `1px solid ${isAmber ? "var(--peach-edge, rgba(184,106,62,.28))" : "var(--mint-edge, rgba(44,140,112,.28))"}`,
            fontFamily: inter,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: isAmber ? "var(--peach, #b86a3e)" : "var(--mint, #2c8c70)",
              boxShadow: `0 0 6px ${isAmber ? "var(--peach, #b86a3e)" : "var(--mint, #2c8c70)"}`,
            }}
          />
          {statusChip.label}
        </span>
      </div>
      <div
        style={{
          fontSize: 11.5,
          color: "var(--t3)",
          fontFamily: inter,
          lineHeight: 1.5,
        }}
      >
        {boardroomRef}
      </div>
    </header>
  )
}

function PackageSummary({ onVdrTip, vdrTipShown }: { onVdrTip: () => void; vdrTipShown: boolean }) {
  const rows: Array<[string, string, "anchor" | "default" | "mint"]> = [
    ["Normalized SDE (Year 3)", "$962,000", "default"],
    ["Listing Price", "$1,750,000", "anchor"],
    ["Loan Amount", "$1,090,000", "default"],
    ["Buyer Down Payment", "$106,000 minimum", "default"],
    ["DSCR", "4.4× (floor 1.25×)", "mint"],
    ["Monthly Debt Service", "$14,200 / month", "default"],
    ["Scorta Score", "71 / 100 · SBA Eligible", "default"],
  ]
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 12,
        background: "rgba(255,255,255,.7)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 4,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 9.5,
            color: "var(--t3)",
            letterSpacing: ".8px",
            textTransform: "uppercase",
          }}
        >
          Package Summary · cover sheet
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--t3)",
            fontFamily: inter,
          }}
        >
          P&amp;L Recast + add-back schedule + DSCR worksheet · published to VDR
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 1,
          background: "var(--div, rgba(12,10,9,.07))",
          border: "1px solid var(--div, rgba(12,10,9,.07))",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {rows.map(([label, value, tone]) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: "10px 12px",
              background: "rgba(255,255,255,.85)",
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontFamily: inter,
                fontSize: 10,
                color: "var(--t3)",
                letterSpacing: ".3px",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontFamily: tone === "anchor" ? garamond : inter,
                fontSize: tone === "anchor" ? 19 : 13.5,
                fontWeight: 500,
                color: tone === "mint" ? "var(--mint, #2c8c70)" : "var(--t1)",
                letterSpacing: tone === "anchor" ? "-.3px" : 0,
                lineHeight: 1.15,
                overflowWrap: "anywhere",
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
      <div style={{ position: "relative", alignSelf: "flex-start", marginTop: 6 }}>
        <button
          onClick={onVdrTip}
          className="outreach-link"
          style={{
            all: "unset",
            cursor: "pointer",
            fontFamily: inter,
            fontSize: 12,
            fontWeight: 600,
            color: "var(--mint, #2c8c70)",
            letterSpacing: "-.1px",
            padding: "2px 0",
          }}
        >
          View package in VDR →
        </button>
        {vdrTipShown && (
          <span
            role="tooltip"
            style={{
              position: "absolute",
              left: 0,
              top: "calc(100% + 6px)",
              padding: "7px 10px",
              borderRadius: 8,
              background: "rgba(12,10,9,.92)",
              color: "rgba(245,245,245,.95)",
              fontSize: 11,
              lineHeight: 1.4,
              fontFamily: inter,
              whiteSpace: "nowrap",
              boxShadow: "0 8px 22px rgba(0,0,0,.18)",
              animation: "outreachLineIn .22s ease-out",
              zIndex: 20,
            }}
          >
            Package available in your Virtual Data Room.
          </span>
        )}
      </div>
    </div>
  )
}

function LenderCard({
  lender,
  selected,
  submittedAt,
  onToggle,
}: {
  lender: Lender
  selected: boolean
  submittedAt: string | undefined
  onToggle: () => void
}) {
  const submitted = !!submittedAt
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 12,
        background: "rgba(255,255,255,.78)",
        border: `1px solid ${selected || submitted ? "var(--mint-edge, rgba(44,140,112,.28))" : "var(--glass-edge, rgba(0,0,0,.07))"}`,
        boxShadow: "0 1px 0 rgba(255,255,255,.78) inset",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontFamily: garamond,
              fontSize: 19,
              fontWeight: 500,
              color: "var(--t1)",
              letterSpacing: "-.3px",
              lineHeight: 1.15,
            }}
          >
            {lender.name}
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: "var(--t3)",
              fontFamily: inter,
              marginTop: 3,
              lineHeight: 1.45,
            }}
          >
            {lender.type}
          </div>
        </div>
        <MatchBadge pct={lender.matchPct} />
      </div>
      <ProgressBar pct={lender.matchPct} />
      <div style={{ fontSize: 12.5, color: "var(--t2)", fontFamily: inter, lineHeight: 1.55 }}>
        {lender.note}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontFamily: mono, fontSize: 10.5, color: "var(--t2)", letterSpacing: ".3px" }}>
          {lender.loanTermsLine1} · {lender.loanTermsLine2}
        </div>
        <StatusPill
          submitted={submitted}
          submittedAt={submittedAt}
          vdrGranted={lender.vdrGranted}
        />
      </div>
      <div style={{ borderTop: "1px dashed var(--div, rgba(12,10,9,.06))", paddingTop: 10 }}>
        <button
          onClick={onToggle}
          disabled={submitted}
          className={selected ? "outreach-toggle-on" : "outreach-toggle-off"}
          style={{
            all: "unset",
            cursor: submitted ? "default" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "7px 12px",
            borderRadius: 9999,
            background: selected ? "var(--mint-soft, rgba(44,140,112,.10))" : "transparent",
            border: `1px solid ${selected ? "var(--mint-edge, rgba(44,140,112,.28))" : "var(--glass-edge, rgba(0,0,0,.10))"}`,
            color: selected ? "var(--mint, #2c8c70)" : "var(--t2)",
            fontFamily: inter,
            fontSize: 12,
            fontWeight: 600,
            opacity: submitted ? 0.55 : 1,
            transition: "background 180ms ease-out, color 180ms ease-out, border-color 180ms ease-out",
          }}
        >
          {selected || submitted ? (
            <>
              <svg width={11} height={11} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6.4L4.6 9 10 3.4" />
              </svg>
              {submitted ? "Submitted" : "Selected"}
            </>
          ) : (
            <>Include in submission →</>
          )}
        </button>
      </div>
    </div>
  )
}

function MatchBadge({ pct }: { pct: number }) {
  return (
    <span
      style={{
        fontFamily: garamond,
        fontSize: 22,
        fontWeight: 500,
        color: "var(--mint, #2c8c70)",
        letterSpacing: "-.4px",
        lineHeight: 1,
      }}
    >
      {pct}
      <span style={{ fontSize: 12, color: "var(--t3)", fontFamily: inter, marginLeft: 2 }}>%</span>
    </span>
  )
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div
      style={{
        position: "relative",
        height: 5,
        background: "rgba(12,10,9,.06)",
        borderRadius: 9999,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: `${pct}%`,
          background:
            "linear-gradient(90deg, rgba(44,140,112,.78) 0%, var(--mint, #2c8c70) 100%)",
          borderRadius: 9999,
        }}
      />
    </div>
  )
}

function StatusPill({
  submitted,
  submittedAt,
  vdrGranted,
}: {
  submitted: boolean
  submittedAt: string | undefined
  vdrGranted: boolean
}) {
  if (submitted) {
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
          letterSpacing: ".5px",
          textTransform: "uppercase",
          fontFamily: inter,
          color: "var(--mint, #2c8c70)",
          background: "var(--mint-soft, rgba(44,140,112,.10))",
          border: "1px solid var(--mint-edge, rgba(44,140,112,.28))",
        }}
      >
        <svg width={9} height={9} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6.4L4.6 9 10 3.4" />
        </svg>
        Submitted · {submittedAt}
      </span>
    )
  }
  if (vdrGranted) {
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
          letterSpacing: ".5px",
          textTransform: "uppercase",
          fontFamily: inter,
          color: "var(--mint, #2c8c70)",
          background: "var(--mint-soft, rgba(44,140,112,.10))",
          border: "1px solid var(--mint-edge, rgba(44,140,112,.28))",
        }}
      >
        <span aria-hidden style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--mint, #2c8c70)" }} />
        VDR Access Granted
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
        letterSpacing: ".5px",
        textTransform: "uppercase",
        fontFamily: inter,
        color: "var(--t3)",
        background: "rgba(12,10,9,.04)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
      }}
    >
      <span aria-hidden style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--t3)" }} />
      Not yet contacted
    </span>
  )
}

function SubmitLenderBar({
  selectedCount,
  phase,
  onSubmit,
}: {
  selectedCount: number
  phase: SubmitPhase
  onSubmit: () => void
}) {
  const disabled = selectedCount === 0 || phase !== "idle"
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        paddingTop: 6,
      }}
    >
      <div
        style={{
          fontFamily: inter,
          fontSize: 12.5,
          color: "var(--t2)",
        }}
      >
        <span style={{ fontWeight: 600, color: "var(--t1)" }}>{selectedCount}</span>{" "}
        {selectedCount === 1 ? "lender" : "lenders"} selected
      </div>
      <button
        onClick={onSubmit}
        disabled={disabled}
        className="outreach-secondary-primary"
        style={{
          height: 40,
          padding: "0 18px",
          borderRadius: 9999,
          background: phase === "submitted" ? "var(--mint, #2c8c70)" : "var(--btn-bg)",
          color: phase === "submitted" ? "#fff" : "var(--btn-fg)",
          border: "none",
          fontSize: 12.5,
          fontWeight: 600,
          fontFamily: inter,
          letterSpacing: "-.1px",
          display: "inline-flex",
          alignItems: "center",
          gap: 9,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled && phase === "idle" ? 0.55 : 1,
          boxShadow: "0 4px 16px rgba(12,10,9,.14)",
          transition: "transform 180ms ease-out, box-shadow 180ms ease-out, background 180ms ease-out",
        }}
      >
        {phase === "submitting" && <Spinner light />}
        {phase === "submitting"
          ? "Uploading to lender portals..."
          : phase === "submitted"
          ? "Submitted ✓"
          : "Submit Package to Selected Lenders"}
        {phase === "idle" && !disabled && <span style={{ transform: "translateY(-1px)" }}>→</span>}
      </button>
    </div>
  )
}

// ── Buyer column ───────────────────────────────────────────────────────────
function BuyerColumnPanel({
  buyerColumn,
  launchPhase,
  launchedAt,
  expanded,
  onLaunch,
  onOverride,
  overrideTipShown,
  toggleExpanded,
}: {
  buyerColumn: Record<string, BuyerColumn>
  launchPhase: Record<string, LaunchPhase>
  launchedAt: Record<string, string>
  expanded: Record<string, boolean>
  onLaunch: (id: string) => void
  onOverride: () => void
  overrideTipShown: boolean
  toggleExpanded: (id: string) => void
}) {
  return (
    <article
      style={{
        padding: "20px 22px",
        borderRadius: 16,
        background: "rgba(248,245,238,.92)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        boxShadow:
          "0 1px 0 rgba(255,255,255,.78) inset, 0 16px 40px rgba(12,10,9,.06)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <ColumnHeader
        eyebrow="OUTREACH AGENT · BUYER SEQUENCES"
        statusChip={{ tone: "amber", label: "2 SEQUENCES READY · 1 HELD" }}
        boardroomRef="Priority order from Boardroom: SBA-Backed Operator first · Micro-PE second · Search Fund held pending NJ Transit contract"
      />
      <Kanban
        buyerColumn={buyerColumn}
        launchPhase={launchPhase}
        launchedAt={launchedAt}
        expanded={expanded}
        onLaunch={onLaunch}
        onOverride={onOverride}
        overrideTipShown={overrideTipShown}
        toggleExpanded={toggleExpanded}
      />
    </article>
  )
}

const KANBAN_COLUMNS: ReadonlyArray<{ key: BuyerColumn; label: string }> = [
  { key: "identified", label: "Identified" },
  { key: "contacted", label: "Contacted" },
  { key: "interested", label: "Interested" },
  { key: "nda", label: "NDA Signed" },
]

function Kanban({
  buyerColumn,
  launchPhase,
  launchedAt,
  expanded,
  onLaunch,
  onOverride,
  overrideTipShown,
  toggleExpanded,
}: {
  buyerColumn: Record<string, BuyerColumn>
  launchPhase: Record<string, LaunchPhase>
  launchedAt: Record<string, string>
  expanded: Record<string, boolean>
  onLaunch: (id: string) => void
  onOverride: () => void
  overrideTipShown: boolean
  toggleExpanded: (id: string) => void
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: 8,
        background: "rgba(12,10,9,.03)",
        borderRadius: 12,
        padding: 8,
        border: "1px solid var(--glass-edge, rgba(0,0,0,.05))",
      }}
    >
      {KANBAN_COLUMNS.map((col) => {
        const buyers = BUYERS.filter((b) => buyerColumn[b.id] === col.key)
        return (
          <div key={col.key} style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            <div
              style={{
                fontFamily: mono,
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: ".7px",
                textTransform: "uppercase",
                color: "var(--t3)",
                padding: "4px 6px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {col.label}
              <span style={{ marginLeft: 6, color: "var(--t3)" }}>·</span>
              <span style={{ marginLeft: 4, color: "var(--t2)" }}>{buyers.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 80 }}>
              {buyers.length === 0 && col.key !== "identified" ? (
                <div
                  style={{
                    fontFamily: inter,
                    fontSize: 10,
                    color: "var(--t3)",
                    textAlign: "center",
                    padding: "10px 6px",
                    border: "1px dashed var(--div, rgba(12,10,9,.10))",
                    borderRadius: 10,
                    background: "rgba(255,255,255,.4)",
                    lineHeight: 1.4,
                  }}
                >
                  {col.key === "contacted"
                    ? "No buyers contacted yet · launch a sequence to begin"
                    : col.key === "interested"
                    ? "No interested buyers yet"
                    : "No NDAs signed yet"}
                </div>
              ) : (
                buyers.map((b) => (
                  <BuyerCard
                    key={b.id}
                    buyer={b}
                    column={col.key}
                    launch={launchPhase[b.id] ?? "idle"}
                    launchedAt={launchedAt[b.id]}
                    expanded={!!expanded[b.id]}
                    onLaunch={() => onLaunch(b.id)}
                    onOverride={onOverride}
                    overrideTipShown={overrideTipShown}
                    onToggleExpanded={() => toggleExpanded(b.id)}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function BuyerCard({
  buyer,
  column,
  launch,
  launchedAt,
  expanded,
  onLaunch,
  onOverride,
  overrideTipShown,
  onToggleExpanded,
}: {
  buyer: Buyer
  column: BuyerColumn
  launch: LaunchPhase
  launchedAt: string | undefined
  expanded: boolean
  onLaunch: () => void
  onOverride: () => void
  overrideTipShown: boolean
  onToggleExpanded: () => void
}) {
  const meta = BUYER_META[buyer.buyerType]
  const held = buyer.held
  const isCompactColumn = column !== "identified"

  return (
    <div
      style={{
        position: "relative",
        padding: "12px 13px",
        borderRadius: 11,
        background: held ? "rgba(184,106,62,.06)" : "rgba(255,255,255,.92)",
        border: `1px solid ${held ? "var(--peach-edge, rgba(184,106,62,.28))" : "var(--glass-edge, rgba(0,0,0,.08))"}`,
        borderLeft: held ? "3px solid var(--peach, #b86a3e)" : `3px solid ${meta.accent}`,
        boxShadow: "0 1px 0 rgba(255,255,255,.78) inset, 0 6px 16px rgba(12,10,9,.05)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 7, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
          <div
            aria-hidden
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: meta.soft,
              color: meta.accent,
              border: `1px solid ${meta.edge}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: inter,
              fontWeight: 700,
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            {buyer.initial}
          </div>
          <div
            style={{
              fontFamily: garamond,
              fontSize: 16,
              fontWeight: 500,
              color: "var(--t1)",
              letterSpacing: "-.2px",
              lineHeight: 1.15,
              minWidth: 0,
              flex: 1,
              overflowWrap: "anywhere",
            }}
          >
            {buyer.name}
          </div>
        </div>
        <BuyerTypeChip type={buyer.buyerType} />
      </div>

      {!isCompactColumn && (
        <>
          <div style={{ fontSize: 11.5, color: "var(--t2)", fontFamily: inter, lineHeight: 1.5 }}>
            {buyer.profile}
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: "var(--t1)",
              fontFamily: inter,
              lineHeight: 1.5,
              padding: "8px 10px",
              borderRadius: 9,
              background: meta.soft,
              border: `1px solid ${meta.edge}`,
            }}
          >
            <span
              style={{
                display: "block",
                fontFamily: mono,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: ".7px",
                textTransform: "uppercase",
                color: meta.accent,
                marginBottom: 3,
              }}
            >
              Match rationale
            </span>
            {buyer.matchRationale}
          </div>

          {held ? (
            <HoldBlock
              reason={buyer.holdReason ?? ""}
              estimate={buyer.holdEstimate ?? ""}
              note={buyer.agentNote}
              onOverride={onOverride}
              overrideTipShown={overrideTipShown}
            />
          ) : (
            <SequenceBlock
              touches={buyer.sequence}
              expanded={expanded}
              onToggle={onToggleExpanded}
              accent={meta.accent}
              note={buyer.agentNote}
              launch={launch}
              onLaunch={onLaunch}
            />
          )}
        </>
      )}

      {isCompactColumn && launchedAt && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: mono,
            fontSize: 10,
            color: meta.accent,
            letterSpacing: ".3px",
          }}
        >
          <span aria-hidden style={{ width: 5, height: 5, borderRadius: "50%", background: meta.accent }} />
          Contacted · {launchedAt}
        </div>
      )}
    </div>
  )
}

function BuyerTypeChip({ type }: { type: BuyerType }) {
  const meta = BUYER_META[type]
  return (
    <span
      style={{
        alignSelf: "flex-start",
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 8px",
        borderRadius: 9999,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: ".7px",
        textTransform: "uppercase",
        fontFamily: inter,
        color: meta.accent,
        background: meta.soft,
        border: `1px solid ${meta.edge}`,
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden style={{ width: 4, height: 4, borderRadius: "50%", background: meta.accent }} />
      {meta.label}
    </span>
  )
}

function SequenceBlock({
  touches,
  expanded,
  onToggle,
  accent,
  note,
  launch,
  onLaunch,
}: {
  touches: ReadonlyArray<SequenceTouch>
  expanded: boolean
  onToggle: () => void
  accent: string
  note: string
  launch: LaunchPhase
  onLaunch: () => void
}) {
  const launched = launch === "launched"
  const launching = launch === "launching"
  const firstTouch = touches[0]
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        paddingTop: 4,
        borderTop: "1px dashed var(--div, rgba(12,10,9,.06))",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: ".7px",
            textTransform: "uppercase",
            color: "var(--t3)",
          }}
        >
          {touches.length}-touch sequence
        </div>
        <button
          onClick={onToggle}
          className="outreach-link"
          style={{
            all: "unset",
            cursor: "pointer",
            fontFamily: mono,
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: ".5px",
            textTransform: "uppercase",
            color: "var(--t2)",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 4px",
            borderRadius: 6,
          }}
        >
          {expanded ? "Hide" : "View"}
          <span
            aria-hidden
            style={{
              display: "inline-block",
              transition: "transform 180ms ease-out",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              fontSize: 8,
            }}
          >
            ▾
          </span>
        </button>
      </div>
      {!expanded && firstTouch && (
        <TouchRow touch={firstTouch} accent={accent} preview />
      )}
      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {touches.map((t, i) => (
            <TouchRow key={i} touch={t} accent={accent} />
          ))}
        </div>
      )}
      <div
        style={{
          fontSize: 10.5,
          color: "var(--t3)",
          fontFamily: mono,
          letterSpacing: ".3px",
          lineHeight: 1.4,
        }}
      >
        Outreach Agent: {note}
      </div>
      <button
        onClick={onLaunch}
        disabled={launched || launching}
        className="outreach-launch"
        style={{
          all: "unset",
          cursor: launched || launching ? "default" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderRadius: 9999,
          background: launched ? accent : "transparent",
          color: launched ? "#fff" : accent,
          border: `1px solid ${accent}`,
          fontFamily: inter,
          fontSize: 11.5,
          fontWeight: 600,
          letterSpacing: "-.05px",
          alignSelf: "flex-start",
          transition: "background 180ms ease-out, color 180ms ease-out, transform 180ms ease-out",
        }}
      >
        {launching && <Spinner accentColor={accent} />}
        {launched ? (
          <>
            <svg width={10} height={10} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6.4L4.6 9 10 3.4" />
            </svg>
            Sequence launched
          </>
        ) : launching ? (
          "Launching sequence..."
        ) : (
          <>Launch Sequence →</>
        )}
      </button>
    </div>
  )
}

function TouchRow({
  touch,
  accent,
  preview,
}: {
  touch: SequenceTouch
  accent: string
  preview?: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: "7px 9px",
        borderRadius: 8,
        background: preview ? "rgba(12,10,9,.025)" : "transparent",
        border: preview ? "1px solid var(--glass-edge, rgba(0,0,0,.05))" : "none",
      }}
    >
      <span
        style={{
          fontFamily: mono,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: ".5px",
          textTransform: "uppercase",
          color: accent,
          minWidth: 38,
          paddingTop: 1,
        }}
      >
        {touch.label}
      </span>
      <span style={{ fontSize: 11.5, color: "var(--t1)", fontFamily: inter, lineHeight: 1.5 }}>
        {touch.body}
      </span>
    </div>
  )
}

function HoldBlock({
  reason,
  estimate,
  note,
  onOverride,
  overrideTipShown,
}: {
  reason: string
  estimate: string
  note: string
  onOverride: () => void
  overrideTipShown: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 10,
        borderRadius: 10,
        background: "rgba(184,106,62,.08)",
        border: "1px solid var(--peach-edge, rgba(184,106,62,.28))",
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: ".7px",
          textTransform: "uppercase",
          color: "var(--peach, #b86a3e)",
        }}
      >
        Hold Condition · Concentration Agent
      </div>
      <div style={{ fontSize: 11.5, color: "var(--t1)", fontFamily: inter, lineHeight: 1.5 }}>
        {reason}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "var(--t2)",
          fontFamily: inter,
          lineHeight: 1.45,
          paddingTop: 6,
          borderTop: "1px dashed var(--peach-edge, rgba(184,106,62,.28))",
        }}
      >
        <span style={{ fontFamily: mono, fontSize: 9.5, color: "var(--peach, #b86a3e)", letterSpacing: ".5px" }}>
          Est. unlock:
        </span>{" "}
        {estimate}
      </div>
      <div
        style={{
          fontSize: 10.5,
          color: "var(--t3)",
          fontFamily: mono,
          letterSpacing: ".3px",
          lineHeight: 1.4,
        }}
      >
        Outreach Agent: {note}
      </div>
      <div style={{ position: "relative", alignSelf: "flex-start" }}>
        <button
          onClick={onOverride}
          className="outreach-link"
          style={{
            all: "unset",
            cursor: "pointer",
            fontFamily: inter,
            fontSize: 11,
            fontWeight: 600,
            color: "var(--t2)",
            padding: "4px 8px",
            borderRadius: 8,
            border: "1px solid var(--glass-edge, rgba(0,0,0,.10))",
            background: "rgba(255,255,255,.7)",
          }}
        >
          Override Hold →
        </button>
        {overrideTipShown && (
          <span
            role="tooltip"
            style={{
              position: "absolute",
              left: 0,
              bottom: "calc(100% + 6px)",
              padding: "8px 11px",
              borderRadius: 10,
              background: "rgba(12,10,9,.92)",
              color: "rgba(245,245,245,.95)",
              fontSize: 11,
              lineHeight: 1.4,
              fontFamily: inter,
              width: 240,
              boxShadow: "0 8px 22px rgba(0,0,0,.18)",
              animation: "outreachLineIn .22s ease-out",
              zIndex: 20,
            }}
          >
            Not recommended. The Search Fund will ask about contract status immediately. Resolve
            the hold condition first.
          </span>
        )}
      </div>
    </div>
  )
}

// ── Approval gate (full-width mint banner) ────────────────────────────────
function ApprovalGate({
  visible,
  persona,
  mode,
  phase,
  lineIdx,
  approvedAt,
  onAuthorize,
  onReviewPlan,
  reviewTipShown,
}: {
  visible: boolean
  persona: Persona
  mode: OutreachMode
  phase: ApprovePhase
  lineIdx: number
  approvedAt: { date: string; time: string } | null
  onAuthorize: () => void
  onReviewPlan: () => void
  reviewTipShown: boolean
}) {
  const isLenders = mode === "lenders"
  const eyebrow = isLenders
    ? "Lender Ops Agent · awaiting your approval"
    : "Outreach Agent · awaiting your approval"
  const headline = isLenders
    ? "Authorize lender package submission."
    : "Authorize buyer outreach sequences."
  const body = isLenders
    ? "Approving this plan authorizes the Lender Ops Agent to submit the SBA package to your selected lenders. Every commitment and term sheet will route back here for your review. You can pause or revoke access at any time from the VDR."
    : "Approving this plan authorizes the Outreach Agent to launch buyer sequences against Scorta's verified network. Every reply, NDA, and LOI will route back here for your review. You can pause or revoke any sequence at any time."
  const reviewLabel = isLenders ? "Review lender plan" : "Review outreach plan"
  const auditCopy = isLenders
    ? "Lender submission authorized"
    : "Buyer outreach authorized"
  const agentsLabel = isLenders ? "Lender Ops Agent active" : "Outreach Agent active"
  return (
    <section
      aria-hidden={!visible}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: `opacity ${T.surfaceRevealMs}ms ease-out, transform ${T.surfaceRevealMs}ms ease-out`,
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
            animation: "outreachCasePulse 3.2s ease-in-out infinite",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 280, fontFamily: inter }}>
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
            {eyebrow}
          </div>
          <div style={{ fontSize: 14.5, color: "var(--t1)", lineHeight: 1.45, fontWeight: 600 }}>
            {headline}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--t2)", lineHeight: 1.55, marginTop: 4 }}>
            {body}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={onReviewPlan}
              disabled={phase !== "idle"}
              className="outreach-secondary"
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
              {reviewLabel}
            </button>
            {reviewTipShown && (
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
                  animation: "outreachLineIn .22s ease-out",
                  zIndex: 30,
                }}
              >
                Full sequence copy available for review before launch.
              </span>
            )}
          </div>
          <button
            onClick={onAuthorize}
            disabled={phase !== "idle"}
            className="outreach-primary"
            style={{
              height: 44,
              padding: "0 22px",
              borderRadius: 9999,
              background: phase === "approved" ? "var(--mint, #2c8c70)" : "var(--btn-bg)",
              color: phase === "approved" ? "#fff" : "var(--btn-fg)",
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
              minWidth: 240,
              justifyContent: "center",
            }}
          >
            {phase === "approving" && <Spinner light />}
            {phase === "approved" && (
              <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6.4L4.6 9 10 3.4" />
              </svg>
            )}
            <span key={lineIdx}>
              {phase === "approving"
                ? APPROVE_LINES[lineIdx]
                : phase === "approved"
                ? auditCopy
                : "Authorize & Launch"}
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
            animation: "outreachLineIn .28s ease-out",
          }}
        >
          <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6.4L4.6 9 10 3.4" />
          </svg>
          <span>
            {auditCopy} by {persona.identity.displayName} ·{" "}
            {approvedAt.date} · {approvedAt.time} · {agentsLabel}. All responses route to{" "}
            {persona.identity.firstName} for review before any commitment is made.
          </span>
        </div>
      )}
    </section>
  )
}

// ── Post-approval status bar ──────────────────────────────────────────────
function PostApprovalBar({
  persona,
  mode,
  approvedAt,
  lenderSubmittedCount,
  activeSequenceCount,
}: {
  persona: Persona
  mode: OutreachMode
  approvedAt: { date: string; time: string }
  lenderSubmittedCount: number
  activeSequenceCount: number
}) {
  return (
    <section
      style={{
        padding: "20px 24px",
        background: "linear-gradient(180deg, rgba(44,140,112,.12) 0%, rgba(44,140,112,.04) 100%)",
        border: "1px solid var(--mint-edge, rgba(44,140,112,.28))",
        borderRadius: 16,
        boxShadow: "0 1px 0 rgba(255,255,255,.6) inset, 0 8px 24px rgba(44,140,112,.10)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        animation: "outreachFadeIn .32s ease-out",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 280 }}>
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
            Deal · IN MARKET
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {mode === "lenders" ? (
              <StatusLine
                label={`Lender Ops Agent — monitoring ${lenderSubmittedCount} ${lenderSubmittedCount === 1 ? "submission" : "submissions"}`}
              />
            ) : (
              <StatusLine
                label={`Outreach Agent — ${activeSequenceCount} ${activeSequenceCount === 1 ? "sequence" : "sequences"} active · 1 held`}
              />
            )}
          </div>
        </div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 11.5,
            color: "var(--mint, #2c8c70)",
            letterSpacing: ".3px",
          }}
        >
          Authorized by {persona.identity.firstName} · {approvedAt.date} · {approvedAt.time}
        </div>
      </div>
      <div
        style={{
          fontSize: 12.5,
          color: "var(--t2)",
          lineHeight: 1.55,
          fontFamily: inter,
        }}
      >
        Both agents are now live. Every lender response, every NDA request, every buyer reply
        routes back to your VDR inbox for review before any commitment is made.
      </div>
    </section>
  )
}

function StatusLine({ label }: { label: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--mint, #2c8c70)",
          boxShadow: "0 0 8px var(--mint, #2c8c70)",
          animation: "outreachBlink 1.6s ease-in-out infinite",
        }}
      />
      <span style={{ fontSize: 12.5, color: "var(--t1)", fontFamily: inter }}>{label}</span>
    </div>
  )
}

// ── Deal progress strip (the emotional close) ─────────────────────────────
function DealProgressStrip() {
  return (
    <section
      style={{
        marginTop: 6,
        padding: "18px 22px",
        borderRadius: 14,
        background: "rgba(255,255,255,.65)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        boxShadow: "0 1px 0 rgba(255,255,255,.85) inset",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        animation: "outreachStripIn .5s ease-out",
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: ".8px",
          textTransform: "uppercase",
          color: "var(--t3)",
        }}
      >
        Deal Progress · Palace Kitchen &amp; Catering
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        {DEAL_STRIP.map((label, i) => (
          <React.Fragment key={label}>
            <DealChip label={label} done />
            {i < DEAL_STRIP.length - 1 && <DealArrow />}
          </React.Fragment>
        ))}
        <DealArrow />
        <DealChip label="In Market" active />
      </div>
    </section>
  )
}

function DealChip({ label, done, active }: { label: string; done?: boolean; active?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 11px",
        borderRadius: 9999,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: ".4px",
        textTransform: "uppercase",
        fontFamily: inter,
        color: active ? "#fff" : "var(--mint, #2c8c70)",
        background: active
          ? "var(--mint, #2c8c70)"
          : "var(--mint-soft, rgba(44,140,112,.10))",
        border: `1px solid ${active ? "var(--mint, #2c8c70)" : "var(--mint-edge, rgba(44,140,112,.28))"}`,
        boxShadow: active ? "0 0 0 4px rgba(44,140,112,.14)" : "none",
        animation: active ? "outreachInMarketPulse 2.4s ease-in-out infinite" : "none",
      }}
    >
      {done && (
        <svg width={9} height={9} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6.4L4.6 9 10 3.4" />
        </svg>
      )}
      {active && (
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 0 6px rgba(255,255,255,.6)",
          }}
        />
      )}
      {label}
    </span>
  )
}

function DealArrow() {
  return (
    <span
      aria-hidden
      style={{
        fontFamily: mono,
        fontSize: 10,
        color: "var(--t4, rgba(12,10,9,.28))",
        letterSpacing: 0,
      }}
    >
      →
    </span>
  )
}

// ── Spinner ────────────────────────────────────────────────────────────────
function Spinner({ light, accentColor }: { light?: boolean; accentColor?: string }) {
  const border = accentColor
    ? `${accentColor}40`
    : light
    ? "rgba(245,245,245,.32)"
    : "rgba(12,10,9,.18)"
  const top = accentColor ?? (light ? "var(--btn-fg)" : "var(--t1)")
  return (
    <span
      aria-hidden
      style={{
        width: 11,
        height: 11,
        borderRadius: "50%",
        border: `2px solid ${border}`,
        borderTopColor: top,
        animation: "outreachSpin .8s linear infinite",
        flexShrink: 0,
      }}
    />
  )
}

// ── Scoped styles ─────────────────────────────────────────────────────────
function ScopedStyles() {
  return (
    <style>{`
      @keyframes outreachCasePulse {
        0%, 100% { transform: scale(1);    opacity: 1;  }
        50%      { transform: scale(1.10); opacity: .9; }
      }
      @keyframes outreachBlink {
        0%, 100% { opacity: 1;  }
        50%      { opacity: .3; }
      }
      @keyframes outreachFadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes outreachLineIn {
        from { opacity: 0; transform: translateY(3px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes outreachStripIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes outreachInMarketPulse {
        0%, 100% { box-shadow: 0 0 0 4px rgba(44,140,112,.14); }
        50%      { box-shadow: 0 0 0 8px rgba(44,140,112,.06); }
      }
      @keyframes outreachSpin {
        to { transform: rotate(360deg); }
      }
      .outreach-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 28px rgba(12,10,9,.22);
      }
      .outreach-secondary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 22px rgba(12,10,9,.10);
      }
      .outreach-secondary-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 22px rgba(12,10,9,.18);
      }
      .outreach-launch:hover:not(:disabled) {
        transform: translateY(-1px);
      }
      .outreach-toggle-on:hover:not(:disabled),
      .outreach-toggle-off:hover:not(:disabled) {
        transform: translateY(-1px);
      }
      .outreach-link:hover {
        text-decoration: underline;
      }
    `}</style>
  )
}
