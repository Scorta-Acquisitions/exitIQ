"use client"

/**
 * Reverse Recast — the differentiator. The seller's add-back schedule taken
 * apart line by line, deliberately echoing the sell-side Recast table structure
 * (`RecastStation.tsx`) — that echo is the argument: same engine, sign flipped.
 *
 * Every figure comes from the `ReverseRecastResult` computed server-side. The
 * Sonnet memo streams *below* the table and is additive prose — the table
 * renders instantly and never waits on the stream. 8s to first token, or any
 * failure, falls back to the placeholder memo.
 */

import Link from "next/link"
import { useRouter } from "next/navigation"
import React from "react"

import { SurfaceCard } from "@/components/dealiq/Surface"
import { BUYER } from "@/lib/dealiq/data/buyer"
import { FALLBACK_CHALLENGE_MEMO, RECAST_COPY } from "@/lib/dealiq/data/copy"
import { formatCurrency, formatMultiple, formatMultipleBand, formatSignedCurrency } from "@/lib/dealiq/format"
import { dealPath } from "@/lib/dealiq/navigation"
import { RULE_LABEL } from "@/lib/dealiq/reverseRecast"
import type { ApprovePhase, FlagSeverity, RecastLine, RecastVerdict, ReverseRecastResult } from "@/lib/dealiq/types"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

const COUNT_UP_MS = 600
const FIRST_TOKEN_TIMEOUT_MS = 8_000
const APPROVE_SPINNER_MS = 700
const APPROVE_HOLD_MS = 520

function verdictGlyph(verdict: RecastVerdict): { glyph: string; color: string } {
  switch (verdict) {
    case "accepted":
      return { glyph: "✓", color: "var(--dq-accent)" }
    case "partial":
      return { glyph: "⚠", color: "var(--gold)" }
    case "rejected":
      return { glyph: "✗", color: "var(--crit)" }
  }
}

function severityColor(severity: FlagSeverity): string {
  switch (severity) {
    case "critical":
      return "var(--crit)"
    case "warn":
      return "var(--gold)"
    case "info":
      return "var(--t2)"
  }
}

/** Sweeps 0 → target once per mount; reduced-motion renders the final value. */
function useCountUp(target: number, durationMs = COUNT_UP_MS): number {
  const [value, setValue] = React.useState(0)
  React.useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target)
      return
    }
    let raf = 0
    let start: number | undefined
    const step = (ts: number) => {
      if (start === undefined) start = ts
      const t = Math.min(1, (ts - start) / durationMs)
      setValue(target * (1 - Math.pow(1 - t, 3)))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // Mount-only by design — one sweep, not one per re-render.
  }, [])
  return value
}

export function ReverseRecastPanel({
  recast,
  dealId,
  ask,
  compMultiple,
}: {
  recast: ReverseRecastResult
  dealId: string
  ask: number
  compMultiple: { low: number; high: number }
}) {
  const challenges = recast.lines.filter((line) => line.kind === "add_back_challenge")
  const omitted = recast.lines.filter((line) => line.kind === "omitted_cost")

  return (
    <div className="dq-screen" style={{ maxWidth: 880 }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: 9.5,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "var(--t3)",
        }}
      >
        {RECAST_COPY.eyebrow}
      </div>
      <h1
        style={{
          margin: "3px 0 0",
          fontFamily: garamond,
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: "-.3px",
          color: "var(--t1)",
        }}
      >
        {RECAST_COPY.title}
      </h1>

      <Ledger claimed={recast.claimedSde} defensible={recast.defensibleSde} adjusted={recast.totalAdjusted} />

      {recast.flags.length > 0 && <FlagStrip flags={recast.flags} dealId={dealId} />}

      <ChallengeTable challenges={challenges} omitted={omitted} />

      <NegotiationBlock recast={recast} ask={ask} compMultiple={compMultiple} />

      <ChallengeMemo dealId={dealId} />

      <AcceptGate dealId={dealId} />
    </div>
  )
}

// ─── Header ledger ───────────────────────────────────────────────────────────

function Ledger({ claimed, defensible, adjusted }: { claimed: number; defensible: number; adjusted: number }) {
  const animatedDefensible = useCountUp(defensible)
  const figures = [
    { label: RECAST_COPY.ledgerClaimed, value: formatCurrency(claimed), color: "var(--t2)" },
    { label: RECAST_COPY.ledgerDefensible, value: formatCurrency(Math.round(animatedDefensible)), color: "var(--t1)" },
    { label: RECAST_COPY.ledgerAdjusted, value: formatSignedCurrency(-adjusted), color: "var(--crit)" },
  ]
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 20, flexWrap: "wrap" }}>
      {figures.map((figure, i) => (
        <React.Fragment key={figure.label}>
          {i > 0 && (
            <span aria-hidden style={{ color: "var(--t3)", fontSize: 18 }}>
              →
            </span>
          )}
          <div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 9,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--t3)",
              }}
            >
              {figure.label}
            </div>
            <div
              style={{
                marginTop: 2,
                fontFamily: mono,
                fontSize: i === 1 ? 24 : 18,
                fontWeight: 600,
                color: figure.color,
              }}
            >
              {figure.value}
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

// ─── Flag strip ──────────────────────────────────────────────────────────────

function FlagStrip({ flags, dealId }: { flags: ReverseRecastResult["flags"]; dealId: string }) {
  return (
    <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
      {flags.map((flag) => {
        const color = severityColor(flag.severity)
        return (
          <div
            key={flag.id}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              padding: "10px 12px",
              borderRadius: 9,
              border: `1px solid ${color}`,
              background: "var(--s2)",
            }}
          >
            <span aria-hidden style={{ color, fontSize: 13, lineHeight: 1.4, flexShrink: 0 }}>
              ⚑
            </span>
            <div style={{ fontSize: 12, lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600, color: "var(--t1)" }}>{flag.label}.</span>{" "}
              <span style={{ color: "var(--t2)" }}>{flag.detail}</span>{" "}
              {flag.scenario ? (
                <Link
                  href={dealPath(dealId, "returns")}
                  className="dq-focus"
                  style={{ color: "var(--dq-accent)", fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" }}
                >
                  {RECAST_COPY.flagScenarioLink}
                </Link>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Challenge table ─────────────────────────────────────────────────────────

function ChallengeTable({
  challenges,
  omitted,
}: {
  challenges: ReadonlyArray<RecastLine>
  omitted: ReadonlyArray<RecastLine>
}) {
  const [openId, setOpenId] = React.useState<string | null>(null)

  return (
    <div
      style={{
        marginTop: 20,
        border: "1px solid var(--b3)",
        borderRadius: 12,
        overflow: "hidden",
        background: "var(--glass-bg)",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: inter, fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: "var(--s2)" }}>
              <Th align="left">Line item</Th>
              <Th align="right">Claimed</Th>
              <Th align="right">Accepted</Th>
              <Th align="right">Adjusted</Th>
              <Th align="left">Rule</Th>
            </tr>
          </thead>
          <tbody>
            <GroupHeader label={RECAST_COPY.groupChallenges} />
            {challenges.map((line) => (
              <LineRows key={line.id} line={line} open={openId === line.id} onToggle={setOpenId} />
            ))}
            {omitted.length > 0 && <GroupHeader label={RECAST_COPY.groupOmitted} />}
            {omitted.map((line) => (
              <LineRows key={line.id} line={line} open={openId === line.id} onToggle={setOpenId} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ align, children }: { align: "left" | "right"; children: React.ReactNode }) {
  return (
    <th
      style={{
        padding: "9px 12px",
        textAlign: align,
        fontFamily: mono,
        fontSize: 9,
        fontWeight: 500,
        letterSpacing: ".08em",
        textTransform: "uppercase",
        color: "var(--t3)",
      }}
    >
      {children}
    </th>
  )
}

function GroupHeader({ label }: { label: string }) {
  return (
    <tr>
      <td
        colSpan={5}
        style={{
          padding: "10px 12px 5px",
          fontFamily: mono,
          fontSize: 9.5,
          fontWeight: 600,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "var(--dq-accent)",
          borderTop: "1px solid var(--b3)",
        }}
      >
        {label}
      </td>
    </tr>
  )
}

function LineRows({
  line,
  open,
  onToggle,
}: {
  line: RecastLine
  open: boolean
  onToggle: (id: string | null) => void
}) {
  const { glyph, color } = verdictGlyph(line.verdict)
  const isOmitted = line.kind === "omitted_cost"
  const detailId = `dq-recast-detail-${line.id}`

  return (
    <>
      <tr style={{ borderTop: "1px solid var(--b3)" }}>
        <td style={{ padding: "10px 12px" }}>
          <button
            type="button"
            className="dq-focus"
            aria-expanded={open}
            aria-controls={detailId}
            onClick={() => onToggle(open ? null : line.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              width: "100%",
              textAlign: "left",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: inter,
              fontSize: 12.5,
              color: "var(--t1)",
            }}
          >
            <span aria-hidden style={{ color, fontWeight: 700, flexShrink: 0, width: 14 }}>
              {glyph}
            </span>
            <span style={{ fontWeight: 500 }}>{line.label}</span>
            <span
              aria-hidden
              style={{
                marginLeft: "auto",
                color: "var(--t3)",
                fontSize: 10,
                transform: open ? "rotate(90deg)" : "none",
                transition: "transform .15s ease",
              }}
            >
              ▸
            </span>
          </button>
        </td>
        <Amount value={isOmitted ? null : line.claimed} />
        <Amount value={isOmitted ? null : line.accepted} />
        <Amount value={line.adjusted} signed color={line.adjusted > 0 ? "var(--crit)" : "var(--t2)"} />
        <td style={{ padding: "10px 12px" }}>
          <span
            style={{
              fontFamily: mono,
              fontSize: 9.5,
              letterSpacing: ".05em",
              color: "var(--t2)",
              border: "1px solid var(--b2)",
              borderRadius: 6,
              padding: "2px 7px",
              whiteSpace: "nowrap",
            }}
          >
            {RULE_LABEL[line.rule]}
          </span>
        </td>
      </tr>
      {open && (
        <tr id={detailId}>
          <td colSpan={5} style={{ padding: "0 12px 12px 35px", background: "var(--s2)" }}>
            <div style={{ padding: "10px 0 0", fontSize: 12, lineHeight: 1.55, color: "var(--t2)" }}>
              <span style={{ fontWeight: 600, color: "var(--t1)" }}>{RULE_LABEL[line.rule]}:</span> {line.rationale}
              {line.sourceNote ? (
                <div style={{ marginTop: 6, fontFamily: mono, fontSize: 10.5, color: "var(--t3)" }}>
                  {line.sourceNote}
                </div>
              ) : null}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function Amount({
  value,
  signed = false,
  color = "var(--t1)",
}: {
  value: number | null
  signed?: boolean
  color?: string
}) {
  return (
    <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: mono, fontSize: 12, color }}>
      {value === null || (signed && value === 0)
        ? "—"
        : signed && value > 0
          ? formatSignedCurrency(-value)
          : formatCurrency(value)}
    </td>
  )
}

// ─── Negotiation block ───────────────────────────────────────────────────────

function NegotiationBlock({
  recast,
  ask,
  compMultiple,
}: {
  recast: ReverseRecastResult
  ask: number
  compMultiple: { low: number; high: number }
}) {
  const figures = [
    { label: "Ask", value: formatCurrency(ask) },
    { label: "Implied multiple", value: `${formatMultiple(recast.impliedMultiple)} on defensible SDE` },
    { label: "Comp band", value: formatMultipleBand(compMultiple.low, compMultiple.high) },
    { label: "Fair value", value: formatCurrency(recast.fairValue) },
    { label: "Delta off the ask", value: formatSignedCurrency(-recast.negotiationDelta) },
  ]
  return (
    <section
      style={{
        marginTop: 22,
        padding: "16px 18px",
        borderRadius: 11,
        border: "1px solid var(--dq-accent-edge)",
        background: "var(--dq-accent-soft)",
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 10.5,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "var(--t3)",
        }}
      >
        {RECAST_COPY.negotiationTitle}
      </div>
      <dl
        style={{
          margin: "10px 0 0",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        {figures.map((figure) => (
          <div key={figure.label}>
            <dt
              style={{
                fontFamily: mono,
                fontSize: 9,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--t3)",
              }}
            >
              {figure.label}
            </dt>
            <dd style={{ margin: "2px 0 0", fontFamily: mono, fontSize: 13.5, fontWeight: 600, color: "var(--t1)" }}>
              {figure.value}
            </dd>
          </div>
        ))}
      </dl>
      <p style={{ margin: "12px 0 0", fontSize: 11.5, lineHeight: 1.5, color: "var(--t2)" }}>
        {RECAST_COPY.negotiationBasis}
      </p>
    </section>
  )
}

// ─── Streamed challenge memo ─────────────────────────────────────────────────

type MemoState = "streaming" | "live" | "fallback"

function ChallengeMemo({ dealId }: { dealId: string }) {
  const [memo, setMemo] = React.useState("")
  const [state, setState] = React.useState<MemoState>("streaming")

  React.useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    let gotFirstToken = false
    const firstTokenTimer = setTimeout(() => {
      if (!gotFirstToken) controller.abort()
    }, FIRST_TOKEN_TIMEOUT_MS)

    ;(async () => {
      try {
        const res = await fetch("/api/dealiq/narrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dealId }),
          signal: controller.signal,
        })
        if (!res.ok || !res.body) throw new Error(`narrate_http_${res.status}`)
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ""
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          gotFirstToken = true
          accumulated += decoder.decode(value, { stream: true })
          if (!cancelled) setMemo(accumulated)
        }
        if (!accumulated.trim()) throw new Error("empty_stream")
        if (!cancelled) setState("live")
      } catch {
        if (!cancelled) {
          setMemo(FALLBACK_CHALLENGE_MEMO)
          setState("fallback")
        }
      } finally {
        clearTimeout(firstTokenTimer)
      }
    })()

    return () => {
      cancelled = true
      clearTimeout(firstTokenTimer)
      controller.abort()
    }
  }, [dealId])

  return (
    <section style={{ marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "var(--t3)",
          }}
        >
          {RECAST_COPY.memoHeading}
        </div>
        {state !== "streaming" && (
          <span
            style={{
              fontFamily: mono,
              fontSize: 9,
              letterSpacing: ".06em",
              color: "var(--t3)",
              border: "1px solid var(--b2)",
              borderRadius: 5,
              padding: "1px 6px",
            }}
          >
            {state === "live" ? "sonnet" : "cached"}
          </span>
        )}
      </div>
      <div
        aria-live="polite"
        style={{
          marginTop: 8,
          padding: "14px 16px",
          borderRadius: 11,
          border: "1px solid var(--b3)",
          background: "var(--s2)",
          fontSize: 12.5,
          lineHeight: 1.65,
          color: "var(--t2)",
          whiteSpace: "pre-wrap",
          maxWidth: 680,
        }}
      >
        {memo || RECAST_COPY.memoPending}
      </div>
    </section>
  )
}

// ─── Accept gate ─────────────────────────────────────────────────────────────

function AcceptGate({ dealId }: { dealId: string }) {
  const router = useRouter()
  const [phase, setPhase] = React.useState<ApprovePhase>("idle")
  const [signedAt, setSignedAt] = React.useState<{ date: string; time: string } | null>(null)
  const timersRef = React.useRef<Array<ReturnType<typeof setTimeout>>>([])

  React.useEffect(() => () => timersRef.current.forEach(clearTimeout), [])

  function onAccept() {
    if (phase !== "idle") return
    setPhase("approving")
    const now = new Date()
    const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    timersRef.current.push(
      setTimeout(() => {
        setPhase("approved")
        setSignedAt({ date, time })
        timersRef.current.push(setTimeout(() => router.push(dealPath(dealId, "returns")), APPROVE_HOLD_MS))
      }, APPROVE_SPINNER_MS)
    )
  }

  return (
    <SurfaceCard style={{ marginTop: 26, display: "flex", justifyContent: "flex-end", padding: "14px 18px" }}>
      {phase === "approved" && signedAt ? (
        <div
          className="dq-enter"
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid var(--dq-accent-edge)",
            background: "var(--dq-accent-soft)",
            fontSize: 12.5,
            color: "var(--t1)",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--dq-accent)" }}>{RECAST_COPY.accepted}</span>
          <span style={{ fontFamily: mono, fontSize: 10.5, color: "var(--t3)", marginLeft: 10 }}>
            {BUYER.name} · {signedAt.date} · {signedAt.time}
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onAccept}
          disabled={phase !== "idle"}
          className="dq-primary dq-focus"
          style={{
            padding: "11px 18px",
            borderRadius: 9,
            border: "none",
            background: "var(--dq-accent)",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 600,
            fontFamily: inter,
            cursor: phase === "idle" ? "pointer" : "default",
            opacity: phase === "idle" ? 1 : 0.72,
          }}
        >
          {phase === "approving" ? RECAST_COPY.accepting : RECAST_COPY.acceptGate}
        </button>
      )}
    </SurfaceCard>
  )
}
