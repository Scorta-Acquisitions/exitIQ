"use client"

/**
 * Capital Verification — the join between the two products, stated plainly
 * (Execution Plan item 11): verify once, see certified deals before the market.
 *
 * The funding document is read entirely in the browser. Its name, size, and
 * type are displayed and nothing else happens — THE FILE IS NEVER UPLOADED:
 * no fetch, no POST, no storage of any kind occurs on this surface, and the
 * `File` object itself is discarded the moment its metadata is read. The
 * scripted check run demonstrates the flow; production review is analyst-run,
 * and the surface says so.
 */

import React from "react"

import { useDealIQSession } from "@/components/dealiq/DealIQSessionContext"
import { BUYER } from "@/lib/dealiq/data/buyer"
import { VERIFY_COPY } from "@/lib/dealiq/data/copy"
import { formatCompactCurrency, formatCount, formatDate, formatFileSize } from "@/lib/dealiq/format"
import {
  acceptAttribute,
  fileExtension,
  isAcceptedFundingDocument,
  VERIFICATION_CHECK_SETTLE_MS,
  VERIFICATION_CHECK_STEP_MS,
  verificationRunMs,
} from "@/lib/dealiq/verification"

const garamond = "'EB Garamond', var(--font-eb-garamond, 'Times New Roman', serif)"
const inter = "Inter, var(--font-inter, sans-serif)"
const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

type Phase = "badge" | "dropzone" | "checking"

/** Plain strings only — the `File` object is never kept. */
type FileFacts = {
  name: string
  sizeBytes: number
  typeLabel: string
}

const visuallyHidden: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
}

export function CapitalVerification() {
  const { capitalVerified, setCapitalVerified, hydrated } = useDealIQSession()

  // The seed buyer is already verified, so the page opens on the badge and the
  // upload flow stays demonstrable behind "Re-verify" (plan item 11 step 4).
  const [phase, setPhase] = React.useState<Phase>(BUYER.capitalVerified ? "badge" : "dropzone")
  const [file, setFile] = React.useState<FileFacts | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [dragActive, setDragActive] = React.useState(false)
  const [revealed, setRevealed] = React.useState(0)
  const [settled, setSettled] = React.useState(0)

  const timersRef = React.useRef<Array<ReturnType<typeof setTimeout>>>([])

  React.useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout)
  }, [])

  // Session-fresh means the flag was written this browser session — the badge
  // carries a freshness chip on top of the seed's standing verification.
  const sessionFresh = hydrated && capitalVerified

  function handleFile(candidate: File) {
    // Read the metadata, then let go of the File — nothing here transmits it.
    const facts: FileFacts = {
      name: candidate.name,
      sizeBytes: candidate.size,
      typeLabel: candidate.type || (fileExtension(candidate.name) ?? "unknown"),
    }
    if (!isAcceptedFundingDocument(candidate.name, candidate.type)) {
      setError(VERIFY_COPY.wrongType)
      return
    }
    setError(null)
    setFile(facts)
    setPhase("checking")
    setRevealed(1)
    setSettled(0)

    const lineCount = VERIFY_COPY.checkLines.length
    const timers: Array<ReturnType<typeof setTimeout>> = []
    for (let i = 0; i < lineCount; i++) {
      if (i > 0) timers.push(setTimeout(() => setRevealed(i + 1), i * VERIFICATION_CHECK_STEP_MS))
      timers.push(setTimeout(() => setSettled(i + 1), i * VERIFICATION_CHECK_STEP_MS + VERIFICATION_CHECK_SETTLE_MS))
    }
    timers.push(
      setTimeout(() => {
        setCapitalVerified(true)
        setPhase("badge")
      }, verificationRunMs(lineCount))
    )
    timersRef.current = timers
  }

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const candidate = event.target.files?.[0]
    // Reset so choosing the same file again re-fires the change event.
    event.target.value = ""
    if (candidate) handleFile(candidate)
  }

  function onDrop(event: React.DragEvent) {
    event.preventDefault()
    setDragActive(false)
    const candidate = event.dataTransfer.files?.[0]
    if (candidate) handleFile(candidate)
  }

  return (
    <div className="dq-screen" style={{ maxWidth: 760 }}>
      <ScopedStyles />

      <div
        style={{
          fontFamily: mono,
          fontSize: 9.5,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "var(--t3)",
        }}
      >
        {VERIFY_COPY.eyebrow}
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
        {VERIFY_COPY.title}
      </h1>

      <div style={{ marginTop: 20 }}>
        {phase === "badge" && (
          <VerifiedBadge sessionFresh={sessionFresh} file={file} onReverify={() => setPhase("dropzone")} />
        )}

        {phase === "dropzone" && (
          <div className="dq-enter">
            <input
              id="dq-pof-file"
              type="file"
              accept={acceptAttribute()}
              onChange={onInputChange}
              className="dqv-file"
              style={visuallyHidden}
            />
            <label
              htmlFor="dq-pof-file"
              className="dqv-drop"
              onDragOver={(event) => {
                event.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "38px 24px",
                borderRadius: 13,
                border: `1.5px dashed ${dragActive ? "var(--dq-accent)" : "var(--b2)"}`,
                background: dragActive ? "var(--dq-accent-soft)" : "var(--s2)",
                cursor: "pointer",
                textAlign: "center",
                transition: "border-color .15s ease, background .15s ease",
              }}
            >
              <DocumentGlyph />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--t1)", letterSpacing: "-.01em" }}>
                {VERIFY_COPY.dropzoneIdle}
              </span>
              <span
                style={{
                  fontSize: 11.5,
                  color: "var(--dq-accent)",
                  fontWeight: 500,
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                {VERIFY_COPY.dropzoneBrowse}
              </span>
              <span style={{ fontFamily: mono, fontSize: 10, color: "var(--t3)", marginTop: 4 }}>
                {VERIFY_COPY.dropzoneHint}
              </span>
            </label>

            {error ? (
              <p
                role="alert"
                style={{
                  margin: "12px 0 0",
                  fontSize: 12,
                  lineHeight: 1.45,
                  color: "var(--crit)",
                  background: "var(--crit-soft)",
                  border: "1px solid var(--crit-edge)",
                  borderRadius: 8,
                  padding: "8px 10px",
                }}
              >
                {error}
              </p>
            ) : null}

            {BUYER.capitalVerified ? (
              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setPhase("badge")
                }}
                className="dq-focus"
                style={{
                  marginTop: 12,
                  padding: "8px 12px",
                  borderRadius: 9,
                  border: "1px solid var(--b2)",
                  background: "transparent",
                  color: "var(--t2)",
                  fontSize: 11.5,
                  fontWeight: 500,
                  fontFamily: inter,
                  cursor: "pointer",
                }}
              >
                {VERIFY_COPY.keepCurrent}
              </button>
            ) : null}
          </div>
        )}

        {phase === "checking" && file && <CheckRunner file={file} revealed={revealed} settled={settled} />}
      </div>

      {/* The trade statement — the claim this surface exists to make */}
      <blockquote
        style={{
          margin: "30px 0 0",
          padding: 0,
          fontFamily: garamond,
          fontSize: 22,
          lineHeight: 1.42,
          letterSpacing: "-.2px",
          color: "var(--t1)",
          maxWidth: 640,
        }}
      >
        {VERIFY_COPY.tradeStatement}
      </blockquote>

      <PoolStats sessionFresh={sessionFresh} />

      <p
        style={{
          margin: "22px 0 0",
          padding: "12px 14px",
          maxWidth: 640,
          fontSize: 11.5,
          lineHeight: 1.5,
          color: "var(--t3)",
          border: "1px dashed var(--b2)",
          borderRadius: 9,
          background: "var(--s2)",
        }}
      >
        {VERIFY_COPY.productionNote}
      </p>
    </div>
  )
}

// ── Badge ────────────────────────────────────────────────────────────────────

function VerifiedBadge({
  sessionFresh,
  file,
  onReverify,
}: {
  sessionFresh: boolean
  file: FileFacts | null
  onReverify: () => void
}) {
  const method = VERIFY_COPY.methodLabels[BUYER.verificationMethod]
  return (
    <section
      className="dq-enter"
      aria-label={VERIFY_COPY.badge}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "20px 22px",
        borderRadius: 13,
        border: "1px solid var(--dq-accent-edge)",
        background: "var(--dq-accent-soft)",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--dq-accent)",
          color: "#fff",
        }}
      >
        <ShieldGlyph size={24} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{ fontFamily: garamond, fontSize: 20, fontWeight: 500, letterSpacing: "-.3px", color: "var(--t1)" }}
          >
            {VERIFY_COPY.badge}
          </span>
          {sessionFresh ? (
            <span
              style={{
                fontFamily: mono,
                fontSize: 9.5,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                color: "var(--dq-accent)",
                border: "1px solid var(--dq-accent-edge)",
                borderRadius: 6,
                padding: "2px 6px",
                background: "rgba(255,255,255,.55)",
              }}
            >
              {VERIFY_COPY.verifiedThisSession}
            </span>
          ) : null}
        </div>
        <div style={{ marginTop: 3, fontSize: 12, color: "var(--t2)" }}>
          {method} ·{" "}
          {sessionFresh && file ? (
            <span title={file.name} style={{ fontFamily: mono, fontSize: 11 }}>
              {file.name} · {formatFileSize(file.sizeBytes)}
            </span>
          ) : (
            formatDate(BUYER.verifiedOn)
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onReverify}
        className="dq-focus"
        style={{
          flexShrink: 0,
          padding: "8px 12px",
          borderRadius: 9,
          border: "1px solid var(--dq-accent-edge)",
          background: "rgba(255,255,255,.6)",
          color: "var(--dq-accent)",
          fontSize: 11.5,
          fontWeight: 500,
          fontFamily: inter,
          cursor: "pointer",
        }}
      >
        {VERIFY_COPY.reverify}
      </button>
    </section>
  )
}

// ── Scripted check run ───────────────────────────────────────────────────────

function CheckRunner({ file, revealed, settled }: { file: FileFacts; revealed: number; settled: number }) {
  return (
    <section
      className="dq-enter"
      aria-label="Verification in progress"
      style={{
        padding: "18px 20px",
        borderRadius: 13,
        border: "1px solid var(--b3)",
        background: "var(--glass-bg)",
        boxShadow: "var(--glass-shadow)",
      }}
    >
      <div
        title={file.name}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: mono,
          fontSize: 11,
          color: "var(--t2)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        <DocumentGlyph small />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{file.name}</span>
        <span style={{ color: "var(--t3)", flexShrink: 0 }}>
          {formatFileSize(file.sizeBytes)} · {file.typeLabel}
        </span>
      </div>

      <ul
        aria-live="polite"
        style={{
          margin: "14px 0 0",
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {VERIFY_COPY.checkLines.slice(0, revealed).map((line, i) => {
          const done = i < settled
          return (
            <li
              key={line}
              className="dq-enter"
              style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "var(--t1)" }}
            >
              {done ? (
                <span aria-hidden style={{ color: "var(--dq-accent)", display: "flex", flexShrink: 0 }}>
                  <CheckGlyph />
                </span>
              ) : (
                <span aria-hidden className="dqv-spin" />
              )}
              {line}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// ── Pool stats ───────────────────────────────────────────────────────────────

function PoolStats({ sessionFresh }: { sessionFresh: boolean }) {
  const stats: Array<{ label: string; value: string }> = [
    { label: VERIFY_COPY.statRank, value: `#${formatCount(BUYER.poolRank)} of ${formatCount(BUYER.poolSize)}` },
    { label: VERIFY_COPY.statCommitted, value: formatCompactCurrency(BUYER.committedCapital) },
    { label: VERIFY_COPY.statMethod, value: VERIFY_COPY.methodLabels[BUYER.verificationMethod] },
    {
      label: VERIFY_COPY.statVerified,
      value: sessionFresh ? VERIFY_COPY.verifiedThisSession : formatDate(BUYER.verifiedOn),
    },
  ]
  return (
    <dl
      style={{
        margin: "18px 0 0",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 12,
        maxWidth: 640,
      }}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid var(--b3)",
            background: "var(--s2)",
          }}
        >
          <dt
            style={{
              fontFamily: mono,
              fontSize: 9,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--t3)",
            }}
          >
            {stat.label}
          </dt>
          <dd style={{ margin: "3px 0 0", fontFamily: mono, fontSize: 13.5, fontWeight: 600, color: "var(--t1)" }}>
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

// ── Glyphs & styles ──────────────────────────────────────────────────────────

function ShieldGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.5 2.4 3.9v4.2c0 3.3 2.3 5.6 5.6 6.4 3.3-.8 5.6-3.1 5.6-6.4V3.9L8 1.5Z"
        fill="currentColor"
        opacity=".22"
      />
      <path
        d="M5.6 8.2 7.2 9.8l3.2-3.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3.2 8.4 6.4 11.6 12.8 4.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DocumentGlyph({ small }: { small?: boolean }) {
  const size = small ? 14 : 26
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={small ? "currentColor" : "var(--dq-accent)"}
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

function ScopedStyles() {
  return (
    <style>{`
      .dqv-drop:hover { border-color: var(--dq-accent) !important; }
      .dqv-file:focus-visible + .dqv-drop {
        outline: 2px solid var(--dq-accent);
        outline-offset: 2px;
      }
      .dqv-spin {
        width: 12px;
        height: 12px;
        flex-shrink: 0;
        border-radius: 50%;
        border: 1.5px solid var(--dq-accent-edge);
        border-top-color: var(--dq-accent);
        animation: dqvSpin .7s linear infinite;
      }
      @keyframes dqvSpin { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) {
        .dqv-spin { animation: none; }
      }
    `}</style>
  )
}
