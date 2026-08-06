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

import { SurfaceCard } from "@/components/dealiq/Surface"
import { DILIGENCE_COPY } from "@/lib/dealiq/data/copy"
import { ASK_OF_LABEL, CATEGORY_LABEL } from "@/lib/dealiq/diligence"
import { formatFileSize } from "@/lib/dealiq/format"
import { dealPath } from "@/lib/dealiq/navigation"
import { RULE_LABEL } from "@/lib/dealiq/reverseRecast"
import type { DiligenceCategory, FlagSeverity, RankedDiligenceQuestion, RecastFlag } from "@/lib/dealiq/types"
import { acceptAttribute, isAcceptedFundingDocument } from "@/lib/dealiq/verification"

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

/** Plain strings only — the `File` object is never kept (mirrors `CapitalVerification`). */
type AttachedDocument = {
  id: string
  name: string
  sizeBytes: number
}

const visuallyHidden: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
}

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
  const [attachments, setAttachments] = React.useState<ReadonlyArray<AttachedDocument>>([])
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const resetRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    return () => {
      if (resetRef.current) clearTimeout(resetRef.current)
    }
  }, [])

  const visible = filter === "all" ? ranked : ranked.filter((question) => question.category === filter)

  function handleUpload(candidate: File) {
    // Read the metadata, then let go of the File — nothing here transmits it,
    // matching CapitalVerification's no-storage rule (standing decision 34).
    if (!isAcceptedFundingDocument(candidate.name, candidate.type)) {
      setUploadError(DILIGENCE_COPY.wrongType)
      return
    }
    setUploadError(null)
    setAttachments((prev) => [
      ...prev,
      { id: `${Date.now()}_${Math.random().toString(36).slice(2)}`, name: candidate.name, sizeBytes: candidate.size },
    ])
  }

  function onUploadInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const candidate = event.target.files?.[0]
    // Reset so choosing the same file again re-fires the change event.
    event.target.value = ""
    if (candidate) handleUpload(candidate)
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((doc) => doc.id !== id))
  }

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
    <div className="dq-screen" style={{ maxWidth: 860 }}>
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

      <UploadCard
        attachments={attachments}
        uploadError={uploadError}
        fileInputRef={fileInputRef}
        onInputChange={onUploadInputChange}
        onRemove={removeAttachment}
      />

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

// ── Upload card ──────────────────────────────────────────────────────────────

function UploadCard({
  attachments,
  uploadError,
  fileInputRef,
  onInputChange,
  onRemove,
}: {
  attachments: ReadonlyArray<AttachedDocument>
  uploadError: string | null
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: (id: string) => void
}) {
  return (
    <SurfaceCard tone="raised" style={{ marginTop: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <span
          aria-hidden
          style={{
            flexShrink: 0,
            width: 42,
            height: 42,
            borderRadius: 11,
            background: "var(--dq-accent-soft)",
            border: "1px solid var(--dq-accent-edge)",
            color: "var(--dq-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DocumentGlyph size={20} />
        </span>

        <div style={{ flex: 1, minWidth: 220 }}>
          <h2
            style={{
              margin: 0,
              fontFamily: garamond,
              fontSize: 17,
              fontWeight: 500,
              letterSpacing: "-.2px",
              color: "var(--t1)",
            }}
          >
            {DILIGENCE_COPY.uploadSectionTitle}
          </h2>
          <p style={{ margin: "5px 0 0", fontSize: 12.5, lineHeight: 1.55, color: "var(--t2)", maxWidth: 520 }}>
            {DILIGENCE_COPY.uploadContext}
          </p>
        </div>

        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <input
            ref={fileInputRef}
            id="dq-diligence-file"
            type="file"
            accept={acceptAttribute()}
            onChange={onInputChange}
            style={visuallyHidden}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="dq-primary dq-focus"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 20px",
              borderRadius: 10,
              border: "none",
              background: "var(--dq-accent)",
              color: "#fff",
              fontSize: 13.5,
              fontWeight: 600,
              fontFamily: inter,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <UploadGlyph />
            {DILIGENCE_COPY.uploadButton}
          </button>
          {uploadError ? (
            <span role="alert" style={{ fontSize: 10.5, color: "var(--crit)", maxWidth: 220, textAlign: "right" }}>
              {uploadError}
            </span>
          ) : null}
        </div>
      </div>

      {attachments.length > 0 ? (
        <ul
          style={{
            margin: "16px 0 0",
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {attachments.map((doc) => (
            <li
              key={doc.id}
              title={doc.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 9,
                border: "1px solid var(--b3)",
                background: "var(--s2)",
              }}
            >
              <DocumentGlyph size={14} muted />
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 12,
                  color: "var(--t1)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {doc.name}
              </span>
              <span style={{ flexShrink: 0, fontFamily: mono, fontSize: 10, color: "var(--t3)" }}>
                {formatFileSize(doc.sizeBytes)}
              </span>
              <button
                type="button"
                onClick={() => onRemove(doc.id)}
                aria-label={`${DILIGENCE_COPY.removeAria} ${doc.name}`}
                className="dq-focus"
                style={{
                  flexShrink: 0,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: "none",
                  background: "transparent",
                  color: "var(--t3)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M2 2l6 6M8 2l-6 6" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p style={{ margin: "12px 0 0", fontSize: 10.5, color: "var(--t3)" }}>{DILIGENCE_COPY.uploadHint}</p>
    </SurfaceCard>
  )
}

function DocumentGlyph({ size = 14, muted }: { size?: number; muted?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={muted ? "var(--t3)" : "currentColor"}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path d="M4 1.8h5.4L12.6 5v9.2H4V1.8Z" />
      <path d="M9.4 1.8V5h3.2M6 8h4.6M6 10.6h4.6" />
    </svg>
  )
}

function UploadGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path d="M8 10.2V2.4M5 5.4 8 2.4l3 3" />
      <path d="M2.6 10.2v2.4a1 1 0 0 0 1 1h8.8a1 1 0 0 0 1-1v-2.4" />
    </svg>
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
