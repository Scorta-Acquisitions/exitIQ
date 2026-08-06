"use client"

import { useRouter } from "next/navigation"
import React from "react"

import { RECAST_THINKING_FLAG } from "@/lib/auditTrail"
import type { PERSONA as PersonaShape } from "@/lib/persona"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

// ── Timing reference (same family as IngestionStation T = {…}) ────────────
const T = {
  agentWorkingMs: 1800, // Recast Agent "in progress" → surface reveal
  cycleStepMs: 600, // status line cadence inside the 1.8s open
  surfaceRevealMs: 360,
  approveSpinnerMs: 700,
  auditHoldMs: 520,
  pdfTipMs: 2200,
}

const PROGRESS_LINES: ReadonlyArray<string> = [
  "Applying owner compensation add-back...",
  "Normalizing one-time and personal expenses...",
  "Building SBA-defensible narrative...",
]

type Persona = typeof PersonaShape
type ApprovePhase = "idle" | "approving" | "approved"

export function RecastStation({
  persona,
  readOnly = false,
}: {
  persona: Persona
  readOnly?: boolean
}) {
  const router = useRouter()

  // In read-only mode (VDR drawer), skip the working state entirely:
  // surface is visible immediately, no agent animation, no approve gate.
  const [working, setWorking] = React.useState(!readOnly)
  const [cycleIdx, setCycleIdx] = React.useState(0)
  const [surfaceVisible, setSurfaceVisible] = React.useState(readOnly)

  // Approve gate state
  const [approvePhase, setApprovePhase] = React.useState<ApprovePhase>("idle")
  const [approvedAt, setApprovedAt] = React.useState<{ date: string; time: string } | null>(null)

  // PDF tooltip
  const [pdfTipShown, setPdfTipShown] = React.useState(false)
  const pdfTipTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Edit Recast tooltip
  const [editTipShown, setEditTipShown] = React.useState(false)
  const editTipTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Add-back collapse
  const [narrativesOpen, setNarrativesOpen] = React.useState(true)

  // ── Open: 1.8s working state cycling 3 lines, then reveal surface ──────
  React.useEffect(() => {
    if (readOnly) return
    const timers: Array<ReturnType<typeof setTimeout>> = []
    for (let i = 1; i < PROGRESS_LINES.length; i++) {
      timers.push(setTimeout(() => setCycleIdx(i), T.cycleStepMs * i))
    }
    timers.push(
      setTimeout(() => {
        setWorking(false)
        setTimeout(() => {
          setSurfaceVisible(true)
          // Log the Recast Agent's thought-process trace to the permanent
          // audit trail. The modal reads this flag to mark the entry as
          // "Just logged" and auto-expand it.
          try {
            sessionStorage.setItem(RECAST_THINKING_FLAG, "1")
          } catch {
            // sessionStorage may be unavailable; the audit entry is still
            // present in the trail, just without the freshly-logged badge.
          }
        }, 60)
      }, T.agentWorkingMs),
    )
    return () => timers.forEach(clearTimeout)
  }, [readOnly])

  // ── Approve handler ────────────────────────────────────────────────────
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
      setTimeout(() => router.push("/risk"), T.auditHoldMs)
    }, T.approveSpinnerMs)
  }

  function onDownloadPdf() {
    setPdfTipShown(true)
    if (pdfTipTimerRef.current) clearTimeout(pdfTipTimerRef.current)
    pdfTipTimerRef.current = setTimeout(() => setPdfTipShown(false), T.pdfTipMs)
  }

  function onEditRecast() {
    setEditTipShown(true)
    if (editTipTimerRef.current) clearTimeout(editTipTimerRef.current)
    editTipTimerRef.current = setTimeout(() => setEditTipShown(false), T.pdfTipMs)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <ScopedStyles />

      {!readOnly && (
        <>
          <StationHeader working={working} />
          <CaseIntroBanner persona={persona} working={working} cycleIdx={cycleIdx} />
        </>
      )}

      {/* Recast surface ─────────────────────────────────────────────── */}
      <RecastSurface
        visible={surfaceVisible}
        narrativesOpen={narrativesOpen}
        onToggleNarratives={() => setNarrativesOpen((v) => !v)}
        persona={persona}
      />

      {/* Review & Approve gate ──────────────────────────────────────── */}
      {!readOnly && (
        <ApproveGate
          visible={surfaceVisible}
          persona={persona}
          phase={approvePhase}
          approvedAt={approvedAt}
          onApprove={onApprove}
          onDownloadPdf={onDownloadPdf}
          pdfTipShown={pdfTipShown}
          onEditRecast={onEditRecast}
          editTipShown={editTipShown}
        />
      )}
    </div>
  )
}

// ── Station header ────────────────────────────────────────────────────
function StationHeader({ working }: { working: boolean }) {
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
          Station 05 · /recast
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
          Recast Agent
          {working && (
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--mint, #2c8c70)",
                boxShadow: "0 0 6px var(--mint, #2c8c70)",
                animation: "recastBlink 1.1s ease-in-out infinite",
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
        Financials Recast
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--t2)",
          lineHeight: 1.6,
          maxWidth: 680,
          fontFamily: inter,
        }}
      >
        The Recast Agent is normalizing three years of P&amp;L into an SBA-defensible
        view — applying add-backs, generating the lender-facing narrative, and producing
        a valuation against the approved baseline. Your approval here publishes the
        recast to your lender package.
      </p>
    </header>
  )
}

// ── CASE intro banner ─────────────────────────────────────────────────
function CaseIntroBanner({
  persona,
  working,
  cycleIdx,
}: {
  persona: Persona
  working: boolean
  cycleIdx: number
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
          animation: "recastCasePulse 3.2s ease-in-out infinite",
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
          {working ? (
            <>
              Recast Agent is normalizing {persona.identity.shortName}'s financials —
              applying SBA-style add-backs and cleaning the EBITDA story.
            </>
          ) : (
            <>
              Recast complete. Review the normalized financials and approve before the Recast
              Agent publishes to your lender package.
            </>
          )}
        </div>
        {working && (
          <div
            key={cycleIdx}
            style={{
              marginTop: 8,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: mono,
              fontSize: 11.5,
              color: "var(--mint, #2c8c70)",
              letterSpacing: ".2px",
              animation: "recastLineIn .28s ease-out",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--mint, #2c8c70)",
                boxShadow: "0 0 6px var(--mint, #2c8c70)",
                animation: "recastBlink 1.1s ease-in-out infinite",
              }}
            />
            {PROGRESS_LINES[cycleIdx]}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Recast surface (table + narrative + valuation) ───────────────────
function RecastSurface({
  visible,
  narrativesOpen,
  onToggleNarratives,
  persona,
}: {
  visible: boolean
  narrativesOpen: boolean
  onToggleNarratives: () => void
  persona: Persona
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
        padding: "26px 28px 24px",
        background: "rgba(255,255,255,.82)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderRadius: 18,
        boxShadow:
          "0 1px 0 rgba(255,255,255,.92) inset, 0 -1px 0 rgba(0,0,0,.04) inset, 0 12px 36px rgba(12,10,9,.06)",
      }}
    >
      <SurfaceHeader />
      <RecastTable />
      <NarrativeSection open={narrativesOpen} onToggle={onToggleNarratives} />
      <ValuationOutput persona={persona} />
    </section>
  )
}

function SurfaceHeader() {
  return (
    <header style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
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
        Recast Agent · Run Complete
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
        Normalized financials — review before publishing
      </h2>
      <div
        style={{
          fontSize: 12.5,
          color: "var(--t3)",
          fontFamily: inter,
          lineHeight: 1.5,
        }}
      >
        SBA-style P&amp;L recast across 3 years · $127,400 in add-backs applied · Normalized SDE $962,000
        (Year 3)
      </div>
    </header>
  )
}

// ── Section 1: Before / After Recast Table ────────────────────────────
const TABLE_ROWS: ReadonlyArray<{
  label: string
  values: [string, string, string]
  emphasis?: "header" | "subtotal" | "sde" | "addback"
}> = [
  { label: "Gross Revenue", values: ["$1,780,000", "$1,970,000", "$2,100,000"] },
  { label: "Cost of Goods Sold", values: ["$534,000", "$591,000", "$630,000"] },
  { label: "Gross Profit", values: ["$1,246,000", "$1,379,000", "$1,470,000"], emphasis: "subtotal" },
  { label: "Payroll (non-owner)", values: ["$412,000", "$441,000", "$463,000"] },
  { label: "Utilities", values: ["$68,000", "$72,000", "$76,000"] },
  { label: "Marketing", values: ["$24,000", "$31,000", "$38,000"] },
  { label: "Insurance", values: ["$18,000", "$19,000", "$21,000"] },
  { label: "Other Operating", values: ["$44,000", "$51,000", "$57,000"] },
  { label: "EBITDA (as reported)", values: ["$680,000", "$765,000", "$815,000"], emphasis: "subtotal" },
]

const ADDBACK_ROWS: ReadonlyArray<{
  label: string
  values: [string, string, string]
  narrativeKey: NarrativeKey
}> = [
  { label: "Owner Compensation Add-Back", values: ["+$120,000", "+$120,000", "+$120,000"], narrativeKey: "ownerComp" },
  { label: "Personal Vehicle", values: ["+$18,000", "+$18,000", "+$18,000"], narrativeKey: "vehicle" },
  { label: "One-Time Equipment Repair", values: ["—", "+$22,000", "—"], narrativeKey: "equipment" },
  { label: "Personal Travel", values: ["+$9,000", "+$9,000", "+$9,000"], narrativeKey: "travel" },
]

function RecastTable() {
  return (
    <SectionBlock label="Before / After Recast — 3 Years">
      <div
        style={{
          border: "1px solid var(--glass-edge, rgba(0,0,0,.06))",
          borderRadius: 12,
          overflow: "hidden",
          background: "rgba(255,255,255,.6)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: inter,
            fontSize: 13,
            color: "var(--t1)",
          }}
        >
          <thead>
            <tr style={{ background: "rgba(12,10,9,.035)" }}>
              <Th>Line Item</Th>
              <Th align="right">2022</Th>
              <Th align="right">2023</Th>
              <Th align="right" emphasis>
                2024
              </Th>
            </tr>
          </thead>
          <tbody>
            {TABLE_ROWS.map((row) => (
              <TblRow key={row.label} row={row} />
            ))}

            {/* Add-backs section ─────────────────────────────────────── */}
            <tr>
              <td colSpan={4} style={{ padding: "4px 0", background: "rgba(44,140,112,.04)" }}>
                <div
                  style={{
                    padding: "12px 14px 6px",
                    fontFamily: inter,
                    fontSize: 10.5,
                    fontWeight: 600,
                    letterSpacing: ".9px",
                    textTransform: "uppercase",
                    color: "var(--mint, #2c8c70)",
                  }}
                >
                  Add-Backs — applied by Recast Agent
                </div>
              </td>
            </tr>
            {ADDBACK_ROWS.map((row) => (
              <AddBackTblRow key={row.label} row={row} />
            ))}
            <tr style={{ background: "rgba(44,140,112,.05)" }}>
              <Td>
                <span style={{ fontWeight: 600, color: "var(--t1)" }}>Total Add-Backs</span>
              </Td>
              <Td align="right">
                <span style={{ fontWeight: 600, color: "var(--mint, #2c8c70)" }}>+$147,000</span>
              </Td>
              <Td align="right">
                <span style={{ fontWeight: 600, color: "var(--mint, #2c8c70)" }}>+$169,000</span>
              </Td>
              <Td align="right">
                <span style={{ fontWeight: 600, color: "var(--mint, #2c8c70)" }}>+$147,000</span>
              </Td>
            </tr>

            {/* Normalized SDE row ──────────────────────────────────── */}
            <tr
              style={{
                background: "rgba(44,140,112,.08)",
                borderTop: "1px solid var(--mint-edge, rgba(44,140,112,.28))",
              }}
            >
              <td
                style={{
                  padding: "14px 14px 14px 11px",
                  borderLeft: "3px solid var(--mint, #2c8c70)",
                  fontFamily: inter,
                  fontSize: 13.5,
                  fontWeight: 700,
                  letterSpacing: ".4px",
                  textTransform: "uppercase",
                  color: "var(--mint, #2c8c70)",
                }}
              >
                Normalized SDE
              </td>
              <SdeCell>$827,000</SdeCell>
              <SdeCell>$934,000</SdeCell>
              <SdeCell emphasis>$962,000</SdeCell>
            </tr>
          </tbody>
        </table>
      </div>
    </SectionBlock>
  )
}

function TblRow({
  row,
}: {
  row: { label: string; values: [string, string, string]; emphasis?: "header" | "subtotal" | "sde" | "addback" }
}) {
  const isSubtotal = row.emphasis === "subtotal"
  return (
    <tr
      style={{
        background: isSubtotal ? "rgba(12,10,9,.025)" : "transparent",
        borderTop: isSubtotal ? "1px solid var(--glass-edge, rgba(0,0,0,.07))" : undefined,
      }}
    >
      <Td>
        <span style={{ fontWeight: isSubtotal ? 600 : 500 }}>{row.label}</span>
      </Td>
      <Td align="right">
        <span style={{ fontWeight: isSubtotal ? 600 : 400 }}>{row.values[0]}</span>
      </Td>
      <Td align="right">
        <span style={{ fontWeight: isSubtotal ? 600 : 400 }}>{row.values[1]}</span>
      </Td>
      <Td align="right" emphasis>
        <span
          style={{
            fontWeight: isSubtotal ? 700 : 500,
            color: isSubtotal ? "var(--mint, #2c8c70)" : "var(--t1)",
          }}
        >
          {row.values[2]}
        </span>
      </Td>
    </tr>
  )
}

function AddBackTblRow({
  row,
}: {
  row: { label: string; values: [string, string, string]; narrativeKey: NarrativeKey }
}) {
  const [hover, setHover] = React.useState(false)
  const narrative = NARRATIVES[row.narrativeKey]
  return (
    <tr
      style={{ background: "rgba(44,140,112,.025)", position: "relative" }}
    >
      <Td>
        <span
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            position: "relative",
            cursor: "help",
          }}
        >
          <span style={{ color: "var(--t1)", fontWeight: 500 }}>{row.label}</span>
          <InfoDot />
          {hover && <NarrativeTooltip n={narrative} />}
        </span>
      </Td>
      <Td align="right">
        <span style={{ color: row.values[0] === "—" ? "var(--t3)" : "var(--mint, #2c8c70)", fontWeight: 500 }}>
          {row.values[0]}
        </span>
      </Td>
      <Td align="right">
        <span style={{ color: row.values[1] === "—" ? "var(--t3)" : "var(--mint, #2c8c70)", fontWeight: 500 }}>
          {row.values[1]}
        </span>
      </Td>
      <Td align="right" emphasis>
        <span style={{ color: row.values[2] === "—" ? "var(--t3)" : "var(--mint, #2c8c70)", fontWeight: 500 }}>
          {row.values[2]}
        </span>
      </Td>
    </tr>
  )
}

function InfoDot() {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 14,
        height: 14,
        borderRadius: "50%",
        background: "rgba(44,140,112,.12)",
        color: "var(--mint, #2c8c70)",
        fontSize: 9.5,
        fontWeight: 700,
        fontFamily: inter,
        border: "1px solid rgba(44,140,112,.28)",
      }}
    >
      i
    </span>
  )
}

function NarrativeTooltip({ n }: { n: Narrative }) {
  return (
    <span
      role="tooltip"
      style={{
        position: "absolute",
        left: "calc(100% + 10px)",
        top: "50%",
        transform: "translateY(-50%)",
        width: 340,
        padding: "12px 14px",
        borderRadius: 12,
        background: "rgba(12,10,9,.94)",
        color: "rgba(245,245,245,.95)",
        fontSize: 11.5,
        lineHeight: 1.5,
        fontFamily: inter,
        boxShadow: "0 10px 30px rgba(0,0,0,.22)",
        animation: "recastLineIn .22s ease-out",
        zIndex: 30,
        whiteSpace: "normal",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 6,
        }}
      >
        <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: ".5px", textTransform: "uppercase", color: "rgba(167,229,211,.9)" }}>
          {n.label}
        </span>
        <BadgeChip tone={n.tone} compact />
      </div>
      <div style={{ color: "rgba(245,245,245,.88)" }}>{n.body}</div>
    </span>
  )
}

function SdeCell({ children, emphasis }: { children: React.ReactNode; emphasis?: boolean }) {
  return (
    <td
      style={{
        textAlign: "right",
        padding: "14px 14px",
        fontFamily: garamond,
        fontSize: emphasis ? 22 : 18,
        fontWeight: emphasis ? 600 : 500,
        color: "var(--mint, #2c8c70)",
        letterSpacing: "-.3px",
      }}
    >
      {children}
    </td>
  )
}

// ── Section 2: Add-back narrative cards ────────────────────────────────
type NarrativeTone = "accepted" | "likely" | "review"
type NarrativeKey = "ownerComp" | "vehicle" | "equipment" | "travel"

type Narrative = {
  label: string
  amount: string
  tone: NarrativeTone
  body: string
}

const NARRATIVES: Record<NarrativeKey, Narrative> = {
  ownerComp: {
    label: "Owner Compensation — $120,000 / yr",
    amount: "$120,000 / yr",
    tone: "accepted",
    body:
      "Owner salary of $120,000 annually is added back as seller's discretionary earnings. This represents compensation paid to the owner-operator above and beyond what a replacement manager would require. A buyer stepping into this role would recapture this cash flow in full. Supported by payroll records across all 3 years.",
  },
  vehicle: {
    label: "Personal Vehicle — $18,000 / yr",
    amount: "$18,000 / yr",
    tone: "accepted",
    body:
      "Vehicle expenses of $18,000 annually were run through the business for a personally-owned vehicle with documented mixed personal and business use. The business-use portion has been isolated; the personal use component is added back as non-operating expense. Consistent treatment across all 3 years.",
  },
  equipment: {
    label: "One-Time Equipment Repair — $22,000 (Year 2 only)",
    amount: "$22,000",
    tone: "accepted",
    body:
      "A non-recurring equipment repair of $22,000 was incurred in 2023 for office & production equipment. This item is added back as a one-time capital event with no expected recurrence, supported by vendor invoice documentation. Excluded from Year 1 and Year 3 normalized figures.",
  },
  travel: {
    label: "Personal Travel — $9,000 / yr",
    amount: "$9,000 / yr",
    tone: "likely",
    body:
      "Travel expenses of $9,000 annually include a personal travel component run through the business. The non-business portion is added back. A lender may request supporting documentation distinguishing business travel from personal. Recommend retaining receipts for lender review.",
  },
}

function NarrativeSection({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        paddingTop: 18,
        marginTop: 18,
        borderTop: "1px solid var(--div, rgba(12,10,9,.06))",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          <div
            style={{
              fontFamily: inter,
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "1.1px",
              textTransform: "uppercase",
              color: "var(--t3)",
            }}
          >
            Add-Back Justifications — Recast Agent Narrative
          </div>
          <p
            style={{
              fontSize: 12.5,
              color: "var(--t2)",
              lineHeight: 1.55,
              fontFamily: inter,
              maxWidth: 720,
            }}
          >
            The following narratives accompany the recast and will be included in the lender
            package. Each justification is written to SBA SOP 50 10 8 standards.
          </p>
        </div>
        <button
          onClick={onToggle}
          className="recast-chevron"
          aria-label={open ? "Collapse narrative cards" : "Expand narrative cards"}
          style={{
            width: 32,
            height: 32,
            borderRadius: 9999,
            border: "1px solid var(--glass-edge, rgba(0,0,0,.10))",
            background: "rgba(255,255,255,.85)",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--t2)",
            transition: "transform 180ms ease-out, box-shadow 180ms ease-out",
            flexShrink: 0,
          }}
        >
          <svg
            width={11}
            height={11}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 240ms ease-out" }}
          >
            <path d="M2 4.5L6 8.5 10 4.5" />
          </svg>
        </button>
      </div>

      {open && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            animation: "recastLineIn .28s ease-out",
          }}
        >
          {(Object.keys(NARRATIVES) as NarrativeKey[]).map((k) => (
            <NarrativeCard key={k} n={NARRATIVES[k]} />
          ))}
        </div>
      )}
    </div>
  )
}

function NarrativeCard({ n }: { n: Narrative }) {
  return (
    <article
      style={{
        padding: "16px 18px 14px",
        borderRadius: 14,
        background: "rgba(255,255,255,.7)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div
          style={{
            fontFamily: inter,
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--t1)",
            letterSpacing: "-.1px",
          }}
        >
          {n.label}
        </div>
        <BadgeChip tone={n.tone} />
      </header>
      <p
        style={{
          fontSize: 12.5,
          color: "var(--t2)",
          lineHeight: 1.6,
          fontFamily: inter,
        }}
      >
        {n.body}
      </p>
    </article>
  )
}

function BadgeChip({ tone, compact }: { tone: NarrativeTone; compact?: boolean }) {
  const palette =
    tone === "accepted"
      ? { color: "var(--mint, #2c8c70)", bg: "rgba(44,140,112,.10)", edge: "rgba(44,140,112,.28)", label: "SBA Accepted" }
      : tone === "likely"
      ? { color: "var(--sky, #4a7ba8)", bg: "rgba(74,123,168,.10)", edge: "rgba(74,123,168,.26)", label: "Likely Accepted" }
      : { color: "var(--peach, #b86a3e)", bg: "rgba(184,106,62,.10)", edge: "rgba(184,106,62,.28)", label: "Review Required" }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: compact ? "2px 7px" : "3px 9px",
        borderRadius: 9999,
        fontSize: compact ? 9.5 : 10.5,
        fontWeight: 600,
        letterSpacing: ".5px",
        textTransform: "uppercase",
        fontFamily: inter,
        color: compact ? "rgba(167,229,211,.95)" : palette.color,
        background: compact ? "rgba(255,255,255,.08)" : palette.bg,
        border: compact ? "1px solid rgba(255,255,255,.16)" : `1px solid ${palette.edge}`,
        flexShrink: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: palette.color,
        }}
      />
      {palette.label}
    </span>
  )
}

// ── Section 3: Valuation Output ───────────────────────────────────────
function ValuationOutput({ persona }: { persona: Persona }) {
  return (
    <SectionBlock label="Valuation — Based on Approved Recast">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 18,
        }}
      >
        {/* Left — the math */}
        <div
          style={{
            padding: "18px 20px",
            background: "rgba(255,255,255,.7)",
            border: "1px solid var(--glass-edge, rgba(0,0,0,.06))",
            borderRadius: 14,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <ValueRow label="Normalized SDE (Year 3)" value="$962,000" />
          <ValueRow label="SDE Multiple Range" value="1.5× – 3.0×" tooltipLow tooltipHigh />
          <ValueRow label="Applied Multiple" value={`${persona.financials.appliedMultiple}×`} />
          <Divider />
          <ValueRow label="Valuation Range" value={`${persona.financials.valuationLowDisplay} – ${persona.financials.valuationHighDisplay}`} />
          <ValueRow
            label="Recommended Listing Price"
            value={persona.financials.recommendedListingDisplay}
            anchor
          />
          <ValueRow label="Asset Floor" value={persona.financials.assetFloorDisplay} muted />
        </div>

        {/* Right — context */}
        <div
          style={{
            padding: "18px 20px",
            background: "rgba(44,140,112,.06)",
            border: "1px solid var(--mint-edge, rgba(44,140,112,.20))",
            borderRadius: 14,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              fontFamily: inter,
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "1.1px",
              textTransform: "uppercase",
              color: "var(--mint, #2c8c70)",
            }}
          >
            Why {persona.financials.appliedMultiple}×?
          </div>
          <p
            style={{
              fontSize: 13,
              color: "var(--t1)",
              lineHeight: 1.6,
              fontFamily: inter,
            }}
          >
            Fieldstone&apos;s multiple reflects {persona.business.yearsOperating} years of operating history,
            SBA eligibility, and a recurring retainer base — offset by owner-dependency risk currently
            scored at {persona.risk.ownerDependencyScore} / 100. Resolving the dependency score to
            {" "}
            {persona.risk.targetTransferability} / 100 supports the upper end of the range at 3.0×,
            adding approximately {persona.risk.fixValueUnlockDisplay} in deal value.
          </p>
          <div
            style={{
              marginTop: 4,
              paddingTop: 12,
              borderTop: "1px dashed var(--mint-edge, rgba(44,140,112,.28))",
              fontFamily: mono,
              fontSize: 11.5,
              color: "var(--mint, #2c8c70)",
              letterSpacing: ".2px",
              lineHeight: 1.55,
            }}
          >
            SBA 7(a) Eligible · DSCR {persona.sba.dscr}× · {persona.sba.minDownPaymentDisplay} minimum buyer down
          </div>
        </div>
      </div>
    </SectionBlock>
  )
}

function ValueRow({
  label,
  value,
  anchor,
  muted,
  tooltipLow,
  tooltipHigh,
}: {
  label: string
  value: string
  anchor?: boolean
  muted?: boolean
  tooltipLow?: boolean
  tooltipHigh?: boolean
}) {
  const [hoverLow, setHoverLow] = React.useState(false)
  const [hoverHigh, setHoverHigh] = React.useState(false)
  if (anchor) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "4px 0" }}>
        <span
          style={{
            fontFamily: inter,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: ".7px",
            textTransform: "uppercase",
            color: "var(--t2)",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: garamond,
            fontSize: 38,
            fontWeight: 400,
            color: "var(--mint, #2c8c70)",
            letterSpacing: "-.8px",
            lineHeight: 1,
            marginTop: 2,
          }}
        >
          {value}
        </span>
      </div>
    )
  }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "2px 0",
      }}
    >
      <span
        style={{
          fontFamily: inter,
          fontSize: 12.5,
          color: muted ? "var(--t3)" : "var(--t2)",
        }}
      >
        {label}
      </span>
      {(tooltipLow || tooltipHigh) ? (
        <span style={{ display: "inline-flex", gap: 6, position: "relative", fontFamily: inter, fontSize: 13, color: muted ? "var(--t3)" : "var(--t1)", fontWeight: 500 }}>
          <span
            onMouseEnter={() => setHoverLow(true)}
            onMouseLeave={() => setHoverLow(false)}
            style={{ cursor: "help", borderBottom: "1px dotted rgba(12,10,9,.3)", position: "relative" }}
          >
            1.5×
            {hoverLow && <RangeTooltip text="Current floor — reflects owner-dependency risk" />}
          </span>
          <span>–</span>
          <span
            onMouseEnter={() => setHoverHigh(true)}
            onMouseLeave={() => setHoverHigh(false)}
            style={{ cursor: "help", borderBottom: "1px dotted rgba(12,10,9,.3)", position: "relative" }}
          >
            3.0×
            {hoverHigh && <RangeTooltip text="Achievable at Transferability score 62 / 100" />}
          </span>
        </span>
      ) : (
        <span
          style={{
            fontFamily: inter,
            fontSize: 13,
            color: muted ? "var(--t3)" : "var(--t1)",
            fontWeight: 500,
          }}
        >
          {value}
        </span>
      )}
    </div>
  )
}

function RangeTooltip({ text }: { text: string }) {
  return (
    <span
      role="tooltip"
      style={{
        position: "absolute",
        bottom: "calc(100% + 8px)",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "8px 11px",
        borderRadius: 10,
        background: "rgba(12,10,9,.92)",
        color: "rgba(245,245,245,.95)",
        fontSize: 11,
        lineHeight: 1.4,
        fontFamily: inter,
        whiteSpace: "nowrap",
        boxShadow: "0 10px 30px rgba(0,0,0,.22)",
        animation: "recastLineIn .22s ease-out",
        zIndex: 30,
        fontWeight: 400,
        letterSpacing: 0,
      }}
    >
      {text}
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
          borderTop: "6px solid rgba(12,10,9,.92)",
        }}
      />
    </span>
  )
}

function Divider() {
  return <div style={{ height: 1, background: "var(--div, rgba(12,10,9,.07))", margin: "6px 0" }} />
}

// ── Approve gate ──────────────────────────────────────────────────────
function ApproveGate({
  visible,
  persona,
  phase,
  approvedAt,
  onApprove,
  onDownloadPdf,
  pdfTipShown,
  onEditRecast,
  editTipShown,
}: {
  visible: boolean
  persona: Persona
  phase: ApprovePhase
  approvedAt: { date: string; time: string } | null
  onApprove: () => void
  onDownloadPdf: () => void
  pdfTipShown: boolean
  onEditRecast: () => void
  editTipShown: boolean
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
            animation: "recastCasePulse 3.2s ease-in-out infinite",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 240, fontFamily: inter }}>
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
            Recast Agent · awaiting your approval
          </div>
          <div style={{ fontSize: 14.5, color: "var(--t1)", lineHeight: 1.45, fontWeight: 600 }}>
            Approve the normalized financials to publish to your lender package.
          </div>
          <div style={{ fontSize: 12.5, color: "var(--t2)", lineHeight: 1.55, marginTop: 4 }}>
            Once approved, these figures are locked and shared with matched lenders and qualified
            buyers. The Recast Agent&apos;s add-back narratives will accompany every financial
            disclosure. Your approval is your signature on this representation.
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
              onClick={onEditRecast}
              disabled={phase !== "idle"}
              className="recast-secondary"
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
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <svg width={13} height={13} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M2 12h10" />
                <path d="M9 2.5l2.5 2.5L5 11.5H2.5V9z" />
              </svg>
              Edit Recast
            </button>
            {editTipShown && (
              <span
                role="tooltip"
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: "calc(100% + 8px)",
                  padding: "9px 12px",
                  borderRadius: 10,
                  background: "rgba(12,10,9,.92)",
                  color: "rgba(245,245,245,.95)",
                  fontSize: 11.5,
                  lineHeight: 1.45,
                  fontFamily: inter,
                  whiteSpace: "normal",
                  width: 260,
                  boxShadow: "0 10px 30px rgba(0,0,0,.18)",
                  animation: "recastLineIn .22s ease-out",
                  zIndex: 30,
                }}
              >
                Open the editable add-back schedule. Changes route back to the Recast Agent for re-normalization.
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
          <div style={{ position: "relative" }}>
            <button
              onClick={onDownloadPdf}
              disabled={phase !== "idle"}
              className="recast-secondary"
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
              Download recast PDF
            </button>
            {pdfTipShown && (
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
                  animation: "recastLineIn .22s ease-out",
                  zIndex: 30,
                }}
              >
                Available in your VDR once approved.
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
            className="recast-primary"
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
                ? "Publishing to lender package…"
                : phase === "approved"
                ? "Approved · routing to Risk Analysis"
                : "Approve Recast & Continue"}
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
            animation: "recastLineIn .28s ease-out",
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
            Recast approved by {persona.identity.displayName} · {approvedAt.date} · {approvedAt.time} · Recast Agent output locked for lender distribution.
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
        animation: "recastSpin .8s linear infinite",
      }}
    />
  )
}

// ── Shared building blocks ────────────────────────────────────────────
function SectionBlock({
  label,
  subhead,
  children,
}: {
  label: string
  subhead?: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        paddingTop: 18,
        marginTop: 18,
        borderTop: "1px solid var(--div, rgba(12,10,9,.06))",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div
          style={{
            fontFamily: inter,
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "1.1px",
            textTransform: "uppercase",
            color: "var(--t3)",
          }}
        >
          {label}
        </div>
        {subhead && (
          <p
            style={{
              fontSize: 12.5,
              color: "var(--t2)",
              lineHeight: 1.55,
              fontFamily: inter,
              maxWidth: 720,
            }}
          >
            {subhead}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}

function Th({
  children,
  align,
  emphasis,
}: {
  children: React.ReactNode
  align?: "right"
  emphasis?: boolean
}) {
  return (
    <th
      style={{
        textAlign: align ?? "left",
        padding: "10px 14px",
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: ".7px",
        textTransform: "uppercase",
        color: emphasis ? "var(--mint, #2c8c70)" : "var(--t3)",
        fontFamily: inter,
        borderBottom: "1px solid var(--glass-edge, rgba(0,0,0,.06))",
        background: emphasis ? "rgba(44,140,112,.04)" : undefined,
      }}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  align,
  emphasis,
}: {
  children: React.ReactNode
  align?: "right"
  emphasis?: boolean
}) {
  return (
    <td
      style={{
        textAlign: align ?? "left",
        padding: "11px 14px",
        fontSize: 13,
        color: "var(--t1)",
        fontFamily: inter,
        borderTop: "1px solid var(--glass-edge, rgba(0,0,0,.05))",
        background: emphasis ? "rgba(44,140,112,.025)" : undefined,
      }}
    >
      {children}
    </td>
  )
}

// ── Scoped styles ─────────────────────────────────────────────────────
function ScopedStyles() {
  return (
    <style>{`
      @keyframes recastCasePulse {
        0%, 100% { transform: scale(1);    opacity: 1;  }
        50%      { transform: scale(1.10); opacity: .9; }
      }
      @keyframes recastBlink {
        0%, 100% { opacity: 1;  }
        50%      { opacity: .3; }
      }
      @keyframes recastLineIn {
        from { opacity: 0; transform: translateY(3px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes recastSpin {
        to { transform: rotate(360deg); }
      }
      .recast-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 28px rgba(12,10,9,.22);
      }
      .recast-secondary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 22px rgba(12,10,9,.10);
      }
      .recast-chevron:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(12,10,9,.10);
      }
    `}</style>
  )
}
