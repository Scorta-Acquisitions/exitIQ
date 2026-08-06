"use client"

/**
 * Diligence Pack — ~25 questions ranked by which kill the deal fastest
 * (Execution Plan item 9). The ordering is the product: the list renders in the
 * exact order `rankQuestions()` produced, promoted rows link back to the recast
 * finding that floated them, and the red-flag strip is fed by the same engine
 * flags the recast tab shows. "Copy pack" writes markdown to the clipboard —
 * nothing is sent anywhere (§7: no outbound anything).
 */

import Link from "next/link"
import React from "react"

import { DILIGENCE_COPY } from "@/lib/dealiq/data/copy"
import { ASK_OF_LABEL, CATEGORY_LABEL } from "@/lib/dealiq/diligence"
import { dealPath } from "@/lib/dealiq/navigation"
import { RULE_LABEL } from "@/lib/dealiq/reverseRecast"
import type { DiligenceCategory, FlagSeverity, RankedDiligenceQuestion, RecastFlag } from "@/lib/dealiq/types"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

const CATEGORY_FILTERS: ReadonlyArray<DiligenceCategory> = [
  "financial",
  "customer",
  "operational",
  "legal",
  "people",
  "market",
]

const COPIED_RESET_MS = 2000

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

function killSpeedColor(killSpeed: number): string {
  if (killSpeed >= 4) return "var(--crit)"
  if (killSpeed === 3) return "var(--gold)"
  return "var(--t3)"
}

type CopyState = "idle" | "copied" | "failed"

export function DiligencePanel({
  ranked,
  flags,
  dealId,
  packMarkdown,
}: {
  ranked: ReadonlyArray<RankedDiligenceQuestion>
  flags: ReadonlyArray<RecastFlag>
  dealId: string
  /** Pre-built by the server from the same ranked list — what "Copy pack" writes. */
  packMarkdown: string
}) {
  const [filter, setFilter] = React.useState<"all" | DiligenceCategory>("all")
  const [copyState, setCopyState] = React.useState<CopyState>("idle")
  const resetRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (resetRef.current) clearTimeout(resetRef.current)
    }
  }, [])

  const visible = filter === "all" ? ranked : ranked.filter((question) => question.category === filter)

  async function copyPack() {
    try {
      await navigator.clipboard.writeText(packMarkdown)
      setCopyState("copied")
    } catch {
      setCopyState("failed")
    }
    if (resetRef.current) clearTimeout(resetRef.current)
    resetRef.current = setTimeout(() => setCopyState("idle"), COPIED_RESET_MS)
  }

  return (
    <div style={{ padding: "26px 22px 48px", fontFamily: inter, maxWidth: 860 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 9.5,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--t3)",
            }}
          >
            {DILIGENCE_COPY.eyebrow}
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
            {DILIGENCE_COPY.title}
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.55, color: "var(--t2)", maxWidth: 620 }}>
            {DILIGENCE_COPY.subtitle}
          </p>
        </div>
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <button
            type="button"
            onClick={copyPack}
            className="dq-primary dq-focus"
            style={{
              padding: "8px 14px",
              borderRadius: 9,
              border: "none",
              background: "var(--dq-accent)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: inter,
              cursor: "pointer",
            }}
          >
            {copyState === "copied" ? DILIGENCE_COPY.copied : DILIGENCE_COPY.copyButton}
          </button>
          {copyState === "failed" ? (
            <span role="alert" style={{ fontSize: 10.5, color: "var(--crit)", maxWidth: 200, textAlign: "right" }}>
              {DILIGENCE_COPY.copyFailed}
            </span>
          ) : null}
        </div>
      </div>

      {flags.length > 0 && <RedFlagStrip flags={flags} dealId={dealId} />}

      <FilterChips ranked={ranked} filter={filter} onFilter={setFilter} />

      {visible.length === 0 ? (
        <p
          style={{
            margin: "16px 0 0",
            padding: "22px 20px",
            textAlign: "center",
            fontSize: 12.5,
            color: "var(--t3)",
            border: "1px dashed var(--b2)",
            borderRadius: 11,
            background: "var(--s2)",
          }}
        >
          {DILIGENCE_COPY.emptyFilter}
        </p>
      ) : (
        <ol
          style={{
            margin: "16px 0 0",
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {visible.map((question) => (
            <QuestionRow key={question.id} question={question} dealId={dealId} />
          ))}
        </ol>
      )}
    </div>
  )
}

// ── Red flags ────────────────────────────────────────────────────────────────

function RedFlagStrip({ flags, dealId }: { flags: ReadonlyArray<RecastFlag>; dealId: string }) {
  return (
    <section aria-label={DILIGENCE_COPY.flagsTitle} style={{ marginTop: 18 }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: 9,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "var(--t3)",
        }}
      >
        {DILIGENCE_COPY.flagsTitle}
      </div>
      <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
        {flags.map((flag) => {
          const color = severityColor(flag.severity)
          return (
            <div
              key={flag.id}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                padding: "9px 12px",
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
                <Link
                  href={dealPath(dealId, "recast")}
                  className="dq-focus"
                  style={{ color: "var(--dq-accent)", fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" }}
                >
                  {DILIGENCE_COPY.flagLink}
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ── Filters ──────────────────────────────────────────────────────────────────

function FilterChips({
  ranked,
  filter,
  onFilter,
}: {
  ranked: ReadonlyArray<RankedDiligenceQuestion>
  filter: "all" | DiligenceCategory
  onFilter: (next: "all" | DiligenceCategory) => void
}) {
  const countFor = (category: "all" | DiligenceCategory) =>
    category === "all" ? ranked.length : ranked.filter((question) => question.category === category).length

  const chips: ReadonlyArray<{ key: "all" | DiligenceCategory; label: string }> = [
    { key: "all", label: DILIGENCE_COPY.filterAll },
    ...CATEGORY_FILTERS.map((category) => ({ key: category, label: CATEGORY_LABEL[category] })),
  ]

  return (
    <div
      role="group"
      aria-label="Filter by category"
      style={{ marginTop: 18, display: "flex", gap: 6, flexWrap: "wrap" }}
    >
      {chips.map((chip) => {
        const active = filter === chip.key
        return (
          <button
            key={chip.key}
            type="button"
            onClick={() => onFilter(chip.key)}
            aria-pressed={active}
            className="dq-focus"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 11px",
              borderRadius: 8,
              border: `1px solid ${active ? "var(--dq-accent-edge)" : "var(--b2)"}`,
              background: active ? "var(--dq-accent-soft)" : "transparent",
              color: active ? "var(--dq-accent)" : "var(--t2)",
              fontSize: 11.5,
              fontWeight: active ? 600 : 500,
              fontFamily: inter,
              cursor: "pointer",
            }}
          >
            {chip.label}
            <span style={{ fontFamily: mono, fontSize: 9.5, color: active ? "var(--dq-accent)" : "var(--t3)" }}>
              {countFor(chip.key)}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ── Question rows ────────────────────────────────────────────────────────────

function QuestionRow({ question, dealId }: { question: RankedDiligenceQuestion; dealId: string }) {
  return (
    <li>
      <details
        className="dq-diligence-row"
        style={{
          border: `1px solid ${question.promoted ? "var(--dq-accent-edge)" : "var(--b3)"}`,
          borderRadius: 11,
          background: question.promoted ? "var(--dq-accent-soft)" : "var(--glass-bg)",
          overflow: "hidden",
        }}
      >
        <summary
          className="dq-focus"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "11px 14px",
            cursor: "pointer",
            listStyle: "none",
          }}
        >
          <KillSpeedBar killSpeed={question.killSpeed} />
          <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, lineHeight: 1.45, color: "var(--t1)" }}>
            {question.question}
          </span>
          {question.promoted ? (
            <span
              style={{
                flexShrink: 0,
                fontFamily: mono,
                fontSize: 9,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                color: "var(--dq-accent)",
                border: "1px solid var(--dq-accent-edge)",
                borderRadius: 5,
                padding: "2px 6px",
              }}
            >
              {DILIGENCE_COPY.promotedBadge}
            </span>
          ) : null}
          <span
            style={{
              flexShrink: 0,
              fontFamily: mono,
              fontSize: 9.5,
              letterSpacing: ".04em",
              color: "var(--t3)",
            }}
          >
            {CATEGORY_LABEL[question.category]}
          </span>
        </summary>
        <div style={{ padding: "0 14px 12px 14px", borderTop: "1px solid var(--div)" }}>
          <p style={{ margin: "10px 0 0", fontSize: 12, lineHeight: 1.55, color: "var(--t2)" }}>{question.rationale}</p>
          <div
            style={{
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
              fontFamily: mono,
              fontSize: 10,
              color: "var(--t3)",
            }}
          >
            <span>
              {DILIGENCE_COPY.killSpeedLabel} {question.killSpeed}/5
            </span>
            <span>
              {DILIGENCE_COPY.askLead} {ASK_OF_LABEL[question.askOf]}
            </span>
            {question.promoted && question.sourceFinding ? (
              <span>
                {DILIGENCE_COPY.promotedLead} {RULE_LABEL[question.sourceFinding]}{" "}
                <Link
                  href={dealPath(dealId, "recast")}
                  className="dq-focus"
                  style={{ color: "var(--dq-accent)", fontWeight: 500, textDecoration: "none" }}
                >
                  {DILIGENCE_COPY.flagLink}
                </Link>
              </span>
            ) : null}
          </div>
        </div>
      </details>
    </li>
  )
}

function KillSpeedBar({ killSpeed }: { killSpeed: number }) {
  const color = killSpeedColor(killSpeed)
  return (
    <span
      role="img"
      aria-label={`${DILIGENCE_COPY.killSpeedLabel} ${killSpeed} of 5`}
      style={{ display: "flex", gap: 2, flexShrink: 0 }}
    >
      {[1, 2, 3, 4, 5].map((step) => (
        <span
          key={step}
          aria-hidden
          style={{
            width: 5,
            height: 14,
            borderRadius: 2,
            background: step <= killSpeed ? color : "var(--b2)",
          }}
        />
      ))}
    </span>
  )
}
