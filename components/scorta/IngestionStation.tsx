"use client"

import { useRouter } from "next/navigation"
import React from "react"

import type { PERSONA as PersonaShape } from "@/lib/persona"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

// ── Timing reference (same family as ConnectStation T = {…}) ──────────────
const T = {
  streamStepMs: 300, // 20 lines × 300ms ≈ 6s perceived ingestion
  streamTailMs: 360, // pause after "Analysis complete." before summary lands
  summaryRevealMs: 360,
  approveSpinnerMs: 700,
  auditHoldMs: 520, // audit line visible before route transition
  flagTipMs: 2200,
}

type LogLine = {
  ts: string
  text: string
  accent?: "mint" // detected add-back signal lines
  flag?: "red" | "amber" // raised flag lines
}

// 20-line script, lifted verbatim from DEMO_PERSONA.md Section 9
const LOG_LINES: ReadonlyArray<LogLine> = [
  { ts: "00:01", text: "Authenticating QuickBooks connection..." },
  { ts: "00:02", text: "Fetching chart of accounts..." },
  { ts: "00:04", text: "Pulling 36 months of transaction history..." },
  { ts: "00:07", text: "Analyzing 1,247 transactions..." },
  { ts: "00:09", text: "Categorizing revenue streams..." },
  { ts: "00:11", text: "Identifying owner compensation entries..." },
  { ts: "00:13", text: "Flagging non-recurring expenses..." },
  { ts: "00:15", text: "Cross-referencing Plaid bank deposits..." },
  { ts: "00:18", text: "Reconciling revenue vs. bank receipts: 98.4% match" },
  { ts: "00:21", text: "Calculating add-back schedule..." },
  { ts: "00:24", text: "Detected: $120,000 owner salary (add-back eligible)", accent: "mint" },
  { ts: "00:25", text: "Detected: $18,000 personal vehicle expenses (add-back eligible)", accent: "mint" },
  { ts: "00:26", text: "Detected: $22,000 one-time equipment repair — Year 2 (add-back eligible)", accent: "mint" },
  { ts: "00:27", text: "Detected: $9,000 personal travel (add-back eligible)", accent: "mint" },
  { ts: "00:29", text: "Normalizing SDE across 3 years..." },
  { ts: "00:31", text: "Running concentration analysis..." },
  { ts: "00:33", text: "Flagged: Top customer = 19% of revenue (moderate)", flag: "amber" },
  { ts: "00:34", text: "Flagged: Key-man dependency — owner drives catering sales", flag: "red" },
  { ts: "00:36", text: "Generating financial summary..." },
  { ts: "00:38", text: "Analysis complete." },
]

type Persona = typeof PersonaShape
type ApprovePhase = "idle" | "approving" | "approved"

export function IngestionStation({ persona }: { persona: Persona }) {
  const router = useRouter()

  // Stream state — starts immediately on mount
  const [visibleCount, setVisibleCount] = React.useState(1)
  const [streamDone, setStreamDone] = React.useState(false)
  const [summaryVisible, setSummaryVisible] = React.useState(false)

  // Approve gate state
  const [approvePhase, setApprovePhase] = React.useState<ApprovePhase>("idle")
  const [approvedAt, setApprovedAt] = React.useState<{ date: string; time: string } | null>(null)

  // Review raw data tooltip
  const [rawTipShown, setRawTipShown] = React.useState(false)
  const rawTipTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Stream driver ─────────────────────────────────────────────────────
  React.useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = []
    for (let i = 2; i <= LOG_LINES.length; i++) {
      timers.push(setTimeout(() => setVisibleCount(i), T.streamStepMs * (i - 1)))
    }
    timers.push(
      setTimeout(
        () => setStreamDone(true),
        T.streamStepMs * LOG_LINES.length + T.streamTailMs,
      ),
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  // Reveal summary card after stream ends
  React.useEffect(() => {
    if (!streamDone) return
    const id = setTimeout(() => setSummaryVisible(true), 60)
    return () => clearTimeout(id)
  }, [streamDone])

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
      setTimeout(() => router.push("/recast"), T.auditHoldMs)
    }, T.approveSpinnerMs)
  }

  function onReviewRaw() {
    setRawTipShown(true)
    if (rawTipTimerRef.current) clearTimeout(rawTipTimerRef.current)
    rawTipTimerRef.current = setTimeout(() => setRawTipShown(false), T.flagTipMs)
  }

  const todayDisplay = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <ScopedStyles />

      <StationHeader streaming={!streamDone} />
      <AriaIntroBanner persona={persona} streaming={!streamDone} />

      {/* Streaming log ─────────────────────────────────────────────── */}
      <StreamingLog
        lines={LOG_LINES.slice(0, visibleCount)}
        totalCount={LOG_LINES.length}
        complete={streamDone}
      />

      {/* Final summary card ─────────────────────────────────────────── */}
      <SummaryCard
        visible={summaryVisible}
        persona={persona}
        todayDisplay={todayDisplay}
      />

      {/* Review & Approve gate ──────────────────────────────────────── */}
      <ApproveGate
        visible={summaryVisible}
        persona={persona}
        phase={approvePhase}
        approvedAt={approvedAt}
        onApprove={onApprove}
        onReviewRaw={onReviewRaw}
        rawTipShown={rawTipShown}
      />
    </div>
  )
}

// ── Station header ────────────────────────────────────────────────────
function StationHeader({ streaming }: { streaming: boolean }) {
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
          Station 04 · /ingestion
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
          Ingestion Agent
          {streaming && (
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--mint, #2c8c70)",
                boxShadow: "0 0 6px var(--mint, #2c8c70)",
                animation: "ingestBlink 1.1s ease-in-out infinite",
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
        Data Processing
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
        The Ingestion Agent is reconstructing 36 months of activity — classifying
        revenue, identifying owner-related add-backs, and reconciling bank deposits
        against the ledger. You'll review the extracted summary before the Recast
        Agent proceeds.
      </p>
    </header>
  )
}

// ── ARIA intro banner ─────────────────────────────────────────────────
function AriaIntroBanner({
  persona,
  streaming,
}: {
  persona: Persona
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
          animation: "ingestAriaPulse 3.2s ease-in-out infinite",
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
          {streaming ? (
            <>
              The Ingestion Agent is classifying {persona.identity.businessName.split(" ")[0]}'s
              ledger right now. I'll surface the add-back schedule and the two flags for your
              approval the moment it finishes.
            </>
          ) : (
            <>
              The Ingestion Agent has finished. Review the extracted summary — once you
              approve, I'll dispatch the Recast Agent to produce the SBA-defensible
              narrative.
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Streaming log ─────────────────────────────────────────────────────
function StreamingLog({
  lines,
  totalCount,
  complete,
}: {
  lines: ReadonlyArray<LogLine>
  totalCount: number
  complete: boolean
}) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  // Auto-scroll to latest line as the stream advances
  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [lines.length])

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
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            gap: 6,
          }}
        >
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57" }} />
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#febc2e" }} />
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840" }} />
        </span>
        <div
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: "rgba(245,245,245,.55)",
            letterSpacing: ".4px",
            flex: 1,
          }}
        >
          ingestion-agent · palace-kitchen · live
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: mono,
            fontSize: 10.5,
            color: complete ? "var(--mint, #2c8c70)" : "rgba(245,245,245,.55)",
            letterSpacing: ".5px",
            textTransform: "uppercase",
          }}
        >
          {!complete && (
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--mint, #2c8c70)",
                boxShadow: "0 0 6px var(--mint, #2c8c70)",
                animation: "ingestBlink 1.1s ease-in-out infinite",
              }}
            />
          )}
          {complete ? "Complete" : `${lines.length} / ${totalCount}`}
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
          lineHeight: 1.7,
          color: "rgba(245,245,245,.72)",
          scrollBehavior: "smooth",
        }}
      >
        {lines.map((line, i) => (
          <LogRow key={`${line.ts}-${i}`} line={line} />
        ))}
        {!complete && <Caret />}
      </div>
    </section>
  )
}

function LogRow({ line }: { line: LogLine }) {
  const isAccent = line.accent === "mint"
  const isFlag = !!line.flag
  const tone = isAccent
    ? "var(--mint, #2c8c70)"
    : isFlag
    ? line.flag === "red"
      ? "#e88a72"
      : "#e3b06b"
    : "rgba(245,245,245,.72)"
  const tsColor = isAccent || isFlag ? tone : "rgba(245,245,245,.42)"
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "1px 0",
        animation: "ingestLineIn .28s ease-out",
      }}
    >
      <span style={{ color: tsColor, flexShrink: 0, letterSpacing: ".4px" }}>
        [{line.ts}]
      </span>
      <span
        style={{
          color: tone,
          fontWeight: isAccent || isFlag ? 500 : 400,
          letterSpacing: ".05px",
        }}
      >
        {line.text}
      </span>
    </div>
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
        animation: "ingestCaret 1.05s steps(2) infinite",
      }}
    />
  )
}

// ── Summary card ─────────────────────────────────────────────────────
function SummaryCard({
  visible,
  persona,
  todayDisplay,
}: {
  visible: boolean
  persona: Persona
  todayDisplay: string
}) {
  return (
    <section
      aria-hidden={!visible}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: `opacity ${T.summaryRevealMs}ms ease-out, transform ${T.summaryRevealMs}ms ease-out`,
        pointerEvents: visible ? "auto" : "none",
        display: visible ? "block" : "none",
        padding: "26px 28px 24px",
        background: "rgba(255,255,255,.82)",
        border: "1px solid var(--glass-edge, rgba(0,0,0,.07))",
        borderRadius: 18,
        boxShadow: "0 1px 0 rgba(255,255,255,.92) inset, 0 -1px 0 rgba(0,0,0,.04) inset, 0 12px 36px rgba(12,10,9,.06)",
      }}
    >
      {/* Card header */}
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
          Ingestion Agent · Run Complete
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
          Extracted summary — review before handoff
        </h2>
        <div
          style={{
            fontSize: 12.5,
            color: "var(--t3)",
            fontFamily: inter,
            lineHeight: 1.5,
          }}
        >
          Completed {todayDisplay} · 1,247 transactions analyzed across 36 months · Data confidence: 94%
        </div>
        <ConfidenceBar percent={94} />
      </header>

      {/* Section 1 — Financial Overview */}
      <SectionBlock label="Financial Overview">
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
                <Th>Year</Th>
                <Th align="right">Revenue</Th>
                <Th align="right">COGS</Th>
                <Th align="right">Gross Profit</Th>
              </tr>
            </thead>
            <tbody>
              <FinRow year="2022" revenue="$1,780,000" cogs="$534,000" gross="$1,246,000" />
              <FinRow year="2023" revenue="$1,970,000" cogs="$591,000" gross="$1,379,000" />
              <FinRow year="2024" revenue="$2,100,000" cogs="$630,000" gross="$1,470,000" emphasis />
            </tbody>
          </table>
        </div>
        <CalloutLine tone="mint">
          ↑ {persona.financials.revenueTrend3yr}% revenue growth over 3 years — consistent upward trend.
        </CalloutLine>
      </SectionBlock>

      {/* Section 2 — Add-Backs */}
      <SectionBlock
        label="Add-Backs Identified by Ingestion Agent"
        subhead="The following items were automatically flagged as add-back eligible. Each will be reviewed by the Recast Agent for SBA defensibility."
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            border: "1px solid var(--glass-edge, rgba(0,0,0,.06))",
            borderRadius: 12,
            overflow: "hidden",
            background: "rgba(255,255,255,.6)",
          }}
        >
          <AddBackRow
            category="Owner Compensation"
            amount="$120,000 / yr"
            badge="Confirmed"
          />
          <AddBackRow
            category="Personal Vehicle Expenses"
            amount="$18,000 / yr"
            badge="Confirmed"
          />
          <AddBackRow
            category="One-Time Equipment Repair"
            amount="$22,000"
            badge="Confirmed"
            note="Year 2 only"
          />
          <AddBackRow
            category="Personal Travel"
            amount="$9,000 / yr"
            badge="Confirmed"
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              background: "rgba(44,140,112,.06)",
              borderTop: "1px solid var(--mint-edge, rgba(44,140,112,.18))",
            }}
          >
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: ".6px",
                textTransform: "uppercase",
                color: "var(--t2)",
                fontFamily: inter,
              }}
            >
              Total add-backs identified
            </span>
            <span
              style={{
                fontFamily: garamond,
                fontSize: 22,
                fontWeight: 400,
                color: "var(--mint, #2c8c70)",
                letterSpacing: "-.3px",
              }}
            >
              $127,400
              <span
                style={{
                  fontFamily: inter,
                  fontSize: 11.5,
                  color: "var(--t3)",
                  marginLeft: 8,
                  letterSpacing: 0,
                  fontWeight: 500,
                }}
              >
                normalized across 3 yrs
              </span>
            </span>
          </div>
        </div>
        <CalloutLine>
          Recast Agent will produce the full SBA-defensible add-back narrative for each line item.
        </CalloutLine>
      </SectionBlock>

      {/* Section 3 — Flags */}
      <SectionBlock
        label="Risk Flags"
        subhead="Two signals were automatically flagged for agent review. These do not block the recast — they route to Risk Analysis after financials are approved."
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <FlagCard
            tone="red"
            title="Key-Man Dependency"
            body={`Owner drives all catering sales relationships and vendor negotiations. ${persona.risk.staffTenuredCount} of ${persona.risk.staffTotal} employees has 3+ years tenure. ${persona.risk.sopsDocumented} documented SOPs on record.`}
            downstream="Owner-Dependency Agent will address this in Risk Analysis"
          />
          <FlagCard
            tone="amber"
            title="Customer Concentration — Moderate"
            body={`Top customer accounts for ${persona.risk.topCustomerShare}% of annual revenue (${persona.risk.topAccountName} · ${persona.risk.topAccountTenureYears}-year account tenure). Within SBA threshold — flagged for monitoring.`}
            downstream="Concentration Agent will review contract status in Risk Analysis"
          />
        </div>
      </SectionBlock>

      {/* Section 4 — Normalized SDE Preview */}
      <SectionBlock label="Normalized SDE — Preview">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            padding: "20px 22px",
            background: "rgba(44,140,112,.06)",
            border: "1px solid var(--mint-edge, rgba(44,140,112,.20))",
            borderRadius: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 200 }}>
            <span
              style={{
                fontFamily: garamond,
                fontSize: 42,
                fontWeight: 400,
                color: "var(--mint, #2c8c70)",
                letterSpacing: "-.8px",
                lineHeight: 1,
              }}
            >
              {persona.financials.normalizedSDEYear3Display.replace("K", ",000")}
            </span>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: ".6px",
                textTransform: "uppercase",
                color: "var(--t2)",
                fontFamily: inter,
              }}
            >
              Normalized SDE · Year 3
            </span>
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 280,
              fontSize: 12.5,
              color: "var(--t2)",
              lineHeight: 1.55,
              fontFamily: inter,
            }}
          >
            Based on $815,000 reported EBITDA + $147,000 in confirmed add-backs.
            Recast Agent will validate the line items and produce the lender-facing narrative.
          </div>
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: "var(--t3)",
            fontStyle: "italic",
            fontFamily: inter,
            lineHeight: 1.5,
          }}
        >
          Full recast requires Recast Agent review. This is the Ingestion Agent's preliminary read.
        </div>
      </SectionBlock>
    </section>
  )
}

function ConfidenceBar({ percent }: { percent: number }) {
  return (
    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          height: 4,
          width: "100%",
          background: "rgba(12,10,9,.06)",
          borderRadius: 9999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            background: "var(--mint, #2c8c70)",
            borderRadius: 9999,
            boxShadow: "0 0 8px rgba(44,140,112,.4)",
            animation: "ingestBarIn .9s ease-out",
          }}
        />
      </div>
    </div>
  )
}

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

function Th({ children, align }: { children: React.ReactNode; align?: "right" }) {
  return (
    <th
      style={{
        textAlign: align ?? "left",
        padding: "10px 14px",
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: ".7px",
        textTransform: "uppercase",
        color: "var(--t3)",
        fontFamily: inter,
        borderBottom: "1px solid var(--glass-edge, rgba(0,0,0,.06))",
      }}
    >
      {children}
    </th>
  )
}

function FinRow({
  year,
  revenue,
  cogs,
  gross,
  emphasis,
}: {
  year: string
  revenue: string
  cogs: string
  gross: string
  emphasis?: boolean
}) {
  return (
    <tr style={{ background: emphasis ? "rgba(44,140,112,.04)" : "transparent" }}>
      <Td>
        <span style={{ fontWeight: emphasis ? 600 : 500 }}>{year}</span>
      </Td>
      <Td align="right">{revenue}</Td>
      <Td align="right">{cogs}</Td>
      <Td align="right">
        <span
          style={{
            color: emphasis ? "var(--mint, #2c8c70)" : "var(--t1)",
            fontWeight: emphasis ? 600 : 400,
          }}
        >
          {gross}
        </span>
      </Td>
    </tr>
  )
}

function Td({ children, align }: { children: React.ReactNode; align?: "right" }) {
  return (
    <td
      style={{
        textAlign: align ?? "left",
        padding: "11px 14px",
        fontSize: 13,
        color: "var(--t1)",
        fontFamily: inter,
        borderTop: "1px solid var(--glass-edge, rgba(0,0,0,.05))",
      }}
    >
      {children}
    </td>
  )
}

function CalloutLine({
  tone,
  children,
}: {
  tone?: "mint"
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        fontSize: 12.5,
        color: tone === "mint" ? "var(--mint, #2c8c70)" : "var(--t2)",
        fontFamily: inter,
        lineHeight: 1.55,
        fontWeight: tone === "mint" ? 600 : 400,
      }}
    >
      {children}
    </div>
  )
}

function AddBackRow({
  category,
  amount,
  badge,
  note,
}: {
  category: string
  amount: string
  badge: "Confirmed" | "Likely" | "Review Required"
  note?: string
}) {
  const palette =
    badge === "Confirmed"
      ? { color: "var(--mint, #2c8c70)", bg: "var(--mint-soft, rgba(44,140,112,.10))", edge: "var(--mint-edge, rgba(44,140,112,.28))" }
      : badge === "Likely"
      ? { color: "var(--sky, #4a7ba8)", bg: "var(--sky-soft, rgba(74,123,168,.10))", edge: "var(--sky-edge, rgba(74,123,168,.26))" }
      : { color: "var(--peach, #b86a3e)", bg: "var(--peach-soft, rgba(184,106,62,.10))", edge: "var(--peach-edge, rgba(184,106,62,.28))" }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 18px",
        borderTop: "1px solid var(--glass-edge, rgba(0,0,0,.05))",
      }}
    >
      <div style={{ flex: 1, minWidth: 0, fontFamily: inter }}>
        <div style={{ fontSize: 13, color: "var(--t1)", fontWeight: 500 }}>{category}</div>
        {note && (
          <div style={{ fontSize: 11.5, color: "var(--t3)", marginTop: 2 }}>{note}</div>
        )}
      </div>
      <div
        style={{
          fontFamily: inter,
          fontSize: 13,
          color: "var(--t1)",
          fontWeight: 500,
          letterSpacing: ".1px",
          minWidth: 110,
          textAlign: "right",
        }}
      >
        {amount}
      </div>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 9px",
          borderRadius: 9999,
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: ".5px",
          textTransform: "uppercase",
          fontFamily: inter,
          color: palette.color,
          background: palette.bg,
          border: `1px solid ${palette.edge}`,
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
        {badge}
      </span>
    </div>
  )
}

function FlagCard({
  tone,
  title,
  body,
  downstream,
}: {
  tone: "red" | "amber"
  title: string
  body: string
  downstream: string
}) {
  const palette =
    tone === "red"
      ? {
          accent: "var(--crit, #c44e2c)",
          accentSoft: "rgba(196,78,44,.08)",
          accentEdge: "rgba(196,78,44,.24)",
          label: "High",
        }
      : {
          accent: "var(--peach, #b86a3e)",
          accentSoft: "var(--peach-soft, rgba(184,106,62,.08))",
          accentEdge: "var(--peach-edge, rgba(184,106,62,.24))",
          label: "Moderate",
        }
  return (
    <article
      style={{
        position: "relative",
        padding: "16px 18px 14px",
        borderRadius: 14,
        background: palette.accentSoft,
        border: `1px solid ${palette.accentEdge}`,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: palette.accent,
        }}
      />
      <header
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
      >
        <div
          style={{
            fontFamily: inter,
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--t1)",
            letterSpacing: "-.1px",
          }}
        >
          {title}
        </div>
        <span
          style={{
            padding: "2px 8px",
            borderRadius: 9999,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: ".7px",
            textTransform: "uppercase",
            color: palette.accent,
            background: "rgba(255,255,255,.7)",
            border: `1px solid ${palette.accentEdge}`,
            fontFamily: inter,
          }}
        >
          {palette.label}
        </span>
      </header>
      <p
        style={{
          fontSize: 12.5,
          color: "var(--t2)",
          lineHeight: 1.55,
          fontFamily: inter,
        }}
      >
        {body}
      </p>
      <div
        style={{
          marginTop: 4,
          paddingTop: 8,
          borderTop: `1px dashed ${palette.accentEdge}`,
          fontSize: 11.5,
          color: palette.accent,
          fontFamily: inter,
          fontWeight: 600,
          letterSpacing: ".2px",
        }}
      >
        → {downstream}
      </div>
    </article>
  )
}

// ── Review & Approve gate ────────────────────────────────────────────
function ApproveGate({
  visible,
  persona,
  phase,
  approvedAt,
  onApprove,
  onReviewRaw,
  rawTipShown,
}: {
  visible: boolean
  persona: Persona
  phase: ApprovePhase
  approvedAt: { date: string; time: string } | null
  onApprove: () => void
  onReviewRaw: () => void
  rawTipShown: boolean
}) {
  return (
    <section
      aria-hidden={!visible}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: `opacity ${T.summaryRevealMs}ms ease-out ${T.summaryRevealMs * 0.5}ms, transform ${T.summaryRevealMs}ms ease-out ${T.summaryRevealMs * 0.5}ms`,
        pointerEvents: visible ? "auto" : "none",
        display: visible ? "block" : "none",
        padding: "22px 26px 20px",
        background:
          "linear-gradient(180deg, rgba(44,140,112,.08) 0%, rgba(44,140,112,.04) 100%)",
        border: "1px solid var(--mint-edge, rgba(44,140,112,.28))",
        borderRadius: 16,
        boxShadow: "0 1px 0 rgba(255,255,255,.6) inset, 0 8px 24px rgba(44,140,112,.10)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div
          aria-hidden
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 30%, rgba(255,255,255,.95) 0%, rgba(167,229,211,.55) 40%, rgba(44,140,112,.95) 100%)",
            boxShadow: "0 0 10px rgba(44,140,112,.55)",
            animation: "ingestAriaPulse 3.2s ease-in-out infinite",
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
            Ingestion Agent · awaiting your approval
          </div>
          <div style={{ fontSize: 14.5, color: "var(--t1)", lineHeight: 1.45, fontWeight: 600 }}>
            Review extracted data before the Recast Agent proceeds.
          </div>
          <div style={{ fontSize: 12.5, color: "var(--t2)", lineHeight: 1.55, marginTop: 4 }}>
            The figures above will form the basis of your normalized financials,
            add-back schedule, and lender package. Approve to hand off to the Recast Agent.
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
              onClick={onReviewRaw}
              disabled={phase !== "idle"}
              className="ingest-secondary"
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
              Review raw data
            </button>
            {rawTipShown && (
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
                  animation: "ingestLineIn .22s ease-out",
                  zIndex: 30,
                }}
              >
                Full transaction export available in your VDR.
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
            className="ingest-primary"
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
              transition: "transform 180ms ease-out, box-shadow 180ms ease-out, background 180ms ease-out",
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
            <span>
              {phase === "approving"
                ? "Dispatching Recast Agent…"
                : phase === "approved"
                ? "Approved · routing to Recast"
                : "Approve & Continue"}
            </span>
            {phase === "idle" && <span style={{ transform: "translateY(-1px)" }}>→</span>}
          </button>
        </div>
      </div>

      {/* Audit log line — appears after click, before route */}
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
            animation: "ingestLineIn .28s ease-out",
          }}
        >
          <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6.4L4.6 9 10 3.4" />
          </svg>
          <span>
            Approved by {persona.identity.displayName} · {approvedAt.date} · {approvedAt.time}
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
        animation: "ingestSpin .8s linear infinite",
      }}
    />
  )
}

// ── Scoped styles ─────────────────────────────────────────────────────
function ScopedStyles() {
  return (
    <style>{`
      @keyframes ingestAriaPulse {
        0%, 100% { transform: scale(1);    opacity: 1;  }
        50%      { transform: scale(1.10); opacity: .9; }
      }
      @keyframes ingestBlink {
        0%, 100% { opacity: 1;  }
        50%      { opacity: .3; }
      }
      @keyframes ingestLineIn {
        from { opacity: 0; transform: translateY(3px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes ingestSpin {
        to { transform: rotate(360deg); }
      }
      @keyframes ingestCaret {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }
      @keyframes ingestBarIn {
        from { width: 0%; }
      }
      .ingest-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 28px rgba(12,10,9,.22);
      }
      .ingest-secondary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 22px rgba(12,10,9,.10);
      }
    `}</style>
  )
}
