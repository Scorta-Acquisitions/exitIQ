"use client"

/**
 * Streaming agent log — the terminal panel both products use as a latency mask.
 *
 * Lifted *by copy* from `IngestionStation.tsx` (Execution Plan §2: the 42KB
 * demo-critical file stays untouched) and made presentational: the caller owns
 * the timer that advances `lines`, this component only renders the visible
 * slice. Accent color arrives as a prop — `--dq-accent` on the buy side, mint
 * on the sell side — so neither product's signature leaks into the other.
 */

import React from "react"

const mono = "'JetBrains Mono', var(--font-jetbrains-mono, monospace)"

/**
 * Declared locally rather than imported from `lib/dealiq/types` so the sell side
 * can adopt this component without importing buy-side modules. Structurally
 * compatible with both products' script shapes.
 */
export type StreamingLogLine = {
  readonly ts: string
  readonly text: string
  readonly accent?: boolean
  readonly flag?: "red" | "amber"
}

export function StreamingLog({
  lines,
  totalCount,
  complete,
  title,
  accentColor,
  height = 300,
}: {
  /** The visible slice of the script, in order. */
  lines: ReadonlyArray<StreamingLogLine>
  totalCount: number
  complete: boolean
  /** Mono header label, e.g. "ingestion-agent · dealiq · live". */
  title: string
  /** CSS color for `accent: true` lines and the live dot. */
  accentColor: string
  height?: number
}) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [lines.length])

  return (
    <section
      aria-label={title}
      style={{
        position: "relative",
        background: "rgba(12,10,9,.92)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 14,
        boxShadow: "0 12px 36px rgba(12,10,9,.18)",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "11px 16px",
          borderBottom: "1px solid rgba(255,255,255,.07)",
          background: "rgba(255,255,255,.025)",
        }}
      >
        <span aria-hidden style={{ display: "inline-flex", gap: 6 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57" }} />
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#febc2e" }} />
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840" }} />
        </span>
        <div style={{ fontFamily: mono, fontSize: 11, color: "rgba(245,245,245,.55)", letterSpacing: ".4px", flex: 1 }}>
          {title}
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: mono,
            fontSize: 10.5,
            color: complete ? accentColor : "rgba(245,245,245,.55)",
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
                background: accentColor,
                boxShadow: `0 0 6px ${accentColor}`,
                animation: "sharedLogBlink 1.1s ease-in-out infinite",
              }}
            />
          )}
          {complete ? "Complete" : `${lines.length} / ${totalCount}`}
        </div>
      </header>

      <div
        ref={scrollRef}
        aria-live="polite"
        style={{
          height,
          overflowY: "auto",
          padding: "12px 16px 16px",
          fontFamily: mono,
          fontSize: 12,
          lineHeight: 1.7,
          color: "rgba(245,245,245,.72)",
          scrollBehavior: "smooth",
        }}
      >
        {lines.map((line, i) => (
          <LogRow key={`${line.ts}-${i}`} line={line} accentColor={accentColor} />
        ))}
        {!complete && <Caret />}
      </div>

      <style>{`
        @keyframes sharedLogBlink { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes sharedLogLineIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sharedLogCaret { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @media (prefers-reduced-motion: reduce) {
          .shared-log-row { animation: none !important; }
        }
      `}</style>
    </section>
  )
}

function LogRow({ line, accentColor }: { line: StreamingLogLine; accentColor: string }) {
  const tone = line.accent
    ? accentColor
    : line.flag
      ? line.flag === "red"
        ? "#e88a72"
        : "#e3b06b"
      : "rgba(245,245,245,.72)"
  const tsColor = line.accent || line.flag ? tone : "rgba(245,245,245,.42)"
  return (
    <div
      className="shared-log-row"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "1px 0",
        animation: "sharedLogLineIn .28s ease-out",
      }}
    >
      <span style={{ color: tsColor, flexShrink: 0, letterSpacing: ".4px" }}>[{line.ts}]</span>
      <span style={{ color: tone, fontWeight: line.accent || line.flag ? 500 : 400, letterSpacing: ".05px" }}>
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
        animation: "sharedLogCaret 1.05s steps(2) infinite",
      }}
    />
  )
}
