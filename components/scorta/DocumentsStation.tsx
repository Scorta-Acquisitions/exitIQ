"use client"

import { useRouter } from "next/navigation"
import React from "react"

import type { PERSONA as PersonaShape } from "@/lib/persona"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

// ── Timing (same family as Ingestion / Recast / Risk / Boardroom T = {…}) ───
const T = {
  streamStepMs: 300, // 12 lines × 300ms = 3.6s
  streamTailMs: 360, // pause after final line before preview reveal
  surfaceRevealMs: 360,
  approveSpinnerMs: 700,
  auditHoldMs: 520,
  previewTipMs: 2200,
}

type Persona = typeof PersonaShape
type ApprovePhase = "idle" | "approving" | "approved"

type AgentAttribution =
  | "Recast Agent + CIM Agent"
  | "CIM Agent"
  | "Recast Agent"
  | "Owner-Dependency Agent"
  | "Concentration Agent"
  | "Recast Agent + Boardroom"
  | "Boardroom"

type CIMSection = {
  number: number
  title: string
  agent: AgentAttribution
  agentTooltip: string
}

// 12-section CIM spec (hard-coded from Station 7 spec — assembly stream order
// and section attributions). Section 1 + Section 6 render as full content.
// Sections 2–5, 7–12 collapse to title + agent chip and expand to a mint
// placeholder line on chevron toggle.
const SECTIONS: ReadonlyArray<CIMSection> = [
  {
    number: 1,
    title: "Executive Summary",
    agent: "Recast Agent + CIM Agent",
    agentTooltip:
      "Built from the Recast Agent's normalized SDE and the CIM Agent's lender-facing narrative.",
  },
  {
    number: 2,
    title: "Business Overview & History",
    agent: "CIM Agent",
    agentTooltip: "Built from the CIM Agent's business narrative output.",
  },
  {
    number: 3,
    title: "Products & Services",
    agent: "CIM Agent",
    agentTooltip: "Built from the CIM Agent's service-mix analysis.",
  },
  {
    number: 4,
    title: "Market & Competition",
    agent: "CIM Agent",
    agentTooltip: "Built from the CIM Agent's market-position assessment.",
  },
  {
    number: 5,
    title: "Financial Performance",
    agent: "Recast Agent",
    agentTooltip: "Built from the Recast Agent's approved 3-year normalized P&L.",
  },
  {
    number: 6,
    title: "Deal Structure & Terms",
    agent: "Recast Agent + Boardroom",
    agentTooltip:
      "Built from the Recast Agent's valuation output and the Boardroom's buyer-profile recommendations.",
  },
  {
    number: 7,
    title: "Operations & Staffing",
    agent: "Owner-Dependency Agent",
    agentTooltip: "Built from the Owner-Dependency Agent's staffing and SOP review.",
  },
  {
    number: 8,
    title: "Owner-Dependency Remediation",
    agent: "Owner-Dependency Agent",
    agentTooltip:
      "Built from the Owner-Dependency Agent's 5-task SOP remediation plan (38/100 → 62/100).",
  },
  {
    number: 9,
    title: "Customer Concentration Analysis",
    agent: "Concentration Agent",
    agentTooltip:
      "Built from the Concentration Agent's NJ Transit account review and contract coverage plan.",
  },
  {
    number: 10,
    title: "Facilities & Equipment",
    agent: "CIM Agent",
    agentTooltip: "Built from the CIM Agent's property and equipment schedule.",
  },
  {
    number: 11,
    title: "Growth Opportunities",
    agent: "CIM Agent",
    agentTooltip: "Built from the CIM Agent's documented upside levers.",
  },
  {
    number: 12,
    title: "Buyer Qualification Criteria",
    agent: "Boardroom",
    agentTooltip:
      "Built from Boardroom's buyer persona analysis — SBA-Backed Operator and Micro-PE prioritized.",
  },
]

// Buyer profile chips for Section 6 (persona accent tokens established
// in the Boardroom station — mint / sky / peach. Do not introduce new colors.)
type BuyerProfile = {
  key: "sba" | "search" | "micro"
  label: string
  accent: string
  accentSoft: string
  accentEdge: string
  body: string
}

// ── Document picker — 8 deliverables the agent fleet can produce ──────
// Only "cim" is wired live. The other 7 are dummy buttons that flash a
// tooltip, communicating that the same upstream agent work fuels every
// document Scorta would produce during exit-readiness prep.
type DocType = {
  key:
    | "cim"
    | "teaser"
    | "lender"
    | "nda"
    | "addbacks"
    | "sops"
    | "loi"
    | "buyerqa"
  abbr: string // 3-letter avatar
  title: string
  agent: string
  audience: string // who this is for (Buyers / Lenders / Internal / Legal)
  body: string
}

const DOC_TYPES: ReadonlyArray<DocType> = [
  {
    key: "cim",
    abbr: "CIM",
    title: "Confidential Information Memorandum",
    agent: "CIM Agent",
    audience: "Buyer-facing",
    body: "The full 12-section deal document buyers receive after signing an NDA. Built from the approved recast, risk profile, and Boardroom buyer-targeting work.",
  },
  {
    key: "teaser",
    abbr: "TSR",
    title: "Anonymized Listing Teaser",
    agent: "Outreach Agent",
    audience: "Buyer-facing",
    body: "One-page blind profile for marketplace listings and cold buyer outreach. Surfaces the opportunity without exposing Palace's identity until NDA.",
  },
  {
    key: "lender",
    abbr: "LP",
    title: "SBA Lender Package",
    agent: "Lender Ops Agent",
    audience: "Lender-facing",
    body: "SBA 7(a)-ready package — normalized P&L, add-back schedule, DSCR worksheet, and lender-facing narrative for the three pre-matched lenders.",
  },
  {
    key: "nda",
    abbr: "NDA",
    title: "Mutual NDA Template",
    agent: "Case Manager Agent",
    audience: "Legal · pre-VDR",
    body: "Bilateral non-disclosure ready for buyer countersignature before VDR access is granted. Calibrated to New Jersey jurisdiction.",
  },
  {
    key: "addbacks",
    abbr: "ABS",
    title: "Add-Back Defensibility Memo",
    agent: "Recast Agent",
    audience: "Lender-facing",
    body: "SBA SOP 50 10 8-defensible narrative for each add-back line. Ships with the financials in the VDR so lender underwriting questions don't slow the deal.",
  },
  {
    key: "sops",
    abbr: "SOP",
    title: "Operations Manual & SOP Library",
    agent: "Owner-Dependency Agent",
    audience: "Internal · remediation",
    body: "The 5-task SOP package that closes the 38/100 → 62/100 transferability gap. +$450K deal value unlock when complete.",
  },
  {
    key: "loi",
    abbr: "LOI",
    title: "Letter of Intent Template",
    agent: "Boardroom",
    audience: "Legal · buyer-side",
    body: "Pre-drafted LOI calibrated to the Boardroom's verdicts — SBA structure, seller note range, and condition precedents specific to each buyer persona.",
  },
  {
    key: "buyerqa",
    abbr: "Q&A",
    title: "Buyer Q&A Brief",
    agent: "Boardroom",
    audience: "Internal · prep",
    body: "FAQ + objection-handling pack derived from the Boardroom's buyer persona analysis. Ready for your first buyer call after NDAs are signed.",
  },
]

const BUYER_PROFILES: ReadonlyArray<BuyerProfile> = [
  {
    key: "sba",
    label: "SBA-Backed Operator",
    accent: "var(--mint, #2c8c70)",
    accentSoft: "rgba(44,140,112,.10)",
    accentEdge: "rgba(44,140,112,.28)",
    body: "Full SBA 7(a) structure available at $106K down. Conditional on SOP documentation completion. Pre-qualified lender matches available in VDR.",
  },
  {
    key: "search",
    label: "Search Fund",
    accent: "var(--sky, #4a7ba8)",
    accentSoft: "rgba(74,123,168,.10)",
    accentEdge: "rgba(74,123,168,.26)",
    body: "SBA or seller-financed. Conditional on 3-year NJ Transit contract confirmation. Outreach held pending contract status.",
  },
  {
    key: "micro",
    label: "Micro-PE",
    accent: "var(--peach, #b86a3e)",
    accentSoft: "rgba(184,106,62,.10)",
    accentEdge: "rgba(184,106,62,.28)",
    body: "Cash + seller note. $175K–$229K seller note (10–15% of deal). No hard conditions — prefers faster close. Platform acquisition framing.",
  },
]

export function DocumentsStation({
  persona,
  readOnly = false,
}: {
  persona: Persona
  readOnly?: boolean
}) {
  const router = useRouter()

  // Picker gate — user picks a deliverable before generation starts.
  // Only the CIM picker tile is wired live; the others flash a tooltip.
  // In read-only mode (VDR drawer), skip the picker entirely and render
  // the preview surface as the only thing visible.
  const [started, setStarted] = React.useState(readOnly)
  const [dummyTipFor, setDummyTipFor] = React.useState<string | null>(null)
  const dummyTipTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Stream state — starts when the user clicks "Generate CIM →"
  const [visibleLines, setVisibleLines] = React.useState(readOnly ? SECTIONS.length : 1)
  const [streamComplete, setStreamComplete] = React.useState(readOnly)
  const [previewVisible, setPreviewVisible] = React.useState(readOnly)

  // Accordion — Section 1 + Section 6 expanded by default
  const [expanded, setExpanded] = React.useState<ReadonlySet<number>>(
    () => new Set([1, 6]),
  )
  function toggleSection(n: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })
  }

  // Approve gate state
  const [approvePhase, setApprovePhase] = React.useState<ApprovePhase>("idle")
  const [approvedAt, setApprovedAt] = React.useState<{ date: string; time: string } | null>(null)

  // Preview tooltip
  const [previewTipShown, setPreviewTipShown] = React.useState(false)
  const previewTipTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Stream driver — 12 lines × 300ms (fires once the user picks CIM) ──
  React.useEffect(() => {
    if (!started || readOnly) return
    const timers: Array<ReturnType<typeof setTimeout>> = []
    for (let i = 2; i <= SECTIONS.length; i++) {
      timers.push(setTimeout(() => setVisibleLines(i), T.streamStepMs * (i - 1)))
    }
    timers.push(
      setTimeout(
        () => setStreamComplete(true),
        T.streamStepMs * SECTIONS.length + T.streamTailMs / 2,
      ),
    )
    timers.push(
      setTimeout(
        () => setPreviewVisible(true),
        T.streamStepMs * SECTIONS.length + T.streamTailMs,
      ),
    )
    return () => timers.forEach(clearTimeout)
  }, [started, readOnly])

  // ── Approve handler ───────────────────────────────────────────────────
  function onApprove() {
    if (approvePhase !== "idle") return
    setApprovePhase("approving")
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
    setTimeout(() => {
      setApprovePhase("approved")
      setApprovedAt({ date, time })
      setTimeout(() => router.push("/marketplace"), T.auditHoldMs)
    }, T.approveSpinnerMs)
  }

  function onPreviewFullCim() {
    setPreviewTipShown(true)
    if (previewTipTimerRef.current) clearTimeout(previewTipTimerRef.current)
    previewTipTimerRef.current = setTimeout(() => setPreviewTipShown(false), T.previewTipMs)
  }

  React.useEffect(() => {
    return () => {
      if (previewTipTimerRef.current) clearTimeout(previewTipTimerRef.current)
      if (dummyTipTimerRef.current) clearTimeout(dummyTipTimerRef.current)
    }
  }, [])

  // Picker handlers — CIM kicks off generation, others flash a tooltip
  function onPickDoc(key: DocType["key"]) {
    if (started) return
    if (key === "cim") {
      setStarted(true)
      return
    }
    setDummyTipFor(key)
    if (dummyTipTimerRef.current) clearTimeout(dummyTipTimerRef.current)
    dummyTipTimerRef.current = setTimeout(() => setDummyTipFor(null), T.previewTipMs)
  }

  const documentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <ScopedStyles />

      {!readOnly && (
        <>
          <StationHeader started={started} streaming={started && !streamComplete} />
          <AriaIntroBanner
            persona={persona}
            started={started}
            streaming={started && !streamComplete}
          />
        </>
      )}

      {/* Layer 0 — Document picker (user picks before generation runs) ── */}
      {!started && !readOnly && (
        <DocPickerSurface
          onPick={onPickDoc}
          dummyTipFor={dummyTipFor}
        />
      )}

      {/* Layer 1 — Generation terminal card ───────────────────────────── */}
      {started && !readOnly && (
        <GenerationSurface
          visibleLines={visibleLines}
          totalCount={SECTIONS.length}
          complete={streamComplete}
        />
      )}

      {/* Layer 2 — CIM preview document surface ────────────────────────── */}
      {started && (
        <PreviewSurface
          visible={previewVisible}
          persona={persona}
          documentDate={documentDate}
          expanded={expanded}
          onToggle={toggleSection}
        />
      )}

      {/* Layer 3 — Review & Approve gate ───────────────────────────────── */}
      {started && !readOnly && (
        <ApproveGate
          visible={previewVisible}
          persona={persona}
          phase={approvePhase}
          approvedAt={approvedAt}
          onApprove={onApprove}
          onPreviewFullCim={onPreviewFullCim}
          previewTipShown={previewTipShown}
        />
      )}
    </div>
  )
}

// ── Station header ────────────────────────────────────────────────────
function StationHeader({ started, streaming }: { started: boolean; streaming: boolean }) {
  return (
    <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
          Station 07 · /documents
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
          {started ? "CIM Agent" : "Document Agents · standing by"}
          {streaming && (
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--mint, #2c8c70)",
                boxShadow: "0 0 6px var(--mint, #2c8c70)",
                animation: "cimBlink 1.1s ease-in-out infinite",
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
        CIM &amp; Documents
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
        {started ? (
          <>
            The CIM Agent is assembling Palace Kitchen &amp; Catering's Confidential
            Information Memorandum from the approved recast, risk profile, and
            Boardroom buyer-targeting work — section by section. Review each
            section, then publish to the Virtual Data Room.
          </>
        ) : (
          <>
            The Boardroom's dispatch authorized eight agent deliverables for
            Palace Kitchen. Each one is built from the same approved upstream
            data — your recast financials, risk profile, and buyer-targeting
            verdicts. Choose what to generate next.
          </>
        )}
      </p>
    </header>
  )
}

// ── ARIA intro banner ─────────────────────────────────────────────────
function AriaIntroBanner({
  persona,
  started,
  streaming,
}: {
  persona: Persona
  started: boolean
  streaming: boolean
}) {
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
          animation: "cimAriaPulse 3.2s ease-in-out infinite",
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
          ARIA · Case Manager
        </div>
        <div style={{ fontSize: 13.5, color: "var(--t1)", lineHeight: 1.55, fontFamily: inter }}>
          {!started ? (
            <>
              Every deliverable Palace will need for lender outreach, buyer
              outreach, and the close is one click away — each one assembled
              from the agents who already approved their underlying inputs.
              Start with the CIM (buyers see it first); the rest stand by until
              you call for them.
            </>
          ) : streaming ? (
            <>
              The Recast Agent and Boardroom have handed off everything the CIM
              Agent needs. {persona.identity.businessName}'s Confidential
              Information Memorandum is being assembled now — 12 sections, built
              from approved data. Review and approve each section before it goes
              to buyers.
            </>
          ) : (
            <>
              The CIM is ready for your review. Once you approve, the document
              publishes to the Virtual Data Room and your lender package
              distribution is authorized.
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Layer 0 — Document picker ─────────────────────────────────────────
function DocPickerSurface({
  onPick,
  dummyTipFor,
}: {
  onPick: (key: DocType["key"]) => void
  dummyTipFor: string | null
}) {
  return (
    <section
      style={{
        padding: "24px 28px 22px",
        background: "rgba(255,255,255,.82)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderRadius: 18,
        boxShadow:
          "0 1px 0 rgba(255,255,255,.92) inset, 0 -1px 0 rgba(0,0,0,.04) inset, 0 12px 36px rgba(12,10,9,.06)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        animation: "cimSurfaceIn .32s ease-out",
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
          Document Fleet · 8 deliverables configured
        </div>
        <h2
          style={{
            fontFamily: garamond,
            fontSize: 26,
            fontWeight: 400,
            color: "var(--t1)",
            letterSpacing: "-.4px",
            lineHeight: 1.15,
          }}
        >
          What should we generate next?
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--t3)",
            fontFamily: inter,
            lineHeight: 1.55,
            maxWidth: 720,
          }}
        >
          Each document is owned by the agent that produced its underlying
          inputs. Start with the Confidential Information Memorandum — buyers
          read it first. The rest of the fleet is ready on demand.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        {DOC_TYPES.map((doc) => (
          <DocPickerCard
            key={doc.key}
            doc={doc}
            primary={doc.key === "cim"}
            onPick={() => onPick(doc.key)}
            tipShown={dummyTipFor === doc.key}
          />
        ))}
      </div>
    </section>
  )
}

function DocPickerCard({
  doc,
  primary,
  onPick,
  tipShown,
}: {
  doc: DocType
  primary: boolean
  onPick: () => void
  tipShown: boolean
}) {
  const mint = "var(--mint, #2c8c70)"
  const mintSoft = "rgba(44,140,112,.10)"
  const mintEdge = "rgba(44,140,112,.28)"
  return (
    <article
      style={{
        position: "relative",
        padding: "18px 20px 16px",
        background: primary ? "rgba(44,140,112,.05)" : "rgba(255,255,255,.55)",
        border: `1px solid ${primary ? mintEdge : "var(--glass-edge, rgba(0,0,0,.07))"}`,
        borderTop: primary ? `3px solid ${mint}` : `1px solid var(--glass-edge, rgba(0,0,0,.07))`,
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "transform 220ms ease-out, box-shadow 220ms ease-out",
      }}
      className="cim-doc-card"
    >
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div
          aria-hidden
          style={{
            width: 42,
            height: 42,
            flexShrink: 0,
            borderRadius: 10,
            background: primary ? mint : "rgba(12,10,9,.78)",
            color: primary ? "#fff" : "rgba(245,245,245,.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: mono,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: ".4px",
            boxShadow: primary
              ? "0 6px 16px rgba(44,140,112,.28)"
              : "0 6px 14px rgba(12,10,9,.10)",
          }}
        >
          {doc.abbr}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              fontFamily: garamond,
              fontSize: 18,
              fontWeight: 400,
              color: "var(--t1)",
              letterSpacing: "-.2px",
              lineHeight: 1.2,
            }}
          >
            {doc.title}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "2px 8px",
                borderRadius: 9999,
                background: mintSoft,
                border: `1px solid ${mintEdge}`,
                fontFamily: inter,
                fontSize: 10.5,
                fontWeight: 600,
                color: mint,
                letterSpacing: ".1px",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: mint,
                }}
              />
              {doc.agent}
            </span>
            <span
              style={{
                fontFamily: mono,
                fontSize: 10,
                color: "var(--t3)",
                letterSpacing: ".6px",
                textTransform: "uppercase",
              }}
            >
              · {doc.audience}
            </span>
          </div>
        </div>
      </header>

      <p
        style={{
          fontSize: 12.5,
          color: "var(--t2)",
          lineHeight: 1.55,
          fontFamily: inter,
          margin: 0,
          flex: 1,
        }}
      >
        {doc.body}
      </p>

      <footer
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 4,
          paddingTop: 10,
          borderTop: `1px dashed ${primary ? mintEdge : "var(--glass-edge, rgba(0,0,0,.10))"}`,
          position: "relative",
        }}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: ".6px",
            textTransform: "uppercase",
            color: primary ? mint : "var(--t3)",
          }}
        >
          {primary ? "Ready · primary build" : "Ready on demand"}
        </span>
        <button
          type="button"
          onClick={onPick}
          className={primary ? "cim-primary" : "cim-secondary"}
          style={{
            height: 34,
            padding: "0 14px",
            borderRadius: 9999,
            background: primary ? "var(--btn-bg)" : "rgba(255,255,255,.85)",
            color: primary ? "var(--btn-fg)" : "var(--t1)",
            border: primary
              ? "none"
              : "1px solid var(--glass-edge, rgba(0,0,0,.10))",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: inter,
            letterSpacing: "-.05px",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            boxShadow: primary ? "0 6px 18px rgba(12,10,9,.18)" : "none",
            transition:
              "transform 180ms ease-out, box-shadow 180ms ease-out, background 180ms ease-out",
          }}
        >
          <span>
            {primary ? "Generate CIM" : "Generate"}
          </span>
          <span aria-hidden style={{ transform: "translateY(-1px)" }}>
            →
          </span>
        </button>
        {tipShown && (
          <span
            role="tooltip"
            style={{
              position: "absolute",
              right: 0,
              bottom: "calc(100% + 8px)",
              padding: "8px 12px",
              borderRadius: 10,
              background: "rgba(12,10,9,.94)",
              color: "rgba(245,245,245,.95)",
              fontSize: 11.5,
              lineHeight: 1.4,
              fontFamily: inter,
              maxWidth: 280,
              whiteSpace: "normal",
              textAlign: "left",
              boxShadow: "0 12px 28px rgba(12,10,9,.22)",
              animation: "cimLineIn .22s ease-out",
              zIndex: 30,
            }}
          >
            Available on demand · the {doc.agent} will publish this to your VDR
            when you request it.
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
                borderTop: "6px solid rgba(12,10,9,.94)",
              }}
            />
          </span>
        )}
      </footer>
    </article>
  )
}

// ── Layer 1 — Generation surface ──────────────────────────────────────
function GenerationSurface({
  visibleLines,
  totalCount,
  complete,
}: {
  visibleLines: number
  totalCount: number
  complete: boolean
}) {
  const lines = SECTIONS.slice(0, visibleLines)
  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [visibleLines])

  // After completion, the card collapses to a slim status bar — but the
  // terminal stays visible as evidence the agent ran (spec: do not hide it).
  if (complete) {
    return (
      <section
        style={{
          padding: "10px 16px",
          background: "rgba(12,10,9,.92)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 12,
          boxShadow: "0 6px 18px rgba(12,10,9,.12)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          animation: "cimSurfaceIn .32s ease-out",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--mint, #2c8c70)",
            boxShadow: "0 0 6px var(--mint, #2c8c70)",
          }}
        />
        <div
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: "rgba(167,229,211,.95)",
            fontWeight: 600,
            letterSpacing: ".6px",
            textTransform: "uppercase",
          }}
        >
          CIM Agent · complete · 12 sections ✓
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "rgba(245,245,245,.55)",
            letterSpacing: ".4px",
          }}
        >
          cim-agent · ready for review
        </div>
      </section>
    )
  }

  return (
    <section
      style={{
        position: "relative",
        background: "rgba(12,10,9,.92)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 16,
        boxShadow: "0 12px 36px rgba(12,10,9,.18)",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,.07)",
          background: "rgba(255,255,255,.025)",
        }}
      >
        <span aria-hidden style={{ display: "inline-flex", gap: 6 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57" }} />
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#febc2e" }} />
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840" }} />
        </span>
        <span
          aria-hidden
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--mint, #2c8c70)",
            boxShadow: "0 0 6px var(--mint, #2c8c70)",
            animation: "cimBlink 1.1s ease-in-out infinite",
          }}
        />
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "rgba(167,229,211,.95)",
            fontWeight: 600,
            letterSpacing: ".7px",
            textTransform: "uppercase",
          }}
        >
          CIM Agent · Palace Kitchen &amp; Catering
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: "rgba(245,245,245,.55)",
            letterSpacing: ".4px",
          }}
        >
          cim-agent · assembling · live
        </div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            color: "rgba(245,245,245,.55)",
            letterSpacing: ".5px",
            textTransform: "uppercase",
          }}
        >
          {visibleLines} / {totalCount}
        </div>
      </header>

      <div
        ref={scrollRef}
        style={{
          height: 320,
          overflowY: "auto",
          padding: "14px 18px 18px",
          fontFamily: mono,
          fontSize: 12.5,
          lineHeight: 1.75,
          color: "rgba(245,245,245,.78)",
          scrollBehavior: "smooth",
        }}
      >
        {lines.map((section, i) => {
          const last = i === lines.length - 1
          return (
            <div
              key={section.number}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 12,
                padding: "2px 0",
                opacity: last ? 1 : 0.78,
                animation: "cimLineIn .28s ease-out",
              }}
            >
              <span
                style={{
                  color: "rgba(245,245,245,.42)",
                  flexShrink: 0,
                  letterSpacing: ".4px",
                }}
              >
                [Section {String(section.number).padStart(2, "0")}]
              </span>
              <span
                style={{
                  flex: 1,
                  color: "rgba(245,245,245,.88)",
                }}
              >
                {section.title}...
              </span>
              <span style={{ color: "var(--mint, #2c8c70)", flexShrink: 0 }}>✓</span>
            </div>
          )
        })}
        <Caret />
      </div>
    </section>
  )
}

function Caret() {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 8,
        height: 14,
        background: "rgba(245,245,245,.72)",
        verticalAlign: "middle",
        marginTop: 4,
        animation: "cimCaret 1.05s steps(2) infinite",
      }}
    />
  )
}

// ── Layer 2 — CIM document preview ────────────────────────────────────
function PreviewSurface({
  visible,
  persona,
  documentDate,
  expanded,
  onToggle,
}: {
  visible: boolean
  persona: Persona
  documentDate: string
  expanded: ReadonlySet<number>
  onToggle: (n: number) => void
}) {
  return (
    <section
      aria-hidden={!visible}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: `opacity ${T.surfaceRevealMs}ms ease-out, transform ${T.surfaceRevealMs}ms ease-out`,
        pointerEvents: visible ? "auto" : "none",
        display: visible ? "block" : "none",
        background: "#faf9f7",
        border: "1px solid rgba(122,107,86,.18)",
        borderRadius: 4,
        boxShadow:
          "0 1px 0 rgba(255,255,255,.7) inset, 0 -1px 0 rgba(122,107,86,.08) inset, 0 18px 44px rgba(60,48,32,.10)",
        padding: "44px 56px 36px",
      }}
    >
      {/* Document header ─────────────────────────────────────────── */}
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          paddingBottom: 22,
          marginBottom: 24,
          borderBottom: "1px solid rgba(122,107,86,.16)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: garamond,
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: "3.6px",
            textTransform: "uppercase",
            color: "rgba(60,48,32,.62)",
          }}
        >
          Confidential Information Memorandum
        </div>
        <div
          style={{
            fontFamily: garamond,
            fontSize: 30,
            fontWeight: 400,
            color: "#1a1612",
            letterSpacing: "-.4px",
            lineHeight: 1.1,
            marginTop: 4,
          }}
        >
          {persona.identity.businessName}
        </div>
        <div
          style={{
            fontFamily: garamond,
            fontSize: 14,
            fontStyle: "italic",
            color: "rgba(60,48,32,.7)",
          }}
        >
          Prepared by Scorta
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: mono,
            fontSize: 11,
            color: "rgba(60,48,32,.55)",
            letterSpacing: ".6px",
            textTransform: "uppercase",
          }}
        >
          {documentDate} · SBA 7(a) Eligible · Listed: {persona.financials.recommendedListingDisplay}
        </div>
        <div
          style={{
            marginTop: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: "#1a1612",
              color: "#faf9f7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: garamond,
              fontWeight: 500,
              fontSize: 13,
              letterSpacing: "-.3px",
            }}
          >
            S
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div
              style={{
                fontFamily: garamond,
                fontSize: 15,
                fontWeight: 500,
                color: "#1a1612",
                letterSpacing: "-.2px",
                lineHeight: 1,
              }}
            >
              Scorta
            </div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 9,
                color: "rgba(60,48,32,.55)",
                letterSpacing: ".7px",
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              Broker of Record
            </div>
          </div>
        </div>
      </header>

      {/* Sections ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {SECTIONS.map((section) => {
          const isOpen = expanded.has(section.number)
          return (
            <SectionRow
              key={section.number}
              section={section}
              isOpen={isOpen}
              onToggle={() => onToggle(section.number)}
              persona={persona}
            />
          )
        })}
      </div>
    </section>
  )
}

function SectionRow({
  section,
  isOpen,
  onToggle,
  persona,
}: {
  section: CIMSection
  isOpen: boolean
  onToggle: () => void
  persona: Persona
}) {
  return (
    <article
      style={{
        borderTop: "1px solid rgba(122,107,86,.14)",
        padding: "20px 0 20px",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="cim-section-toggle"
        style={{
          all: "unset",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 14,
          width: "100%",
          padding: "2px 0",
        }}
        aria-expanded={isOpen}
      >
        <span
          style={{
            fontFamily: garamond,
            fontSize: 13,
            fontWeight: 500,
            color: "rgba(60,48,32,.55)",
            letterSpacing: ".4px",
            minWidth: 36,
          }}
        >
          {String(section.number).padStart(2, "0")}
        </span>
        <span
          style={{
            fontFamily: garamond,
            fontSize: section.number === 1 || section.number === 6 ? 24 : 19,
            fontWeight: 400,
            color: "#1a1612",
            letterSpacing: "-.3px",
            lineHeight: 1.2,
            flex: 1,
          }}
        >
          {section.title}
        </span>
        <SectionChip agent={section.agent} tooltip={section.agentTooltip} />
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            marginLeft: 4,
            color: "rgba(60,48,32,.55)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 240ms ease-out",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5l4 4 4-4" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            paddingTop: 18,
            paddingLeft: 50,
            animation: "cimLineIn .28s ease-out",
          }}
        >
          {section.number === 1 ? (
            <ExecutiveSummary persona={persona} />
          ) : section.number === 6 ? (
            <DealStructure persona={persona} />
          ) : (
            <CollapsedPlaceholder n={section.number} />
          )}
        </div>
      )}
    </article>
  )
}

function SectionChip({ agent, tooltip }: { agent: AgentAttribution; tooltip: string }) {
  const [shown, setShown] = React.useState(false)
  return (
    <span
      onMouseEnter={() => setShown(true)}
      onMouseLeave={() => setShown(false)}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "4px 10px",
        borderRadius: 9999,
        background: "rgba(44,140,112,.10)",
        border: "1px solid rgba(44,140,112,.22)",
        fontFamily: inter,
        fontSize: 11,
        fontWeight: 500,
        color: "var(--mint, #2c8c70)",
        letterSpacing: ".1px",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--mint, #2c8c70)",
        }}
      />
      <span>Complete · {agent}</span>
      {shown && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            right: 0,
            padding: "8px 12px",
            borderRadius: 10,
            background: "rgba(12,10,9,.94)",
            color: "rgba(245,245,245,.95)",
            fontSize: 11.5,
            lineHeight: 1.45,
            fontFamily: inter,
            fontWeight: 500,
            letterSpacing: 0,
            maxWidth: 280,
            whiteSpace: "normal",
            textAlign: "left",
            boxShadow: "0 12px 28px rgba(12,10,9,.22)",
            animation: "cimLineIn .22s ease-out",
            zIndex: 20,
          }}
        >
          {tooltip}
        </span>
      )}
    </span>
  )
}

function CollapsedPlaceholder({ n }: { n: number }) {
  return (
    <div
      style={{
        padding: "12px 16px",
        background: "rgba(44,140,112,.06)",
        border: "1px dashed rgba(44,140,112,.30)",
        borderRadius: 10,
        fontFamily: inter,
        fontSize: 12.5,
        color: "var(--mint, #2c8c70)",
        letterSpacing: ".1px",
        fontWeight: 500,
      }}
    >
      Section {String(n).padStart(2, "0")} content available in VDR · approved for buyer access
    </div>
  )
}

// ── Section 1 — Executive Summary ─────────────────────────────────────
function ExecutiveSummary({ persona }: { persona: Persona }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        fontFamily: garamond,
        fontSize: 16.5,
        lineHeight: 1.7,
        color: "#1a1612",
        letterSpacing: ".05px",
        maxWidth: 760,
      }}
    >
      <p>
        {persona.identity.businessName} is a {persona.business.yearsOperating}-year-old,
        owner-operated food service business located in Northern New Jersey. The
        business operates a full-service commercial kitchen offering walk-in
        dining, corporate catering, and event services. The owner holds title to
        the 4,200&nbsp;sq&nbsp;ft facility, which is included in the listing.
      </p>
      <p>
        Over the trailing 36&nbsp;months, Palace Kitchen has grown revenue at an{" "}
        {persona.financials.revenueTrend3yr}% compound rate, reaching{" "}
        {persona.financials.revenueDisplay} in Year&nbsp;3. Normalized Seller's
        Discretionary Earnings (SDE) for Year&nbsp;3 are{" "}
        {persona.financials.normalizedSDEYear3Display.replace("K", ",000")}, after{" "}
        $147,000 in documented and SBA-defensible add-backs including owner
        compensation, personal vehicle expenses, and a non-recurring equipment
        repair. The 3-year normalized SDE trend shows consistent improvement:
        $827K (Year&nbsp;1) → $934K (Year&nbsp;2) → $962K (Year&nbsp;3).
      </p>
      <p>
        The business is listed at {persona.financials.recommendedListingDisplay},
        representing a {persona.financials.appliedMultiple}× multiple on Year&nbsp;3
        normalized SDE. The listing is SBA 7(a) eligible with a projected DSCR
        of {persona.sba.dscr}× — well above the {persona.sba.dscrFloor}× threshold.
        Minimum buyer down payment is {persona.sba.minDownPaymentDisplay.replace("K", ",000")}.
        Property ownership provides a balance sheet asset that supports both SBA
        financing and micro-PE acquisition structures.
      </p>
      <p>
        A Scorta-assisted remediation plan is in progress to address
        owner-dependency risk (current Transferability score:{" "}
        {persona.risk.ownerDependencyScore}/100; target:{" "}
        {persona.risk.targetTransferability}/100). Completion of the 5-task SOP
        documentation program is projected to add{" "}
        {persona.risk.fixValueUnlockDisplay.replace("+$", "$").replace("K", ",000")} in
        deal value and support the upper end of the valuation range at a 3.0×
        multiple. The {persona.risk.topAccountName} account ({persona.risk.topCustomerShare}%
        of revenue, {persona.risk.topAccountTenureYears}-year tenure) is being
        formalized under a 3-year written contract.
      </p>
    </div>
  )
}

// ── Section 6 — Deal Structure & Terms ────────────────────────────────
function DealStructure({ persona }: { persona: Persona }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.05fr)",
        gap: 28,
        alignItems: "flex-start",
      }}
    >
      {/* Left — the numbers */}
      <div
        style={{
          padding: "18px 22px",
          background: "rgba(255,255,255,.5)",
          border: "1px solid rgba(122,107,86,.14)",
          borderRadius: 10,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <ValueRow label="Listing Price" value="$1,750,000" emphasis />
        <ValueRow label="Multiple (Year 3)" value="2.4× SDE" />
        <ValueRow label="Valuation Range" value="$1.6M – $1.9M" />
        <ValueRow label="Asset Floor" value="$500K" muted />

        <Divider />

        <SubsectionLabel>SBA 7(a) Financing</SubsectionLabel>
        <ValueRow label="Loan Amount" value="$1,090,000 (87.5% financed)" />
        <ValueRow label="Buyer Down Payment" value="$106,000 minimum" />
        <ValueRow label="Monthly Debt Service" value="$14,200/month" />
        <ValueRow
          label="DSCR"
          value={`${persona.sba.dscr}× (floor ${persona.sba.dscrFloor}×)`}
          mint
        />

        <Divider />

        <ValueRow label="Seller Note (Micro-PE)" value="$175K – $229K optional" />
        <ValueRow label="Earnout" value="Available on request" muted />
      </div>

      {/* Right — buyer structure guidance */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: ".7px",
            textTransform: "uppercase",
            color: "rgba(60,48,32,.62)",
          }}
        >
          Per Buyer Profile · Boardroom recommendations
        </div>
        {BUYER_PROFILES.map((profile) => (
          <BuyerProfileCard key={profile.key} profile={profile} />
        ))}
      </div>
    </div>
  )
}

function ValueRow({
  label,
  value,
  emphasis,
  mint,
  muted,
}: {
  label: string
  value: string
  emphasis?: boolean
  mint?: boolean
  muted?: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 14,
        padding: "5px 0",
      }}
    >
      <span
        style={{
          fontFamily: inter,
          fontSize: 12.5,
          color: "rgba(60,48,32,.7)",
          letterSpacing: ".05px",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: emphasis ? garamond : inter,
          fontSize: emphasis ? 22 : 13,
          fontWeight: emphasis ? 400 : 600,
          color: mint
            ? "var(--mint, #2c8c70)"
            : muted
            ? "rgba(60,48,32,.55)"
            : "#1a1612",
          letterSpacing: emphasis ? "-.3px" : ".05px",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  )
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: "rgba(122,107,86,.18)",
        margin: "10px 0 8px",
      }}
    />
  )
}

function SubsectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: ".7px",
        textTransform: "uppercase",
        color: "rgba(60,48,32,.62)",
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  )
}

function BuyerProfileCard({ profile }: { profile: BuyerProfile }) {
  const [expanded, setExpanded] = React.useState(false)
  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        padding: "14px 16px",
        background: profile.accentSoft,
        border: `1px solid ${profile.accentEdge}`,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        transition: "transform 220ms ease-out, box-shadow 220ms ease-out",
        transform: expanded ? "translateY(-1px)" : "translateY(0)",
        boxShadow: expanded ? `0 8px 22px ${profile.accentSoft}` : "none",
        cursor: "default",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          alignSelf: "flex-start",
          padding: "3px 9px",
          borderRadius: 9999,
          background: "rgba(255,255,255,.7)",
          border: `1px solid ${profile.accentEdge}`,
          fontFamily: inter,
          fontSize: 11,
          fontWeight: 600,
          color: profile.accent,
          letterSpacing: ".1px",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: profile.accent,
          }}
        />
        {profile.label}
      </div>
      <p
        style={{
          fontFamily: inter,
          fontSize: 12.5,
          lineHeight: 1.55,
          color: "#1a1612",
          margin: 0,
        }}
      >
        {profile.body}
      </p>
    </div>
  )
}

// ── Layer 3 — Review & Approve gate ───────────────────────────────────
function ApproveGate({
  visible,
  persona,
  phase,
  approvedAt,
  onApprove,
  onPreviewFullCim,
  previewTipShown,
}: {
  visible: boolean
  persona: Persona
  phase: ApprovePhase
  approvedAt: { date: string; time: string } | null
  onApprove: () => void
  onPreviewFullCim: () => void
  previewTipShown: boolean
}) {
  return (
    <section
      aria-hidden={!visible}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: `opacity ${T.surfaceRevealMs}ms ease-out ${T.surfaceRevealMs * 0.5}ms, transform ${T.surfaceRevealMs}ms ease-out ${T.surfaceRevealMs * 0.5}ms`,
        pointerEvents: visible ? "auto" : "none",
        display: visible ? "block" : "none",
        padding: "22px 26px 20px",
        background:
          "linear-gradient(180deg, rgba(44,140,112,.08) 0%, rgba(44,140,112,.04) 100%)",
        border: "1px solid var(--mint-edge, rgba(44,140,112,.28))",
        borderRadius: 16,
        boxShadow:
          "0 1px 0 rgba(255,255,255,.6) inset, 0 8px 24px rgba(44,140,112,.10)",
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
            animation: "cimAriaPulse 3.2s ease-in-out infinite",
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
            CIM Agent · awaiting your approval
          </div>
          <div
            style={{
              fontSize: 14.5,
              color: "var(--t1)",
              lineHeight: 1.45,
              fontWeight: 600,
            }}
          >
            Approve the CIM for VDR release.
          </div>
          <div style={{ fontSize: 12.5, color: "var(--t2)", lineHeight: 1.55, marginTop: 4 }}>
            Once approved, the CIM will be published to your Virtual Data Room
            and made available to buyers who sign an NDA. Lender package
            distribution will reference the approved CIM. You can update
            individual sections at any time — updates require re-approval.
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
              onClick={onPreviewFullCim}
              disabled={phase !== "idle"}
              className="cim-secondary"
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
              Preview full CIM
            </button>
            {previewTipShown && (
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
                  animation: "cimLineIn .22s ease-out",
                  zIndex: 30,
                }}
              >
                Full 12-section CIM available in your VDR.
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
            onClick={onApprove}
            disabled={phase !== "idle"}
            className="cim-primary"
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
              minWidth: 260,
              justifyContent: "center",
            }}
          >
            {phase === "approving" && <Spinner light />}
            {phase === "approved" && (
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
            <span>
              {phase === "approving"
                ? "Publishing to VDR..."
                : phase === "approved"
                ? "Published · routing to Marketplace"
                : "Approve & Publish to VDR"}
            </span>
            {phase === "idle" && <span style={{ transform: "translateY(-1px)" }}>→</span>}
          </button>
        </div>
      </div>

      {/* Audit confirmation line ──────────────────────────────────── */}
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
            animation: "cimLineIn .28s ease-out",
            flexWrap: "wrap",
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
            CIM approved by {persona.identity.displayName} · {approvedAt.date} ·{" "}
            {approvedAt.time} · Published to VDR · Lender package distribution
            authorized.
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
        animation: "cimSpin .8s linear infinite",
      }}
    />
  )
}

// ── Scoped styles ─────────────────────────────────────────────────────
function ScopedStyles() {
  return (
    <style>{`
      @keyframes cimAriaPulse {
        0%, 100% { transform: scale(1);    opacity: 1;  }
        50%      { transform: scale(1.10); opacity: .9; }
      }
      @keyframes cimBlink {
        0%, 100% { opacity: 1;  }
        50%      { opacity: .3; }
      }
      @keyframes cimLineIn {
        from { opacity: 0; transform: translateY(3px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes cimSurfaceIn {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes cimSpin {
        to { transform: rotate(360deg); }
      }
      @keyframes cimCaret {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }
      .cim-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 28px rgba(12,10,9,.22);
      }
      .cim-secondary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 22px rgba(12,10,9,.10);
      }
      .cim-section-toggle:hover {
        opacity: 0.92;
      }
      .cim-doc-card:hover {
        transform: translateY(-1px);
        box-shadow: 0 14px 30px rgba(12,10,9,.10);
      }
    `}</style>
  )
}
